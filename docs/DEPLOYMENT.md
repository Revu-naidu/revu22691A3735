# Deployment Guide

## Overview

The Client-Side React URL Shortener is designed to run entirely in the browser, making deployment straightforward. Since there's no backend component, you only need to serve static files.

## Build Process

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Git (for version control)

### Building for Production

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Production Build**
   ```bash
   npm run build
   ```

3. **Verify Build Output**
   ```bash
   ls -la dist/
   ```
   
   You should see:
   - `index.html` - Main HTML file
   - `assets/` - Directory containing JS, CSS, and other assets
   - Static assets (favicon, etc.)

### Build Configuration

The application uses Vite for building with the following optimizations:

**Vite Configuration (`vite.config.ts`)**:
```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Set to true for debugging
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
```

## Deployment Options

### 1. Static File Hosting

#### Netlify (Recommended)

**Automatic Deployment:**
1. Connect your Git repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on git push

**Manual Deployment:**
1. Build the project locally: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Configure custom domain if needed

**Netlify Configuration (`netlify.toml`)**:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel

**Automatic Deployment:**
1. Import project from Git repository
2. Vercel auto-detects Vite configuration
3. Deploy with zero configuration

**Manual Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### GitHub Pages

**Setup:**
1. Build project: `npm run build`
2. Push `dist` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

**Automated with GitHub Actions (`.github/workflows/deploy.yml`)**:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### 2. CDN Deployment

#### AWS CloudFront + S3

**S3 Setup:**
1. Create S3 bucket with static website hosting
2. Upload `dist` contents to bucket
3. Configure bucket policy for public read access

**CloudFront Setup:**
1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Configure custom error pages for SPA routing

**Bucket Policy Example:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

#### Azure Static Web Apps

1. Connect GitHub repository
2. Configure build settings:
   - App location: `/`
   - Build location: `dist`
   - Build command: `npm run build`

### 3. Self-Hosted Options

#### Nginx

**Configuration (`/etc/nginx/sites-available/url-shortener`)**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/url-shortener/dist;
    index index.html;

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

#### Apache

**Configuration (`.htaccess` in dist folder)**:
```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer-when-downgrade"
```

## Environment Configuration

### Environment Variables

Create `.env.production` for production-specific settings:

```env
VITE_APP_TITLE=URL Shortener
VITE_APP_VERSION=1.0.0
VITE_BASE_URL=https://your-domain.com
```

### Build-time Configuration

**Package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:staging": "vite build --mode staging",
    "build:production": "vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

## Performance Optimization

### Bundle Analysis

**Analyze bundle size:**
```bash
npm install --save-dev rollup-plugin-visualizer
```

**Add to vite.config.ts:**
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
});
```

### Optimization Strategies

**Code Splitting:**
- Vendor chunks for third-party libraries
- Route-based splitting for large applications
- Component-level splitting for heavy components

**Asset Optimization:**
- Image compression and optimization
- Font subsetting and optimization
- CSS purging for unused styles

**Caching Strategy:**
- Long-term caching for assets with hashes
- Service worker for offline functionality
- CDN caching for global distribution

## Security Considerations

### Content Security Policy

**Recommended CSP header:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';
```

### HTTPS Configuration

**Force HTTPS redirect:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

**Essential security headers:**
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Monitoring and Analytics

### Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/react @sentry/tracing
```

**Configuration:**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

**Web Vitals tracking:**
```bash
npm install web-vitals
```

**Implementation:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## Maintenance and Updates

### Update Strategy

**Regular Updates:**
1. Update dependencies monthly
2. Security patches immediately
3. Feature updates quarterly

**Update Process:**
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Backup and Recovery

**Automated Backups:**
- Git repository serves as code backup
- Build artifacts stored in CI/CD pipeline
- Configuration files versioned

**Recovery Process:**
1. Restore from Git repository
2. Rebuild application
3. Redeploy to hosting platform

## Troubleshooting Deployment Issues

### Common Problems

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

**Routing Issues:**
- Ensure server redirects all routes to index.html
- Check base URL configuration
- Verify client-side routing setup

**Asset Loading Problems:**
- Check asset paths in build output
- Verify CDN configuration
- Test with different browsers

**Performance Issues:**
- Analyze bundle size
- Check network requests
- Verify caching headers

### Debug Commands

**Local testing:**
```bash
# Build and preview locally
npm run build
npm run preview

# Serve with different tools
npx serve dist
python -m http.server 3000 --directory dist
```

**Network debugging:**
```bash
# Test with curl
curl -I https://your-domain.com

# Check DNS resolution
nslookup your-domain.com

# Test SSL certificate
openssl s_client -connect your-domain.com:443
```

## Checklist for Production Deployment

### Pre-deployment
- [ ] All tests passing
- [ ] Build completes without errors
- [ ] Bundle size within acceptable limits
- [ ] Security headers configured
- [ ] HTTPS certificate installed
- [ ] Domain DNS configured
- [ ] CDN/caching configured

### Post-deployment
- [ ] Application loads correctly
- [ ] All routes work properly
- [ ] URL shortening functionality works
- [ ] Statistics page displays data
- [ ] Redirects work as expected
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested
- [ ] Performance metrics acceptable

### Ongoing Maintenance
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Update dependencies regularly
- [ ] Review security headers
- [ ] Backup configuration files
- [ ] Document any custom configurations