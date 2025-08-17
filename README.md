# ФІКСЕР / FIXER - Safety Map for Ukraine

A mobile-first Progressive Web App (PWA) specifically designed for Ukrainian civilians, international journalists, and volunteers. Provides critical safety information including bomb shelters, air raid alerts, and essential resources, with trilingual support (Ukrainian, English, Russian).

## 🚀 Features

- **🏠 Bomb Shelter Locator** - Find nearest shelters with capacity and amenities
- **🚨 Air Raid Alert System** - Real-time alerts with visual and audio warnings
- **🌍 Trilingual Support** - Ukrainian (default), English, and Russian
- **📱 Mobile-First Design** - Optimized for 375px-428px viewports
- **⚡ Emergency Features** - Battery saver mode, large touch targets, high contrast
- **📍 Quick Reporting** - One-tap shelter status and resource availability updates
- **🔄 Offline-First** - Works without internet connection
- **🎨 Ukrainian Design** - Ukrainian blue/yellow color scheme with cultural sensitivity

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Mapbox GL JS, Tailwind CSS, PWA
- **Internationalization**: i18next with browser language detection
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL with PostGIS, Realtime, Auth, Storage)
- **Hosting**: Vercel
- **Mobile-first**: 375px-428px viewport (iPhone SE to iPhone Pro Max)

## 📱 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The Supabase backend is already configured. You only need to add your Mapbox token:

```env
REACT_APP_SUPABASE_URL=https://hhdhjrkojgqziqmygqct.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZGhqcmtvamdxemlxbXlncWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MzEzNzMsImV4cCI6MjA3MTAwNzM3M30.CBtzhNxcuej71Mt4HuaDWOlZS_ivEUfnZcUV08LwoCQ
REACT_APP_MAPBOX_TOKEN=your_mapbox_public_token
```

### 3. Key Features Implementation

The app includes these Ukrainian-specific features:

- **🇺🇦 Language Detection**: Auto-detects Ukrainian, falls back to English/Russian
- **🎨 Ukrainian Colors**: #0057B7 (blue) and #FFD700 (yellow) design theme
- **📱 Emergency UX**: 44px minimum touch targets, battery saver mode
- **🏠 Shelter Priority**: Bomb shelters are the #1 priority feature
- **🚨 Alert System**: Air raid alerts with visual/audio notifications
- **📍 Quick Actions**: One-tap reporting for shelter status and resources

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

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import Git repository
4. Add environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_MAPBOX_TOKEN`
5. Deploy

## 📱 Testing the App

1. Open on mobile device or Chrome DevTools mobile view
2. Allow location permissions
3. Test quick report buttons
4. Check real-time updates (open in two tabs)
5. Test offline mode (Chrome DevTools > Network > Offline)
6. Install as PWA (Chrome menu > Install app)

## 🔮 Next Features to Build

After MVP is working, add:

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

## 🐛 Common Issues & Solutions

### Issue: Location not working
**Solution**: Ensure HTTPS in production, check browser permissions

### Issue: Real-time not updating
**Solution**: Check Supabase Realtime is enabled for tables

### Issue: Map not loading
**Solution**: Verify Mapbox token is correct

### Issue: PWA not installing
**Solution**: Must be served over HTTPS, check manifest.json

## 🔒 Security Features

- Anonymous reporting by default
- Device ID for verification without accounts
- No personal data required
- HTTPS only in production
- Row Level Security on all tables
- Rate limiting on API calls

## 📂 Project Structure

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

## 🤝 Contributing

This app helps save lives by crowd-sourcing safety information in conflict zones. Build with care and consideration for the users who will depend on it.

- MIT License
- Accept PRs for translations
- Partner with humanitarian organizations
- Maintain free tier for conflict zones

---

**⚠️ Important**: This application is designed for humanitarian purposes to help save lives in conflict zones. Please use responsibly and consider the safety of all users.
