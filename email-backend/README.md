# Email Backend Server

This backend server handles email sending and password reset functionality for the Academia De San Jose Student Portal.

## Features
- Send student credentials via email
- Send staff credentials via email
- Password reset with verification code
- Delete users from Firebase Authentication

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

**To get Gmail App Password:**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Copy the generated password to `.env`

### 3. Download Firebase Service Account Key

**IMPORTANT:** The password reset feature requires Firebase Admin SDK, which needs a service account key.

**Steps to download:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **academia-de-san-jose**
3. Click the gear icon (⚙️) → Project settings
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded file as `serviceAccountKey.json` in this directory (`email-backend/`)

**Security Note:** 
- NEVER commit `serviceAccountKey.json` to git
- This file is already in `.gitignore`
- Keep this file secure and private

### 4. Start the Server
```bash
node server.js
```

The server will run on `http://localhost:5000`

## API Endpoints

### POST /api/send-credentials
Send student login credentials via email.

**Request Body:**
```json
{
  "email": "student@example.com",
  "studentId": "1234",
  "password": "temp-password",
  "studentName": "John Doe"
}
```

### POST /api/send-staff-credentials
Send staff login credentials via email.

**Request Body:**
```json
{
  "email": "staff@example.com",
  "staffName": "Jane Smith",
  "username": "jsmith",
  "password": "temp-password",
  "office": "Registrar"
}
```

### POST /api/send-reset-code
Send password reset verification code via email.

**Request Body:**
```json
{
  "email": "student@example.com",
  "studentName": "John Doe",
  "studentId": "1234"
}
```

**Response:**
- Generates 6-digit verification code
- Code expires in 15 minutes
- Stores code in memory (consider using Redis for production)

### POST /api/verify-reset-code
Verify the password reset code.

**Request Body:**
```json
{
  "email": "student@example.com",
  "code": "123456"
}
```

### POST /api/reset-password
Reset user password using verified code.

**Request Body:**
```json
{
  "email": "student@example.com",
  "newPassword": "newSecurePassword123",
  "verificationCode": "123456"
}
```

**Requirements:**
- Requires `serviceAccountKey.json` to be present
- Uses Firebase Admin SDK to update password
- Automatically clears verification code after successful reset

### POST /api/delete-user
Delete user from Firebase Authentication.

**Request Body:**
```json
{
  "uid": "firebase-user-uid"
}
```

**Requirements:**
- Requires `serviceAccountKey.json` to be present

## Important Notes

### Without serviceAccountKey.json
If the service account key is not configured:
- Email sending will still work
- Password reset **will not work** (requires Admin SDK)
- User deletion **will not work** (requires Admin SDK)

The server will start with a warning message if the key is missing.

### Production Considerations
1. **Verification Code Storage**: Currently uses in-memory Map. For production:
   - Use Redis for distributed systems
   - Use a database for persistence
   - Implement rate limiting

2. **Email Service**: Consider using dedicated email services:
   - SendGrid
   - Amazon SES
   - Mailgun

3. **Security**:
   - Add rate limiting to prevent spam
   - Implement CAPTCHA for password reset
   - Use HTTPS in production
   - Add request validation and sanitization

## Troubleshooting

### "Gmail SMTP connection failed"
- Check your Gmail credentials in `.env`
- Ensure you're using an App Password, not your regular password
- Verify 2-Factor Authentication is enabled on your Google account

### "Firebase Admin not initialized"
- Download `serviceAccountKey.json` from Firebase Console
- Place it in the `email-backend/` directory
- Restart the server

### "Failed to send verification code"
- Check if email-backend server is running on port 5000
- Verify Gmail SMTP connection is working
- Check server logs for detailed error messages

## Testing

Test the server is running:
```bash
curl http://localhost:5000
```

Expected response:
```json
{
  "message": "Email backend is running with Gmail SMTP!"
}
```
