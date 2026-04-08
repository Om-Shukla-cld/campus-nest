# 🏠 CampusNest – Student Housing & Community Platform

A full-stack student housing platform with roommate matching, community hub, anonymous reviews, and property management.

---

## 🚀 Quick Start

### Backend (FastAPI + SQLite/PostgreSQL)

```bash
cd backend
pip install -r requirements.txt

# Run the server (SQLite by default — no setup needed!)
uvicorn backend.main:app --reload --port 8000
```

- The database is auto-created with demo data on first run.
- API docs: http://localhost:8000/docs

### Frontend (React + Vite)

```bash
# From project root / frontend directory
npm install
npm run dev
```

- App runs at: http://localhost:5173
- Set `VITE_API_URL=http://localhost:8000` in `.env` (optional, defaults to this)

---

## 📁 Project Structure

```
campusnest/
├── backend/
│   ├── main.py           # FastAPI app + all API routes
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── database.py       # DB engine + session
│   ├── auth.py           # JWT + role-based access
│   ├── config.py         # Settings (SQLite/PostgreSQL toggle)
│   ├── seed.py           # Demo data seeding
│   └── requirements.txt
│
├── src/
│   ├── App.jsx           # Root with session persistence
│   ├── utils/api.js      # API client service
│   ├── index.css         # Tailwind + custom styles
│   └── components/
│       ├── LandingPage.jsx        # Hero + Auth forms
│       ├── StudentDashboard.jsx   # Full student portal
│       ├── OwnerDashboard.jsx     # Property manager
│       ├── ModeratorDashboard.jsx # Admin panel
│       ├── GuestDashboard.jsx     # Browse-only mode
│       ├── AboutMeModal.jsx       # Profile setup popup
│       ├── CompareProperties.jsx  # Side-by-side compare
│       ├── RentAnalyzer.jsx       # Charts + insights
│       ├── SmartTransport.jsx     # Commute matching
│       ├── CommunityHub.jsx       # Posts + groups
│       └── GetServices.jsx        # Local service directory
```

---

## 🔑 Demo Credentials

| Role | Login Info |
|------|-----------|
| **Student** | Any reg no (e.g. `21BCE0001`) + OTP `1234` |
| **Owner** | Any phone + OTP `1234` |
| **Moderator** | Phone `+910000000000` |
| **Guest** | Click "Browse Now" — no login needed |

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/send-otp` | Send OTP (demo: always 1234) |
| POST | `/auth/student/register` | Student registration |
| POST | `/auth/student/login` | Student login |
| POST | `/auth/owner/register` | Owner registration |
| POST | `/auth/owner/login` | Owner login |
| GET | `/properties` | List/search properties |
| GET | `/properties/{id}` | Property detail with rooms/slots |
| POST | `/properties/compare` | Compare 2–3 properties |
| POST | `/reviews` | Submit anonymous review |
| GET | `/services` | List local services |
| GET | `/community/groups` | Community channels |
| GET | `/community/groups/{id}/posts` | Posts in channel |
| POST | `/community/posts` | Create post |
| GET | `/commute/groups` | Transport groups |
| GET | `/rent-trends` | Rent trend data |
| GET | `/owner/properties` | Owner's properties + tenants |
| PATCH | `/moderator/owners/{id}` | Approve/reject owner |
| PATCH | `/moderator/properties/{id}` | Approve/reject listing |

Full interactive docs: **http://localhost:8000/docs**

---

## ✨ Key Features

- **JWT Auth** with OTP verification (phone-based)
- **Role-based access**: Student / Owner / Moderator / Guest
- **Roommate Matching** — anonymous preference display (privacy-first)
- **Compare Properties** — side-by-side comparison (2–3 properties)
- **Rent Analyzer** — area-wise trend charts (Recharts)
- **Community Hub** — group posts, likes, comments, anonymous mode
- **Smart Transport** — commute group matching by time
- **Local Services** — electrician, plumber, tiffin, cook, maid
- **Anonymous Reviews** with multi-dimension ratings
- **Moderator Dashboard** — approve owners, properties, reviews
- **Guest Mode** — browse-only with upgrade prompt
- **About Me Modal** — mandatory student lifestyle profile
- **Session persistence** via localStorage

---

## 🗄️ Database

Default: **SQLite** (file: `campusnest.db`) — no setup needed.

To switch to **PostgreSQL**:
1. Update `config.py`: set `USE_SQLITE = False`
2. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/campusnest
   ```
3. Create the database: `createdb campusnest`
4. Run the server — tables are auto-created.

---

## 🔧 Environment Variables

Create `.env` in the backend directory:

```env
USE_SQLITE=true
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campusnest
SECRET_KEY=your-super-secret-key-change-this
DEBUG=true
DEMO_OTP=1234
```

Create `.env` in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
```
