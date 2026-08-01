import React, { useState, useEffect } from 'react';
import { FaBell, FaDownload, FaFilter, FaBalanceScale, FaClock, FaChartBar, FaUserCircle } from 'react-icons/fa';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Notifications from './Notifications';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Analytics.css';

const Analytics = ({ department }) => {
  const [filterDate, setFilterDate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Analytics state
  const [totalTickets, setTotalTickets] = useState(0);
  const [avgResolutionTime, setAvgResolutionTime] = useState('0h 0mins');
  const [cancelledRate, setCancelledRate] = useState('0%');
  const [staffActivity, setStaffActivity] = useState([]);
  const [submissionData, setSubmissionData] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
    
    // Listen for unread notifications
    const staffData = JSON.parse(localStorage.getItem('staffData'));
    if (staffData?.uid) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', staffData.uid),
        where('recipientType', '==', 'staff')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const unread = querySnapshot.docs.filter(doc => !doc.data().isRead).length;
        setUnreadCount(unread);
      });

      return () => unsubscribe();
    }
  }, [department]);
  
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all tickets for this department
      const ticketsQuery = query(
        collection(db, 'requests'),
        where('office', '==', department)
      );
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const ticketsData = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);
      
      // Fetch all staff members in this department
      const staffQuery = query(
        collection(db, 'staff'),
        where('office', '==', department)
      );
      const staffSnapshot = await getDocs(staffQuery);
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStaffMembers(staffData);
      
      // Calculate analytics
      calculateAnalytics(ticketsData, staffData);
      
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateAnalytics = (ticketsData, staffData) => {
    // 1. Total Tickets
    setTotalTickets(ticketsData.length);
    
    // 2. Average Resolution Time
    const resolvedTickets = ticketsData.filter(t => t.status === 'Resolved' && t.resolvedAt && t.createdAt);
    if (resolvedTickets.length > 0) {
      const totalTimeMs = resolvedTickets.reduce((sum, ticket) => {
        const created = ticket.createdAt.toDate ? ticket.createdAt.toDate() : new Date(ticket.createdAt);
        const resolved = ticket.resolvedAt.toDate ? ticket.resolvedAt.toDate() : new Date(ticket.resolvedAt);
        return sum + (resolved - created);
      }, 0);
      const avgTimeMs = totalTimeMs / resolvedTickets.length;
      const hours = Math.floor(avgTimeMs / (1000 * 60 * 60));
      const mins = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));
      setAvgResolutionTime(`${hours}h ${mins}mins`);
    } else {
      setAvgResolutionTime('N/A');
    }
    
    // 3. Cancelled Rate
    const cancelledTickets = ticketsData.filter(t => t.status === 'Cancelled').length;
    const cancelRate = ticketsData.length > 0 ? Math.round((cancelledTickets / ticketsData.length) * 100) : 0;
    setCancelledRate(`${cancelRate}%`);
    
    // 4. Staff Activity (count resolved tickets per staff)
    const staffActivityData = staffData.map(staff => {
      const resolvedByStaff = ticketsData.filter(t => 
        (t.assignedTo === staff.name || t.claimedBy === staff.name) && t.status === 'Resolved'
      ).length;
      const totalByStaff = ticketsData.filter(t => 
        t.assignedTo === staff.name || t.claimedBy === staff.name
      ).length;
      const percentage = totalByStaff > 0 ? Math.round((resolvedByStaff / totalByStaff) * 100) : 0;
      
      return {
        name: staff.name,
        resolved: resolvedByStaff,
        percentage: percentage
      };
    }).sort((a, b) => b.resolved - a.resolved); // Sort by most resolved
    setStaffActivity(staffActivityData);
    
    // 5. Submission Times by Month
    const monthCounts = {
      'JAN': 0, 'FEB': 0, 'MAR': 0, 'APR': 0, 'MAY': 0, 'JUN': 0,
      'JUL': 0, 'AUG': 0, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0
    };
    
    ticketsData.forEach(ticket => {
      const date = ticket.createdAt?.toDate ? ticket.createdAt.toDate() : new Date(ticket.createdAt);
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = monthNames[date.getMonth()];
      monthCounts[month]++;
    });
    
    const submissionChartData = Object.keys(monthCounts).map(month => ({
      month,
      value: monthCounts[month]
    }));
    setSubmissionData(submissionChartData);
    
    // 6. Subject Distribution (Pie Chart)
    const subjectCounts = {};
    ticketsData.forEach(ticket => {
      const subject = ticket.subject || 'Other';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    const total = ticketsData.length;
    const subjectData = Object.keys(subjectCounts).map(subject => ({
      subject,
      count: subjectCounts[subject],
      percentage: total > 0 ? Math.round((subjectCounts[subject] / total) * 100) : 0
    })).sort((a, b) => b.count - a.count); // Sort by most frequent
    
    setSubjectDistribution(subjectData);
  };

  const maxValue = submissionData.length > 0 ? Math.max(...submissionData.map(d => d.value)) : 1;
  
  // Helper to generate pie chart path
  const generatePiePath = (startAngle, endAngle, radius = 150) => {
    const cx = 200;
    const cy = 200;
    
    // Special case: if it's 100% (full circle), draw a circle instead of a path
    if (Math.abs(endAngle - startAngle) >= 359.9) {
      return `M ${cx},${cy - radius} A ${radius},${radius} 0 1,1 ${cx},${cy + radius} A ${radius},${radius} 0 1,1 ${cx},${cy - radius} Z`;
    }
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };
  
  // Generate pie chart segments based on subject distribution
  const pieColors = ['#5DADE2', '#66bb6a', '#5B7CE6', '#FFB74D', '#EF5350', '#AB47BC', '#26C6DA', '#FFA726'];
  let currentAngle = -90; // Start from top
  const pieSegments = subjectDistribution.slice(0, 8).map((item, index) => { // Limit to top 8
    const sweepAngle = (item.percentage / 100) * 360;
    const path = generatePiePath(currentAngle, currentAngle + sweepAngle);
    const labelAngle = currentAngle + sweepAngle / 2;
    const labelRad = (labelAngle * Math.PI) / 180;
    const labelX = 200 + 110 * Math.cos(labelRad);
    const labelY = 200 + 110 * Math.sin(labelRad);
    
    const segment = {
      path,
      color: pieColors[index % pieColors.length],
      percentage: item.percentage,
      subject: item.subject,
      labelX,
      labelY
    };
    
    currentAngle += sweepAngle;
    return segment;
  });

  if (loading) {
    return <LoadingSpinner message="Loading analytics..." fullScreen={true} />;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Department Analytics</h1>
        <div className="analytics-header-actions">
          <button className="export-pdf-btn">
            <FaDownload />
            Export PDF
          </button>
          <button className="filter-date-btn">
            <FaFilter />
            by Date
          </button>
          <div className="notification-bell" onClick={() => setShowNotifications(true)}>
            <FaBell className="bell-icon" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
        </div>
      </div>

      <div className="analytics-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-container">
            <FaBalanceScale className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">OVERALL</p>
            <p className="stat-sublabel">Total Tickets</p>
            <h2 className="stat-value">{totalTickets}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FaClock className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">ACTIVITY</p>
            <p className="stat-sublabel">Avg Resolution Time</p>
            <h2 className="stat-value">{avgResolutionTime}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-container">
            <FaChartBar className="stat-icon" />
          </div>
          <div className="stat-content">
            <p className="stat-label">RATE</p>
            <p className="stat-sublabel">Cancelled Rate</p>
            <h2 className="stat-value">{cancelledRate}</h2>
          </div>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-card submission-chart">
          <h3 className="chart-title">Submission Times</h3>
          <div className="bar-chart">
            <div className="bar-chart-y-axis">
              <span>300</span>
              <span>250</span>
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            <div className="bar-chart-content">
              {submissionData.map((data, index) => (
                <div key={index} className="bar-container">
                  <div 
                    className="bar" 
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                    title={`${data.month}: ${data.value} ticket${data.value !== 1 ? 's' : ''}`}
                  >
                    <span className="bar-tooltip">{data.value}</span>
                  </div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card staff-activity-card">
          <h3 className="chart-title">Staff Activity</h3>
          <div className="staff-list">
            {staffActivity.map((staff, index) => (
              <div key={index} className="staff-item">
                <div className="staff-info">
                  <FaUserCircle className="staff-avatar" />
                  <div className="staff-details">
                    <span className="staff-name">{staff.name}</span>
                    <span className="staff-resolved">{staff.resolved} Resolved</span>
                  </div>
                </div>
                <div className="staff-progress">
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${staff.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="frequent-request-section">
        <div className="frequent-header">
          <h3 className="chart-title">Frequent Ticket Request</h3>
          <div className="filter-icon-container">
            <span className="filter-label">Filter:</span>
            <FaFilter className="filter-icon-small" />
          </div>
        </div>
        
        <div className="pie-chart-container">
          <div className="pie-chart-wrapper">
            <svg viewBox="0 0 400 400" className="pie-chart">
              {pieSegments.map((segment, index) => (
                <g key={index}>
                  <path
                    d={segment.path}
                    fill={segment.color}
                  />
                  {segment.percentage >= 5 && (
                    <text 
                      x={segment.labelX} 
                      y={segment.labelY} 
                      fill={segment.color} 
                      fontSize={segment.percentage > 15 ? "20" : "16"} 
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {segment.percentage}%
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className="pie-legend">
            {subjectDistribution.slice(0, 8).map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: pieColors[index % pieColors.length] }}></div>
                <span className="legend-label">{item.subject} ({item.count})</span>
              </div>
            ))}
            {subjectDistribution.length === 0 && (
              <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No data available</p>
            )}
          </div>
        </div>
      </div>
      
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
};

export default Analytics;
