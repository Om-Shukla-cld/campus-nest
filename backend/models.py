from sqlalchemy import (
    Column, Integer, String, Boolean, Float,
    ForeignKey, DateTime, JSON, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


# ─────────────── Enums ───────────────

class UserRole(str, enum.Enum):
    student = "student"
    owner = "owner"
    moderator = "moderator"
    guest = "guest"


class PropertyType(str, enum.Enum):
    PG = "PG"
    Flat = "Flat"


class GenderType(str, enum.Enum):
    Boys = "Boys"
    Girls = "Girls"
    CoEd = "Co-ed"
    Any = "Any"


class RentStatus(str, enum.Enum):
    Paid = "PAID"
    Unpaid = "UNPAID"
    Partial = "PARTIAL"


class ApprovalStatus(str, enum.Enum):
    Pending = "PENDING"
    Approved = "APPROVED"
    Rejected = "REJECTED"


# ─────────────── Models ───────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    reg_no = Column(String(20), unique=True, index=True, nullable=True)      # Students only
    role = Column(String(20), default="student", nullable=False)
    gender = Column(String(10), nullable=True)
    parent_phone = Column(String(20), nullable=True)
    face_id_url = Column(String(500), nullable=True)
    photo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    owned_properties = relationship("Property", back_populates="owner", foreign_keys="Property.owner_id")
    tenancies = relationship("Tenancy", back_populates="student")
    reviews = relationship("Review", back_populates="author")
    community_posts = relationship("CommunityPost", back_populates="author")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    otp_records = relationship("OTPRecord", back_populates="user", cascade="all, delete-orphan")


class OTPRecord(Base):
    """Stores OTP codes for phone verification."""
    __tablename__ = "otp_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    phone = Column(String(20), nullable=False, index=True)
    otp_code = Column(String(10), nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="otp_records")


class Profile(Base):
    """Student lifestyle preferences for roommate matching."""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    veg = Column(String(20), default="Veg")               # Veg / Non-veg / Vegan
    smoker = Column(String(20), default="Non-smoker")     # Smoker / Non-smoker / Occasional
    sleep = Column(String(20), default="Flexible")        # Early Bird / Night Owl / Flexible
    cleanliness = Column(String(30), default="Neat Freak")
    study = Column(String(30), default="Library Dweller")
    about_me = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    property_type = Column(String(10), default="PG")         # PG / Flat
    gender_type = Column(String(10), default="Co-ed")        # Boys / Girls / Co-ed / Any
    area = Column(String(200), nullable=True)
    full_address = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Pricing
    rent = Column(Integer, nullable=False)
    other_price = Column(Integer, nullable=True)             # Price on other platforms
    security_deposit = Column(Integer, nullable=True)

    # Metadata
    safety_score = Column(Float, default=3.0)
    distance = Column(String(20), nullable=True)            # e.g. "1.2km"
    approval_status = Column(String(20), default="PENDING")
    is_active = Column(Boolean, default=True)
    verified_badge = Column(Boolean, default=False)

    # Amenities stored as JSON list
    amenities = Column(JSON, default=list)                  # ["Wifi", "Inverter", "Food", ...]
    images = Column(JSON, default=list)                     # List of image URLs

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_properties", foreign_keys=[owner_id])
    rooms = relationship("Room", back_populates="property", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="property", cascade="all, delete-orphan")
    tenancies = relationship("Tenancy", back_populates="property")


class Room(Base):
    """A room inside a property with multiple slots."""
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"))
    room_label = Column(String(50), default="Room A")       # Room A, Room B, etc.
    capacity = Column(Integer, default=2)
    rent_per_slot = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property", back_populates="rooms")
    slots = relationship("Slot", back_populates="room", cascade="all, delete-orphan")


class Slot(Base):
    """Individual bed slot inside a room."""
    __tablename__ = "slots"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"))
    slot_label = Column(String(20), default="Slot 1")
    is_occupied = Column(Boolean, default=False)
    # Anonymous roommate preferences (Profile snapshot, NOT user identity)
    roommate_prefs = Column(JSON, nullable=True)            # {"veg":"Veg", "smoker":"Non-smoker", ...}
    about_me_snippet = Column(Text, nullable=True)          # Anonymous snippet
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="slots")
    tenancy = relationship("Tenancy", back_populates="slot", uselist=False)


class Tenancy(Base):
    """Links a student to a slot in a property."""
    __tablename__ = "tenancies"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"))
    slot_id = Column(Integer, ForeignKey("slots.id", ondelete="SET NULL"), nullable=True)
    rent_status = Column(String(20), default="UNPAID")      # PAID / UNPAID / PARTIAL
    issue_raised = Column(Boolean, default=False)
    issue_description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="tenancies")
    property = relationship("Property", back_populates="tenancies")
    slot = relationship("Slot", back_populates="tenancy")


class Review(Base):
    """Anonymous property reviews."""
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id", ondelete="CASCADE"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # Rating dimensions
    noise_rating = Column(Float, nullable=True)
    electricity_rating = Column(Float, nullable=True)
    owner_behavior_rating = Column(Float, nullable=True)
    overall_rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    property = relationship("Property", back_populates="reviews")
    author = relationship("User", back_populates="reviews")


class Service(Base):
    """Local services like electrician, plumber, etc."""
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    service_type = Column(String(50), nullable=False)       # Electrician, Plumber, Maid, Cook, Tiffin
    provider_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    area = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, default=4.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CommunityGroup(Base):
    __tablename__ = "community_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    group_type = Column(String(30), default="General")      # General / BuySell / GenderBased
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("CommunityPost", back_populates="group", cascade="all, delete-orphan")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("community_groups.id", ondelete="CASCADE"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    likes = Column(Integer, default=0)
    is_anonymous = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("CommunityGroup", back_populates="posts")
    author = relationship("User", back_populates="community_posts")
    comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")


class PostComment(Base):
    __tablename__ = "post_comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("community_posts.id", ondelete="CASCADE"))
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("CommunityPost", back_populates="comments")


class CommuteGroup(Base):
    """Smart transport groups for students travelling together."""
    __tablename__ = "commute_groups"

    id = Column(Integer, primary_key=True, index=True)
    departure_time = Column(String(20), nullable=False)     # "09:00 AM"
    from_area = Column(String(100), nullable=True)
    to_area = Column(String(100), nullable=True)
    transport_type = Column(String(30), default="Car")
    max_members = Column(Integer, default=4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("CommuteGroupMember", back_populates="group", cascade="all, delete-orphan")


class CommuteGroupMember(Base):
    __tablename__ = "commute_group_members"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("commute_groups.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    group = relationship("CommuteGroup", back_populates="members")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notif_type = Column(String(30), default="info")         # info / warning / success / alert
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class RentTrend(Base):
    """Historical rent data per area for the Rent Analyzer."""
    __tablename__ = "rent_trends"

    id = Column(Integer, primary_key=True, index=True)
    area = Column(String(100), nullable=False)
    month = Column(String(20), nullable=False)              # "Jan 2024"
    avg_rent = Column(Integer, nullable=False)
    property_type = Column(String(10), default="PG")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
