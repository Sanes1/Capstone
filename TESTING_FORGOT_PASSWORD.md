# Testing Forgot Password Feature

## ✅ All Servers Running

Your servers are currently running:
- ✅ **Student App**: http://localhost:3000
- ✅ **Admin App**: http://localhost:3001
- ✅ **SuperAdmin App**: http://localhost:3002
- ✅ **Email Backend**: http://localhost:5000

## ⚠️ Important: Firebase Admin SDK Required

The email backend is running but shows this warning:
```
⚠️ Firebase Admin not initialized - delete user from Auth will not work
Download service account key from Firebase Console to enable this feature
```

**This means password reset will NOT work yet!** You need to download the service account key.

### How to Fix:

1. Go to https://console.firebase.google.com/
2. Select project: **academia-de-san-jose**
3. Click Settings (⚙️) → **Project settings**
4. Go to **Service accounts** tab
5. Click **"Generate new private key"** button
6. Save downloaded file as `serviceAccountKey.json`
7. Place it in `email-backend/` folder
8. Restart email backend: Stop terminal 5 and run `node server.js` again

You should then see:
```
✅ Firebase Admin initialized
✅ Gmail SMTP ready to send emails
🚀 Email backend running on http://localhost:5000
```

## 🧪 How to Test (After Downloading Service Account Key)

### Test Flow:

1. **Open Student App**: http://localhost:3000

2. **Click "Forget Password?" link** on the login page

3. **Enter Student ID**:
   - Enter a 4-digit Student ID (e.g., "1234")
   - System automatically looks up their email from database
   - Sends 6-digit code to their registered email
   - Shows masked email (e.g., "st***@gmail.com")

4. **Check Email**:
   - Open the student's email inbox
   - Look for email from Academia De San Jose
   - Copy the 6-digit verification code

5. **Enter Code & New Password**:
   - Watch the 60-second countdown timer
   - Enter the 6-digit code
   - Enter new password (min 6 chars)
   - Confirm password
   - Click "Reset Password"

6. **Login with New Password**:
   - Modal closes automatically
   - Login with the new password
   - Should work! ✨

### Test Scenarios:

#### ✅ Happy Path:
- Valid Student ID → Code sent → Enter code within 60s → Set password → Success

#### ❌ Error Scenarios to Test:

1. **Invalid Student ID**:
   - Enter non-existent Student ID
   - Should show: "Student ID not found in our records"

2. **Wrong Code**:
   - Enter incorrect 6-digit code
   - Should show: "Invalid verification code"

3. **Expired Code**:
   - Wait 60+ seconds after receiving code
   - Try to reset password
   - Should show: "Verification code has expired"
   - Can click "Resend" to get new code

4. **Password Mismatch**:
   - Enter different passwords in "New" and "Confirm"
   - Should show: "Passwords do not match"

5. **Short Password**:
   - Enter password < 6 characters
   - Should show: "Password must be at least 6 characters"

## 📧 Email Configuration

Make sure `email-backend/.env` has:
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

If not configured, emails won't send!

## 🎨 UI Features to Notice:

1. **2-Step Indicator**: Shows current step (Send Code → Verify & Reset)
2. **Countdown Timer**: Live 60-second countdown
3. **Timer Color Change**: Turns orange when < 10 seconds remaining
4. **Masked Email**: Shows "st***@gmail.com" for privacy
5. **Auto-focus**: Automatically focuses on input fields
6. **Loading States**: Buttons show "Sending Code..." / "Resetting Password..."
7. **Success Messages**: Green checkmark with success text
8. **Error Messages**: Red alert with error text
9. **Resend Button**: Can request new code if expired
10. **Back Button**: Can go back to enter different Student ID

## 🔍 What to Look For:

### Step 1: Send Code
- [ ] Student ID input only accepts 4 digits
- [ ] Shows error if Student ID not found
- [ ] Shows success message with masked email
- [ ] Transitions to Step 2 automatically

### Step 2: Verify & Reset
- [ ] Timer starts at 60 and counts down
- [ ] Timer turns orange at 10 seconds
- [ ] Code input only accepts 6 digits
- [ ] Code input has wide letter-spacing for readability
- [ ] Password validation works (min 6 chars)
- [ ] Password confirmation works
- [ ] "Resend" button requests new code
- [ ] "Back" button returns to Step 1
- [ ] Success message appears after reset
- [ ] Modal closes automatically after success

## 🐛 Known Issues:

1. **Hot Reload Errors**: If you see React errors in console, they're from hot module replacement. Refresh the page to clear them.

2. **Firebase Admin Warning**: Password reset won't work without `serviceAccountKey.json`. Download it first!

3. **Email Not Received**: 
   - Check spam folder
   - Verify Gmail SMTP is configured in `.env`
   - Check email-backend console for errors

## 📝 Quick Checklist:

Before testing, make sure:
- [ ] All 4 servers are running (student, admin, superadmin, email-backend)
- [ ] `serviceAccountKey.json` is in `email-backend/` folder
- [ ] Email-backend shows "✅ Firebase Admin initialized"
- [ ] Gmail SMTP is configured in `email-backend/.env`
- [ ] Test student exists in Firestore with valid email

## 🎉 Success Criteria:

The feature is working correctly if:
1. ✅ Student can request code with Student ID
2. ✅ Email is sent within 5 seconds
3. ✅ Countdown timer works and shows remaining time
4. ✅ Valid code + new password successfully resets password
5. ✅ Student can login with new password immediately
6. ✅ Expired codes are rejected with proper error message
7. ✅ Resend code functionality works
8. ✅ All error scenarios show appropriate messages

## 💡 Tips:

- Use a real student email you have access to for testing
- Test the full flow at least 3 times to ensure consistency
- Try all error scenarios to verify validation
- Check email delivery time (should be < 5 seconds)
- Verify the countdown timer accuracy
- Test on different browsers if possible

## 🚀 Next Steps After Testing:

Once everything works:
1. Test with multiple students
2. Consider adding rate limiting (max 3 requests per hour)
3. Add CAPTCHA for security (optional)
4. Monitor email delivery success rates
5. Add logging for password reset attempts

---

**Need Help?**
- Check email-backend console for detailed logs
- Check browser console for frontend errors
- Verify Firebase connection
- Ensure student data in Firestore has valid email field
