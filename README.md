# EcoTachosTec — Mobile App

> React Native mobile app for the EcoTachosTec smart waste classification system. Scan waste with your phone camera, get instant AI classification, monitor smart bins on a live map, and report incidents — all from iOS or Android.

---

## What it does

The EcoTachosTec mobile app extends the web platform to field operators and institutional users. It connects to the same Django backend and allows users to:

- **Scan waste** using the phone camera and receive an instant AI classification (organic / inorganic / recyclable)
- **Monitor smart bins** on an interactive map with live status updates
- **Report incidents** (overflowing bins, malfunctions) with geolocated photos
- **Receive push notifications** for critical alerts — full bins, detection anomalies, maintenance schedules

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 48 |
| Navigation | React Navigation (Stack + Tab navigators) |
| Camera | Expo Camera with manual focus/exposure controls |
| Maps | React Native Maps |
| Push notifications | Expo Notifications + Firebase Cloud Messaging (Android) / APNS (iOS) |
| Offline storage | AsyncStorage (local cache + offline sync) |
| HTTP client | Axios (same JWT setup as web) |
| State | React Context + hooks |

---

## Key features

**Waste scanner**
- Camera viewfinder with framing guides
- Manual focus and exposure controls
- Sends image to backend YOLOv8 model
- Shows result: category + confidence score with color indicator
- Option to confirm or correct classification (feeds back into model training dataset)

**Live map**
- Smart bin markers with status colors (green = active, yellow = alert, red = offline)
- Tap any marker to see fill level, last classification, and assignment
- Auto-centered on user's institution

**Incident reporting**
- Capture photo of a problem (damaged bin, overflow)
- Automatically geolocated
- Sent to backend and visible in admin dashboard

**Push notifications**
- Bin fill level alerts
- New AI detections at assigned devices
- Maintenance reminders

---

## Getting started

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for development)
- Backend running (see [ecotachostec-backend](https://github.com/Erick5933/ecotachostec-backend))

### Run locally

```bash
git clone https://github.com/Erick5933/ecotachostec-mobile
cd ecotachostec-mobile

npm install

# Set your backend URL
cp .env.example .env
# Edit .env → API_URL=http://your-local-ip:8000/api

npx expo start
```

Scan the QR code with Expo Go on your phone.

### Build for production

```bash
# Android APK
eas build --platform android

# iOS (requires Apple Developer account)
eas build --platform ios
```

---

## Project structure

```
src/
├── screens/
│   ├── HomeScreen.jsx       # Dashboard with stats
│   ├── ScannerScreen.jsx    # Camera + AI classification
│   ├── MapScreen.jsx        # Live bin map
│   ├── ClasificacionesScreen.jsx
│   └── AjustesScreen.jsx
├── components/
│   ├── CameraViewfinder.jsx
│   ├── ClassificationResult.jsx
│   ├── BinMarker.jsx
│   └── NotificationBadge.jsx
├── navigation/
│   ├── StackNavigator.jsx
│   └── TabNavigator.jsx
├── services/
│   ├── api.js               # Axios instance
│   ├── notifications.js     # Expo push notification setup
│   └── storage.js           # AsyncStorage helpers
└── hooks/
    ├── useCamera.js
    └── useSync.js           # Offline sync logic
```

---

## Offline behavior

The app caches device list, recent detections, and user profile locally via AsyncStorage. When connectivity is lost:
- Map still shows last known bin status
- Classification history remains accessible
- Incident reports queue locally and sync when connection is restored

Conflict resolution uses last-modified timestamp when syncing with the backend.

---

## Supported platforms

- Android 8.0+
- iOS 13+

---

## Related repositories

- [ecotachostec-backend](https://github.com/Erick5933/ecotachostec-backend) — Django REST API + YOLOv8 inference
- [ecotachostec-frontend](https://github.com/Erick5933/ecotachostec-frontend) — React web dashboard

---

## Authors

Built by Erick Chacón & Edwin Choez — Instituto Tecnológico del Azuay, Ecuador (2025–2026)
