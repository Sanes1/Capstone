import { useState, useEffect } from 'react';
import { MdStar, MdStarHalf, MdStarBorder } from 'react-icons/md';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import '../styles/Feedback.css';

// Placeholder office data mirrors the Figma design until Firebase is wired up.
// breakdown: % of ratings that are 5★, 4★, 3★, 2★, 1★ (sums to 100).
// Seeded synchronously so direct routes (feedback-finance, etc.) render
// immediately without a flash of "—" while ratings load.
const DEFAULT_OFFICES = [
  { id: 'finance', name: 'Finance', rating: 4.8, responseTime: 90, helpfulness: 88, breakdown: [86, 11, 2, 1, 0] },
  { id: 'registrar', name: 'Registrar', rating: 4.8, responseTime: 90, helpfulness: 88, breakdown: [84, 13, 2, 1, 0] },
  { id: 'library', name: 'Library', rating: 4.0, responseTime: 78, helpfulness: 80, breakdown: [72, 17, 7, 3, 1] },
  { id: 'discipline', name: 'Discipline', rating: 4.5, responseTime: 90, helpfulness: 88, breakdown: [83, 12, 4, 1, 0] }
];

function Feedback({ selectedOffice: initialOffice, onNavigate }) {
  const [selectedOffice, setSelectedOffice] = useState(initialOffice || null);
  const [responseTime, setResponseTime] = useState(0);
  const [helpfulness, setHelpfulness] = useState(0);
  const [comments, setComments] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [offices, setOffices] = useState(DEFAULT_OFFICES);

  // Frontend-only gating: Submit Feedback stays disabled until both required
  // star ratings are given (Additional Comments and Follow-up are optional).
  const isFormValid = responseTime > 0 && helpfulness > 0;

  // Update selectedOffice when prop changes
  useEffect(() => {
    setSelectedOffice(initialOffice || null);
  }, [initialOffice]);

  // React reuses this component across feedback-* routes, so reset the form
  // whenever the office changes (otherwise ratings/comments would leak over).
  useEffect(() => {
    setResponseTime(0);
    setHelpfulness(0);
    setComments('');
    setFollowUp(false);
  }, [initialOffice]);

  // Navigate to the dedicated feedback page for an office. Falls back to
  // in-page selection when no router callback is provided.
  const navigateToOffice = (officeId) => {
    if (onNavigate) {
      onNavigate(`feedback-${officeId}`);
    } else {
      setSelectedOffice(officeId);
    }
  };

  // Return to the feedback overview page.
  const goBackToOverview = () => {
    if (onNavigate) {
      onNavigate('feedback');
    } else {
      setSelectedOffice(null);
    }
  };

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
    setOffices(DEFAULT_OFFICES);
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
    setResponseTime(0);
    setHelpfulness(0);
    setComments('');
    setFollowUp(false);
    goBackToOverview();
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const value = rating - i;
      if (value >= 0.75) {
        stars.push(<MdStar key={i} />);
      } else if (value >= 0.25) {
        stars.push(<MdStarHalf key={i} />);
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
        <Breadcrumb items={[{ label: 'Feedback', current: true }]} />
        
        <div className="page-header">
          <h1>Share your feedback</h1>
        </div>

        {offices.length === 0 ? (
          <LoadingSpinner message="Loading office information..." fullScreen={false} />
        ) : (
          <div className="office-grid">
            {offices.map((office) => (
              <div
                key={office.id}
                className="office-rating-card"
                role="button"
                tabIndex={0}
                onClick={() => navigateToOffice(office.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigateToOffice(office.id);
                  }
                }}
                aria-label={`Rate the ${office.name} office`}
              >
                <h3>{office.name}</h3>
                <div className="rating-display">
                  <span className="rating-number">
                    {office.rating > 0 ? office.rating.toFixed(1) : 'N/A'}
                    <span className="rating-total">/5</span>
                  </span>
                  <div className="stars" aria-hidden="true">
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
        )}
      </div>
    );
  }

  // Dedicated feedback page for the selected office
  const currentOffice = offices.find(o => o.id === selectedOffice);
  const officeName = currentOffice?.name || 'Office';
  const breakdown = currentOffice?.breakdown || [85, 12, 3, 0, 0];
  
  return (
    <div className="feedback-page">
      <Breadcrumb
        items={[
          { label: 'Feedback', onClick: goBackToOverview },
          { label: officeName, current: true }
        ]}
      />
      
      <div className="page-header">
        <h1>{officeName} Feedback</h1>
      </div>

      {/* Overall Satisfaction card — mirrors the Figma department layout */}
      <div className="satisfaction-card">
        <div className="satisfaction-summary">
          <MdStar className="satisfaction-star" aria-hidden="true" />
          <div className="summary-copy">
            <h3>Overall Satisfaction</h3>
            <div className="summary-rating">
              <span className="big-rating">{currentOffice ? currentOffice.rating.toFixed(1) : '—'}</span>
              <div className="summary-stars" aria-hidden="true">
                {currentOffice ? renderStars(currentOffice.rating) : null}
              </div>
            </div>
            <p className="summary-label">Average Rating</p>
          </div>
        </div>

        <div className="rating-bars" aria-label="Rating distribution">
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div className="rating-bar-row" key={star}>
              <span className="star-label">{star}</span>
              <MdStar className="bar-star" aria-hidden="true" />
              <div className="bar">
                <div className="bar-fill" style={{ width: `${breakdown[i]}%` }}></div>
              </div>
              <span className="percentage">{breakdown[i]}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="feedback-form">
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
            {/* Scoped class names (follow-up-*) so this switch never collides
                with the settings 2FA toggle (both defined global .toggle-switch) */}
            <div
              className={`follow-up-switch ${followUp ? 'active' : ''}`}
              role="switch"
              aria-checked={followUp}
              aria-label="Allow follow-up contact"
              tabIndex={0}
              onClick={() => setFollowUp(!followUp)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFollowUp(!followUp);
                }
              }}
            >
              <div className="follow-up-slider"></div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="cancel-btn-feedback" onClick={goBackToOverview}>
            Cancel
          </button>
          <button
            className="submit-feedback-btn"
            onClick={handleSubmitFeedback}
            disabled={!isFormValid}
            title={!isFormValid ? 'Rate Response Time and Helpfulness to submit' : undefined}
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
