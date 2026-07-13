# ClassAttend - Attendance Management PWA

A **production-quality Progressive Web App (PWA)** for managing daily classroom attendance. Built with React + TypeScript + Supabase (backendless architecture).

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **Backend:** None — all data handled directly by Supabase
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Authentication
- **Realtime:** Supabase Realtime
- **State Management:** React Query + React Context
- **Forms:** React Hook Form + Zod
- **PWA:** vite-plugin-pwa

## Features

- ⚡ One-tap attendance marking (Present → Absent → Leave → Reset)
- 👥 Student management with CRUD operations
- 📊 Dashboard with live statistics
- 📱 PWA — installable on Android, works offline
- 🔄 Real-time sync between CR users
- 📈 Analytics with charts
- 🌙 Dark/Light/System theme
- 📤 Export to PDF, Excel, CSV
- 🔐 Role-based access (Admin, CR, Teacher)
- 📋 Attendance history with calendar view
- 🧑‍🏫 Teacher portal (read-only)

## Roles & Permissions

| Feature | Admin | CR | Teacher |
|---------|-------|-----|---------|
| Manage Students | ✓ | ✓ | ✗ |
| Mark Attendance | ✓ | ✓ | ✗ |
| Edit Attendance | ✓ | ✓ | ✗ |
| View Reports | ✓ | ✓ | ✓ |
| Download Reports | ✓ | ✓ | ✓ |
| Settings | ✓ | ✗ | ✗ |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Shubhams1712/Attendence_app.git
cd Attendence_app
```

### 2. Install dependencies

```bash
cd client
npm install
```

### 3. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `database/schema.sql`
4. Get your project URL and anon key from Settings → API

### 4. Configure environment variables

```bash
cd client
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
├── client/                  # Frontend (React + Vite)
│   ├── public/             # Static assets (icons, favicon)
│   ├── src/
│   │   ├── components/ui/  # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme, Offline)
│   │   ├── hooks/          # Custom hooks + React Query hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── lib/            # Utilities, Supabase client, share/export
│   │   ├── pages/          # Page components
│   │   ├── services/       # Supabase service layer
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Router configuration
│   │   └── main.tsx        # App entry point
│   └── package.json
├── database/
│   └── schema.sql          # Complete Supabase database schema with RLS
├── README.md
└── .gitignore
```

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy

### Supabase (Backend)

- Database, Auth, Realtime, and RLS are all managed by Supabase
- No separate backend deployment needed

## Features Checklist

- [x] React + TypeScript + Vite
- [x] Tailwind CSS with dark/light mode
- [x] Supabase Authentication with roles
- [x] Student management (CRUD)
- [x] One-tap attendance marking
- [x] Mark All Present/Absent/Reset
- [x] Search and filter students
- [x] Sort by roll number/name
- [x] Live attendance summary
- [x] Dashboard with statistics
- [x] Attendance history (list + calendar view)
- [x] Reports with export (PDF, Excel, CSV)
- [x] Analytics with charts
- [x] Teacher portal (read-only)
- [x] Real-time sync between CR users
- [x] Offline support with IndexedDB
- [x] PWA (installable on Android)
- [x] Role-based access control
- [x] Row Level Security (RLS)
- [x] Share attendance via WhatsApp/Telegram/Email
- [x] Toast notifications
- [x] Skeleton loaders
- [x] Empty states
- [x] Smooth animations (Framer Motion)
- [x] Mobile-first responsive design
- [x] Bottom navigation

## License

MIT
