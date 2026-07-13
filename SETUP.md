# 🚀 ClassAttend - Complete Setup Guide

Follow these steps **exactly** to get the project running on your computer.

---

## 📋 Prerequisites

Before you start, make sure you have:

- [ ] **Node.js** (version 18 or higher) — [Download here](https://nodejs.org)
- [ ] **Git** — [Download here](https://git-scm.com)
- [ ] **A Supabase account** (free) — [Sign up here](https://supabase.com)

### Check if Node.js is installed

Open your terminal/command prompt and run:

```bash
node --version
```

If you see a version number (like `v18.17.0` or higher), you're good. If not, download and install Node.js first.

---

## Step 1: Clone the Project

Open your terminal and run these commands:

```bash
git clone https://github.com/Shubhams1712/Attendence_app.git
cd Attendence_app
```

---

## Step 2: Install Dependencies

```bash
cd client
npm install
```

Wait for it to finish. You'll see a lot of text — that's normal!

---

## Step 3: Create Your Supabase Project

### 3.1 Sign up / Log in

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** and sign up with GitHub (easiest) or email

### 3.2 Create a New Project

1. Click **"New Project"**
2. Fill in:
   - **Organization**: Create one if you don't have one (name it anything)
   - **Project name**: `classattend` (or anything you like)
   - **Database password**: Choose a strong password (save it somewhere!)
   - **Region**: Choose the one closest to you
3. Click **"Create new project"**
4. Wait 1-2 minutes for it to set up

---

## Step 4: Run the Database Schema

### 4.1 Open SQL Editor

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 4.2 Copy and Paste the Schema

1. Open the file `database/schema.sql` from this project (in a text editor)
2. **Select all** the contents (Ctrl+A / Cmd+A)
3. **Copy** it (Ctrl+C / Cmd+C)
4. **Paste** it into the Supabase SQL Editor (Ctrl+V / Cmd+V)
5. Click the **"Run"** button (or press Ctrl+Enter)

You should see "Success. No rows returned" at the bottom.

### 4.3 Run the Seed Data (Optional but Recommended)

1. Click **"New query"** again
2. Open the file `database/seed.sql` from this project
3. Copy all contents and paste into Supabase SQL Editor
4. Click **"Run"**

This adds sample data so you can see the app working immediately.

---

## Step 5: Get Your Supabase Keys

### 5.1 Find Your Project URL

1. In Supabase dashboard, click the **gear icon** (⚙️) at the top left → **"Project Settings"**
2. Click **"API"** in the left sidebar
3. Under **"Project URL"**, click the copy button 📋
   - It looks like: `https://xxxxxxxx.supabase.co`

### 5.2 Find Your Anon Key

1. In the same **"API"** page
2. Under **"Project API keys"**, find **"anon public"**
3. Click the copy button 📋
   - It's a long string starting with `eyJ...`

---

## Step 6: Configure Environment Variables

### 6.1 Create the .env file

In the `client` folder, create a file called `.env` (yes, just `.env` — no name before the dot).

You can do this by:
- **Windows**: Open Notepad, paste the content below, then **File → Save As** → change "Save as type" to "All Files" → name it `.env` → save in the `client` folder
- **Mac/Linux**: Run `touch .env` in the terminal while in the `client` folder

### 6.2 Paste Your Keys

Put your Supabase URL and Anon Key into the `.env` file:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**IMPORTANT**: Replace the placeholder values with your actual values from Step 5!

---

## Step 7: Enable Realtime

1. In Supabase dashboard, go to **"Database"** → **"Replication"**
2. Find the `attendance_records` table and **enable** it
3. Find the `attendance_sessions` table and **enable** it

This allows the app to sync attendance in real-time between users.

---

## Step 8: Create Your First User

1. In Supabase dashboard, go to **"Authentication"** → **"Users"**
2. Click **"Add user"**
3. Choose **"Email"** method
4. Enter:
   - **Email**: `admin@classattend.com` (or any email)
   - **Password**: `admin123` (or any password)
5. Click **"Create user"**

---

## Step 9: Run the App!

Go back to your terminal (make sure you're in the `client` folder) and run:

```bash
npm run dev
```

You should see:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 🎉 Open in Browser

Open your browser and go to: **http://localhost:5173**

Log in with the email and password you created in Step 8!

---

## 🔄 Quick Reference Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run preview` | Preview the production build |

---

## 🆘 Troubleshooting

### "Module not found" error
Run `npm install` again in the `client` folder.

### "Supabase credentials not configured" warning
Check your `.env` file. Make sure:
- The file is in the `client` folder (not the project root)
- There are no spaces around the `=` sign
- You copied the correct URL and key

### "Table doesn't exist" error
You didn't run the database schema. Go back to Step 4.

### App loads but shows blank page
Open browser console (F12) and check for errors. Usually it's a Supabase connection issue.

### Login doesn't work
Make sure you created a user in Step 8. The app uses Supabase Auth — you need to create users through the Supabase dashboard.

---

## 📱 Installing as PWA (Android)

1. Open the app in Chrome on your Android phone
2. Chrome will show an "Install app" banner
3. Tap "Install"
4. The app will appear on your home screen like a native app!

---

## 🌐 Deploying to Vercel (Free)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Click "New Project" → Import your GitHub repo
4. Set environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"

Your app will be live at `https://your-project.vercel.app`!

---

## 📞 Need Help?

If you're stuck on any step, create an issue on GitHub or ask for help. Make sure to mention:
- Which step you're stuck on
- What error message you see
- What operating system you're using (Windows/Mac/Linux)
