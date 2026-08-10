import React from 'react';

/**
 * Maps request statuses to their Figma-design badge styles.
 */
const STATUS_CLASS_MAP = {
  pending: 'status-pending',
  'in process': 'status-in-process',
  'in progress': 'status-in-process',
  resolved: 'status-resolved',
  cancelled: 'status-cancelled',
  returned: 'status-returned',
  'for follow up': 'status-for-follow-up'
};

/**
 * Reusable request-status badge.
 * @param {{ status?: string }} props
 */
function StatusBadge({ status }) {
  const key = String(status || 'Pending').toLowerCase();
  const className = STATUS_CLASS_MAP[key] || 'status-pending';
  return <span className={`status ${className}`}>{status || 'Pending'}</span>;
}

export default StatusBadge;
