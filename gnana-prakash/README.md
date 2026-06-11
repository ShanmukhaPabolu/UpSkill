# Gnana Prakash Training Management & Monitoring System (TMS)

> **Department of School Education, Government of Andhra Pradesh**

A production-quality, full-stack web application for managing teacher training programs across all districts and venues in Andhra Pradesh.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js (JWT) |
| State | TanStack Query v5 |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| File Upload | react-dropzone (local storage) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── super-admin/       # Super Admin dashboard + all modules
│   │   ├── state-admin/       # State Admin views
│   │   ├── district-admin/    # District Admin views
│   │   ├── mandal-admin/      # Mandal/Venue Admin views
│   │   ├── teacher/           # Teacher portal
│   │   └── trainer/           # Trainer portal
│   └── api/                   # REST API routes
│       ├── auth/              # NextAuth
│       ├── programs/          # Training program CRUD
│       ├── venues/            # Venue management
│       ├── participants/      # Participant management
│       ├── attendance/        # Attendance tracking
│       ├── food/              # Food records
│       ├── photos/            # Photo upload + approval
│       ├── videos/            # Video upload + approval
│       ├── users/             # User management
│       ├── analytics/         # Analytics data
│       └── reports/           # Report generation
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── shared/                # Layout, sidebar, header
│   ├── dashboard/             # Stat cards, charts
│   ├── programs/              # Program CRUD UI
│   ├── venues/                # Venue CRUD UI
│   ├── participants/          # Participant UI
│   ├── attendance/            # Attendance sheet
│   ├── food/                  # Food records UI
│   ├── media/                 # Photo/video upload
│   └── reports/               # Analytics + reports
├── models/                    # Mongoose schemas
│   ├── User.ts
│   ├── District.ts
│   ├── Mandal.ts
│   ├── Venue.ts
│   ├── Program.ts
│   ├── Participant.ts
│   ├── Attendance.ts
│   ├── FoodRecord.ts
│   ├── Photo.ts
│   ├── Video.ts
│   ├── CustomField.ts
│   ├── Tag.ts
│   └── AuditLog.ts
├── lib/
│   ├── db/mongoose.ts         # DB connection
│   ├── db/seed.ts             # Seed data
│   ├── auth/options.ts        # NextAuth config
│   ├── auth/rbac.ts           # Role-based access
│   ├── utils/index.ts         # Utilities
│   └── validations/index.ts   # Zod schemas
├── types/index.ts             # TypeScript types
└── middleware.ts              # Route protection
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local with your MongoDB URI and NextAuth secret
```

### 3. Seed database
```bash
npm run seed
```

### 4. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@gnana.edu.in | Admin@1234 |
| State Admin | state@gnana.edu.in | Admin@1234 |
| District Admin | dist-krishna@gnana.edu.in | Admin@1234 |
| Mandal Admin | venue-vjw@gnana.edu.in | Admin@1234 |
| Teacher | teacher1@gnana.edu.in | Admin@1234 |

---

## 🔐 Role & Permission Matrix

| Feature | Super Admin | State Admin | District Admin | Mandal Admin | Teacher |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage Users | ✅ | — | — | — | — |
| Create Programs | ✅ | — | ✅ | ✅ | — |
| Manage Venues | ✅ | — | ✅ | — | — |
| Record Attendance | ✅ | — | ✅ | ✅ | — |
| Upload Photos | ✅ | — | ✅ | ✅ | — |
| Approve Media | ✅ | — | ✅ | — | — |
| View Analytics | ✅ | ✅ | ✅ | ✅ | — |
| Generate Reports | ✅ | ✅ | ✅ | — | — |
| Custom Fields | ✅ | — | — | — | — |
| Tag Management | ✅ | — | — | — | — |
| Audit Logs | ✅ | — | — | — | — |

---

## 🗂️ Key Features

### Training Program Management
- Full CRUD for programs (Draft → Active → Completed)
- Multi-district, multi-venue support
- Tag system for categorisation
- Custom field engine (no code changes needed)

### Attendance Tracking
- Day-wise attendance for 8+ participant categories
- Auto-calculated totals
- AMO signature image capture
- Historical records

### Media Management
- Photo upload with drag-and-drop (up to 10MB)
- Video upload (up to 500MB)
- Category-based organisation (Inauguration, Classroom, Food, etc.)
- Approval workflow (Pending → Approved/Rejected)
- Only approved media shown in dashboards

### Analytics
- Recharts-powered interactive charts
- Attendance trends, district-wise participation
- Venue utilisation, food consumption
- Participant category distribution

### Reports
- Attendance, Participant, Venue, Food, Photo, Consolidated reports
- Download as PDF or Excel (JSON in prototype)

---

## 🚧 Production Upgrade Path

This prototype is designed for easy cloud migration:

| Feature | Prototype | Production Upgrade |
|---|---|---|
| File Storage | Local disk | Cloudinary / AWS S3 |
| Session | JWT (24h) | Redis-backed sessions |
| DB | MongoDB Atlas M0 | Atlas M10+ with replicas |
| Search | Mongoose regex | Elasticsearch / Atlas Search |
| Reports | JSON download | Puppeteer PDF / ExcelJS |

---

## 📊 Database Collections

`users` · `districts` · `mandals` · `venues` · `programs` · `participants` · `attendance` · `foodRecords` · `photos` · `videos` · `customFields` · `tags` · `auditLogs`

---

## 🏛️ Government Compliance

- All data under `.gov.in` domain structure
- Role-based access control with audit logging
- No external analytics or ad tracking
- Data residency: India (MongoDB Atlas Mumbai)
- Password hashing: bcrypt with salt rounds 12

---

*Built for the Department of School Education, Government of Andhra Pradesh*
