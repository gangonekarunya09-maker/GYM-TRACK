# GymTrack — Mobile-First Gym Workout Tracker

A fast, mobile-first workout tracking web app designed to log gym sets, track personal records (PRs), monitor strength progression with charts, and run built-in rest timers.

---

## Vercel Deployment Configuration

When importing or deploying this repository on [Vercel](https://vercel.com):

### 1. Project Preset Settings

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | **Vite** |
| **Build Command** | `npm run build` *(or `vite build`)* |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | **18.x** or **20.x** *(recommended)* |

A pre-configured `vercel.json` file is already included in the root directory:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Environment Variables on Vercel (Optional)

Configure these in **Project Settings → Environment Variables**:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Optional | Your Supabase project URL (e.g. `https://xyzcompany.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Optional | Your Supabase public anonymous API key |

> **Note**: Even without Supabase environment variables configured, GymTrack works immediately in high-speed local storage mode with pre-seeded exercises and templates. Users can also connect to Supabase dynamically from the in-app **Database & Cloud Sync** menu.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
