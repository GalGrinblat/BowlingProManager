# Deployment Guide - Vercel

This guide will help you deploy the Bowling League Management System to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier available at [vercel.com](https://vercel.com))
- Your code pushed to a GitHub repository

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Visit Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Sign in with your GitHub account
   - Click "Import Project"

3. **Import your repository**:
   - Select your GitHub repository from the list
   - Or paste the repository URL

4. **Configure the project**:
   - **Project Name**: Choose a name (e.g., `bowling-league-app`)
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Environment Variables**: None required for initial deployment

5. **Deploy**:
   - Click "Deploy"
   - Wait 1-2 minutes for the build to complete
   - Your app will be live at `your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts to link your project
   - Confirm settings (Framework: Vite, Build Command: `npm run build`, Output: `dist`)

4. **Production deployment**:
   ```bash
   vercel --prod
   ```

## Post-Deployment

### Your App is Live! 🎉

Your app will be available at:
- **Production**: `https://your-project-name.vercel.app`
- **Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)

### Important Notes for Testers

Since the app uses `localStorage` for data persistence:

1. **Data is Device-Specific**:
   - Each user's data is stored locally in their browser
   - Data is not shared between users or devices
   - Perfect for testing individual user workflows

2. **Data Persistence**:
   - Data persists as long as browser cache is not cleared
   - Users should avoid clearing browser data during testing
   - Regular data exports are recommended (Settings → Export Data)

3. **First-Time Setup**:
   - Recommend using the "Seed Demo Data" feature in Settings
   - Creates 40 players, 2 leagues, 16 teams, and completed round 1 games
   - Great way to explore features without manual setup

### Automatic Deployments

Vercel automatically deploys your app when you push to GitHub:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments (unique URLs for testing)

### Custom Domain (Optional)

To use your own domain:
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Configuration

### Environment Variables

Currently, no environment variables are required. If you add backend integration later:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables for each environment (Production, Preview, Development)
3. Redeploy for changes to take effect

### Build Settings

Default settings (already configured in `vite.config.ts`):
- **Base Path**: `/` (root deployment)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: Automatically detected (18.x or higher)

## Monitoring

### View Deployment Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click on any deployment
4. View "Build Logs" and "Function Logs"

### Analytics (Optional)

Vercel provides free analytics:
1. Go to your project settings
2. Enable "Analytics"
3. View page views, performance metrics, etc.

## Rollback

If a deployment has issues:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the previous working deployment
3. Click "..." menu → "Promote to Production"

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel Dashboard
2. **Test locally** first: `npm run build`
3. **Ensure all dependencies** are in `package.json` (not just devDependencies if needed in build)

### App Loads But Features Don't Work

1. **Check browser console** for errors
2. **Verify base path** is `/` in `vite.config.ts`
3. **Check localStorage** is enabled in browser

### Performance Issues

1. **Enable Vercel Analytics** to identify slow pages
2. **Consider code splitting** for large bundles
3. **Optimize images** and assets

## Next Steps

### For Production Use

When ready to move beyond testing with localStorage:

1. **Backend Integration**:
   - Set up Supabase, Firebase, or custom backend
   - Update API service layer in `src/services/api.ts`
   - Add environment variables for API endpoints

2. **Authentication**:
   - Integrate real authentication (Auth0, Supabase Auth, etc.)
   - Replace mock auth in `src/contexts/AuthContext.tsx`

3. **Database**:
   - Migrate from localStorage to persistent database
   - Implement data migration tools for existing users

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Deployment**: [vitejs.dev/guide/static-deploy.html](https://vitejs.dev/guide/static-deploy.html)
- **Project Issues**: See `TROUBLESHOOTING.md` in documentation folder

---

**Your app is configured and ready to deploy! 🚀**

Run these commands to get started:
```bash
# Test the build locally
npm run build
npm run preview

# Deploy to Vercel (after installing vercel CLI)
vercel
```
