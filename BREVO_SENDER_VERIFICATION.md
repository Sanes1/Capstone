# Brevo Sender Verification

## Why emails might not arrive

Brevo requires sender email verification for better delivery rates.

## Steps to Verify Sender Email

### Option 1: Use Brevo's Default Sender (Quickest)

1. Go to https://app.brevo.com/settings/senders
2. Look for verified senders
3. Use one of those emails in the backend

Update `server.js` line 172:
```javascript
sender: {
  name: "Academia De San Jose",
  email: "YOUR-VERIFIED-EMAIL@domain.com"  // Use verified email from Brevo
}
```

### Option 2: Verify Your Own Domain Email

1. Go to https://app.brevo.com/settings/senders
2. Click "Add a new sender"
3. Enter your email (e.g., admin@asj.edu)
4. Verify via email confirmation
5. Update sender email in code

### Option 3: Use Your Personal Email (For Testing)

For testing, use your own verified email:

```javascript
sender: {
  name: "Academia De San Jose",
  email: "vabe.sanes.swu@phinmaed.com"  // Your verified email
}
```

## Check Email Status

1. Go to https://app.brevo.com/email-campaigns
2. Click "Transactional" tab
3. See all sent emails and their status
4. Check if email was delivered or bounced

## Common Issues

### Email in Spam
- Check spam/junk folder
- Mark as "Not Spam"
- Future emails will go to inbox

### Email Bounced
- Check email address is correct
- Verify sender email in Brevo
- Check Brevo dashboard for bounce reason

### Email Not Sent
- Check Brevo API key is correct
- Check daily limit (300 emails/day)
- Check backend logs for errors

## Testing

1. **Check spam folder first!**
2. Try sending to a different email
3. Check Brevo dashboard for delivery status
4. Use your own email for testing

## After Verification

Once sender is verified:
- Emails will arrive faster
- Better inbox placement
- Higher delivery rate
