import React, { useState, useEffect } from 'react';
import { MdNotifications, MdStar, MdStarBorder } from 'react-icons/md';
import '../styles/Feedback.css';

function Feedback({ selectedOffice: initialOffice }) {
  const [selectedOffice, setSelectedOffice] = useState(initialOffice || null);
  const [responseTime, setResponseTime] = useState(0);
  const [helpfulness, setHelpfulness] = useState(0);
  const [comments, setComments] = useState('');
  const [followUp, setFollowUp] = useState(false);

  // Update selectedOffice when prop changes
  useEffect(() => {
    setSelectedOffice(initialOffice || null);
  }, [initialOffice]);

  const offices = [
    { id: 'finance', name: 'Finance', rating: 4.8, responseTime: 90, helpfulness: 88 },
    { id: 'registrar', name: 'Registrar', rating: 4.8, responseTime: 92, helpfulness: 88 },
    { id: 'library', name: 'Library', rating: 4.0, responseTime: 78, helpfulness: 80 },
    { id: 'discipline', name: 'Discipline', rating: 4.5, responseTime: 90, helpfulness: 88 }
  ];

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
          <div className="header-actions">
            <button className="notification-btn">
              <MdNotifications />
            </button>
          </div>
        </div>

        <div className="office-grid">
          {offices.map((office) => (
            <div key={office.id} className="office-rating-card">
              <h3>{office.name}</h3>
              <div className="rating-display">
                <span className="rating-number">{office.rating}/5</span>
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
            </div>
          ))}
        </div>
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
        <div className="header-actions">
          <button className="notification-btn">
            <MdNotifications />
          </button>
        </div>
      </div>

      <div className="feedback-form">
        <div className="satisfaction-section">
          <div className="satisfaction-header">
            <h3><MdStar style={{ color: '#8CB986', marginRight: '8px' }} />Overall Satisfaction</h3>
            <div className="rating-summary">
              <div className="big-rating">{currentOffice?.rating || '4.8'}</div>
              <div className="rating-stars">
                {renderStars(currentOffice?.rating || 4.8)}
              </div>
              <div className="rating-label">Average Rating</div>
            </div>
          </div>
          
          <div className="rating-bars">
            {[
              { stars: 5, percentage: 85 },
              { stars: 4, percentage: 12 },
              { stars: 3, percentage: 3 },
              { stars: 2, percentage: 0 },
              { stars: 1, percentage: 0 }
            ].map((item) => (
              <div key={item.stars} className="rating-bar-row">
                <span className="star-label">{item.stars}</span>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${item.percentage}%` }}></div>
                </div>
                <span className="percentage">{item.percentage}%</span>
              </div>
            ))}
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
          <button className="submit-feedback-btn">Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
