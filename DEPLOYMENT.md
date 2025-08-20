# 🚀 Render Deployment Guide

## ✅ **Fixed: 404 Error Issue**

The 404 error was caused by the server not serving the React frontend. This has been fixed by:

1. **Updated `backend/app.js`** to serve static files from `dist/` folder
2. **Added catch-all route** to serve `index.html` for any non-API routes
3. **Created build script** to build frontend and copy to backend
4. **Added health check endpoint** at `/api/health`

## 🔧 **Deployment Steps**

### **1. Build Locally (Optional)**
```bash
npm run build:render
```
This builds the frontend and copies it to `backend/dist/`

### **2. Deploy to Render**

#### **Option A: Using render.yaml (Recommended)**
1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically use the `render.yaml` configuration
4. Set your environment variables in Render dashboard

#### **Option B: Manual Setup**
1. **Build Command**: `npm run build:render`
2. **Start Command**: `cd backend && npm start`
3. **Root Directory**: Leave empty (root of repo)
4. **Environment**: Node
5. **Plan**: Starter (Free)

### **3. Environment Variables**
Set these in Render dashboard:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## 🛡️ **Keep-Alive Solution**

### **Option 1: External Service (Recommended)**
Use a service like **UptimeRobot** to ping your health endpoint:
- **URL**: `https://your-app.onrender.com/api/health`
- **Interval**: Every 5 minutes
- **Expected Status**: 200 OK

### **Option 2: Self-Pinging (Alternative)**
The backend includes a keep-alive script:
```bash
cd backend && npm run keep-alive
```

## 🔍 **Health Check Endpoint**

Your app now has a health check at:
```
GET https://your-app.onrender.com/api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-08-20T06:21:28.000Z",
  "uptime": 123.456
}
```

## 📁 **File Structure After Build**

```
backend/
├── dist/           # React frontend (copied from frontend/dist)
│   ├── index.html
│   └── assets/
├── app.js          # Express server (serves both API and frontend)
├── server.js       # Server entry point
└── keepAlive.js    # Keep-alive script
```

## 🚨 **Troubleshooting**

### **Still Getting 404?**
1. Check if `backend/dist/` folder exists
2. Verify `backend/app.js` has the static file serving code
3. Ensure the catch-all route is at the bottom of routes

### **Cold Start Issues?**
1. Set up UptimeRobot to ping `/api/health` every 5 minutes
2. Or run the keep-alive script on a separate server

### **Environment Variables?**
1. Check all required env vars are set in Render dashboard
2. Verify MongoDB connection string is correct
3. Ensure JWT_SECRET is set

## ✅ **Expected Result**

After deployment, your app should:
- ✅ Serve React frontend at root URL
- ✅ Have working API endpoints at `/api/*`
- ✅ Show health status at `/api/health`
- ✅ Stay warm with regular pings

**Your Render app should now work perfectly!** 🎉 