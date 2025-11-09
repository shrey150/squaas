# 🚀 Deploy in 10 Minutes

## Step 1: Push to GitHub (if not already)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Step 2: Deploy Backend (Render)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your `squaas` repository
4. Fill in:
   ```
   Name: squaas-backend
   Region: Oregon
   Root Directory: backend
   Build Command: pip install poetry && poetry install
   Start Command: poetry run uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
5. Click **"Create Web Service"**
6. **COPY YOUR BACKEND URL**: `https://squaas-backend-xxxx.onrender.com`

---

## Step 3: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"**
3. Select your `squaas` repository
4. Configure:
   ```
   Framework: Next.js
   Root Directory: frontend
   ```
5. **Add Environment Variable**:
   ```
   Name: NEXT_PUBLIC_WS_URL
   Value: wss://squaas-backend-xxxx.onrender.com/ws
   ```
   (Replace with YOUR backend URL from Step 2, change `https` to `wss`)
6. Click **"Deploy"**
7. **COPY YOUR FRONTEND URL**: `https://squaas-xxxx.vercel.app`

---

## Step 4: Update Backend CORS

1. Go back to **Render Dashboard** → Your backend service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**:
   ```
   Key: ALLOWED_ORIGINS
   Value: https://squaas-xxxx.vercel.app
   ```
   (Replace with YOUR frontend URL from Step 3)
4. Save (auto-redeploys in ~1 minute)

---

## Step 5: Test on Your iPhone! 📱

Open Safari and go to:
```
https://squaas-xxxx.vercel.app/phone
```

Grant permissions when asked, and you're live! 🎉

---

## Troubleshooting

**"Connecting..." forever?**
- Check `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
- Check `ALLOWED_ORIGINS` has your Vercel URL
- Wait 1-2 min for Render to wake up (free tier)

**Backend errors?**
- Check Render logs
- Make sure `pyproject.toml` is in backend folder

**Need help?**
- See `DEPLOYMENT.md` for full details
- Check browser console (F12) for errors

