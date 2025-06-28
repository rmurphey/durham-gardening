# Deployment Guide - Durham Garden Planner

## Recommended Platform: Vercel

We recommend **Vercel** for deploying this garden planning application for the following reasons:

### Why Vercel?
- **Superior WebAssembly support** for our SQLite database integration
- **Edge Functions** for weather API proxying and caching
- **Excellent build performance** for data-heavy applications
- **Built-in analytics** to track forecast API usage
- **Generous free tier** perfect for OSS projects

## Quick Deploy to Vercel

### 1. One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/durham-garden-planner)

### 2. Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your local repository
git clone https://github.com/your-username/durham-garden-planner
cd durham-garden-planner/apps/climate-garden-sim
npm install
npm run deploy
```

## Configuration

### Environment Variables (Optional)

The app works perfectly without any API keys using the National Weather Service, but you can enhance forecasting with:

```bash
# In Vercel dashboard > Settings > Environment Variables
OPENWEATHERMAP_API_KEY=your_key_here  # Optional: Enhanced weather data
WEATHERAPI_API_KEY=your_key_here      # Optional: Extended forecasts
```

### Build Settings

Vercel will auto-detect the React app, but you can configure:

```json
{
  "buildCommand": "npm run vercel:build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "devCommand": "npm start"
}
```

### Custom Domain (Optional)

1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as shown

## Alternative Platforms

### Netlify
Good alternative with similar features:

```bash
# Deploy to Netlify
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

**Netlify considerations:**
- No Edge Functions (weather API proxying more complex)
- Build time limits may affect large database builds
- Slightly less optimal WebAssembly performance

### GitHub Pages
Budget option for basic hosting:

```bash
# Add to package.json
"homepage": "https://yourusername.github.io/durham-garden-planner"

# Deploy
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

**GitHub Pages limitations:**
- No server-side functionality
- No custom headers for optimal caching
- Manual deployment process

### Railway/Render
Overkill for this static app, but options if you need backend features.

## Performance Optimizations

### Database File Optimization
The SQLite database is automatically optimized during build:

```bash
# Manual database optimization
npm run db:build    # Rebuilds optimized database
npm run db:verify   # Validates data integrity
```

### Caching Strategy
Vercel automatically handles optimal caching:

- **Database files**: Cached for 1 year (immutable)
- **WebAssembly files**: Cached for 1 year (immutable)
- **Weather data**: Cached for 6 hours
- **Forecast calculations**: Cached in browser localStorage

### Bundle Size Management
Current optimized sizes:
- **Main bundle**: ~400KB gzipped
- **SQLite WASM**: ~1.6MB (loaded separately)
- **Database file**: ~50KB
- **Total first load**: ~450KB + 1.6MB WASM (lazy loaded)

## Monitoring & Analytics

### Built-in Vercel Analytics
Enable in Vercel dashboard for:
- Page load performance
- Core Web Vitals
- User engagement metrics

### Weather API Usage Tracking
Monitor API usage through:
- Vercel function logs
- Built-in rate limiting
- Automatic fallback to free NWS data

### Error Monitoring
Optional integration with:
- Sentry (recommended)
- LogRocket
- Vercel's built-in error tracking

## Development Workflow

### Local Development
```bash
npm start              # Standard React development
npm run vercel:dev     # Test with Vercel Edge Functions
npm run db:update      # Update database with new data
```

### Testing Deployment
```bash
npm run vercel:build   # Test production build locally
vercel --prod          # Deploy to production
```

### CI/CD with GitHub Actions
Auto-deploy on push:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run vercel:build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Costs

### Vercel (Recommended)
- **Hobby Plan**: Free
  - 100GB bandwidth
  - 6,000 build minutes
  - Perfect for most OSS projects

- **Pro Plan**: $20/month (if you exceed free limits)
  - 1TB bandwidth
  - Faster builds
  - Advanced analytics

### Weather API Costs
- **National Weather Service**: Free (unlimited)
- **WeatherAPI**: Free up to 1M calls/month
- **OpenWeatherMap**: Free up to 1K calls/day

### Total Cost
**$0/month** for most OSS projects using free tiers!

## Security Considerations

### API Key Protection
- Weather API keys stored in Vercel environment variables
- Keys never exposed to client-side code
- Automatic rate limiting prevents abuse

### Database Security
- SQLite database is read-only
- No user data storage
- All processing happens client-side

### Content Security Policy
Recommended headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.weather.gov https://api.openweathermap.org https://api.weatherapi.com"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Common Issues

**Build fails with "database not found":**
```bash
npm run db:build  # Rebuild database
npm run build     # Retry build
```

**WebAssembly loading errors:**
- Check `vercel.json` WASM headers configuration
- Verify CRACO config includes WASM experiments

**Weather API errors:**
- App automatically falls back to National Weather Service
- Check Vercel function logs for API issues
- Verify environment variables are set correctly

### Getting Help
- Check [GitHub Issues](https://github.com/your-username/durham-garden-planner/issues)
- Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Weather API documentation linked in code comments

## Contributing to Deployment

### Improving Performance
- Database optimization scripts in `scripts/`
- Bundle analysis: `npm run build && npx serve -s build`
- WASM loading optimizations welcome

### Adding New Regions
- Update database schema in `database/`
- Add regional weather patterns
- Test deployment with new data

### API Integrations
- New weather providers in `api/weather.js`
- Rate limiting improvements
- Caching optimizations

The deployment is designed to be as simple and cost-effective as possible while providing a robust, scalable platform for the garden planning application.