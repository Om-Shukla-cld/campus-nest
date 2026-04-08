"""
Seed script to populate demo data including VIT Bhopal housing directory.
Run from the backend/ directory: python seed.py
Or from project root:           python -m backend.seed
"""
import os
import csv
import sys

# ── Make sure the backend package is importable when run as a script ──
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

from database import SessionLocal, engine
import models

# ──────────────────────────────────────────────────────────────────────
# CSV path – sits next to this file, or fall back to dev-env upload path
# ──────────────────────────────────────────────────────────────────────
_CSV_CANDIDATES = [
    os.path.join(_HERE, "vit_bhopal_housing_directory.csv"),
    os.path.join(_HERE, "..", "vit_bhopal_housing_directory.csv"),
    "/mnt/user-data/uploads/vit_bhopal_housing_directory.csv",
]
VIT_CSV_PATH = next((p for p in _CSV_CANDIDATES if os.path.exists(p)), None)


def seed_all():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.Property).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")
        _seed_moderator(db)
        _seed_owners_and_properties(db)
        _seed_vit_bhopal_csv(db)
        _seed_services(db)
        _seed_community(db)
        _seed_commute_groups(db)
        _seed_rent_trends(db)
        db.commit()
        print("Seeding complete!")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        db.close()


def _seed_moderator(db):
    mod = models.User(
        name="Admin Moderator",
        phone="+910000000000",
        role="moderator",
        is_active=True,
        is_verified=True,
        profile_complete=True,
    )
    db.add(mod)
    db.flush()
    print(f"  Created moderator: {mod.phone}")


