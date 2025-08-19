# FIXER - Emergency Safety Map (Portfolio Project)

A location-based emergency reporting system demonstrating real-time mapping and geospatial databases.

This is a technical demonstration project showcasing full-stack development skills. While inspired by humanitarian use cases, the current implementation focuses on technical architecture rather than production deployment.

## Technical Features Demonstrated

### Implemented & Working
- **Real-time Map Interface** - Interactive Mapbox GL JS with live marker updates
- **Geospatial Database** - PostGIS spatial queries with distance calculations
- **Anonymous Reporting System** - Privacy-focused data submission without authentication  
- **Multilingual Support** - Dynamic UI translation (Ukrainian/English/Russian)
- **PWA Architecture** - Service worker, offline caching, installable app
- **Mobile-Optimized UI** - Touch-first design with accessible interactions
- **Real-time Data Sync** - WebSocket updates via Supabase Realtime

### Learning Outcomes
- **Frontend**: React 18 + TypeScript + Modern CSS patterns
- **Backend**: PostgreSQL + PostGIS geospatial extensions  
- **State Management**: Zustand for lightweight, performant state
- **Testing**: Jest + React Testing Library with 80%+ coverage
- **DevOps**: Vercel deployment with environment configuration

## Tech Stack

- **Frontend**: React, TypeScript, Mapbox GL JS, Tailwind CSS, PWA
- **Internationalization**: i18next with browser language detection
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL with PostGIS, Realtime, Auth, Storage)
- **Hosting**: Vercel
- **Mobile-first**: 375px-428px viewport (iPhone SE to iPhone Pro Max)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Supabase backend is pre-configured. Add your Mapbox token:

```env
REACT_APP_SUPABASE_URL=https://hhdhjrkojgqziqmygqct.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGhqcmtvamdxemlxbXlncWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzEzNzMsImV4cCI6MjA3MTAwNzM3M30.CBtzhNxcuej71Mt4HuaDWOlZS_ivEUfnZcUV08LwoCQ
REACT_APP_MAPBOX_TOKEN=your_mapbox_public_token
```

### 3. Key Features Implementation

Ukrainian-specific features:

- **Language Detection**: Auto-detects Ukrainian, falls back to English/Russian
- **Ukrainian Colors**: #0057B7 (blue) and #FFD700 (yellow) design theme
- **Emergency UX**: 44px minimum touch targets, battery saver mode
- **Shelter Priority**: Bomb shelters are the #1 priority feature
- **Alert System**: Air raid alerts with visual/audio notifications
- **Quick Actions**: One-tap reporting for shelter status and resources

### 4. Mapbox Setup

1. Create account at [mapbox.com](https://mapbox.com)
2. Get public access token
3. Add to `.env.local`

### 5. Run Development Server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### 6. Build for Production

```bash
npm run build
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import Git repository
4. Add environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_MAPBOX_TOKEN`
5. Deploy

## Testing the App

1. Open on mobile device or Chrome DevTools mobile view
2. Allow location permissions
3. Test quick report buttons
4. Check real-time updates (open in two tabs)
5. Test offline mode (Chrome DevTools > Network > Offline)
6. Install as PWA (Chrome menu > Install app)

## Next Features to Build

Planned features include:

1. Report verification system
2. Find nearest hospital/shelter
3. Photo upload for reports
4. Journalist check-in system
5. Push notifications for nearby dangers
6. Offline map tile caching
7. Voice input for reports
8. Report expiry system
9. Multi-language support
10. Share location via WhatsApp

## Common Issues & Solutions

### Issue: Location not working
**Solution**: Ensure HTTPS in production, check browser permissions

### Issue: Real-time not updating
**Solution**: Check Supabase Realtime is enabled for tables

### Issue: Map not loading
**Solution**: Verify Mapbox token is correct

### Issue: PWA not installing
**Solution**: Must be served over HTTPS, check manifest.json

## Security Features

- Anonymous reporting by default
- Device ID for verification without accounts
- No personal data required
- HTTPS only in production
- Row Level Security on all tables
- Rate limiting on API calls

## Project Structure

```
src/
├── components/
│   ├── Map/
│   │   └── MapView.tsx
│   ├── Reports/
│   │   └── QuickReport.tsx
│   ├── Mobile/
│   │   ├── BottomSheet.tsx
│   │   └── BottomNav.tsx
│   └── Resources/
│       └── NearestResource.tsx
├── hooks/
│   ├── useRealtimeReports.ts
│   ├── useGeolocation.ts
│   └── useOfflineSync.ts
├── lib/
│   ├── supabase.ts
│   └── database.types.ts
├── utils/
│   └── mapHelpers.ts
└── App.tsx
```

## Contributing

This application crowdsources safety information in conflict zones. Development should prioritize user safety and reliability.

- MIT License
- PRs welcome for translations
- Open to partnerships with humanitarian organizations
- Free access maintained for conflict zones

---

**Important**: This application is designed for humanitarian purposes. Please use responsibly and consider the safety of all users.
