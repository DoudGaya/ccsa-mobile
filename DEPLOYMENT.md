# DEPLOYMENT.md - FIMS Deployment Guide

## Overview
This guide covers the deployment of the FIMS (Farmers Information Management System) to production environments.

## Pre-deployment Checklist

### 1. Environment Configuration
- [ ] Set up production database (NeonDB)
- [ ] Configure Supabase project
- [ ] Set up environment variables
- [ ] Configure API keys and secrets
- [ ] Set up domain and SSL certificates

### 2. Database Setup
- [ ] Create production database
- [ ] Run database migrations
- [ ] Set up database backups
- [ ] Configure database monitoring

### 3. Backend Deployment
- [ ] Build and test backend locally
- [ ] Deploy to production server (Vercel/Railway/etc.)
- [ ] Configure environment variables
- [ ] Set up monitoring and logging

### 4. Mobile App Deployment
- [ ] Build production app bundles
- [ ] Submit to app stores (Google Play, Apple App Store)
- [ ] Configure OTA updates (Expo Updates)
- [ ] Set up crash reporting

## Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@host:5432/database_name?sslmode=require"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"

# JWT
JWT_SECRET="your-production-jwt-secret"

# External APIs
NIN_API_URL="https://api.nin.gov.ng"
NIN_API_KEY="your-nin-api-key"

# CORS
CORS_ORIGIN="https://your-mobile-app.com"
```

### Mobile App (.env)
```env
# API Configuration
API_BASE_URL="https://your-backend-api.com/api"

# Supabase
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Environment
NODE_ENV="production"
```

## Deployment Steps

### 1. Database Deployment (NeonDB)

1. **Create NeonDB Project**
   ```bash
   # Visit https://neon.tech and create a new project
   # Copy the connection string
   ```

2. **Set up Database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

3. **Seed Database (Optional)**
   ```bash
   npx prisma db seed
   ```

### 2. Backend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Add all environment variables from .env
   - Redeploy if necessary

### 3. Mobile App Deployment

#### Option A: Expo Application Services (EAS)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas configure
   ```

3. **Build for Production**
   ```bash
   # Build for Android
   eas build --platform android --profile production

   # Build for iOS
   eas build --platform ios --profile production
   ```

4. **Submit to App Stores**
   ```bash
   # Submit to Google Play
   eas submit --platform android

   # Submit to Apple App Store
   eas submit --platform ios
   ```

#### Option B: Traditional Build

1. **Build APK (Android)**
   ```bash
   npx expo build:android --type apk
   ```

2. **Build IPA (iOS)**
   ```bash
   npx expo build:ios --type archive
   ```

## Production Configuration

### app.json/app.config.js Updates
```json
{
  "expo": {
    "name": "FIMS - Farmers Information Management System",
    "slug": "ccsa-fims",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ccsa.fims"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.ccsa.fims"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

## Security Considerations

### 1. API Security
- Use HTTPS everywhere
- Implement rate limiting
- Validate all inputs
- Use JWT tokens with short expiration
- Implement proper CORS policies

### 2. Database Security
- Use connection pooling
- Implement database-level permissions
- Regular backups
- Monitor for suspicious activity

### 3. Mobile App Security
- Obfuscate sensitive code
- Use secure storage for tokens
- Implement certificate pinning
- Regular security updates

## Monitoring and Logging

### 1. Backend Monitoring
- Set up application monitoring (Sentry, LogRocket)
- Monitor API performance
- Set up alerts for errors and downtime
- Monitor database performance

### 2. Mobile App Monitoring
- Implement crash reporting
- Monitor app performance
- Track user analytics
- Monitor API usage

## Backup and Recovery

### 1. Database Backups
- Automated daily backups
- Point-in-time recovery
- Test backup restoration regularly

### 2. Code Backups
- Version control (Git)
- Regular repository backups
- Deployment rollback procedures

## Performance Optimization

### 1. Backend Optimization
- Implement caching (Redis)
- Optimize database queries
- Use CDN for static assets
- Implement API response compression

### 2. Mobile App Optimization
- Optimize images and assets
- Implement lazy loading
- Use efficient data structures
- Minimize bundle size

## Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Security patches
- Performance improvements
- Feature updates

### 2. Health Checks
- Monitor system health
- Check API endpoints
- Verify database connections
- Test critical user flows

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check connection string
   - Verify database server status
   - Check network connectivity

2. **API Authentication Issues**
   - Verify JWT tokens
   - Check API keys
   - Validate CORS settings

3. **Mobile App Issues**
   - Check API endpoints
   - Verify app configuration
   - Check device compatibility

### Support Contacts
- Technical Support: tech@ccsa.gov.ng
- Emergency Contact: +234-xxx-xxx-xxxx
- Documentation: https://docs.ccsa.gov.ng

## Post-Deployment Tasks

### 1. User Training
- Train enrolment agents
- Provide user manuals
- Set up help desk support

### 2. Data Migration
- Import existing farmer data
- Validate data integrity
- Update system configurations

### 3. Go-Live Checklist
- [ ] All systems tested and working
- [ ] Users trained and ready
- [ ] Support team prepared
- [ ] Monitoring systems active
- [ ] Backup procedures verified
- [ ] Security measures in place

## Rollback Procedures

### 1. Database Rollback
```bash
# Restore from backup
pg_restore -d database_name backup_file.sql
```

### 2. API Rollback
```bash
# Revert to previous deployment
vercel --prod --rollback
```

### 3. Mobile App Rollback
```bash
# Revert to previous OTA update
eas update --branch production --message "Rollback to previous version"
```

---

**Note**: This deployment guide should be customized based on your specific infrastructure and requirements. Always test deployments in a staging environment first.
