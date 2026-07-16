import React, { useState } from 'react';
import { FaBell, FaDownload, FaFilter, FaStar, FaUserCircle } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import '../styles/Feedback.css';

const Feedback = ({ department }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [replyText, setReplyText] = useState('');

  const feedbackData = [
    {
      name: 'RICKY LIAM',
      date: '03-11-2026',
      rating: 5,
      comment: 'The transaction process was fast and smooth. It saved time and improved overall user experience.',
      responseTime: 5,
      helpfulness: 5
    },
    {
      name: 'JANE DOE',
      date: '03-11-2026',
      rating: 5,
      comment: 'Fast transaction speed helped reduce waiting time. It improved user satisfaction.',
      responseTime: 5,
      helpfulness: 5
    },
    {
      name: 'Ruth Mitch',
      date: '03-11-2026',
      rating: 5,
      comment: 'The transaction was completed quickly without delays. It made the process efficient and convenient.',
      responseTime: 5,
      helpfulness: 5
    },
    {
      name: 'JAYSONN MILLER',
      date: '03-11-2026',
      rating: 5,
      comment: 'The system handled the transaction instantly. It made the experience smooth and reliable.',
      responseTime: 5,
      helpfulness: 5
    }
  ];

  const satisfactionStats = [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 12 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 }
  ];

  const toggleReplyForm = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
    setReplyText('');
  };

  const handleSendReply = (index) => {
    console.log('Sending reply to feedback', index, replyText);
    setExpandedCard(null);
    setReplyText('');
  };

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <h1 className="feedback-title">{department ? `${department.charAt(0).toUpperCase() + department.slice(1)} Feedback` : 'Finance Feedback'}</h1>
        <div className="feedback-header-actions">
          <button className="filter-date-btn-feedback">
            Filter by Date
            <FaFilter />
          </button>
          <FaBell className="notification-bell" />
        </div>
      </div>

      {expandedCard === null && (
        <>
          <div className="overall-satisfaction-card">
            <div className="satisfaction-header">
              <FaStar className="star-icon-header" />
              <h3 className="satisfaction-title">Overall Satisfaction</h3>
            </div>
            
            <div className="satisfaction-content">
              <div className="satisfaction-score">
                <h2 className="score-value">4.8</h2>
                <div className="stars-display">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="star-filled" />
                  ))}
                </div>
                <p className="average-label">Average Rating</p>
              </div>

              <div className="satisfaction-bars">
                {satisfactionStats.map((stat) => (
                  <div key={stat.stars} className="bar-row">
                    <span className="bar-star-number">{stat.stars}</span>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-satisfaction" 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                    <span className="bar-percentage">{stat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="feedback-cards-grid">
            {feedbackData.map((feedback, index) => (
              <div key={index} className="feedback-card">
                <div className="feedback-card-header">
                  <div className="user-info-feedback">
                    <FaUserCircle className="user-avatar-feedback" />
                    <div className="user-details-feedback">
                      <h4 className="user-name-feedback">{feedback.name}</h4>
                      <p className="feedback-date">{feedback.date}</p>
                    </div>
                  </div>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar 
                        key={star} 
                        className={star <= feedback.rating ? 'star-filled' : 'star-empty'} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="feedback-comment">{feedback.comment}</p>
                
                <button className="reply-button" onClick={() => toggleReplyForm(index)}>
                  <BsChatDots />
                  Write a reply
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {expandedCard !== null && (
        <div className="feedback-card-single">
          <div className="feedback-card-header">
            <div className="user-info-feedback">
              <FaUserCircle className="user-avatar-feedback" />
              <div className="user-details-feedback">
                <h4 className="user-name-feedback">{feedbackData[expandedCard].name}</h4>
                <p className="feedback-date">{feedbackData[expandedCard].date}</p>
              </div>
            </div>
          </div>
          
          <p className="feedback-comment">{feedbackData[expandedCard].comment}</p>
          
          <div className="expanded-ratings">
            <div className="rating-row">
              <span className="rating-label">Response Time</span>
              <div className="rating-stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star} 
                    className={star <= feedbackData[expandedCard].responseTime ? 'star-filled' : 'star-empty'} 
                  />
                ))}
              </div>
            </div>
            <div className="rating-row">
              <span className="rating-label">Helpfulness</span>
              <div className="rating-stars-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star} 
                    className={star <= feedbackData[expandedCard].helpfulness ? 'star-filled' : 'star-empty'} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="reply-form">
            <label className="reply-label">Write a reply</label>
            <textarea 
              className="reply-textarea-feedback"
              placeholder="Type your response here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="reply-actions">
              <button className="cancel-btn" onClick={() => toggleReplyForm(expandedCard)}>
                Cancel
              </button>
              <button className="send-message-btn-feedback" onClick={() => handleSendReply(expandedCard)}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
