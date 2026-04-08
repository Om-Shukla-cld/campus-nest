"""
CampusNest API – FastAPI Backend

Run from the project root (recommended):
    uvicorn backend.main:app --reload --port 8000

Or from inside the backend/ directory:
    uvicorn main:app --reload --port 8000
"""
import os
import sys

# ── Ensure the backend directory is on sys.path so absolute imports work
# whether this module is run as 'uvicorn main:app' (from backend/) or
# 'uvicorn backend.main:app' (from the project root).
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

import random
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from database import get_db, engine
import models, schemas
from auth import (
    create_access_token,
    get_current_user,
    get_optional_user,
    require_role,
)
from config import settings
from seed import seed_all

# ─────────────── App Init ───────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CampusNest – Student Housing, Community & Property Management Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables & seed on startup
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    seed_all()

# Static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


# ─────────────── Helpers ───────────────

def generate_otp(length: int = 4) -> str:
    return "".join(random.choices(string.digits, k=length))


def _calc_property_stats(prop: models.Property):
    """Attach computed fields to property object."""
    reviews = prop.reviews or []
    prop.avg_rating = round(sum(r.overall_rating for r in reviews) / len(reviews), 1) if reviews else None
    prop.review_count = len(reviews)
    total_slots = sum(len(room.slots) for room in (prop.rooms or []))
    occupied_slots = sum(1 for room in (prop.rooms or []) for slot in room.slots if slot.is_occupied)
    prop.available_slots = total_slots - occupied_slots
    return prop


# ─────────────── Health ───────────────

@app.get("/", tags=["Health"])
def root():
    return {"message": "CampusNest API is running 🏠", "version": settings.APP_VERSION}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "app": settings.APP_NAME}


# ─────────────── OTP ───────────────

@app.post("/auth/send-otp", response_model=schemas.MessageResponse, tags=["Auth"])
def send_otp(req: schemas.SendOTPRequest, db: Session = Depends(get_db)):
    """Send OTP to phone number (Demo: always returns 1234)."""
    # In production: integrate SMS provider (Twilio / AWS SNS)
    otp_code = settings.DEMO_OTP  # "1234" for demo
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    # Invalidate old OTPs for this phone
    db.query(models.OTPRecord).filter(
        models.OTPRecord.phone == req.phone,
        models.OTPRecord.is_used == False
    ).update({"is_used": True})

    # Store new OTP
    otp_record = models.OTPRecord(phone=req.phone, otp_code=otp_code, expires_at=expires_at)
    db.add(otp_record)
    db.commit()

    # Simulate sending OTP (in production, send SMS)
    print(f"[DEMO OTP] Phone: {req.phone} → OTP: {otp_code}")
    return {"message": f"OTP sent to {req.phone} (Demo OTP: {otp_code})", "success": True}


def _verify_otp(phone: str, otp_code: str, db: Session) -> bool:
    """Verify OTP against database. Always accepts demo OTP."""
    if otp_code == settings.DEMO_OTP:
        return True  # Demo bypass

    record = db.query(models.OTPRecord).filter(
        models.OTPRecord.phone == phone,
        models.OTPRecord.otp_code == otp_code,
        models.OTPRecord.is_used == False,
        models.OTPRecord.expires_at > datetime.now(timezone.utc)
    ).first()

    if record:
        record.is_used = True
        db.commit()
        return True
    return False


# ─────────────── Student Auth ───────────────

@app.post("/auth/student/register", response_model=schemas.TokenResponse, tags=["Auth"])
def register_student(req: schemas.StudentRegisterRequest, db: Session = Depends(get_db)):
    """Register a new student with phone OTP + reg number + face ID."""
    if not _verify_otp(req.phone, req.otp_code, db):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Check duplicates
    if db.query(models.User).filter(models.User.phone == req.phone).first():
        raise HTTPException(status_code=409, detail="Phone number already registered")
    if db.query(models.User).filter(models.User.reg_no == req.reg_no).first():
        raise HTTPException(status_code=409, detail="Registration number already registered")

    user = models.User(
        name=req.name,
        phone=req.phone,
        reg_no=req.reg_no,
        gender=req.gender,
        parent_phone=req.parent_phone,
        face_id_url=req.face_id_url,
        role="student",
        is_active=True,
        is_verified=True,
        profile_complete=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token, role=user.role,
        user_id=user.id, profile_complete=user.profile_complete
    )


