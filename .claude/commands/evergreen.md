# Claude Commands for Durham Garden Planner

This file contains custom commands for working with the Durham Garden Planner application.

## Development Commands

### `dev`
Start development server with hot reloading and file watching:
```bash
npm run dev
```

### `dev:quiet`
Start development server with reduced ESLint errors:
```bash
npm run dev:quiet
```

### `dev:bg`
Start development server in background:
```bash
npm run dev:bg
```

### `dev:vercel`
Start Vercel development server with API routes:
```bash
npm run dev:vercel
```

### `start`
Start React development server (basic):
```bash
npm start
```

## Build & Test Commands

### `build`
Build the application for production:
```bash
npm run build
```

### `test`
Run the test suite in watch mode:
```bash
npm test
```

### `test:db`
Test database functionality:
```bash
npm run test:db
```

### `test:interfaces`
Run interface validation tests:
```bash
npm run test:interfaces
```

## Code Quality Commands

### `lint`
Run ESLint on source files:
```bash
npm run lint
```

### `lint:fix`
Run ESLint and auto-fix issues:
```bash
npm run lint:fix
```

### `lint:changed`
Lint only changed files (staged):
```bash
npm run lint:changed
```

### `lint:changed:fix`
Lint and fix only changed files (recommended after making changes):
```bash
npm run lint:changed:fix
```

## Database Commands

### `db:build`
Build/rebuild the garden database:
```bash
npm run db:build
```

### `db:test`
Test database integrity:
```bash
npm run db:test
```

### `db:verify`
Verify database status:
```bash
npm run db:verify
```

### `db:update`
Update database schema/data:
```bash
npm run db:update
```

### `db:status`
Check database status:
```bash
npm run db:status
```

## Quality Checks

### `check:syntax`
Quick syntax validation:
```bash
npm run check:syntax
```

### `check:react`
Check React compilation:
```bash
npm run check:react
```

### `check:compilation`
Full compilation check:
```bash
npm run check:compilation
```

### `precommit`
Run all pre-commit checks:
```bash
npm run precommit
```

## Deployment Commands

### `vercel:build`
Build for Vercel deployment (includes database build):
```bash
npm run vercel:build
```

### `deploy`
Full build and deploy to production:
```bash
npm run deploy
```

### `vercel`
Access Vercel CLI directly:
```bash
npm run vercel
```

## Weather & Garden Commands

### `forecast`
Trigger manual weather forecast update:
```bash
node api/dev/trigger-forecast.js
```

### `weather`
Check weather API endpoint:
```bash
curl http://localhost:3000/api/weather
```

## Common Workflows

### After Making Code Changes
```bash
npm run lint:changed:fix
npm run check:react
npm test
```

### Before Committing
```bash
npm run precommit
```

### Full Development Setup
```bash
npm install
npm run db:build
npm run dev
```

### Production Deployment
```bash
npm run deploy
```

## Notes

- All commands should be run from the project root directory
- Database commands require SQLite3 to be installed
- Weather API requires proper environment variables (BLOB_READ_WRITE_TOKEN)
- Vercel deployment requires authentication with `vercel login`
- Development server runs on http://localhost:3000
- Database files are in `/database/` and `/public/database/` directories