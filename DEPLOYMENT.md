# Deployment Guide

Deploy the mobile app to production using Vercel (frontend) + Render (backend).

## 🎯 Architecture

- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Python/FastAPI)
- **Domain**: Custom domain or defaults

---

## 📦 Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)

### 1.2 Deploy Backend

**Option A: One-Click Deploy (Recommended)**

Click this button once you push to GitHub:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Option B: Manual Deploy**

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `squaas-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: 
     ```bash
     pip install poetry && poetry install
     ```
   - **Start Command**: 
     ```bash
     poetry run uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free

4. **Environment Variables** (Add these):
   - `PYTHON_VERSION`: `3.11`
   - `OPENAI_API_KEY`: Your OpenAI API key (if using AI features)

5. Click **"Create Web Service"**

6. Wait for deployment (~3-5 minutes)

7. **Copy your backend URL**: 
   ```
   https://squaas-backend.onrender.com
   ```

### 1.3 Update Backend CORS

You'll need to update the backend to allow your Vercel domain. We'll do this after deploying frontend.

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)

### 2.2 Deploy Frontend

1. Click **"Add New Project"**
2. Import your GitHub repo
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Environment Variables** (Add these):
   
   Click **"Environment Variables"** and add:
   
   - **Key**: `NEXT_PUBLIC_WS_URL`
   - **Value**: `wss://squaas-backend.onrender.com/ws`
     (Replace with your Render backend URL, use `wss://` for secure WebSocket)

5. Click **"Deploy"**

6. Wait for deployment (~2-3 minutes)

7. **Copy your frontend URL**:
   ```
   https://squaas.vercel.app
   ```

### 2.3 Test Your Deployment

Open in browser:
- Desktop: `https://squaas.vercel.app`
- Mobile: `https://squaas.vercel.app/phone`

---

## 🔧 Step 3: Update Backend CORS

Now that you have your Vercel URL, update the backend to allow it:

### 3.1 Update `backend/main.py`

Find the CORS middleware (around line 67):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Change to:

```python
# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "https://squaas.vercel.app,https://squaas-*.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.2 Set Environment Variable in Render

1. Go to Render Dashboard → Your service
2. Navigate to **"Environment"**
3. Add new variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://squaas.vercel.app,https://squaas-*.vercel.app`
     (Replace `squaas` with your actual Vercel project name)

4. Click **"Save Changes"**
5. Render will auto-redeploy (~1-2 minutes)

---

## ✅ Step 4: Verify Everything Works

### 4.1 Test on Desktop
1. Open: `https://squaas.vercel.app`
2. Should see the desktop UI
3. Check WebSocket (green dot in corner)

### 4.2 Test on iPhone
1. Open Safari on iPhone
2. Navigate to: `https://squaas.vercel.app/phone`
3. Grant location permission
4. Grant motion/orientation permission
5. Should see:
   - ✅ Green GPS dot (GPS active)
   - ✅ Green WebSocket dot (connected)
   - ✅ Map rotating as you turn
   - ✅ Position updating every second

### 4.3 Check Backend Logs (Render)
1. Go to Render Dashboard → Your service
2. Click **"Logs"** tab
3. Should see:
   ```
   INFO: Client connected. Total clients: 1
   Location updated: 37.7749, -122.4194 - 5 POIs nearby
   ```

---

## 🎨 Step 5: Custom Domain (Optional)

### 5.1 Vercel Custom Domain
1. In Vercel Dashboard → Your project
2. Go to **"Settings"** → **"Domains"**
3. Add your domain (e.g., `play.yourdomain.com`)
4. Follow DNS setup instructions

### 5.2 Render Custom Domain
1. In Render Dashboard → Your service
2. Go to **"Settings"** → **"Custom Domains"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow DNS setup instructions

### 5.3 Update Environment Variables
After adding custom domains, update:

**Vercel** (`NEXT_PUBLIC_WS_URL`):
```
wss://api.yourdomain.com/ws
```

**Render** (`ALLOWED_ORIGINS`):
```
https://play.yourdomain.com
```

---

## 🐛 Troubleshooting

### Backend Won't Start
- Check Render logs for Python errors
- Verify `pyproject.toml` is in backend directory
- Check that PORT environment variable is used correctly

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_WS_URL` is set correctly (use `wss://` not `ws://`)
- Check CORS settings in backend
- Look at browser console for connection errors

### GPS Not Working on iPhone
- HTTPS is required for geolocation (Vercel provides this automatically)
- Make sure location permissions are granted
- Check browser console for errors

### WebSocket Disconnects Frequently
- Render free tier may sleep after inactivity
- Consider upgrading to paid plan
- Check backend logs for connection issues

### Build Fails on Vercel
- Check that `frontend/package.json` exists
- Verify all dependencies are listed
- Look at Vercel build logs for specific errors

---

## 💰 Costs

### Free Tier Limits:
- **Vercel**: 
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Free SSL
  
- **Render**:
  - Free tier (sleeps after 15 min inactivity)
  - 750 hours/month
  - Auto-wakes on request

### Recommended Upgrades:
- **Render Pro** ($7/month): No sleep, better performance
- **Vercel Pro** ($20/month): Higher bandwidth, team features

---

## 🚀 Quick Deploy Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend to Render
- [ ] Copy backend URL
- [ ] Deploy frontend to Vercel with `NEXT_PUBLIC_WS_URL`
- [ ] Update backend CORS with Vercel URL
- [ ] Test on desktop
- [ ] Test on iPhone
- [ ] (Optional) Add custom domains

---

## 📝 Environment Variables Summary

### Vercel (Frontend):
```
NEXT_PUBLIC_WS_URL=wss://squaas-backend.onrender.com/ws
```

### Render (Backend):
```
PYTHON_VERSION=3.11
ALLOWED_ORIGINS=https://squaas.vercel.app,https://squaas-*.vercel.app
OPENAI_API_KEY=sk-... (if using AI features)
```

---

## 🎉 You're Done!

Your app is now deployed and accessible from anywhere:
- 📱 Mobile: `https://squaas.vercel.app/phone`
- 💻 Desktop: `https://squaas.vercel.app`

No more local network or tunneling needed! 🚀