@app.post("/auth/student/login", response_model=schemas.TokenResponse, tags=["Auth"])
def login_student(req: schemas.StudentLoginRequest, db: Session = Depends(get_db)):
    """Login via phone+OTP or reg_no+OTP."""
    # Find user by phone or reg_no
    user = db.query(models.User).filter(
        (models.User.phone == req.identifier) | (models.User.reg_no == req.identifier),
        models.User.role == "student",
        models.User.is_active == True,
    ).first()

    # Demo: allow login with any phone that starts with identifier "demo"
    if not user and req.identifier.lower().startswith("demo"):
        user = db.query(models.User).filter(models.User.role == "student").first()

    if not user:
        raise HTTPException(status_code=404, detail="Student not found. Please register first.")

    if not _verify_otp(user.phone, req.otp_code, db):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    token = create_access_token({"user_id": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token, role=user.role,
        user_id=user.id, profile_complete=user.profile_complete
    )


# ─────────────── Owner Auth ───────────────

@app.post("/auth/owner/register", response_model=schemas.TokenResponse, tags=["Auth"])
def register_owner(req: schemas.OwnerRegisterRequest, db: Session = Depends(get_db)):
    if not _verify_otp(req.phone, req.otp_code, db):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    if db.query(models.User).filter(models.User.phone == req.phone).first():
        raise HTTPException(status_code=409, detail="Phone already registered")

    user = models.User(
        name=req.name,
        phone=req.phone,
        photo_url=req.photo_url,
        role="owner",
        is_active=True,
        is_verified=False,     # Requires moderator approval
        profile_complete=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token, role=user.role,
        user_id=user.id, profile_complete=user.profile_complete
    )


@app.post("/auth/owner/login", response_model=schemas.TokenResponse, tags=["Auth"])
def login_owner(req: schemas.OwnerLoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.phone == req.phone,
        models.User.role == "owner",
        models.User.is_active == True,
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Owner not found")
    if not _verify_otp(req.phone, req.otp_code, db):
        raise HTTPException(status_code=400, detail="Invalid OTP")

    token = create_access_token({"user_id": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token, role=user.role,
        user_id=user.id, profile_complete=user.profile_complete
    )


# Moderator demo login (no OTP for moderator in demo)
@app.post("/auth/moderator/login", response_model=schemas.TokenResponse, tags=["Auth"])
def login_moderator(phone: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.phone == phone,
        models.User.role == "moderator",
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Moderator not found")

    token = create_access_token({"user_id": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token, role=user.role,
        user_id=user.id, profile_complete=True
    )


# ─────────────── Profile (About Me) ───────────────

@app.post("/profile", response_model=schemas.ProfileResponse, tags=["Profile"])
def create_or_update_profile(
    req: schemas.ProfileCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(models.Profile).filter(models.Profile.user_id == current_user.id).first()
    if profile:
        for key, val in req.dict().items():
            setattr(profile, key, val)
    else:
        profile = models.Profile(user_id=current_user.id, **req.dict())
        db.add(profile)

    current_user.profile_complete = True
    db.commit()
    db.refresh(profile)
    return profile


@app.get("/profile/me", response_model=schemas.UserResponse, tags=["Profile"])
def get_my_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.refresh(current_user)
    return current_user


# ─────────────── Properties ───────────────

@app.get("/properties", tags=["Properties"])
def list_properties(
    property_type: Optional[str] = Query(None),
    gender_type: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    min_rent: Optional[int] = Query(None),
    max_rent: Optional[int] = Query(None),
    amenity: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_user),
):
    """List/search properties. Available to all (including guests)."""
    query = db.query(models.Property).options(
        joinedload(models.Property.rooms).joinedload(models.Room.slots),
        joinedload(models.Property.reviews)
    ).filter(models.Property.approval_status == "APPROVED", models.Property.is_active == True)

    if property_type:
        query = query.filter(models.Property.property_type == property_type)
    if gender_type:
        query = query.filter(models.Property.gender_type.in_([gender_type, "Co-ed", "Any"]))
    if area:
        query = query.filter(models.Property.area.ilike(f"%{area}%"))
    if min_rent:
        query = query.filter(models.Property.rent >= min_rent)
    if max_rent:
        query = query.filter(models.Property.rent <= max_rent)

    props = query.all()

    result = []
    for prop in props:
        prop = _calc_property_stats(prop)
        result.append({
            "id": prop.id,
            "name": prop.name,
            "property_type": prop.property_type,
            "gender_type": prop.gender_type,
            "area": prop.area,
            "rent": prop.rent,
            "other_price": prop.other_price,
            "safety_score": prop.safety_score,
            "distance": prop.distance,
            "verified_badge": prop.verified_badge,
            "amenities": prop.amenities or [],
            "images": prop.images or [],
            "avg_rating": prop.avg_rating,
            "review_count": prop.review_count,
            "available_slots": prop.available_slots,
            "approval_status": prop.approval_status,
        })

    # Filter by amenity if specified
    if amenity:
        result = [p for p in result if any(a in p["amenities"] for a in amenity)]

    return result


@app.get("/properties/{property_id}", tags=["Properties"])
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(models.Property).options(
        joinedload(models.Property.rooms).joinedload(models.Room.slots),
        joinedload(models.Property.reviews)
    ).filter(models.Property.id == property_id).first()

    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    prop = _calc_property_stats(prop)

    return {
        "id": prop.id,
        "name": prop.name,
        "description": prop.description,
        "property_type": prop.property_type,
        "gender_type": prop.gender_type,
        "area": prop.area,
        "full_address": prop.full_address,
        "latitude": prop.latitude,
        "longitude": prop.longitude,
        "rent": prop.rent,
        "other_price": prop.other_price,
        "security_deposit": prop.security_deposit,
        "safety_score": prop.safety_score,
        "distance": prop.distance,
        "verified_badge": prop.verified_badge,
        "amenities": prop.amenities or [],
        "images": prop.images or [],
        "avg_rating": prop.avg_rating,
        "review_count": prop.review_count,
        "available_slots": prop.available_slots,
        "approval_status": prop.approval_status,
        "rooms": [
            {
                "id": room.id,
                "room_label": room.room_label,
                "capacity": room.capacity,
                "rent_per_slot": room.rent_per_slot,
                "slots": [
                    {
                        "id": slot.id,
                        "slot_label": slot.slot_label,
                        "is_occupied": slot.is_occupied,
                        # PRIVACY: only show preferences, not identity
                        "roommate_prefs": slot.roommate_prefs if slot.is_occupied else None,
                        "about_me_snippet": slot.about_me_snippet if slot.is_occupied else None,
                    }
                    for slot in room.slots
                ],
            }
            for room in prop.rooms
        ],
        "reviews": [
            {
                "id": r.id,
                "noise_rating": r.noise_rating,
                "electricity_rating": r.electricity_rating,
                "owner_behavior_rating": r.owner_behavior_rating,
                "overall_rating": r.overall_rating,
                "comment": r.comment,
                "is_anonymous": r.is_anonymous,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in prop.reviews
        ],
    }


@app.post("/properties", tags=["Properties"])
def create_property(
    req: schemas.PropertyCreate,
    current_user: models.User = Depends(require_role("owner")),
    db: Session = Depends(get_db),
):
    prop = models.Property(
        owner_id=current_user.id,
        name=req.name,
        description=req.description,
        property_type=req.property_type,
        gender_type=req.gender_type,
        area=req.area,
        full_address=req.full_address,
        latitude=req.latitude,
        longitude=req.longitude,
        rent=req.rent,
        other_price=req.other_price,
        security_deposit=req.security_deposit,
        distance=req.distance,
        amenities=req.amenities,
        images=req.images,
        approval_status="PENDING",
    )
    db.add(prop)
    db.flush()

    for room_data in req.rooms:
        room = models.Room(
            property_id=prop.id,
            room_label=room_data.room_label,
            capacity=room_data.capacity,
            rent_per_slot=room_data.rent_per_slot,
        )
        db.add(room)
        db.flush()
        for slot_data in room_data.slots:
            db.add(models.Slot(room_id=room.id, slot_label=slot_data.slot_label))

    db.commit()
    db.refresh(prop)
    return {"id": prop.id, "name": prop.name, "approval_status": prop.approval_status}


# ─────────────── Compare Properties ───────────────

@app.post("/properties/compare", tags=["Properties"])
def compare_properties(ids: List[int], db: Session = Depends(get_db)):
    """Compare 2-3 properties side by side."""
    if len(ids) < 2 or len(ids) > 3:
        raise HTTPException(status_code=400, detail="Provide 2-3 property IDs to compare")

    result = []
    for pid in ids:
        prop = db.query(models.Property).options(
            joinedload(models.Property.rooms).joinedload(models.Room.slots),
            joinedload(models.Property.reviews)
        ).filter(models.Property.id == pid).first()
        if prop:
            prop = _calc_property_stats(prop)
            result.append(prop)

    return result


# ─────────────── Reviews ───────────────

@app.post("/reviews", tags=["Reviews"])
def create_review(
    req: schemas.ReviewCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    prop = db.query(models.Property).filter(models.Property.id == req.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    review = models.Review(
        property_id=req.property_id,
        author_id=current_user.id if not req.is_anonymous else None,
        noise_rating=req.noise_rating,
        electricity_rating=req.electricity_rating,
        owner_behavior_rating=req.owner_behavior_rating,
        overall_rating=req.overall_rating,
        comment=req.comment,
        is_anonymous=req.is_anonymous,
    )
    db.add(review)
    db.commit()
    return {"message": "Review submitted", "success": True}


@app.get("/properties/{property_id}/reviews", tags=["Reviews"])
def get_property_reviews(property_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(
        models.Review.property_id == property_id,
        models.Review.is_approved == True,
    ).all()
    return [
        {
            "id": r.id,
            "overall_rating": r.overall_rating,
            "noise_rating": r.noise_rating,
            "electricity_rating": r.electricity_rating,
            "owner_behavior_rating": r.owner_behavior_rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in reviews
    ]


# ─────────────── Tenancies (Owner view) ───────────────

@app.get("/owner/properties", tags=["Owner"])
def owner_properties(
    current_user: models.User = Depends(require_role("owner")),
    db: Session = Depends(get_db),
):
    props = db.query(models.Property).options(
        joinedload(models.Property.tenancies).joinedload(models.Tenancy.student),
        joinedload(models.Property.rooms).joinedload(models.Room.slots),
        joinedload(models.Property.reviews),
    ).filter(models.Property.owner_id == current_user.id).all()

    result = []
    for prop in props:
        prop = _calc_property_stats(prop)
        students = [
            {
                "id": t.student.id,
                "reg_no": t.student.reg_no,
                "name": t.student.name or "Student",
                "rent_status": t.rent_status,
                "issue_raised": t.issue_raised,
                "issue_description": t.issue_description,
                "tenancy_id": t.id,
            }
            for t in prop.tenancies if t.student
        ]
        result.append({
            "id": prop.id,
            "name": prop.name,
            "property_type": prop.property_type,
            "area": prop.area,
            "rent": prop.rent,
            "approval_status": prop.approval_status,
            "total_students": len(students),
            "pending_issues": sum(1 for s in students if s["issue_raised"]),
            "students": students,
            "available_slots": prop.available_slots,
        })
    return result


@app.patch("/tenancies/{tenancy_id}", tags=["Owner"])
def update_tenancy(
    tenancy_id: int,
    req: schemas.TenancyUpdate,
    current_user: models.User = Depends(require_role("owner")),
    db: Session = Depends(get_db),
):
    tenancy = db.query(models.Tenancy).filter(models.Tenancy.id == tenancy_id).first()
    if not tenancy:
        raise HTTPException(status_code=404, detail="Tenancy not found")

    if req.rent_status:
        tenancy.rent_status = req.rent_status
    if req.issue_raised is not None:
        tenancy.issue_raised = req.issue_raised
    if req.issue_description is not None:
        tenancy.issue_description = req.issue_description

    db.commit()
    return {"message": "Tenancy updated", "success": True}


# ─────────────── Services ───────────────

@app.get("/services", tags=["Services"])
def list_services(
    service_type: Optional[str] = Query(None),
    area: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Service)
    if service_type:
        query = query.filter(models.Service.service_type.ilike(f"%{service_type}%"))
    if area:
        query = query.filter(models.Service.area.ilike(f"%{area}%"))

    services = query.all()
    return [
        {
            "id": s.id,
            "service_type": s.service_type,
            "provider_name": s.provider_name,
            "phone": s.phone,
            "area": s.area,
            "rating": s.rating,
            "is_verified": s.is_verified,
        }
        for s in services
    ]


# ─────────────── Community ───────────────

@app.get("/community/groups", tags=["Community"])
def list_groups(db: Session = Depends(get_db)):
    groups = db.query(models.CommunityGroup).all()
    return [{"id": g.id, "name": g.name, "group_type": g.group_type, "description": g.description} for g in groups]


@app.get("/community/groups/{group_id}/posts", tags=["Community"])
def list_posts(group_id: int, db: Session = Depends(get_db)):
    posts = db.query(models.CommunityPost).filter(
        models.CommunityPost.group_id == group_id
    ).order_by(models.CommunityPost.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "content": p.content,
            "likes": p.likes,
            "is_anonymous": p.is_anonymous,
            "author_name": None if p.is_anonymous else (p.author.name if p.author else "Unknown"),
            "comment_count": len(p.comments),
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in posts
    ]


@app.post("/community/posts", tags=["Community"])
def create_post(
    req: schemas.PostCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = models.CommunityPost(
        group_id=req.group_id,
        author_id=current_user.id,
        content=req.content,
        is_anonymous=req.is_anonymous,
    )
    db.add(post)
    db.commit()
    return {"message": "Post created", "success": True}


@app.post("/community/posts/{post_id}/like", tags=["Community"])
def like_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.CommunityPost).filter(models.CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.likes += 1
    db.commit()
    return {"likes": post.likes}


@app.post("/community/posts/{post_id}/comments", tags=["Community"])
def add_comment(
    post_id: int,
    req: schemas.CommentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    comment = models.PostComment(
        post_id=post_id,
        author_id=current_user.id,
        content=req.content,
    )
    db.add(comment)
    db.commit()
    return {"message": "Comment added", "success": True}


# ─────────────── Commute ───────────────

@app.get("/commute/groups", tags=["Commute"])
def list_commute_groups(db: Session = Depends(get_db)):
    groups = db.query(models.CommuteGroup).options(
        joinedload(models.CommuteGroup.members)
    ).all()
    return [
        {
            "id": g.id,
            "departure_time": g.departure_time,
            "from_area": g.from_area,
            "to_area": g.to_area,
            "transport_type": g.transport_type,
            "max_members": g.max_members,
            "member_count": len(g.members),
        }
        for g in groups
    ]


@app.post("/commute/groups/{group_id}/join", tags=["Commute"])
def join_commute_group(
    group_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    group = db.query(models.CommuteGroup).options(
        joinedload(models.CommuteGroup.members)
    ).filter(models.CommuteGroup.id == group_id).first()

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if len(group.members) >= group.max_members:
        raise HTTPException(status_code=400, detail="Group is full")

    existing = db.query(models.CommuteGroupMember).filter(
        models.CommuteGroupMember.group_id == group_id,
        models.CommuteGroupMember.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already in this group")

    db.add(models.CommuteGroupMember(group_id=group_id, user_id=current_user.id))
    db.commit()
    return {"message": "Joined commute group", "success": True}


# ─────────────── Rent Trends ───────────────

@app.get("/rent-trends", tags=["Analytics"])
def get_rent_trends(
    area: Optional[str] = Query(None),
    property_type: Optional[str] = Query("PG"),
    db: Session = Depends(get_db),
):
    query = db.query(models.RentTrend)
    if area:
        query = query.filter(models.RentTrend.area == area)
    if property_type:
        query = query.filter(models.RentTrend.property_type == property_type)

    trends = query.order_by(models.RentTrend.id).all()
    return [
        {"area": t.area, "month": t.month, "avg_rent": t.avg_rent, "property_type": t.property_type}
        for t in trends
    ]


# ─────────────── Notifications ───────────────

@app.get("/notifications", tags=["Notifications"])
def get_notifications(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).limit(20).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "notif_type": n.notif_type,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifs
    ]


@app.patch("/notifications/{notif_id}/read", tags=["Notifications"])
def mark_read(
    notif_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id,
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}


# ─────────────── Moderator ───────────────

@app.get("/moderator/pending-owners", tags=["Moderator"])
def pending_owners(
    current_user: models.User = Depends(require_role("moderator")),
    db: Session = Depends(get_db),
):
    owners = db.query(models.User).filter(
        models.User.role == "owner",
        models.User.is_verified == False,
    ).all()
    return [{"id": u.id, "name": u.name, "phone": u.phone, "created_at": u.created_at} for u in owners]


@app.get("/moderator/pending-properties", tags=["Moderator"])
def pending_properties(
    current_user: models.User = Depends(require_role("moderator")),
    db: Session = Depends(get_db),
):
    props = db.query(models.Property).filter(
        models.Property.approval_status == "PENDING"
    ).all()
    return [{"id": p.id, "name": p.name, "area": p.area, "rent": p.rent} for p in props]


@app.patch("/moderator/owners/{owner_id}", tags=["Moderator"])
def moderate_owner(
    owner_id: int,
    action: schemas.ModerationAction,
    current_user: models.User = Depends(require_role("moderator")),
    db: Session = Depends(get_db),
):
    owner = db.query(models.User).filter(models.User.id == owner_id, models.User.role == "owner").first()
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")

    if action.action == "APPROVE":
        owner.is_verified = True
    elif action.action == "REJECT":
        owner.is_active = False
    else:
        raise HTTPException(status_code=400, detail="Action must be APPROVE or REJECT")

    db.commit()
    return {"message": f"Owner {action.action}D successfully", "success": True}


@app.patch("/moderator/properties/{property_id}", tags=["Moderator"])
def moderate_property(
    property_id: int,
    action: schemas.ModerationAction,
    current_user: models.User = Depends(require_role("moderator")),
    db: Session = Depends(get_db),
):
    prop = db.query(models.Property).filter(models.Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    if action.action == "APPROVE":
        prop.approval_status = "APPROVED"
        prop.verified_badge = True
    elif action.action == "REJECT":
        prop.approval_status = "REJECTED"
    else:
        raise HTTPException(status_code=400, detail="Action must be APPROVE or REJECT")

    db.commit()
    return {"message": f"Property {action.action}D successfully", "success": True}


@app.get("/moderator/reviews", tags=["Moderator"])
def all_reviews_for_moderation(
    current_user: models.User = Depends(require_role("moderator")),
    db: Session = Depends(get_db),
):
    reviews = db.query(models.Review).all()
    return [
        {
            "id": r.id,
            "property_id": r.property_id,
            "overall_rating": r.overall_rating,
            "comment": r.comment,
            "is_approved": r.is_approved,
        }
        for r in reviews
    ]


@app.patch("/moderator/reviews/{review_id}", tags=["Moderator"])
def moderate_review(
    review_id: int,
    action: schemas.ModerationAction,
    current_user: models.User = Depends(require_role("moderator")),
    db: Session = Depends(get_db),
):
    review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_approved = (action.action == "APPROVE")
    db.commit()
    return {"message": f"Review {action.action}D", "success": True}


# ─────────────── File Upload ───────────────

@app.post("/upload", tags=["Files"])
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")

    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp", "gif"]:
        raise HTTPException(status_code=400, detail="Only image files allowed")

    import uuid
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return {"url": f"/uploads/{filename}", "filename": filename}
