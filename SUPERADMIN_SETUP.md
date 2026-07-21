# Superadmin Account Setup

## Credentials
- **Username**: `superadmin`
- **Password**: `spadmin`
- **Email**: `superadmin@asj.edu` (or any email you prefer)

## Setup Instructions

### Option 1: Using Firebase Console (Recommended)

1. **Create Authentication Account:**
   - Go to: https://console.firebase.google.com/project/academia-de-san-jose/authentication/users
   - Click "Add user"
   - Email: `superadmin@asj.edu`
   - Password: `spadmin`
   - Click "Add user"
   - Copy the UID from the created user

2. **Add to Firestore:**
   - Go to: https://console.firebase.google.com/project/academia-de-san-jose/firestore/data
   - Create a new collection called `superadmin`
   - Add a document with the following fields:
     ```
     username: "superadmin"
     email: "superadmin@asj.edu"
     uid: "[PASTE THE UID FROM STEP 1]"
     role: "superadmin"
     isActive: true
     createdAt: [Click "Add field" → Type: timestamp → Use server timestamp]
     ```

### Option 2: Using Code (Run Once)

Create a file `create-superadmin.js` in the root directory:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function createSuperadmin() {
  try {
    // Create authentication user
    const userRecord = await auth.createUser({
      email: 'superadmin@asj.edu',
      password: 'spadmin',
      displayName: 'Super Admin'
    });

    console.log('✅ Created auth user:', userRecord.uid);

    // Add to Firestore
    await db.collection('superadmin').add({
      username: 'superadmin',
      email: 'superadmin@asj.edu',
      uid: userRecord.uid,
      role: 'superadmin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Superadmin account created successfully!');
    console.log('Username: superadmin');
    console.log('Password: spadmin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSuperadmin();
```

Then run:
```bash
node create-superadmin.js
```

## Login

After setup, you can login at:
- URL: http://localhost:3000
- Username: `superadmin`
- Password: `spadmin`

## Security Notes

⚠️ **IMPORTANT**: Change the password after first login in production!

The superadmin account has full access to:
- User Management (Students & Staff)
- Analytics
- Request Form Editing
- All system settings
