# Secure Expenses Tracker

A full-stack mobile application for privacy-first personal expense tracking, featuring a custom-built 2FA authentication system with OTP.

Built using **React Native (Expo)** for the frontend and **Node.js (Express) + MongoDB** for the backend.

## Features

- **Secure Authentication**: Custom JWT-based auth with email OTP for 2FA.
- **OTP System**: 
  - 10-minute code validity.
  - Non-blocking email delivery for instant UI feedback.
  - Connection pooling for faster email sending.
- **Expense Management**: Add, view, and delete expenses.
- **Budget Tracking**: Set and monitor your monthly budget.
- **Profile Management**: Update user profile and settings.
- **Cross-Platform**: Runs on Android and iOS via Expo.

## Tech Stack

### Frontend
- **React Native** (Expo SDK)
- **TypeScript**
- **React Navigation**
- **Expo SecureStore** (Token storage)

### Backend
- **Node.js** & **Express**
- **MongoDB** (Database)
- **Mongoose** (ODM)
- **Resend** (Email API)
- **JWT** (Authentication)

## Project Structure

```bash
ExpenseTracker/
├── backend/            # Express API Server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/      
├── src/                
│   ├── context/        
│   ├── navigation/    
│   └── screens/        
├── app.json            
└── eas.json       
```

## Getting Started

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the following variables:
```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Resend Email (Works on Render free tier!)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**📧 Email Setup**: See [RESEND_SETUP.md](./RESEND_SETUP.md) for detailed Resend configuration (takes 5 minutes!).

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

Return to the root directory:
```bash
npm install
```

Start the Expo development server:
```bash
npx expo start
```
Use the Expo Go app on your phone to scan the QR code and run the app.

## Deployment

### Backend (Render)
The backend is deployed on Render with auto-deploy enabled.
- **Live URL:** Your Render service URL
- **Environment variables** must be set in Render dashboard
- Auto-deploys on push to `main` branch

### Mobile App (EAS Build)

#### Development Build
```bash
npx expo start
```

#### Production Build (APK/AAB)
```bash
# Build Android App Bundle for Play Store
eas build --platform android --profile production

# Build APK for direct distribution
eas build --platform android --profile preview
```

#### Google Play Store Deployment
See **[PLAYSTORE_DEPLOYMENT.md](./PLAYSTORE_DEPLOYMENT.md)** for complete step-by-step guide including:
- Google Play Developer account setup
- App store listing creation
- Privacy policy requirements
- Content rating and data safety
- Submission and review process

Updates are managed via EAS Update or new builds.

## Troubleshooting

- **Email Not Sending**: 
  - **On Render**: Render blocks SMTP ports on free tier. Use Resend API instead (see [RESEND_SETUP.md](./RESEND_SETUP.md))
  - **Locally**: Verify `RESEND_API_KEY` is set correctly (starts with `re_`)
  - Check Render logs for `[EMAIL]` prefixed messages
- **Login Lag**: If login feels slow, ensure the backend email settings are correct. The system sends emails asynchronously to prevent UI blocking.
- **Network Errors**: Ensure your mobile device and backend (if running locally) are on the same network, or use a tunneling service like Ngrok.
