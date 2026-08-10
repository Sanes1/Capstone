import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import LoadingSpinner from './LoadingSpinner';
import NotificationBell from './NotificationBell';
import '../styles/EditRequestForm.css';

const EditRequestForm = () => {
  const [selectedOffice, setSelectedOffice] = useState('finance');
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [editingCardOffice, setEditingCardOffice] = useState(null);
  const [cardDraft, setCardDraft] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubject, setNewSubject] = useState('');

  const defaultOffices = [
    {
      id: 'finance',
      name: 'Finance',
      description: 'Manages tuition payments, student balances, billing concerns, and other school-related financial transactions.',
      subjects: ['Balance Verification', 'Payment Plan', 'Refund Request', 'Billing Inquiry']
    },
    {
      id: 'library',
      name: 'Library',
      description: 'Manages book borrowing/returning, library accounts, and student concerns related to library services and resources.',
      subjects: ['Book Request', 'Lost Book Report', 'Library Card Issue', 'Resource Access']
    },
    {
      id: 'registrar',
      name: 'Registrar',
      description: 'Handles student records such as enrollment, grades, certificates, transcripts, and other official academic documents.',
      subjects: ['Document Request', 'Grade Inquiry', 'Enrollment Issue', 'Transcript Request']
    },
    {
      id: 'guidance',
      name: 'Guidance',
      description: 'Handles student behavior concerns, violations, and disciplinary cases to maintain order and safety in school.',
      subjects: ['Counseling Request', 'Disciplinary Appeal', 'Behavior Report', 'Support Services']
    }
  ];

  useEffect(() => {
    loadFormConfig();
  }, []);

  const loadFormConfig = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'config', 'requestForm');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setOffices(docSnap.data().offices || defaultOffices);
      } else {
        // Initialize with default config
        setOffices(defaultOffices);
        await setDoc(docRef, { offices: defaultOffices });
      }
    } catch (error) {
      console.error('Error loading form config:', error);
      setOffices(defaultOffices);
    } finally {
      setLoading(false);
    }
  };

  const saveFormConfig = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'config', 'requestForm');
      await setDoc(docRef, { offices });
      alert('Form configuration saved successfully!');
    } catch (error) {
      console.error('Error saving form config:', error);
      alert('Failed to save configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOfficeDescriptionChange = (officeId, newDescription) => {
    setOffices(offices.map(office => 
      office.id === officeId 
        ? { ...office, description: newDescription }
        : office
    ));
  };

  const startCardEdit = (office) => {
    setEditingCardOffice(office.id);
    setCardDraft(office.description);
    // Keep only one description editor active at a time
    setEditingOffice(null);
  };

  const saveCardEdit = (officeId) => {
    if (!cardDraft.trim()) {
      alert('Description cannot be empty.');
      return;
    }
    handleOfficeDescriptionChange(officeId, cardDraft.trim());
    setEditingCardOffice(null);
  };

  const cancelCardEdit = () => {
    // Draft edits never touch `offices` until Save, so just exit edit mode
    setEditingCardOffice(null);
  };

  const startSectionEdit = (officeId) => {
    setEditingOffice(officeId);
    // Keep only one description editor active at a time
    setEditingCardOffice(null);
  };

  const handleAddSubject = (officeId) => {
    if (!newSubject.trim()) {
      alert('Please enter a subject');
      return;
    }
    
    setOffices(offices.map(office => 
      office.id === officeId 
        ? { ...office, subjects: [...(office.subjects || []), newSubject.trim()] }
        : office
    ));
    setNewSubject('');
  };

  const handleEditSubject = (officeId, oldSubject, newSubject) => {
    if (!newSubject.trim()) {
      alert('Subject cannot be empty');
      return;
    }
    
    setOffices(offices.map(office => 
      office.id === officeId 
        ? { 
            ...office, 
            subjects: office.subjects.map(s => s === oldSubject ? newSubject.trim() : s) 
          }
        : office
    ));
    setEditingSubject(null);
  };

  const handleDeleteSubject = (officeId, subject) => {
    if (!window.confirm(`Delete subject "${subject}"?`)) return;
    
    setOffices(offices.map(office => 
      office.id === officeId 
        ? { ...office, subjects: office.subjects.filter(s => s !== subject) }
        : office
    ));
  };

  const selectedOfficeData = offices.find(o => o.id === selectedOffice);

  if (loading) {
    return <LoadingSpinner message="Loading form configuration..." fullScreen={true} />;
  }

  return (
    <div className="superadmin-page edit-request-form-container">
      <div className="page-header">
        <div>
          <h1 className="form-title">Edit Request Form Configuration</h1>
          <p className="page-subtitle">Manage the offices, descriptions, and subjects students can request</p>
        </div>
        <div className="form-actions-header">
          <button className="btn-primary save-config-btn" onClick={saveFormConfig} disabled={saving}>
            <FaSave aria-hidden="true" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <NotificationBell />
        </div>
      </div>

      <div className="form-content">
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">Select Office to Edit</h2>
          </div>
          <div className="office-cards">
            {offices.map((office) => (
              <div
                key={office.id}
                className={`office-card ${selectedOffice === office.id ? 'selected' : ''} ${editingCardOffice === office.id ? 'editing' : ''}`}
                onClick={() => setSelectedOffice(office.id)}
              >
                <div className="radio-circle"></div>
                <div className="office-info">
                  <h3 className="office-name">{office.name}</h3>
                  {editingCardOffice === office.id ? (
                    <>
                      <textarea
                        className="office-card-textarea"
                        value={cardDraft}
                        onChange={(e) => setCardDraft(e.target.value)}
                        rows={3}
                        aria-label={`Edit ${office.name} description`}
                        autoFocus
                      />
                      <div className="office-card-actions">
                        <button
                          type="button"
                          className="icon-btn save-btn"
                          onClick={(e) => { e.stopPropagation(); saveCardEdit(office.id); }}
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          type="button"
                          className="icon-btn cancel-btn"
                          onClick={(e) => { e.stopPropagation(); cancelCardEdit(); }}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="office-description">{office.description}</p>
                      <button
                        type="button"
                        className="office-edit-btn"
                        onClick={(e) => { e.stopPropagation(); startCardEdit(office); }}
                        aria-label={`Edit ${office.name} description`}
                      >
                        <FaEdit /> Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedOfficeData && (
          <>
            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Office Description</h2>
                {editingOffice === selectedOffice ? (
                  <button 
                    className="icon-btn save-btn"
                    onClick={() => setEditingOffice(null)}
                  >
                    <FaSave /> Save
                  </button>
                ) : (
                  <button 
                    className="icon-btn edit-btn"
                    onClick={() => startSectionEdit(selectedOffice)}
                  >
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
              {editingOffice === selectedOffice ? (
                <textarea
                  className="form-textarea"
                  value={selectedOfficeData.description}
                  onChange={(e) => handleOfficeDescriptionChange(selectedOffice, e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="description-display">{selectedOfficeData.description}</p>
              )}
            </div>

            <div className="form-section">
              <div className="section-header">
                <h2 className="section-title">Subjects for {selectedOfficeData.name}</h2>
              </div>
              
              <div className="subjects-list">
                {(selectedOfficeData.subjects || []).map((subject, index) => (
                  <div key={index} className="subject-item">
                    {editingSubject === `${selectedOffice}-${index}` ? (
                      <input
                        type="text"
                        className="subject-input-edit"
                        defaultValue={subject}
                        onBlur={(e) => handleEditSubject(selectedOffice, subject, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditSubject(selectedOffice, subject, e.target.value);
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="subject-text">{subject}</span>
                        <div className="subject-actions">
                          <button 
                            className="icon-btn-small edit-btn"
                            onClick={() => setEditingSubject(`${selectedOffice}-${index}`)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="icon-btn-small delete-btn"
                            onClick={() => handleDeleteSubject(selectedOffice, subject)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="add-subject-section">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new subject..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubject(selectedOffice);
                    }
                  }}
                />
                <button 
                  className="add-subject-btn"
                  onClick={() => handleAddSubject(selectedOffice)}
                >
                  <FaPlus /> Add Subject
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {saving && <LoadingSpinner message="Saving configuration..." fullScreen={true} />}
    </div>
  );
};

export default EditRequestForm;
