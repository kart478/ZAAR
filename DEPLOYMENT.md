# ZAAR Vercel Deployment Guide

This guide will help you deploy your ZAAR application to Vercel.

## Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Vercel account created

## Quick Deploy Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Root Directory
```bash
# From the root of your project (church-connect-25-main)
vercel --prod
```

## Project Structure for Vercel

Your project is configured as a **monorepo** with:
- **Frontend** (React/Vite app)
- **Backend** (Node.js/Express API)

### vercel.json Configuration
The `vercel.json` file handles the deployment setup:

```json
{
  "version": 2,
  "name": "zaar",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/package.json", 
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Environment Variables

You'll need to set these in your Vercel dashboard:

### Backend Environment Variables
- `NODE_ENV` = `production`
- `JWT_SECRET` = (your JWT secret)
- `JWT_REFRESH_SECRET` = (your JWT refresh secret)
- `FRONTEND_URL` = (your Vercel deployed URL)
- `EMAIL_HOST` = (your SMTP host)
- `EMAIL_PORT` = (your SMTP port)
- `EMAIL_SECURE` = (true/false)
- `EMAIL_USER` = (your email)
- `EMAIL_PASS` = (your app password)
- `EMAIL_FROM` = (your from email)
- `ENABLE_EMAIL` = `true`

### Frontend Environment Variables
- `VITE_API_URL` = (your backend API URL)

## Deployment Process

1. **Vercel detects** the monorepo structure
2. **Builds frontend** using Vite (@vercel/static)
3. **Builds backend** using Node.js (@vercel/node)
4. **Routes API requests** from `/api/*` to backend server
5. **Sets environment variables** from your Vercel dashboard

## Post-Deployment

### 1. Update Environment Variables
Go to your Vercel dashboard → Project Settings → Environment Variables and add all required variables.

### 2. Verify API Routes
Your backend will be accessible at: `https://your-app.vercel.app/api/*`

### 3. Test the Application
- Test frontend: `https://your-app.vercel.app`
- Test API: `https://your-app.vercel.app/api/health`

## Custom Domain (Optional)

If you have a custom domain:
1. Go to Vercel dashboard → Project Settings → Domains
2. Add your custom domain
3. Update CORS in backend if needed

## Troubleshooting

### Common Issues
- **CORS errors**: Check `FRONTEND_URL` environment variable
- **Build failures**: Ensure all dependencies are in package.json
- **API 404s**: Verify routes configuration in vercel.json

### Local Development vs Production
- **Local**: Uses `npm run dev:unified` with proxy
- **Production**: Uses separate deployments on Vercel

## Commands Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# Open project in dashboard
vercel open
```

## Next Steps

1. Push your code to Git repository
2. Run `vercel --prod` from project root
3. Configure environment variables in Vercel dashboard
4. Test your deployed application

Your ZAAR application will be live and ready to use!
