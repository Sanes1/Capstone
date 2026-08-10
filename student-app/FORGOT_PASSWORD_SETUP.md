# Forgot Password Feature - Setup Guide

## Overview
The Forgot Password feature allows students to reset their password using their **Student ID**. The system automatically sends a verification code to their registered email (no need to type email, preventing typos!). Code expires in **1 minute** with live countdown.

## How It Works

### Student Flow:
1. **Step 1: Enter Student ID**
   - Student clicks "Forget Password?" link on login page
   - Modal opens with a 2-step indicator
   - Student enters their **4-digit Student ID** (not email!)
   - System automatically looks up their registered email from database
   - Sends 6-digit verification code to that email
   - Shows masked email (e.g., "st***@gmail.com") for privacy

2. **Step 2: Verify & Reset**
   - Student checks email for 6-digit code
   - **Live countdown timer** shows remaining seconds (60s → 0s)
   - Timer turns orange when < 10 seconds remaining
   - Student enters code + new password in same form
   - Password is updated immediately
   - Can resend code if expired or not received

### Why Student ID instead of Email?
✅ **Prevents typos** - Students might mistype their email
✅ **Database-driven** - Uses the email already in Firestore
✅ **Simpler** - Students know their Student ID
✅ **More secure** - Email is fetched automatically, not exposed in UI

### Technical Implementation:

#### Frontend (Student App):
- **Login.jsx**: Added state and button to show ForgotPassword modal
- **ForgotPassword.jsx**: Streamlined 2-step modal component with:
  - Combined code entry + password reset in step 2
  - Live countdown timer (60 seconds)
  - Timer changes color when < 10 seconds remaining
  - Form validation
  - API calls to backend
  - Success/error messaging
- **ForgotPassword.css**: Styled modal with timer animations

#### Backend (Email Backend Server):
Three API endpoints:

1. **POST /api/send-reset-code**
   - Generates 6-digit random code
   - Stores code in memory with **1-minute expiry** (configurable)
   - Sends email with verification code
   - Auto-deletes expired codes
   - Accepts `expiryMinutes` parameter (defaults to 1)

2. **POST /api/verify-reset-code** (optional - not used in streamlined flow)
   - Validates the verification code
   - Checks if code is expired
   - Returns success if valid

3. **POST /api/reset-password**
   - Verifies code for security
   - Uses Firebase Admin SDK to update password
   - Clears verification code after success
   - Returns success message

## Setup Requirements

### 1. Email Backend Must Be Running
```bash
cd email-backend
node server.js
```

### 2. Gmail SMTP Must Be Configured
Check `email-backend/.env`:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 3. Firebase Admin SDK Service Account Key (CRITICAL!)

**⚠️ IMPORTANT: Password reset will NOT work without this file!**

#### Why is this needed?
- Firebase Admin SDK can update user passwords directly
- Client-side Firebase Auth cannot change passwords without current password
- This is more secure than storing temporary passwords

#### How to get it:
1. Go to https://console.firebase.google.com/
2. Select project: **academia-de-san-jose**
3. Click Settings (⚙️) → Project settings
4. Go to **Service accounts** tab
5. Click **"Generate new private key"** button
6. Save downloaded file as `serviceAccountKey.json`
7. Place it in `email-backend/` directory

#### File location:
```
email-backend/
  ├── server.js
  ├── package.json
  ├── .env
  └── serviceAccountKey.json  ← Place here!
```

#### Security:
- ✅ Already in `.gitignore` - won't be committed
- ✅ Never share this file
- ✅ Keep it secure and private

## Testing the Feature

### 1. Start the email backend server:
```bash
cd email-backend
node server.js
```

You should see:
```
✅ Firebase Admin initialized
✅ Gmail SMTP ready to send emails
🚀 Email backend running on http://localhost:5000
📧 Ready to send emails via Gmail SMTP
```

If you see:
```
⚠️ Firebase Admin not initialized - delete user from Auth will not work
```
Then `serviceAccountKey.json` is missing!

