# Email Setup Instructions

## Step 1: Configure Gmail App Password

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Select "Other" as the device
   - Enter "Academia Student Portal"
   - Click "Generate"
   - **Copy the 16-character password** (you'll need it in the next step)

## Step 2: Update Cloud Function with Your Credentials

Open `functions/index.js` and replace these lines:

```javascript
user: "your-email@gmail.com",  // Replace with your Gmail address
pass: "your-app-password",      // Replace with the App Password from Step 1
```

With your actual credentials:

```javascript
user: "admin@asj.edu",          // Your Gmail
pass: "abcd efgh ijkl mnop",    // Your 16-char App Password (spaces will be removed automatically)
```

## Step 3: Deploy the Cloud Function

Run this command in the root directory:

```bash
firebase deploy --only functions
```

Wait for deployment to complete (may take 1-2 minutes).

## Step 4: Test Email Sending

1. Start the superadmin app
2. Go to User Management
3. Create a new student account
4. Check the student's email inbox for the credentials

## Troubleshooting

### Error: "Less secure app access"
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled

### Error: "Invalid credentials"
- Double-check your email and App Password in `functions/index.js`
- Remove any spaces in the App Password

### Error: "Function not found"
- Run `firebase deploy --only functions` again
- Check Firebase Console → Functions to see if deployment succeeded

### Email goes to spam
- The first few emails might go to spam
- Mark them as "Not Spam" to train Gmail

### Want to use a different email service?
- Change `service: "gmail"` to another service like:
  - `"hotmail"` - For Outlook/Hotmail
  - `"yahoo"` - For Yahoo Mail
  - Or use custom SMTP settings

## Production Recommendations

For production use:
1. Use a dedicated email service (SendGrid, Mailgun, etc.)
2. Use environment variables for credentials (not hardcoded)
3. Set up email templates
4. Add email verification
5. Implement retry logic for failed emails

## Cost

Firebase Cloud Functions free tier:
- 2 million invocations/month
- More than enough for a school system

Gmail limits:
- 500 emails/day for regular Gmail
- 2,000 emails/day for Google Workspace
