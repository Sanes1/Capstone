# Firebase Admin SDK Setup

This guide explains how to set up Firebase Admin SDK to enable deleting users from Firebase Authentication.

## Why is this needed?

When the superadmin deletes a student account, we need to remove it from:
1. **Firestore database** ✅ (already working)
2. **Firebase Authentication** ⚠️ (requires Admin SDK)

The Firebase Admin SDK runs on the backend (email-backend server) and has special permissions to manage users in Firebase Authentication.

## Setup Steps

### Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **academia-de-san-jose**
3. Click the gear icon ⚙️ next to "Project Overview"
4. Click **Project settings**
5. Click the **Service accounts** tab
6. Click **Generate new private key** button
7. A JSON file will download - this is your service account key

### Step 2: Save the Service Account Key

1. Rename the downloaded file to: `serviceAccountKey.json`
2. Move it to the `email-backend` folder:
   ```
   ASJ/
   └── email-backend/
       ├── server.js
       ├── package.json
       ├── .env
       └── serviceAccountKey.json  ← Put it here
   ```

### Step 3: Verify Setup

The service account key is already added to `.gitignore` so it won't be uploaded to GitHub.

When you start the email backend server, you should see:
```
✅ Firebase Admin initialized
```

If you see this instead:
```
⚠️ Firebase Admin not initialized - delete user from Auth will not work
```

Then the service account key file is missing or in the wrong location.

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `serviceAccountKey.json` to GitHub
- Never share this file with anyone
- This file has full admin access to your Firebase project
- It's already in `.gitignore` for protection

## Testing

After setting up the service account key:

1. Restart the email backend server:
   ```bash
   cd email-backend
   node server.js
   ```

2. Go to superadmin app and try deleting a student account

3. The account should be removed from both:
   - Firestore database (students collection)
   - Firebase Authentication (Auth users)

## Troubleshooting

**Error: "Firebase Admin not initialized"**
- Make sure `serviceAccountKey.json` exists in the `email-backend` folder
- Make sure the file name is exactly `serviceAccountKey.json`
- Restart the server after adding the file

**Error: "Failed to delete from Firebase Auth"**
- Check that the service account key is valid
- Check that the UID exists in Firebase Authentication
- Check the server console for detailed error messages
