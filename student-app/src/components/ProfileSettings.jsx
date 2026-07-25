import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../firebase';
import { FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/ProfileSettings.css';

function ProfileSettings({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    middleInitial: '',
    suffix: '',
    gradeLevel: '',
    section: '',
    schoolId: '',
    email: '',
    phoneNumber: '',
    profilePicture: '',
    twoFactorEnabled: false,
    lastPasswordUpdate: null
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const studentData = JSON.parse(localStorage.getItem('studentData'));
      if (!studentData) {
        alert('Please log in again');
        return;
      }

      console.log('📋 Loading profile for student:', studentData);

      // Try to get the document using the Firestore document ID if available
      let docSnap = null;
      
      if (studentData.firestoreDocId) {
        // Use the stored document ID
        const docRef = doc(db, 'students', studentData.firestoreDocId);
        docSnap = await getDoc(docRef);
        console.log('✅ Found using firestoreDocId:', studentData.firestoreDocId);
      }
      
      // If not found or no firestoreDocId, try using uid as document ID
      if (!docSnap || !docSnap.exists()) {
        if (studentData.uid) {
          const docRef = doc(db, 'students', studentData.uid);
          docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            console.log('✅ Found using uid as document ID:', studentData.uid);
          }
        }
      }
      
      // If still not found, we need to query by uid field
      if (!docSnap || !docSnap.exists()) {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const studentsRef = collection(db, 'students');
        
        // Try querying by uid field
        if (studentData.uid) {
          const q = query(studentsRef, where('uid', '==', studentData.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
            // Save the Firestore document ID for future use
            studentData.firestoreDocId = docSnap.id;
            localStorage.setItem('studentData', JSON.stringify(studentData));
            console.log('✅ Found by querying uid field, docId:', docSnap.id);
          }
        }
        
        // Try querying by id field (4 digits)
        if ((!docSnap || !docSnap.exists()) && studentData.id) {
          const q = query(studentsRef, where('id', '==', studentData.id));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            docSnap = querySnapshot.docs[0];
            studentData.firestoreDocId = docSnap.id;
            localStorage.setItem('studentData', JSON.stringify(studentData));
            console.log('✅ Found by querying id field, docId:', docSnap.id);
          }
        }
      }

      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        console.log('📄 Student document data:', data);
        
        setProfileData({
          lastName: data.lastName || '',
          firstName: data.firstName || '',
          middleName: data.middleName || '',
          middleInitial: data.middleInitial || (data.middleName ? data.middleName.charAt(0).toUpperCase() : ''),
          suffix: data.suffix || '',
          gradeLevel: data.gradeLevel || '',
          section: data.section || '',
          schoolId: data.studentId || data.id || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          profilePicture: data.profilePicture || '',
          twoFactorEnabled: data.twoFactorEnabled || false,
          lastPasswordUpdate: data.lastPasswordUpdate || null
        });
        setProfilePicturePreview(data.profilePicture || '');
      } else {
        console.error('❌ Student document not found');
        alert('Profile data not found. Please contact support.');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate middle initial
    if (name === 'middleName' && value) {
      setProfileData(prev => ({
        ...prev,
        middleInitial: value.charAt(0).toUpperCase()
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleToggle2FA = () => {
    setProfileData(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const studentData = JSON.parse(localStorage.getItem('studentData'));
      
      if (!studentData.firestoreDocId) {
        alert('Session error. Please log in again.');
        setSaving(false);
        return;
      }
      
      let profilePictureURL = profileData.profilePicture;

      // Upload profile picture if changed
      if (profilePicture) {
        const storageRef = ref(storage, `profile-pictures/${studentData.uid || studentData.firestoreDocId}`);
        await uploadBytes(storageRef, profilePicture);
        profilePictureURL = await getDownloadURL(storageRef);
      }

      // Update Firestore using the correct document ID
      const docRef = doc(db, 'students', studentData.firestoreDocId);
      await updateDoc(docRef, {
        lastName: profileData.lastName,
        firstName: profileData.firstName,
        middleName: profileData.middleName,
        middleInitial: profileData.middleInitial,
        suffix: profileData.suffix,
        gradeLevel: profileData.gradeLevel,
        section: profileData.section,
        phoneNumber: profileData.phoneNumber,
        profilePicture: profilePictureURL,
        twoFactorEnabled: profileData.twoFactorEnabled,
        updatedAt: new Date().toISOString()
      });

      // Update localStorage
      const updatedStudentData = {
        ...studentData,
        ...profileData,
        profilePicture: profilePictureURL
      };
      localStorage.setItem('studentData', JSON.stringify(updatedStudentData));

      alert('Profile updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordForm.newPassword);

      // Update last password change date in Firestore
      const studentData = JSON.parse(localStorage.getItem('studentData'));
      const docRef = doc(db, 'students', studentData.firestoreDocId);
      await updateDoc(docRef, {
        lastPasswordUpdate: new Date().toISOString()
      });

      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      loadProfileData();
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Current password is incorrect');
      } else {
        alert('Failed to change password: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const getPasswordUpdateMessage = () => {
    if (!profileData.lastPasswordUpdate) {
      return 'Never updated. We recommend updating regularly.';
    }
    const lastUpdate = new Date(profileData.lastPasswordUpdate);
    const monthsAgo = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24 * 30));
    return `Last updated ${monthsAgo} months ago. We recommend updating regularly.`;
  };

  if (loading) {
    return (
      <div className="profile-settings-overlay">
        <div className="profile-settings-modal">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-settings-overlay" onClick={onClose}>
      <div className="profile-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-settings-content">
          {/* Profile Information Section */}
          <div className="settings-section">
            <h3>Profile Information</h3>
            
            <div className="profile-info-grid">
              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile" className="profile-picture" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <span>{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</span>
                    </div>
                  )}
                  <label className="upload-btn">
                    <FaCamera />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="profile-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label>LAST NAME <span className="required">*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>GRADE LEVEL <span className="required">*</span></label>
                    <input
                      type="text"
                      name="gradeLevel"
                      value={profileData.gradeLevel}
                      onChange={handleInputChange}
                      readOnly
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>EMAIL ADDRESS <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <input
                        type="email"
                        value={profileData.email}
                        readOnly
                        className="readonly-field masked-field"
                      />
                      <FaEyeSlash className="eye-icon" />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>FIRST NAME <span className="required">*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>SECTION <span className="required">*</span></label>
                    <input
                      type="text"
                      name="section"
                      value={profileData.section}
                      onChange={handleInputChange}
                      readOnly
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group">
                    <label>PHONE NUMBER <span className="required">*</span></label>
                    <div className="input-with-icon">
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        className="masked-field"
                      />
                      <FaEyeSlash className="eye-icon" />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>MIDDLE NAME</label>
                    <input
                      type="text"
                      name="middleName"
                      value={profileData.middleName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>SCHOOL ID <span className="required">*</span></label>
                    <input
                      type="text"
                      value={profileData.schoolId}
                      readOnly
                      className="readonly-field"
                    />
                  </div>
                </div>

                <div className="form-row small-fields">
                  <div className="form-group small">
                    <label>M.I</label>
                    <input
                      type="text"
                      name="middleInitial"
                      value={profileData.middleInitial}
                      readOnly
                      maxLength="1"
                      className="readonly-field"
                    />
                  </div>

                  <div className="form-group small">
                    <label>SUFFIX</label>
                    <input
                      type="text"
                      name="suffix"
                      value={profileData.suffix}
                      onChange={handleInputChange}
                      placeholder="Jr, Sr, III"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Section */}
          <div className="settings-section">
            <h3>Account Security</h3>
            
            <div className="security-item">
              <div className="security-info">
                <h4>Password</h4>
                <p>{getPasswordUpdateMessage()}</p>
              </div>
              <button className="change-password-btn" onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            </div>

            <div className="security-item">
              <div className="security-info">
                <h4>Two-Factor Authentication (2FA)</h4>
                <p>Secure your account by adding an additional security layer via SMS</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={profileData.twoFactorEnabled}
                  onChange={handleToggle2FA}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button className="logout-btn-settings" onClick={onClose}>
              Log Out
            </button>
            <button 
              className="update-btn" 
              onClick={handleUpdateProfile}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="password-modal-overlay" onClick={() => setShowPasswordModal(false)}>
            <div className="password-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Change Password</h3>
              
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="password-modal-actions">
                <button className="cancel-btn" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button 
                  className="confirm-btn" 
                  onClick={handleChangePassword}
                  disabled={saving}
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSettings;
