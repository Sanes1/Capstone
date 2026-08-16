import { useState, useEffect, useRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import '../styles/BulletinBoard.css';

const formatPostedDate = (value) => {
  if (!value) return '';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function AnnouncementCard({ announcement }) {
  const clampRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [fullHeight, setFullHeight] = useState(null);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  // Measure on mount, resize, window load, and once the webfont finishes
  // loading: `fullHeight` drives the smooth expand animation, and
  // `canExpand` only shows the toggle when the body actually overflows the
  // clamp. Re-measuring after fonts/images load guarantees the toggle never
  // silently disappears for long announcements.
  useEffect(() => {
    const el = clampRef.current;
    if (!el || !announcement.body) {
      setCanExpand(false);
      return undefined;
    }

    let raf = null;
    const measure = () => {
      if (!el) return;
      setFullHeight(`${el.scrollHeight}px`);
      if (!expandedRef.current) {
        setCanExpand(el.scrollHeight > el.clientHeight + 1);
      }
    };
    const measureNextFrame = () => {
      raf = requestAnimationFrame(measure);
    };

    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }
    window.addEventListener('load', measureNextFrame);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('load', measureNextFrame);
      window.removeEventListener('resize', measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [announcement.body]);

  return (
    <div className="announcement-card">
      {announcement.photo && (
        <div className="announcement-image">
          <img src={announcement.photo} alt="" className="announcement-photo" />
        </div>
      )}
      <div className="announcement-details">
        <div className="announcement-office">{announcement.department}</div>
        <h4>{announcement.title}</h4>
        {announcement.body && (
          <div
            ref={clampRef}
            className={`announcement-clamp ${expanded ? 'expanded' : ''}`}
            style={{ maxHeight: expanded ? fullHeight : 'var(--clamp-height)' }}
          >
            <p>{announcement.body}</p>
          </div>
        )}
        {canExpand && (
          <button
            type="button"
            className={`announcement-toggle ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? 'See less' : 'See more'}
            <FaChevronDown className="announcement-toggle-icon" aria-hidden="true" />
          </button>
        )}
        <div className="announcement-footer">
          <span className="announcement-date">
            Posted {formatPostedDate(announcement.createdAt) || 'recently'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementCard;
