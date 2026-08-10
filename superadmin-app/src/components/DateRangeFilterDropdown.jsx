import React, { useState, useEffect, useRef } from 'react';
import { FaFilter, FaCalendarAlt, FaTimes } from 'react-icons/fa';

/**
 * Shared compact "Filter by" dropdown used on the Dashboard and Analytics pages.
 * Renders a single trigger button; clicking opens a small panel with From/To
 * date pickers plus Apply / Clear.
 *
 * Props:
 * - filter: current { from, to } draft values
 * - onFilterChange: (next) => void   — called as the user edits the dates
 * - isActive: boolean                — whether a filter is currently applied
 * - onApply: () => boolean | void    — called when Apply is clicked; return
 *                                    false to keep the panel open (e.g. when
 *                                    validation fails)
 * - onClear: () => void              — called when Clear is clicked
 * - idPrefix: string                 — unique prefix for the date input ids
 */
const DateRangeFilterDropdown = ({
  filter,
  onFilterChange,
  isActive,
  onApply,
  onClear,
  idPrefix
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

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
    <div className="filter-dropdown" ref={wrapRef}>
      <button
        type="button"
        className={`filter-trigger ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FaFilter className="filter-icon" aria-hidden="true" />
        Filter by
        {isActive && <span className="filter-active-dot" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div className="filter-dropdown-panel">
          <div className="filter-dropdown-title">Filter by date range</div>
          <div className="date-filter">
            <div className="date-filter-field">
              <label htmlFor={`${idPrefix}-from-date`}>From</label>
              <input
                id={`${idPrefix}-from-date`}
                type="date"
                value={filter.from}
                max={filter.to || undefined}
                onChange={(e) => onFilterChange({ ...filter, from: e.target.value })}
              />
            </div>
            <div className="date-filter-field">
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
          <div className="filter-dropdown-actions">
            <button type="button" className="filter-apply-btn" onClick={handleApply}>
              <FaCalendarAlt aria-hidden="true" /> Apply
            </button>
            {isActive && (
              <button
                type="button"
                className="filter-clear-btn"
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