def _seed_owners_and_properties(db):
    owners_data = [
        {"name": "Ramesh Kumar", "phone": "+911111111111"},
        {"name": "Sneha Sharma", "phone": "+912222222222"},
        {"name": "Amit Mehta",   "phone": "+913333333333"},
    ]
    owners = []
    for od in owners_data:
        o = models.User(
            name=od["name"], phone=od["phone"],
            role="owner", is_active=True, is_verified=True, profile_complete=True,
        )
        db.add(o)
        db.flush()
        owners.append(o)

    properties_data = [
        {"name": "Sunshine PG",       "type": "PG",   "gender": "Boys",  "area": "Kothri",             "rent": 8500,  "other": 10500, "safety": 4.8, "dist": "1.2km", "amenities": ["Wifi","Inverter","Food"],  "owner_idx": 0},
        {"name": "Royal Stay PG",     "type": "PG",   "gender": "Co-ed", "area": "Behind Petrol Pump", "rent": 7000,  "other": 9000,  "safety": 2.8, "dist": "3.1km", "amenities": ["Wifi"],                    "owner_idx": 1},
        {"name": "Luxury Haven",      "type": "PG",   "gender": "Girls", "area": "Ashta",              "rent": 15000, "other": 18500, "safety": 5.0, "dist": "0.8km", "amenities": ["Wifi","Food","AC"],        "owner_idx": 2},
        {"name": "Zolo Horizon",      "type": "PG",   "gender": "Co-ed", "area": "Kothri",             "rent": 9500,  "other": 12000, "safety": 4.6, "dist": "1.5km", "amenities": ["Wifi","Gym"],              "owner_idx": 0},
        {"name": "Stanza Living",     "type": "PG",   "gender": "Girls", "area": "Ashta",              "rent": 11000, "other": 14500, "safety": 4.7, "dist": "2.0km", "amenities": ["Food","Wifi"],             "owner_idx": 1},
        {"name": "Comfort PG",        "type": "PG",   "gender": "Boys",  "area": "Behind Petrol Pump", "rent": 6500,  "other": 8500,  "safety": 3.0, "dist": "2.8km", "amenities": ["Inverter"],                "owner_idx": 2},
        {"name": "Elite Stay",        "type": "PG",   "gender": "Co-ed", "area": "Kothri",             "rent": 13000, "other": 16000, "safety": 5.0, "dist": "0.5km", "amenities": ["Wifi","AC","Food"],        "owner_idx": 0},
        {"name": "Student Home",      "type": "PG",   "gender": "Co-ed", "area": "Ashta",              "rent": 8000,  "other": 10000, "safety": 4.2, "dist": "1.8km", "amenities": ["Wifi","Parking"],          "owner_idx": 1},
        {"name": "Modern Nest",       "type": "PG",   "gender": "Girls", "area": "Kothri",             "rent": 10000, "other": 13000, "safety": 4.8, "dist": "1.1km", "amenities": ["Wifi","Food"],             "owner_idx": 2},
        {"name": "Safe Haven",        "type": "PG",   "gender": "Co-ed", "area": "Ashta",              "rent": 14000, "other": 17500, "safety": 4.9, "dist": "0.9km", "amenities": ["Wifi","Inverter","Food"],  "owner_idx": 0},
        {"name": "Gomti Apartments",  "type": "Flat", "gender": "Any",   "area": "Ashta",              "rent": 25000, "other": 32000, "safety": 4.8, "dist": "2.2km", "amenities": ["Parking","Inverter"],      "owner_idx": 1},
        {"name": "Unity Flat",        "type": "Flat", "gender": "Any",   "area": "Kothri",             "rent": 18000, "other": 24000, "safety": 4.5, "dist": "1.5km", "amenities": ["Wifi"],                    "owner_idx": 2},
        {"name": "Urban Residencies", "type": "Flat", "gender": "Any",   "area": "Ashta",              "rent": 35000, "other": 45000, "safety": 4.9, "dist": "3.5km", "amenities": ["Gym","Parking"],           "owner_idx": 0},
        {"name": "Metro Heights",     "type": "Flat", "gender": "Any",   "area": "Behind Petrol Pump", "rent": 22000, "other": 28000, "safety": 3.8, "dist": "2.5km", "amenities": ["Inverter"],                "owner_idx": 1},
        {"name": "Skyline Flat",      "type": "Flat", "gender": "Any",   "area": "Kothri",             "rent": 28000, "other": 38000, "safety": 4.7, "dist": "1.8km", "amenities": ["Wifi","Parking"],          "owner_idx": 2},
    ]

    for pd in properties_data:
        prop = models.Property(
            owner_id=owners[pd["owner_idx"]].id,
            name=pd["name"],
            property_type=pd["type"],
            gender_type=pd["gender"],
            area=pd["area"],
            rent=pd["rent"],
            other_price=pd["other"],
            safety_score=pd["safety"],
            distance=pd["dist"],
            amenities=pd["amenities"],
            images=["/pg-preview.png"],
            approval_status="APPROVED",
            verified_badge=True,
        )
        db.add(prop)
        db.flush()

        for room_label in ["Room A", "Room B"]:
            room = models.Room(property_id=prop.id, room_label=room_label, capacity=2)
            db.add(room)
            db.flush()
            db.add(models.Slot(
                room_id=room.id, slot_label="Slot 1", is_occupied=True,
                roommate_prefs={"veg": "Veg", "smoker": "Non-smoker", "sleep": "Night Owl"},
                about_me_snippet="Quiet, clean, prefer non-smokers. Study from home.",
            ))
            db.add(models.Slot(room_id=room.id, slot_label="Slot 2", is_occupied=False))

        db.add(models.Review(
            property_id=prop.id,
            noise_rating=round(pd["safety"] - 0.3, 1),
            electricity_rating=round(pd["safety"] - 0.1, 1),
            owner_behavior_rating=min(round(pd["safety"] + 0.1, 1), 5.0),
            overall_rating=round(pd["safety"] - 0.2, 1),
            comment="Great place, very clean and safe. Highly recommended for students.",
            is_anonymous=True,
            is_approved=True,
        ))

    print(f"  Created {len(properties_data)} demo properties")


# ── VIT Bhopal CSV helpers ────────────────────────────────────────────

def _parse_bool_amenity(value):
    if not value:
        return False
    v = value.strip().lower()
    return v.startswith("yes") or v not in ("no", "unknown", "n/a", "")