### 2. Start the student app:
```bash
cd student-app
npm start
```

### 3. Test the flow:
1. Go to login page
2. Click "Forget Password?" link
3. Enter a valid 4-digit Student ID (e.g., "1234")
4. System automatically fetches email from database
5. Check that student's email for 6-digit code
6. Enter code (watch the 60-second countdown!)
7. Set new password
8. Login with new password

## Email Template

Students will receive an email like this:

```
Subject: Password Reset Verification Code

Academia De San Jose - Password Reset Request

Dear [Student Name],

We received a request to reset your Academia De San Jose account password. Use the verification code below to proceed:

┌─────────────────────────┐
│  Your Verification Code  │
│                          │
│       1 2 3 4 5 6       │
│                          │
│    Valid for 15 minutes  │
└─────────────────────────┘

Security Notice:
• This code expires in 15 minutes
• If you didn't request this, please ignore this email
• Never share this code with anyone
• Contact support if you notice suspicious activity

Best regards,
Academia De San Jose Support Team
```

## Error Handling

The system handles various error scenarios:

### Frontend:
- Invalid Student ID format (must be 4 digits)
- Student ID not found in database
- Incorrect verification code
- Expired verification code (after 60 seconds)
- Password mismatch
- Password too short (< 6 characters)

### Backend:
- Email sending failures
- Firebase Admin not initialized
- User not found
- Code verification failures
- Password update failures

## Production Considerations

### Current Implementation (Development):
- Verification codes stored in-memory Map
- Codes auto-expire after 15 minutes
- Uses Gmail SMTP for emails

### Recommended for Production:
1. **Use Redis** for verification code storage (supports distributed systems)
2. **Rate Limiting**: Prevent abuse (max 3 requests per hour per email)
3. **CAPTCHA**: Add reCAPTCHA to prevent bots
4. **Professional Email Service**: Use SendGrid, AWS SES, or Mailgun
5. **Audit Logging**: Log all password reset attempts
6. **SMS Verification**: Optional 2-factor authentication
7. **IP Tracking**: Monitor suspicious activity

## Troubleshooting

### "Failed to send verification code"
- ✅ Check if email-backend is running on port 5000
- ✅ Verify Gmail SMTP credentials in `.env`
- ✅ Check server console for detailed errors

### "Firebase Admin not initialized"
- ✅ Download `serviceAccountKey.json` from Firebase Console
- ✅ Place it in `email-backend/` directory
- ✅ Restart the email-backend server

### "Failed to reset password"
- ✅ Ensure `serviceAccountKey.json` is present
- ✅ Check if verification code is still valid (15-min expiry)
- ✅ Verify email matches the student's email in Firestore

### "Student ID not found"
- ✅ Ensure student exists in Firestore `students` collection
- ✅ Check that student email is correct
- ✅ Verify the email matches what's stored in Firestore

## File Structure

```
ASJ/
├── student-app/
│   └── src/
│       ├── components/
│       │   ├── Login.jsx              ← Shows "Forget Password?" link
│       │   └── ForgotPassword.jsx     ← Modal component
│       └── styles/
│           └── ForgotPassword.css     ← Modal styling
│
└── email-backend/
    ├── server.js                      ← Added 3 new endpoints
    ├── serviceAccountKey.json         ← DOWNLOAD THIS!
    ├── .env                           ← Gmail credentials
    └── README.md                      ← Backend documentation
```

## Summary

✅ **Completed:**
- 3-step forgot password modal UI
- Email verification code system
- Backend API endpoints
- Password reset using Firebase Admin SDK
- Email templates with styling
- Error handling and validation
- Success/error messages
- Step indicator with animations
- Resend code functionality

⚠️ **Action Required:**
1. Download `serviceAccountKey.json` from Firebase Console
2. Place it in `email-backend/` directory
3. Restart email-backend server
4. Test the complete flow

🎉 **Result:**
Students can now reset their passwords independently without admin intervention!
