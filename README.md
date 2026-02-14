# Secure Expenses Tracker

A full-stack mobile application for privacy-first personal expense tracking, featuring a custom-built 2FA authentication system with OTP.

Built using **React Native (Expo)** for the frontend and **Node.js (Express) + MongoDB** for the backend.

## 🚀 Live Demo

- **Backend API:** [https://expensestracker.onrender.com](https://expensestracker.onrender.com)
- **Status:** ✅ Production-ready
- **Features:** JWT Auth, Email OTP (Resend), MongoDB, Auto-deploy

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
- **React Native** 
- **TypeScript**
- **React Navigation**
- **Expo SecureStore**

### Backend
- **Node.js** & **Express**
- **MongoDB** 
- **Mongoose**
- **Resend** 
- **JWT** 

## Project Structure

```bash
ExpenseTracker/
├── backend/            
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
- **Live URL:** https://expensestracker.onrender.com
- **Environment variables** must be set in Render dashboard
- **Status:** Production-ready with Resend email integration
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


#### Upcoming Updates:- 
- Uploading app on playstore
= Notifications enabled
- Biometrics Fingerprint and Face
- Better UI