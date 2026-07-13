# ClassAttend - Attendance Management System

A production-quality Progressive Web App (PWA) for managing daily classroom attendance, optimized for mobile devices.

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- React Hook Form + Zod
- Framer Motion (animations)
- Recharts (charts)
- Supabase Client

**Backend:**
- Node.js + Express
- TypeScript
- Supabase (Database + Auth + Realtime)

**Database:**
- PostgreSQL (Supabase)

## Project Structure

```
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/         # Button, Card, Input, Modal, etc.
│   │   ├── contexts/       # React contexts (Auth, Theme, Offline)
│   │   ├── layouts/        # Page layouts (MainLayout, AuthLayout)
│   │   ├── lib/            # Utilities (supabase, api client)
│   │   ├── pages/          # Route pages
│   │   └── hooks/          # Custom hooks
│   └── public/             # Static assets
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/      # Auth, error handling
│   │   └── lib/            # Supabase client
│   └── .env.example
├── shared/                 # Shared TypeScript types
└── database/               # Supabase SQL schema
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project (free tier)

### 1. Clone & Install

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Environment Setup

```bash
# Client
cp client/.env.example client/.env
# Edit client/.env with your Supabase credentials

# Server
cp server/.env.example server/.env
# Edit server/.env with your Supabase credentials
```

### 3. Database Setup

1. Go to your Supabase dashboard
2. Open SQL Editor
3. Run the contents of `database/schema.sql`

### 4. Run Development

```bash
# Terminal 1 - Client
cd client
npm run dev

# Terminal 2 - Server
cd server
npm run dev
```

### 5. Build for Production

```bash
# Client
cd client
npm run build

# Server
cd server
npm run build
```

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Set root directory to `client`
4. Add environment variables

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on Render
3. Set root directory to `server`
4. Add environment variables

### Database (Supabase)
- Already hosted on Supabase
- Free tier includes 500MB database

## Features

- [x] Mobile-first responsive design
- [x] Dark/Light/System theme
- [x] Touch-friendly attendance cards
- [x] One-tap attendance marking (cycle: Present → Absent → Leave → Reset)
- [x] Quick actions (Mark All Present/Absent/Reset)
- [x] Live attendance summary
- [x] Student CRUD with search
- [x] Import/Export (Excel, CSV)
- [x] Attendance history with calendar view
- [x] Reports (Daily, Weekly, Monthly, Student-wise)
- [x] Analytics with charts
- [x] Teacher portal (read-only)
- [x] Settings management
- [x] PWA support (installable)
- [x] Offline support with sync
- [x] Real-time sync between CR/Partner CR
- [x] Audit logs
- [x] Role-based access control
- [x] Supabase RLS security

## Roles & Permissions

| Feature | Admin | CR | Partner CR | Teacher |
|---------|-------|-----|------------|---------|
| Manage Students | ✓ | ✓ | ✓ | ✗ |
| Mark Attendance | ✓ | ✓ | ✓ | ✗ |
| Edit Attendance | ✓ | ✓ | ✓ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✓ |
| Download Reports | ✓ | ✓ | ✓ | ✓ |
| Settings | ✓ | ✗ | ✗ | ✗ |
