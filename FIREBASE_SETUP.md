# Firebase Setup Guide

## Firebase Configuration

Firebase has been configured for all three apps:
- Student App
- Admin App
- Super Admin App

## Available Services

The following Firebase services are initialized and ready to use:

1. **Firestore Database** (`db`) - For storing and retrieving data
2. **Authentication** (`auth`) - For user login/signup
3. **Storage** (`storage`) - For file uploads (images, PDFs, etc.)
4. **Analytics** (`analytics`) - For tracking user behavior

## How to Use in Your Components

### Import Firebase Services

```javascript
import { db, auth, storage } from './firebase';
```

### Firestore Database Examples

#### Add a Document
```javascript
import { collection, addDoc } from 'firebase/firestore';

const addTicket = async (ticketData) => {
  try {
    const docRef = await addDoc(collection(db, "tickets"), {
      title: ticketData.title,
      description: ticketData.description,
      status: "pending",
      createdAt: new Date()
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
```

#### Get Documents
```javascript
import { collection, getDocs } from 'firebase/firestore';

const getTickets = async () => {
  const querySnapshot = await getDocs(collection(db, "tickets"));
  const tickets = [];
  querySnapshot.forEach((doc) => {
    tickets.push({ id: doc.id, ...doc.data() });
  });
  return tickets;
};
```

#### Update a Document
```javascript
import { doc, updateDoc } from 'firebase/firestore';

const updateTicketStatus = async (ticketId, newStatus) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    status: newStatus,
    updatedAt: new Date()
  });
};
```

#### Delete a Document
```javascript
import { doc, deleteDoc } from 'firebase/firestore';

const deleteTicket = async (ticketId) => {
  await deleteDoc(doc(db, "tickets", ticketId));
};
```

### Authentication Examples

#### Sign Up
```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth';

const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", userCredential.user);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

#### Sign In
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in:", userCredential.user);
  } catch (error) {
    console.error("Error:", error.message);
  }
};
```

#### Sign Out
```javascript
import { signOut } from 'firebase/auth';

const logout = async () => {
  await signOut(auth);
};
```

### Storage Examples

#### Upload a File
```javascript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const uploadFile = async (file) => {
  const storageRef = ref(storage, `uploads/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};
```

## Suggested Database Structure

### Collections

#### `users`
```javascript
{
  uid: "user-id",
  email: "user@example.com",
  role: "student" | "admin" | "superadmin",
  department: "Finance" | "Library" | "Guidance" | "Registrar",
  name: "John Doe",
  studentId: "05-2324-12345",
  createdAt: timestamp
}
```

#### `tickets`
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  studentName: "John Doe",
  studentId: "05-2324-12345",
  office: "Finance" | "Library" | "Guidance" | "Registrar",
  category: "Payment" | "Document Request" | etc.,
  title: "Tuition Payment Inquiry",
  description: "I need help with...",
  status: "pending" | "in-progress" | "resolved" | "rejected",
  priority: "normal" | "urgent",
  assignedTo: "admin-user-id",
  attachments: ["url1", "url2"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `feedback`
```javascript
{
  id: "auto-generated",
  ticketId: "ticket-id",
  userId: "user-id",
  userName: "John Doe",
  rating: 5,
  responseTime: 5,
  helpfulness: 5,
  comment: "Great service!",
  reply: "Thank you for your feedback",
  createdAt: timestamp
}
```

#### `announcements`
```javascript
{
  id: "auto-generated",
  title: "Extended Hours",
  department: "Finance",
  description: "Finance office will extend hours...",
  imageUrl: "image-url",
  createdBy: "admin-user-id",
  createdAt: timestamp
}
```

#### `deadlines`
```javascript
{
  id: "auto-generated",
  title: "Clearance Deadline",
  office: "Library",
  date: timestamp,
  createdAt: timestamp
}
```

## Security Rules (To be set in Firebase Console)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can create tickets and read their own
    match /tickets/{ticketId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin']);
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
    
    // Announcements readable by all authenticated users
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }
  }
}
```

## Next Steps

1. Set up Firebase Authentication in Firebase Console
2. Enable Email/Password authentication method
3. Create Firestore database (start in test mode, then add security rules)
4. Enable Storage in Firebase Console
5. Deploy security rules for production

## Important Notes

⚠️ **Security**: Never commit Firebase config with real API keys to public repositories. Consider using environment variables for production.

⚠️ **API Key**: The API key in the config is safe to be public as it's just an identifier. Security comes from Firestore security rules.

⚠️ **Testing**: Start with Firestore in test mode during development, then add proper security rules before production.
