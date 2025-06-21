# Stillnest Deployment Guide

## 🚀 Quick Deploy to Vercel

### 1. Prerequisites
- Node.js 18+ installed
- Vercel account
- Supabase project set up

### 2. Environment Variables
Set up the following environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Deploy Commands

#### Test Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Manual Setup

#### Clone and Install
```bash
git clone https://github.com/yourusername/stillnest.git
cd stillnest
npm install
```

#### Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

#### Build and Test
```bash
npm run typecheck  # Type checking
npm run lint       # Linting
npm run build      # Production build
npm run start      # Start production server
```

## 📱 Mobile Testing

### PWA Installation
1. Open the deployed URL on mobile device
2. Use "Add to Home Screen" option
3. Test offline functionality
4. Verify push notifications (if implemented)

### Test Scenarios
- [ ] Sign up / Sign in flow
- [ ] Photo upload and gallery
- [ ] Feed browsing
- [ ] Profile management
- [ ] Search and discovery
- [ ] Offline mode
- [ ] Network recovery

## 🔧 Vercel Configuration

### Custom Domain
```bash
vercel domains add yourdomain.com
vercel domains ls
```

### Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Monitoring
- Health check: `https://yourapp.vercel.app/healthz`
- Vercel Analytics available in dashboard
- Error tracking via Vercel Functions logs

## 🛡️ Security Checklist

- [ ] Environment variables properly set
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers configured
- [ ] Supabase RLS policies active
- [ ] API rate limiting configured
- [ ] No sensitive data in client bundle

## 📊 Performance Optimization

### Vercel Features Enabled
- [x] Edge Functions
- [x] Image Optimization
- [x] Static Generation
- [x] Incremental Static Regeneration
- [x] Edge Caching

### Core Web Vitals
Monitor at: `https://pagespeed.web.dev/`

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check TypeScript errors
2. **Environment Variables**: Verify all required vars are set
3. **Supabase Connection**: Test database connectivity
4. **Image Loading**: Check Next.js image domains configuration

### Debug Commands
```bash
vercel logs           # View deployment logs
vercel inspect        # Detailed deployment info
npm run typecheck     # Local type checking
npm run build         # Local build test
```

## 🔄 CI/CD Pipeline

GitHub Actions workflow automatically:
1. Runs tests on PR/push
2. Deploys preview for `develop` branch
3. Deploys production for `main` branch

Required GitHub Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`