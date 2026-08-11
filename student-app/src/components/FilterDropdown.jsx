import { useState, useEffect, useRef } from 'react';
import { FaFilter, FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * Reusable "filter by …" dropdown — the same UI as the admin-app My Tickets
 * trigger, but with one or more option groups inside a single panel
 * (e.g. Status + Office). Each group keeps its own selection, so picking a
 * value in only one group still filters correctly.
 *
 * Props:
 * - label:    string shown on the trigger, e.g. "Filter"
 * - sections: array of {
 *               title,        // group heading shown in the panel, e.g. "Status"
 *               options,      // string[] — the FIRST option is the "all" default
 *               value,        // current selection for this group
 *               onChange      // (next) => void
 *             }
 */
const FilterDropdown = ({ label, sections }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  const isActive = sections.some(section => section.value !== section.options[0]);

  // Close on outside click/tap or Escape
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

  const handleSelect = (section, option) => {
    // Keep the panel open so the user can pick from the other group too.
    section.onChange(option);
  };

  const handleClear = () => {
    sections.forEach(section => {
      if (section.value !== section.options[0]) {
        section.onChange(section.options[0]);
      }
    });
    setIsOpen(false);
  };

  return (
    <div className="filter-dropdown" ref={wrapRef}>
      <button
        type="button"
        className={`filter-trigger ${isActive ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        <FaFilter className="filter-icon" aria-hidden="true" />
        {label}
        {isActive && <span className="filter-active-dot" aria-hidden="true" />}
        <FaChevronDown className={`filter-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="filter-dropdown-panel">
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="filter-section"
              role="listbox"
              aria-label={section.title}
            >
              <div className="filter-section-header">
                <div className="filter-section-title">{section.title}</div>
                {/* Clear lives in the first group's header, top-right corner */}
                {sectionIndex === 0 && isActive && (
                  <button
                    type="button"
                    className="filter-clear-btn"
                    onClick={handleClear}
                  >
                    <FaTimes aria-hidden="true" /> Clear
                  </button>
                )}
              </div>
              {section.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={section.value === option}
                  className={`filter-option ${section.value === option ? 'selected' : ''}`}
                  onClick={() => handleSelect(section, option)}
                >
                  <span className="filter-option-check">
                    {section.value === option && <FaCheck aria-hidden="true" />}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
