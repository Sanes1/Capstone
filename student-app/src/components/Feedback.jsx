import { useState, useEffect } from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Feedback.css';

function Feedback({ selectedOffice: initialOffice }) {
  const [selectedOffice, setSelectedOffice] = useState(initialOffice || null);
  const [responseTime, setResponseTime] = useState(0);
  const [helpfulness, setHelpfulness] = useState(0);
  const [comments, setComments] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [offices, setOffices] = useState([]);

  // Update selectedOffice when prop changes
  useEffect(() => {
    setSelectedOffice(initialOffice || null);
  }, [initialOffice]);

  useEffect(() => {
    // TODO: Fetch office ratings from database
    // This will be implemented when connecting to Firebase
    loadOfficeRatings();
  }, []);

  const loadOfficeRatings = async () => {
    // TODO: Replace with actual Firebase query
    // const officesRef = collection(db, 'offices');
    // const snapshot = await getDocs(officesRef);
    // Calculate average ratings from feedback collection
    setOffices([
      { id: 'finance', name: 'Finance', rating: 0, responseTime: 0, helpfulness: 0 },
      { id: 'registrar', name: 'Registrar', rating: 0, responseTime: 0, helpfulness: 0 },
      { id: 'library', name: 'Library', rating: 0, responseTime: 0, helpfulness: 0 },
      { id: 'discipline', name: 'Discipline', rating: 0, responseTime: 0, helpfulness: 0 }
    ]);
  };

  const handleSubmitFeedback = async () => {
    if (!responseTime || !helpfulness) {
      alert('Please rate both Response Time and Helpfulness');
      return;
    }

    // TODO: Save feedback to database
    // const feedbackData = {
    //   officeId: selectedOffice,
    //   studentId: localStorage.getItem('studentId'),
    //   responseTime,
    //   helpfulness,
    //   comments,
    //   followUp,
    //   createdAt: serverTimestamp()
    // };
    // await addDoc(collection(db, 'feedback'), feedbackData);

    alert('Thank you for your feedback!');
    setSelectedOffice(null);
    setResponseTime(0);
    setHelpfulness(0);
    setComments('');
    setFollowUp(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<MdStar key={i} />);
      } else {
        stars.push(<MdStarBorder key={i} className="empty" />);
      }
    }
    return stars;
  };

  const renderStarRating = (value, setValue) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <MdStar
            key={star}
            className={value >= star ? 'filled' : ''}
            onClick={() => setValue(star)}
          />
        ))}
      </div>
    );
  };

  // Show office grid view by default (not the form)
  if (!selectedOffice) {
    return (
      <div className="feedback-page">
        <div className="breadcrumb-placeholder"></div>
        
        <div className="page-header">
          <h1>Share your feedback</h1>
        </div>

        {offices.length === 0 ? (
          <LoadingSpinner message="Loading office information..." fullScreen={false} />
        ) : (
          <div className="office-grid">
            {offices.map((office) => (
              <div key={office.id} className="office-rating-card" onClick={() => setSelectedOffice(office.id)}>
                <h3>{office.name}</h3>
                <div className="rating-display">
                  <span className="rating-number">{office.rating > 0 ? office.rating.toFixed(1) : 'N/A'}/5</span>
                  <div className="stars">
                    {renderStars(office.rating)}
                  </div>
                </div>
                <div className="metrics">
                  <div className="metric-row">
                    <span className="metric-label">Response Time</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${office.responseTime}%` }}></div>
                    </div>
                    <span className="metric-value">{office.responseTime}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Helpfulness</span>
                    <div className="metric-bar">
                      <div className="metric-fill" style={{ width: `${office.helpfulness}%` }}></div>
                    </div>
                    <span className="metric-value">{office.helpfulness}%</span>
                  </div>
                </div>
                <button className="rate-office-btn">Rate this office</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show feedback form when an office is selected
  const currentOffice = offices.find(o => o.id === selectedOffice);
  
  return (
    <div className="feedback-page">
      <div className="breadcrumb-placeholder"></div>
      
      <div className="page-header">
        <h1>Share your feedback</h1>
      </div>

      <div className="feedback-form">
        <div className="satisfaction-section">
          <div className="satisfaction-header">
            <h3><MdStar style={{ color: '#8CB986', marginRight: '8px' }} />Rate {currentOffice?.name || 'Office'}</h3>
          </div>
        </div>

        <div className="rating-categories">
          <div className="rating-category">
            <h4>Response Time</h4>
            {renderStarRating(responseTime, setResponseTime)}
          </div>
          <div className="rating-category">
            <h4>Helpfulness</h4>
            {renderStarRating(helpfulness, setHelpfulness)}
          </div>
        </div>

        <div className="comments-section">
          <h4>Additional Comments</h4>
          <textarea
            placeholder="Share your experience..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="follow-up-section">
          <div className="follow-up-header">
            <div>
              <h4>Follow-up Contact</h4>
              <p>May we contact you for further details about your experience?</p>
            </div>
            <div className={`toggle-switch ${followUp ? 'active' : ''}`} onClick={() => setFollowUp(!followUp)}>
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-btn" onClick={() => setSelectedOffice(null)}>Cancel</button>
          <button className="submit-feedback-btn" onClick={handleSubmitFeedback}>Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
