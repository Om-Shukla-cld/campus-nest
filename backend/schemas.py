from pydantic import BaseModel, validator, Field
from typing import List, Optional, Any, Dict
from datetime import datetime


# ─────────────── OTP / Auth ───────────────

class SendOTPRequest(BaseModel):
    phone: str

    @validator("phone")
    def validate_phone(cls, v):
        v = v.strip().replace(" ", "").replace("-", "")
        if not v.startswith("+"):
            v = "+91" + v.lstrip("0")
        return v


class VerifyOTPRequest(BaseModel):
    phone: str
    otp_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    profile_complete: bool


# ─────────────── Student Registration ───────────────

class StudentRegisterRequest(BaseModel):
    phone: str
    reg_no: str
    otp_code: str
    name: Optional[str] = None
    gender: Optional[str] = "Other"
    parent_phone: Optional[str] = None
    face_id_url: Optional[str] = None

    @validator("reg_no")
    def validate_reg_no(cls, v):
        import re
        pattern = r"^\d{2}[a-zA-Z]{3}\d{5}$"
        if not re.match(pattern, v):
            raise ValueError("Registration number must be in format: 11abc11111")
        return v.upper()


class StudentLoginRequest(BaseModel):
    identifier: str      # Phone or reg_no
    otp_code: str


# ─────────────── Owner Registration ───────────────

class OwnerRegisterRequest(BaseModel):
    name: str
    phone: str
    otp_code: str
    photo_url: Optional[str] = None


class OwnerLoginRequest(BaseModel):
    phone: str
    otp_code: str


# ─────────────── Profile ───────────────

class ProfileCreate(BaseModel):
    veg: str = "Veg"
    smoker: str = "Non-smoker"
    sleep: str = "Flexible"
    cleanliness: str = "Neat Freak"
    study: str = "Library Dweller"
    about_me: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    veg: str
    smoker: str
    sleep: str
    cleanliness: str
    study: str
    about_me: Optional[str]

    class Config:
        from_attributes = True


# ─────────────── User ───────────────

class UserResponse(BaseModel):
    id: int
    name: Optional[str]
    phone: str
    reg_no: Optional[str]
    role: str
    gender: Optional[str]
    is_verified: bool
    profile_complete: bool
    profile: Optional[ProfileResponse]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────── Property ───────────────

class SlotCreate(BaseModel):
    slot_label: str = "Slot 1"


class SlotResponse(BaseModel):
    id: int
    slot_label: str
    is_occupied: bool
    roommate_prefs: Optional[Dict[str, Any]]
    about_me_snippet: Optional[str]

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    room_label: str = "Room A"
    capacity: int = 2
    rent_per_slot: Optional[int] = None
    slots: List[SlotCreate] = []


class RoomResponse(BaseModel):
    id: int
    room_label: str
    capacity: int
    rent_per_slot: Optional[int]
    slots: List[SlotResponse]

    class Config:
        from_attributes = True


class PropertyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    property_type: str = "PG"       # PG / Flat
    gender_type: str = "Co-ed"      # Boys / Girls / Co-ed / Any
    area: Optional[str] = None
    full_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rent: int
    other_price: Optional[int] = None
    security_deposit: Optional[int] = None
    distance: Optional[str] = None
    amenities: List[str] = []
    images: List[str] = []
    rooms: List[RoomCreate] = []


class PropertyResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    property_type: str
    gender_type: str
    area: Optional[str]
    full_address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    rent: int
    other_price: Optional[int]
    security_deposit: Optional[int]
    safety_score: float
    distance: Optional[str]
    approval_status: str
    verified_badge: bool
    amenities: List[str]
    images: List[str]
    rooms: List[RoomResponse]
    avg_rating: Optional[float] = None
    review_count: Optional[int] = 0
    available_slots: Optional[int] = 0

    class Config:
        from_attributes = True


class PropertyListItem(BaseModel):
    """Lightweight listing for search results."""
    id: int
    name: str
    property_type: str
    gender_type: str
    area: Optional[str]
    rent: int
    other_price: Optional[int]
    safety_score: float
    distance: Optional[str]
    verified_badge: bool
    amenities: List[str]
    images: List[str]
    avg_rating: Optional[float]
    review_count: int
    available_slots: int
    approval_status: str

    class Config:
        from_attributes = True


# ─────────────── Review ───────────────

class ReviewCreate(BaseModel):
    property_id: int
    noise_rating: Optional[float] = Field(None, ge=1, le=5)
    electricity_rating: Optional[float] = Field(None, ge=1, le=5)
    owner_behavior_rating: Optional[float] = Field(None, ge=1, le=5)
    overall_rating: float = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    is_anonymous: bool = True


class ReviewResponse(BaseModel):
    id: int
    noise_rating: Optional[float]
    electricity_rating: Optional[float]
    owner_behavior_rating: Optional[float]
    overall_rating: float
    comment: Optional[str]
    is_anonymous: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────── Tenancy ───────────────

class TenancyCreate(BaseModel):
    property_id: int
    slot_id: Optional[int] = None


class TenancyResponse(BaseModel):
    id: int
    property_id: int
    rent_status: str
    issue_raised: bool
    issue_description: Optional[str]

    class Config:
        from_attributes = True


class TenancyUpdate(BaseModel):
    rent_status: Optional[str] = None
    issue_raised: Optional[bool] = None
    issue_description: Optional[str] = None


# ─────────────── Services ───────────────

class ServiceResponse(BaseModel):
    id: int
    service_type: str
    provider_name: str
    phone: str
    area: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    rating: float
    is_verified: bool

    class Config:
        from_attributes = True


# ─────────────── Community ───────────────

class PostCreate(BaseModel):
    group_id: int
    content: str
    is_anonymous: bool = False


class CommentCreate(BaseModel):
    content: str


class PostResponse(BaseModel):
    id: int
    group_id: int
    content: str
    likes: int
    is_anonymous: bool
    created_at: Optional[datetime]
    author_name: Optional[str] = None
    comment_count: int = 0

    class Config:
        from_attributes = True


class GroupResponse(BaseModel):
    id: int
    name: str
    group_type: str
    description: Optional[str]

    class Config:
        from_attributes = True


# ─────────────── Commute ───────────────

class CommuteGroupCreate(BaseModel):
    departure_time: str
    from_area: str
    to_area: str = "VIT Campus"
    transport_type: str = "Car"
    max_members: int = 4


class CommuteGroupResponse(BaseModel):
    id: int
    departure_time: str
    from_area: Optional[str]
    to_area: Optional[str]
    transport_type: str
    max_members: int
    member_count: int = 0

    class Config:
        from_attributes = True


# ─────────────── Rent Trends ───────────────

class RentTrendResponse(BaseModel):
    area: str
    month: str
    avg_rent: int
    property_type: str

    class Config:
        from_attributes = True


# ─────────────── Notifications ───────────────

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    is_read: bool
    notif_type: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─────────────── Moderation ───────────────

class ModerationAction(BaseModel):
    action: str         # APPROVE / REJECT
    reason: Optional[str] = None


# ─────────────── Generic ───────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int
