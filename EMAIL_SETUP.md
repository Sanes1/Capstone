# Email Setup Guide

## Overview
When a superadmin creates a student account, the system should automatically send the login credentials (Student ID and Password) to the student's email address.

## Current Status
⚠️ **Email sending is not yet implemented**. Currently, the credentials are only logged to the browser console.

## Implementation Options

### Option 1: Firebase Cloud Functions with SendGrid/Nodemailer (Recommended)

1. **Install Firebase Functions**
```bash
npm install -g firebase-tools
firebase init functions
```

2. **Install Email Library**
```bash
cd functions
npm install nodemailer
# OR
npm install @sendgrid/mail
```

3. **Create Cloud Function** (`functions/index.js`)
```javascript
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use App Password, not regular password
  }
});

exports.sendCredentialsEmail = functions.https.onCall(async (data, context) => {
  const { email, studentId, password, studentName } = data;
  
  const mailOptions = {
    from: 'Academia De San Jose <noreply@asj.edu>',
    to: email,
    subject: 'Your Academia De San Jose Account Credentials',
    html: `
      <h2>Welcome to Academia De San Jose!</h2>
      <p>Dear ${studentName},</p>
      <p>Your student account has been created. Here are your login credentials:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Student ID:</strong> ${studentId}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
      </div>
      <p>Please log in at: <a href="http://localhost:3000">http://localhost:3000</a></p>
      <p><strong>Important:</strong> Please change your password after your first login.</p>
      <br>
      <p>Best regards,<br>Academia De San Jose Administration</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
  return { success: true };
});
```

4. **Deploy Function**
```bash
firebase deploy --only functions
```

5. **Update UserManagement.jsx**
```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendEmail = httpsCallable(functions, 'sendCredentialsEmail');

// In handleCreateStudent, after creating account:
await sendEmail({
  email: studentEmail,
  studentId: studentId,
  password: password,
  studentName: studentName
});
```

### Option 2: Gmail API with OAuth2

1. **Enable Gmail API** in Google Cloud Console
2. **Set up OAuth2 credentials**
3. **Use `@googleapis/gmail` package**

### Option 3: Third-party Email Service

**SendGrid:**
- Sign up at https://sendgrid.com
- Get API key
- Use SendGrid's API

**Mailgun:**
- Sign up at https://www.mailgun.com
- Get API credentials
- Use Mailgun's API

**EmailJS (Easiest for testing):**
- Sign up at https://www.emailjs.com
- No backend required
- Free tier available

## Security Notes

⚠️ **Never store email credentials in frontend code!**
- Use environment variables
- Use Firebase Functions or backend API
- Use App Passwords for Gmail (not your actual password)
- Enable 2-factor authentication on email account

## Testing

For development/testing, you can use:
- **Ethereal Email** (https://ethereal.email) - Fake SMTP service
- **MailHog** - Local email testing tool
- **Mailtrap** - Email sandbox

## Gmail App Password Setup

If using Gmail:
1. Go to Google Account settings
2. Enable 2-Step Verification
3. Go to Security → App passwords
4. Generate app password for "Mail"
5. Use this password in your code (not your Gmail password)

## Current Behavior

Currently, when an account is created:
- ✅ Account is saved to Firebase
- ✅ Success message is shown
- ⚠️ Credentials are logged to console (for testing)
- ❌ Email is NOT sent

Check browser console to see the credentials that would be sent.
