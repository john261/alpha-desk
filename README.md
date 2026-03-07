# 🔐 ALPHA DESK — Deployment Guide

> Institutional equity research platform with **Supabase Auth** + **Vercel** deployment.

---

## 🏗 Architecture

```
Next.js 14 (App Router)
├── Public    → / (fetches only published analyses)
├── Login     → /login (Supabase email+password auth)
└── Admin     → /admin (protected by middleware + RLS)

Supabase
├── Auth      → Email/password login, JWT sessions
├── Database  → PostgreSQL with Row Level Security (RLS)
└── Storage   → Private PDF bucket, signed URLs

Vercel       → Auto-deploy from GitHub
```

---

## 🔒 Security Layers

| Layer | What it does |
|---|---|
| **Supabase Auth** | Email + password login with JWT tokens |
| **Next.js Middleware** | Redirects unauthenticated users away from `/admin` |
| **Row Level Security (RLS)** | Database enforces: public sees only published, admin sees all |
| **Private Storage Bucket** | PDFs never directly accessible — only via signed URLs (1hr) |
| **Rate Limiting** | 5 failed attempts → 60s client lockout (+ Supabase built-in) |
| **Service Role Key** | Never exposed to client, server-only admin operations |
| **HTTPS only** | Enforced by Vercel |

---

## 🚀 Step-by-Step Deployment

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a region close to your users
3. Set a strong database password (save it!)
4. Wait ~2 minutes for setup

### Step 2 — Run the Database Schema

1. In your Supabase dashboard → **SQL Editor** → **New Query**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

### Step 3 — Create Your Admin User

1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your **email** and a **strong password** (16+ chars, mixed)
4. This is the only account that can access `/admin`

> ⚠️ Do NOT use the SQL editor to create users — always use the Auth dashboard.

### Step 4 — Get Your API Keys

In Supabase: **Settings** → **API**

Copy these values:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` *(keep this secret!)*

### Step 5 — Deploy to Vercel

```bash
# 1. Push this project to a GitHub repository
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/alpha-desk.git
git push -u origin main

# 2. Go to vercel.com → New Project → Import from GitHub
# 3. Select your repository
# 4. Add Environment Variables (Settings → Environment Variables):
```

Add these environment variables in Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel domain (e.g. `https://alpha-desk.vercel.app`) |

5. Click **Deploy** — done! ✅

### Step 6 — Configure Auth Redirect URLs

In Supabase: **Authentication** → **URL Configuration**

Add your Vercel URL:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# → Fill in your Supabase keys

# Start dev server
npm run dev
# → Open http://localhost:3000
```

---

## 📁 Project Structure

```
alpha-desk/
├── app/
│   ├── page.tsx          ← Public homepage
│   ├── login/page.tsx    ← Secure login page
│   ├── admin/page.tsx    ← Admin dashboard (protected)
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── supabase/
│       ├── client.ts     ← Browser client
│       ├── server.ts     ← Server client + admin client
│       └── types.ts      ← TypeScript types
├── middleware.ts         ← Route protection
├── supabase/
│   └── schema.sql        ← Database setup
├── .env.example          ← Environment template
└── next.config.js
```

---

## 🔑 Changing Admin Password

Since auth is handled by Supabase:

1. Supabase Dashboard → **Authentication** → **Users**
2. Find your admin user → **Send password reset email**
3. Or: click the user → **Reset password**

---

## 🛡 Additional Security Recommendations

- [ ] Enable **2FA/MFA** in Supabase Auth settings
- [ ] Set up **Supabase email templates** with your branding
- [ ] Add **custom domain** on Vercel (SSL auto-provisioned)
- [ ] Enable **Supabase's built-in rate limiting** (Auth → Rate Limits)
- [ ] Rotate your `service_role` key periodically
- [ ] Review Supabase **Auth Logs** regularly (Auth → Logs)

---

## 📊 Supabase Free Tier Limits

| Resource | Free Tier |
|---|---|
| Database | 500MB |
| Storage | 1GB |
| Auth users | Unlimited |
| Bandwidth | 5GB/month |
| API requests | 500K/month |

More than enough to get started!
