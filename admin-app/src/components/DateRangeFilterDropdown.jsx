import React, { useState, useEffect, useRef } from 'react';
import { FaFilter, FaCalendarAlt, FaTimes, FaChevronDown } from 'react-icons/fa';
import '../styles/DateRangeFilter.css';

/**
 * Compact "Filter by date range" dropdown (from → to) used on the Analytics
 * page. Renders a single trigger button; clicking opens a small panel with
 * From/To date pickers plus Apply / Clear.
 *
 * Props:
 * - filter: { from, to } current draft values (YYYY-MM-DD)
 * - onFilterChange: (next) => void — called as the user edits the dates
 * - isActive: boolean — whether a filter is currently applied
 * - onApply: () => boolean | void — called when Apply is clicked; return
 *                                    false to keep the panel open (validation)
 * - onClear: () => void — called when Clear is clicked
 * - idPrefix: string — unique prefix for the date input ids
 * - appliedFilter: { from, to } — the currently APPLIED filter values; Apply
 *                                 stays disabled when the draft equals this
 *                                 (no change) or both dates are empty
 */
const DateRangeFilterDropdown = ({
  filter,
  onFilterChange,
  isActive,
  onApply,
  onClear,
  idPrefix,
  appliedFilter = { from: '', to: '' }
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  // Apply stays grayed out until the draft has at least one date AND differs
  // from what's currently applied — matching the app's disabled-button pattern.
  const hasInput = Boolean(filter.from || filter.to);
  const hasChanges =
    (filter.from || '') !== (appliedFilter.from || '') ||
    (filter.to || '') !== (appliedFilter.to || '');
  const canApply = hasInput && hasChanges;
  const applyTooltip = !hasInput
    ? 'Pick a date range to enable Apply'
    : 'Change the date range to enable Apply';

  // Close when clicking/tapping outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleApply = () => {
    // The button is disabled without valid changes, but keep this guard as a
    // safety net so Apply can never run against an empty or unchanged draft.
    if (!canApply) return;
    // Keep the panel open if the caller reports validation failure
    if (onApply() !== false) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onClear();
    setIsOpen(false);
  };

  return (
    <div className="daterange-filter-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`daterange-trigger ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FaFilter className="daterange-icon" aria-hidden="true" />
        By Date
        {isActive && <span className="daterange-active-dot" aria-hidden="true" />}
        <FaChevronDown className={`daterange-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="daterange-panel">
          <div className="daterange-title">Filter by date range</div>
          <div className="daterange-fields">
            <div className="daterange-field">
              <label htmlFor={`${idPrefix}-from-date`}>From</label>
              <input
                id={`${idPrefix}-from-date`}
                type="date"
                value={filter.from}
                max={filter.to || undefined}
                onChange={(e) => onFilterChange({ ...filter, from: e.target.value })}
              />
            </div>
            <div className="daterange-field">
              <label htmlFor={`${idPrefix}-to-date`}>To</label>
              <input
                id={`${idPrefix}-to-date`}
                type="date"
                value={filter.to}
                min={filter.from || undefined}
                onChange={(e) => onFilterChange({ ...filter, to: e.target.value })}
              />
            </div>
          </div>
          <div className="daterange-actions">
            <button
              type="button"
              className="daterange-apply-btn"
              onClick={handleApply}
              disabled={!canApply}
              title={!canApply ? applyTooltip : undefined}
            >
              <FaCalendarAlt aria-hidden="true" /> Apply
            </button>
            {isActive && (
              <button
                type="button"
                className="daterange-clear-btn"
                onClick={handleClear}
                aria-label="Clear date filter"
              >
                <FaTimes aria-hidden="true" /> Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilterDropdown;
