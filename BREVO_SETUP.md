# 📧 Brevo Email Setup Guide

## ✅ What's Been Set Up

1. ✅ Express backend created (`email-backend/`)
2. ✅ Brevo SDK installed
3. ✅ Email sending endpoint created
4. ✅ Frontend updated to call backend
5. ✅ Beautiful HTML email template ready

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Brevo API Key

1. Go to https://www.brevo.com
2. Click "Sign up free"
3. Create your account
4. Verify your email
5. Go to https://app.brevo.com/settings/keys/api
6. Click "Generate a new API key"
7. Name it "Student Portal"
8. **Copy the API key** (starts with `xkeysib-...`)

### Step 2: Configure Backend

1. Go to `email-backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` file
4. Paste your Brevo API key:
   ```
   BREVO_API_KEY=xkeysib-your-actual-api-key-here
   ```
5. Save the file

### Step 3: Start Email Backend

Open a NEW terminal and run:

```bash
cd email-backend
npm start
```

You should see:
```
🚀 Email backend running on http://localhost:5000
📧 Ready to send emails via Brevo
```

**Keep this terminal running!**

### Step 4: Test It!

1. Make sure email backend is running (Step 3)
2. Start superadmin app (in another terminal):
   ```bash
   cd superadmin-app
   npm start
   ```
3. Login to superadmin
4. Go to User Management
5. Create a student account with a real email
6. Check that email inbox!

## 📧 What Students Will Receive

Beautiful email with:
- Welcome header (green gradient)
- Student ID
- Password
- Login button
- Security warnings
- Professional footer

## 🎯 Free Tier Limits

Brevo Free Plan:
- ✅ **300 emails per day**
- ✅ **Unlimited contacts**
- ✅ No credit card required
- ✅ Perfect for a school system

## 🔧 Running the System

You need to run **3 things**:

1. **Email Backend** (Terminal 1):
   ```bash
   cd email-backend
   npm start
   ```

2. **Superadmin App** (Terminal 2):
   ```bash
   cd superadmin-app
   npm start
   ```

3. **Student App** (Terminal 3 - optional):
   ```bash
   cd student-app
   npm start
   ```

## 🐛 Troubleshooting

### "Failed to send email" error
- Check if email backend is running
- Verify BREVO_API_KEY in `.env` file
- Check backend terminal for errors

### Email not received
- Check spam folder
- Verify email address is correct
- Check Brevo dashboard for delivery status

### "API key invalid" error
- Make sure you copied the full API key
- No spaces before/after the key
- Key starts with `xkeysib-`

### Port 5000 already in use
Change port in `server.js`:
```javascript
const PORT = 5001; // Change to any available port
```

Then update frontend call in UserManagement.jsx:
```javascript
fetch('http://localhost:5001/api/send-credentials', ...)
```

## 📊 Monitor Emails

Check your Brevo dashboard:
- https://app.brevo.com/statistics
- See sent emails
- Check delivery rates
- View email opens

## 🚀 Production Deployment

For production, deploy the backend to:
1. **Vercel** (free tier)
2. **Railway** (free tier)
3. **Render** (free tier)
4. **Heroku** ($5/month)

Then update the frontend URL from:
```javascript
'http://localhost:5000/api/send-credentials'
```
to:
```javascript
'https://your-backend.vercel.app/api/send-credentials'
```

## 💡 Tips

1. **Test with your own email first**
2. **Keep the backend running** while creating accounts
3. **Check Brevo dashboard** to monitor sends
4. **300 emails/day** = enough for most schools

## 🆘 Need Help?

Check backend logs in terminal for errors!
