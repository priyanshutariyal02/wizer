# Wizer

## Introduction

Wizer is a cross‑platform mobile application built with Expo and React Native that lets users quickly and easily book rides. It features user authentication, real‑time map integration, in‑app payments, and driver matching, all backed by a serverless PostgreSQL database.

---

## Features

- User Authentication via Clerk
- OTP Verification using phone number input
- Real-Time Maps & Directions using Google Places API and react-native-maps
- Ride Booking with fare calculation and ride history
- In-App Payments using Stripe SDK (Google Pay & Apple Pay supported)
- Driver Matching with profile view, ratings, and confirmation
- State Management using Zustand
- Serverless Database hosted on NeonDB

---

## Tech Stack

### Frontend

- Expo / React Native (SDK 53)
- TypeScript
- Tailwind CSS (via NativeWind)
- Expo Router
- Clerk Expo for authentication
- Stripe React Native SDK
- React Native Maps & Google Places Autocomplete
- Zustand for global state
- Jest + jest-expo for testing

### Backend / Database

- NeonDB Serverless (PostgreSQL)
- Node.js setup scripts
- AJV for schema validation

### Tooling

- ESLint & Prettier
- Tailwind CSS
- Metro bundler
- Babel + TypeScript

---

## Folder Structure

```
├── .vscode/              # Editor settings
├── app/                  # Expo Router pages & screens
├── assets/               # Images, icons, splash screens
├── components/           # Reusable React Native components
├── constants/            # App‑wide constants (colors, keys)
├── lib/                  # API clients, helpers
├── scripts/              # DB setup & utilities
├── store/                # Zustand state stores
├── types/                # Global TypeScript types
├── app.json              # Expo config
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Installation

1. Clone the repository

```bash
git clone https://github.com/priyanshutariyal02/wizer.git
cd wizer
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables  
   Create a `.env` file in the root directory and add:

```env
DATABASE_URL=your_neon_db_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

4. Setup the database

```bash
npm run setup-database
```

5. Run the app

- iOS Simulator: `npm run ios`
- Android Emulator: `npm run android`
- Web: `npm run web`
- Expo Dev: `npm start`

---

## Usage

- Sign Up / Sign In with email or phone (OTP)
- Search for pickup and drop‑off locations
- Book a ride and see driver details
- Pay in‑app via Stripe (supports Google Pay and Apple Pay)
- View ride history and current ride status
- Live tracking (if implemented)

---

## Scripts

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| npm start              | Start Expo Metro bundler                |
| npm run android        | Launch Android emulator                 |
| npm run ios            | Launch iOS Simulator                    |
| npm run web            | Run app in the browser                  |
| npm run setup-database | Set up PostgreSQL tables & seed drivers |
| npm run reset-project  | Clear cache & reset DB                  |
| npm test               | Run Jest tests                          |
| npm run lint           | Run ESLint                              |

---

## Contributing

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/YourFeature
```

3. Commit your changes

```bash
git commit -m "Add YourFeature"
```

4. Push the branch

```bash
git push origin feature/YourFeature
```

5. Open a Pull Request

Please ensure code is linted and all tests pass before submitting.
