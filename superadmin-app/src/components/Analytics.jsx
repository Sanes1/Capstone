import React from 'react';
import { FaBell, FaDownload, FaFilter, FaChevronDown, FaInbox, FaClock, FaBan, FaUsers } from 'react-icons/fa';
import '../styles/Analytics.css';

const Analytics = () => {
  const ticketData = [
    { month: 'JUNE', secondSem: 450, firstSem: 0 },
    { month: 'JULY', secondSem: 400, firstSem: 0 },
    { month: 'AUG', secondSem: 250, firstSem: 300 },
    { month: 'SEP', secondSem: 300, firstSem: 400 },
    { month: 'OCT', secondSem: 450, firstSem: 0 },
    { month: 'NOV', secondSem: 350, firstSem: 0 }
  ];

  const departmentData = [
    { department: 'Guidance Office', tickets: 89, resolution: '3days 2hrs', satisfaction: '89%' },
    { department: 'Library', tickets: 65, resolution: '2hrs', satisfaction: '92%' },
    { department: 'Registrar Office', tickets: 112, resolution: '1day 4hrs', satisfaction: '90%' },
    { department: 'Finance Office', tickets: 234, resolution: '5hrs', satisfaction: '91%' }
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
        <div className="analytics-actions">
          <button className="export-button">
            <FaDownload className="export-icon" />
            Export CSV
          </button>
          <button className="filter-by-button">
            Filter by
            <FaFilter className="filter-icon" />
          </button>
          <div className="form-notification">
            <FaBell className="notification-icon" />
          </div>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaInbox className="stat-icon" />
            </div>
            <span className="stat-label">TOTAL</span>
          </div>
          <div className="stat-value">500</div>
          <div className="stat-subtext">All Request</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaClock className="stat-icon" />
            </div>
            <span className="stat-label">ACTIVITY</span>
          </div>
          <div className="stat-value">2days 2hrs</div>
          <div className="stat-subtext">Avg. Resolution</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaBan className="stat-icon" />
            </div>
            <span className="stat-label">RATE</span>
          </div>
          <div className="stat-value">5%</div>
          <div className="stat-subtext">Cancelled Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-container">
              <FaUsers className="stat-icon" />
            </div>
            <span className="stat-label">TOTAL</span>
          </div>
          <div className="stat-value">5,900</div>
          <div className="stat-subtext">Active Users</div>
        </div>
      </div>

      <div className="analytics-content">
        <div className="chart-card">
          <div className="chart-card-header">
            <h2 className="chart-card-title">Ticket Volume Trends</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot second-sem"></span>
                <span>2ND SEM</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot first-sem"></span>
                <span>1ST SEM</span>
              </div>
            </div>
          </div>
          
          <div className="bar-chart">
            {ticketData.map((data, index) => (
              <div key={index} className="bar-group">
                <div className="bars-container">
                  <div 
                    className="bar second-sem" 
                    style={{ height: `${(data.secondSem / 500) * 100}%` }}
                  ></div>
                  {data.firstSem > 0 && (
                    <div 
                      className="bar first-sem" 
                      style={{ height: `${(data.firstSem / 500) * 100}%` }}
                    ></div>
                  )}
                </div>
                <div className="month-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="satisfaction-card">
          <div className="satisfaction-header">
            <h2 className="satisfaction-title">Student Satisfaction</h2>
            <div className="satisfaction-filter">
              <span>Filter by</span>
              <FaChevronDown />
            </div>
          </div>
          
          <div className="satisfaction-content">
            <div className="satisfaction-percentage">93%</div>
            <div className="satisfaction-label">5 Stars</div>
            
            <div className="stars-breakdown">
              <div className="star-row">
                <div className="star-info">
                  <span className="star-dot"></span>
                  <span className="star-label">5 Stars</span>
                </div>
                <span className="star-count">403</span>
              </div>
              <div className="star-row">
                <div className="star-info">
                  <span className="star-dot"></span>
                  <span className="star-label">4 Stars</span>
                </div>
                <span className="star-count">97</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="efficiency-table">
        <div className="efficiency-header">
          <h2 className="efficiency-title">Department Efficiency</h2>
          <span className="view-report">View detailed report</span>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>DEPARTMENT</th>
                <th>TICKETS</th>
                <th>RESOLUTION</th>
                <th>SATISFACTION</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.department}</td>
                  <td>{dept.tickets}</td>
                  <td>{dept.resolution}</td>
                  <td>{dept.satisfaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
