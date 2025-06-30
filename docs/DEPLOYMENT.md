# Deployment Guide - GardenSim

## Deployment Platform: Vercel

GardenSim is deployed on **Vercel** and designed specifically for this platform:

### Why Vercel Works Well for GardenSim:
- **Superior WebAssembly support** for our SQLite database integration
- **Serverless functions** for weather API proxying and cloud garden storage
- **Excellent build performance** for data-heavy applications
- **Built-in blob storage** for cloud garden sharing
- **Edge deployment** for fast global access

## Current Deployment

The application is already deployed and configured on Vercel. For development and maintenance:

### Local Development with Vercel
```bash
# Use Vercel dev server (required for API routes)
npm run dev:vercel

# Alternative: use start-dev.sh script
./scripts/start-dev.sh
```

### Deploying Changes
```bash
# Automatic deployment via GitHub integration
git push origin main  # Triggers automatic Vercel deployment

# Manual deployment (if needed)
vercel --prod
```

## Configuration

### Environment Variables

Required and optional environment variables in Vercel dashboard:

```bash
# Required for cloud garden sharing
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Required for weather integration (free)
REACT_APP_USE_WEATHER_GOV=true

# Optional: Enhanced weather data
REACT_APP_WEATHER_API_KEY=your_weatherapi_key    # WeatherAPI.com free tier
REACT_APP_OPENWEATHER_API_KEY=your_openweather_key  # OpenWeatherMap
REACT_APP_NOAA_CDO_TOKEN=your_noaa_token         # NOAA historical data
```

## Architecture Requirements

GardenSim requires specific platform capabilities:

### Required Features
- **Serverless Functions**: For weather API proxying and cloud storage
- **Blob Storage**: For cloud garden sharing functionality  
- **WebAssembly Support**: For SQLite database in browser
- **Environment Variables**: For API key management
- **Automatic Deployment**: GitHub integration for CI/CD

### Alternative Platforms

**Note**: While other platforms are possible, they would require significant architecture changes:

- **Netlify**: Would need alternative cloud storage solution
- **GitHub Pages**: Cannot support serverless functions or cloud features
- **Railway/Render**: Overkill for this static app
- **AWS S3/CloudFront**: Would need Lambda functions for API proxying

Vercel provides the complete stack needed for GardenSim's features out of the box.

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
- Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Weather API documentation linked in code comments
- Check dev-server.log for local development issues

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

GardenSim's Vercel deployment provides a robust, scalable platform with minimal configuration required. The current setup supports all features including weather integration, database functionality, and cloud garden sharing.