# Firebase Indexes and Storage Setup

## Issue 1: Firestore Composite Index

The app needs a composite index to query requests by studentId and sort by createdAt.

### How to Fix:

**Option A: Click the Auto-Generated Link (Easiest)**

1. Click this link from the error message:
   https://console.firebase.google.com/v1/r/project/academia-de-san-jose/firestore/indexes?create_composite=ClVwcm9qZWN0cy9hY2FkZW1pYS1kZS1zYW4tam9zZS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvcmVxdWVzdHMvaW5kZXhlcy9fEAEaDQoJc3R1ZGVudElkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg

2. Click "Create Index"
3. Wait 2-5 minutes for index to build
4. Refresh the student app

**Option B: Create Manually**

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **academia-de-san-jose**
3. Click **Firestore Database** from sidebar
4. Click **Indexes** tab
5. Click **Create Index**
6. Configure:
   - Collection ID: `requests`
   - Fields to index:
     - Field: `studentId`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
   - Query scope: `Collection`
7. Click **Create Index**
8. Wait for index to build (status will change from "Building" to "Enabled")

---

## Issue 2: Firebase Storage CORS Configuration

Firebase Storage is blocking file uploads from localhost due to CORS policy.

### How to Fix:

**Step 1: Install Google Cloud SDK**

If you don't have it installed:
- Download from: https://cloud.google.com/sdk/docs/install
- Or use Cloud Shell in Firebase Console

**Step 2: Create CORS Configuration File**

Create a file named `cors.json` with this content:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

**Step 3: Apply CORS Configuration**

Run this command in terminal (replace with your bucket name):

```bash
gsutil cors set cors.json gs://academia-de-san-jose.firebasestorage.app
```

**Alternative: Use Firebase Console**

1. Go to Firebase Console
2. Click **Storage** from sidebar
3. Click **Rules** tab
4. Update the rules to:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

---

## Temporary Workaround: Disable orderBy

If you need the app working immediately while indexes build, you can temporarily remove sorting:

### In Dashboard.jsx, change line 37-40:
```javascript
// OLD (requires index)
const q = query(
  requestsRef,
  where('studentId', '==', studentId),
  orderBy('createdAt', 'desc')
);

// NEW (no index needed)
const q = query(
  requestsRef,
  where('studentId', '==', studentId)
);
```

### In MyRequest.jsx, change similar lines

Then manually sort in JavaScript:
```javascript
const allRequests = querySnapshot.docs.map(doc => { ... })
  .sort((a, b) => b.createdAt - a.createdAt); // Sort in code
```

---

## Checking Index Status

1. Go to: https://console.firebase.google.com/project/academia-de-san-jose/firestore/indexes
2. Check if status is "Enabled" (green)
3. If "Building" (yellow), wait a few more minutes

---

## Testing After Fix

1. Refresh the student app
2. Dashboard should load without errors
3. My Request page should show your requests
4. File uploads should work without CORS errors
