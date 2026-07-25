# Student Profile Settings - Database Structure

## Overview
The student profile settings feature allows students to view and update their personal information, manage account security, and upload a profile picture.

## Firestore Database Structure

### Collection: `students`

Each student document should contain the following fields:

```javascript
{
  // Authentication
  uid: "firebase-auth-uid",
  email: "student@example.com",
  
  // Personal Information
  studentId: "05-2324-000000",
  firstName: "Ricky",
  lastName: "Liam",
  middleName: "Santos",
  middleInitial: "S",
  suffix: "Jr", // Optional: Jr, Sr, III, etc.
  
  // Academic Information
  gradeLevel: "Grade 11",
  section: "STEM-A",
  
  // Contact Information
  phoneNumber: "09912345678",
  
  // Profile
  profilePicture: "https://storage.firebase.com/...", // URL from Firebase Storage
  
  // Account Security
  twoFactorEnabled: false,
  lastPasswordUpdate: "2024-01-15T10:30:00.000Z", // ISO timestamp
  
  // Status
  isActive: true,
  
  // Timestamps
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

## Field Descriptions

### Required Fields

| Field | Type | Description | Editable |
|-------|------|-------------|----------|
| `uid` | string | Firebase Authentication UID | No |
| `email` | string | Student email address | No |
| `studentId` | string | Unique student ID (format: XX-XXXX-XXXXXX) | No |
| `firstName` | string | Student's first name | Yes |
| `lastName` | string | Student's last name | Yes |
| `gradeLevel` | string | Current grade level | No |
| `section` | string | Current section | No |
| `phoneNumber` | string | Contact phone number | Yes |

### Optional Fields

| Field | Type | Description | Editable |
|-------|------|-------------|----------|
| `middleName` | string | Student's middle name | Yes |
| `middleInitial` | string | Auto-generated from middleName | Auto |
| `suffix` | string | Name suffix (Jr, Sr, III, etc.) | Yes |
| `profilePicture` | string | URL to profile picture in Firebase Storage | Yes |
| `twoFactorEnabled` | boolean | 2FA status | Yes |
| `lastPasswordUpdate` | string | ISO timestamp of last password change | Auto |

## Firebase Storage Structure

Profile pictures are stored in Firebase Storage:

```
/profile-pictures/
  ├── {uid}/
  │   └── profile.jpg
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-pictures/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024; // Max 5MB
    }
  }
}
```

## Features

### 1. Profile Information
- **View and edit**: First name, last name, middle name, suffix
- **View only**: Email, student ID, grade level, section
- **Upload**: Profile picture (max 5MB)
- **Auto-generate**: Middle initial from middle name

### 2. Account Security
- **Change Password**: 
  - Requires current password
  - New password minimum 6 characters
  - Updates `lastPasswordUpdate` timestamp
- **Two-Factor Authentication**: Toggle to enable/disable 2FA via SMS

### 3. Profile Picture
- Upload via file input
- Stored in Firebase Storage
- Maximum size: 5MB
- Supported formats: JPG, PNG, GIF
- Displayed as initials if no picture uploaded

## Implementation Details

### Components

1. **ProfileSettings.jsx**: Main profile settings component
2. **Header.jsx**: Updated to include profile button
3. **ProfileSettings.css**: Styling for profile settings

### Functions

#### loadProfileData()
Loads student data from Firestore and localStorage

#### handleUpdateProfile()
- Uploads profile picture to Firebase Storage (if changed)
- Updates Firestore document
- Updates localStorage
- Reloads page to reflect changes

#### handleChangePassword()
- Re-authenticates user with current password
- Updates password in Firebase Auth
- Updates `lastPasswordUpdate` in Firestore

### Security

1. **Authentication**: Only logged-in students can access their profile
2. **Authorization**: Students can only edit their own profile
3. **Password Protection**: Phone number and email are masked by default
4. **Re-authentication**: Required for password changes

## Usage

### For Administrators

When creating a new student account, include these fields in the Firestore document:

```javascript
await setDoc(doc(db, 'students', uid), {
  uid: uid,
  email: email,
  studentId: studentId,
  firstName: firstName,
  lastName: lastName,
  middleName: middleName || '',
  middleInitial: middleName ? middleName.charAt(0).toUpperCase() : '',
  suffix: suffix || '',
  gradeLevel: gradeLevel,
  section: section,
  phoneNumber: phoneNumber,
  profilePicture: '',
  twoFactorEnabled: false,
  lastPasswordUpdate: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

### For Students

1. Click on their name/avatar in the top right corner
2. Update personal information
3. Upload profile picture
4. Change password if needed
5. Enable/disable 2FA
6. Click "Update Profile" to save changes

## Future Enhancements

- Email verification before changing email
- SMS-based 2FA implementation
- Password strength meter
- Profile picture cropping tool
- Activity log (login history)
- Security questions for password recovery

## Notes

- Profile pictures are stored permanently until manually deleted
- Password changes log out the user from other devices
- Middle initial is auto-generated but can be manually edited
- Read-only fields (email, student ID, grade, section) can only be changed by administrators
