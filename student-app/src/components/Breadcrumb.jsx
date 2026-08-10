import React from 'react';

/**
 * Reusable breadcrumb navigation.
 * An item is marked as the current page when `current: true` is set, or
 * when it is the last item and has no onClick handler.
 * @param {{ items: Array<{ label: string, onClick?: () => void, current?: boolean }> }} props
 */
function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = Boolean(item.current) || (isLast && !item.onClick);
        return (
          <React.Fragment key={item.label}>
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">
                /
              </span>
            )}
            {item.onClick && !isCurrent ? (
              <button type="button" className="breadcrumb-link" onClick={item.onClick}>
                {item.label}
              </button>
            ) : isCurrent ? (
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <span className="breadcrumb-text">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