def _csv_amenities(row):
    mapping = {
        "wifi": "Wifi",
        "inverter_power_backup": "Inverter",
        "western_washroom": "Western Washroom",
        "food_included": "Food",
        "parking": "Parking",
    }
    return [label for col, label in mapping.items() if _parse_bool_amenity(row.get(col, ""))]


def _csv_gender(raw):
    v = (raw or "").strip().lower()
    if "girl" in v or "female" in v:
        return "Girls"
    if "boy" in v or "male" in v:
        return "Boys"
    if "unisex" in v or "mixed" in v or "co" in v:
        return "Co-ed"
    return "Any"


def _csv_property_type(raw):
    v = (raw or "").strip().lower()
    return "Flat" if ("flat" in v or "apartment" in v) else "PG"


def _seed_vit_bhopal_csv(db):
    if not VIT_CSV_PATH:
        print("  WARNING: VIT Bhopal CSV not found – skipping.")
        print("  Copy vit_bhopal_housing_directory.csv next to seed.py to enable.")
        return

    csv_owner = models.User(
        name="VIT Bhopal Directory",
        phone="+919999999999",
        role="owner",
        is_active=True,
        is_verified=True,
        profile_complete=True,
    )
    db.add(csv_owner)
    db.flush()

    count = 0
    with open(VIT_CSV_PATH, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            # Skip reference row (VIT campus itself)
            if row.get("type", "").strip().lower().startswith("university"):
                continue
            if row.get("status", "").strip().lower() != "active":
                continue

            try:
                rent_min = int(row.get("estimated_rent_min") or 0)
            except (ValueError, TypeError):
                rent_min = 0
            try:
                rent_max = int(row.get("estimated_rent_max") or 0)
            except (ValueError, TypeError):
                rent_max = 0

            rent = rent_min if rent_min else (rent_max or 5000)
            other_price = rent_max if rent_max and rent_max != rent else None

            try:
                lat = float(row.get("latitude") or 0) or None
            except (ValueError, TypeError):
                lat = None
            try:
                lng = float(row.get("longitude") or 0) or None
            except (ValueError, TypeError):
                lng = None

            try:
                safety = float(row.get("rating") or 3.0)
            except (ValueError, TypeError):
                safety = 3.0

            dist_raw = str(row.get("distance_from_vit_km") or "").strip()
            dist_str = dist_raw.lstrip("~") + "km" if dist_raw and dist_raw not in ("N/A", "0") else None

            prop = models.Property(
                owner_id=csv_owner.id,
                name=row.get("name", "Unknown PG"),
                description=row.get("source_notes") or None,
                property_type=_csv_property_type(row.get("type", "")),
                gender_type=_csv_gender(row.get("gender", "")),
                area=row.get("area") or row.get("city") or "Bhopal",
                full_address=row.get("full_address") or None,
                latitude=lat,
                longitude=lng,
                rent=rent,
                other_price=other_price,
                safety_score=safety,
                distance=dist_str,
                amenities=_csv_amenities(row),
                images=["/pg-preview.png"],
                approval_status="APPROVED",
                verified_badge=(row.get("verified", "").strip().lower() == "yes"),
            )
            db.add(prop)
            db.flush()

            room = models.Room(property_id=prop.id, room_label="Room A", capacity=2)
            db.add(room)
            db.flush()
            db.add(models.Slot(room_id=room.id, slot_label="Slot 1", is_occupied=False))
            db.add(models.Slot(room_id=room.id, slot_label="Slot 2", is_occupied=False))

            try:
                rv = float(row.get("rating") or 0)
            except (ValueError, TypeError):
                rv = 0.0
            if rv > 0:
                db.add(models.Review(
                    property_id=prop.id,
                    overall_rating=rv,
                    comment=row.get("source_notes") or "Listed in VIT Bhopal housing directory.",
                    is_anonymous=True,
                    is_approved=True,
                ))

            count += 1

    print(f"  Imported {count} properties from VIT Bhopal CSV")


def _seed_services(db):
    services = [
        {"type": "Electrician", "name": "Ram Singh",    "phone": "+919832144556", "area": "Kothri",             "rating": 4.9},
        {"type": "Electrician", "name": "Mohan Repairs","phone": "+919234567890", "area": "Ashta",              "rating": 4.5},
        {"type": "Plumber",     "name": "Quick Fix Co.","phone": "+919988776655", "area": "Kothri",             "rating": 4.7},
        {"type": "Plumber",     "name": "Pipe Masters", "phone": "+919876543210", "area": "Behind Petrol Pump", "rating": 4.2},
        {"type": "Maid",        "name": "Home Help Co.","phone": "+919123456789", "area": "Ashta",              "rating": 4.5},
        {"type": "Cook",        "name": "Chef Sunita",  "phone": "+919876012345", "area": "Kothri",             "rating": 4.8},
        {"type": "Tiffin",      "name": "Ma's Kitchen", "phone": "+918877665544", "area": "Kothri",             "rating": 5.0},
        {"type": "Tiffin",      "name": "Shree Tiffin", "phone": "+918765432109", "area": "Ashta",              "rating": 4.6},
    ]
    for s in services:
        db.add(models.Service(
            service_type=s["type"], provider_name=s["name"],
            phone=s["phone"], area=s["area"], rating=s["rating"], is_verified=True,
        ))
    print(f"  Created {len(services)} services")


def _seed_community(db):
    groups = [
        models.CommunityGroup(name="General Campus", group_type="General",     description="All campus discussions"),
        models.CommunityGroup(name="Buy & Sell",     group_type="BuySell",     description="Marketplace for students"),
        models.CommunityGroup(name="Girls Only",     group_type="GenderBased", description="Safe space for girls"),
    ]
    for g in groups:
        db.add(g)
    db.flush()

    posts = [
        {"group_idx": 0, "content": "Anyone have extra notes for Physics 101? Need them before exams!", "likes": 12},
        {"group_idx": 0, "content": "Sunshine PG has the best WiFi in the area. Clocked 150Mbps!",     "likes": 8},
        {"group_idx": 1, "content": "Selling my electric kettle for 500. Barely used. DM me.",          "likes": 2},
        {"group_idx": 1, "content": "Samsung laptop (8GB RAM, 256GB SSD) selling for 28000.",           "likes": 5},
        {"group_idx": 2, "content": "Looking for a female roommate for Luxury Haven. Non-smoker pref.", "likes": 7},
    ]
    for pd in posts:
        db.add(models.CommunityPost(
            group_id=groups[pd["group_idx"]].id,
            content=pd["content"],
            likes=pd["likes"],
            is_anonymous=True,
        ))
    print(f"  Created {len(groups)} community groups + {len(posts)} posts")


def _seed_commute_groups(db):
    groups = [
        models.CommuteGroup(departure_time="08:00 AM", from_area="Kothri Junction",    to_area="VIT Campus", transport_type="Car",  max_members=4),
        models.CommuteGroup(departure_time="09:00 AM", from_area="Ashta Main Road",    to_area="VIT Campus", transport_type="Auto", max_members=3),
        models.CommuteGroup(departure_time="10:00 AM", from_area="Behind Petrol Pump", to_area="VIT Campus", transport_type="Bike", max_members=2),
    ]
    for g in groups:
        db.add(g)
    print(f"  Created {len(groups)} commute groups")


def _seed_rent_trends(db):
    areas = ["Kothri", "Ashta", "Behind Petrol Pump"]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
    base_rents = {"Kothri": 8500, "Ashta": 9200, "Behind Petrol Pump": 7500}
    for area in areas:
        base = base_rents[area]
        for i, month in enumerate(months):
            db.add(models.RentTrend(area=area, month=f"{month} 2024", avg_rent=base + i * 120, property_type="PG"))
    print("  Created rent trend data")


if __name__ == "__main__":
    seed_all()
