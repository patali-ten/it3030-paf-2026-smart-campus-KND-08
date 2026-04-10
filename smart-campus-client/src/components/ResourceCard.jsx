// ResourceCard.jsx — Navy & Gold theme matching SilverWood University design system

export default function ResourceCard({ resource, onClick }) {
  const isActive = resource.status === 'ACTIVE';

  const typeIcons = {
    LECTURE_HALL: '🏛️',
    LAB:          '🔬',
    MEETING_ROOM: '🤝',
    EQUIPMENT:    '🎥',
  };

  const typeLabels = {
    LECTURE_HALL: 'Lecture Hall',
    LAB:          'Laboratory',
    MEETING_ROOM: 'Meeting Room',
    EQUIPMENT:    'Equipment',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Lato:wght@400;700&display=swap');
        .sw-card { font-family: 'Lato', sans-serif; }
        .sw-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(27,42,74,0.14) !important;
          border-color: #C9A84C !important;
        }
        .sw-card:hover .sw-card-icon-wrap {
          background: #C9A84C !important;
        }
        .sw-card:hover .sw-card-icon-wrap span {
          filter: grayscale(0);
        }
        .sw-card-icon-wrap {
          transition: background 0.25s;
        }
      `}</style>

      <div
        onClick={() => onClick && onClick(resource)}
        className="sw-card relative rounded-2xl p-5 cursor-pointer transition-all duration-250"
        style={{
          background: '#ffffff',
          border: '1.5px solid #e8e4d9',
          boxShadow: '0 2px 12px rgba(27,42,74,0.06)',
        }}
      >
        {/* Status dot */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full"
            style={{ background: isActive ? '#38a169' : '#e53e3e' }} />
          <span className="text-xs font-semibold"
            style={{ color: isActive ? '#276749' : '#c53030' }}>
            {isActive ? 'Active' : 'Offline'}
          </span>
        </div>

        {/* Icon */}
        <div
          className="sw-card-icon-wrap inline-flex items-center justify-center rounded-xl mb-4"
          style={{ background: '#1B2A4A', width: 48, height: 48 }}
        >
          <span style={{ fontSize: 22 }}>{typeIcons[resource.type] || '📦'}</span>
        </div>

        {/* Name */}
        <p className="font-bold text-sm mb-0.5 pr-16" style={{ color: '#1B2A4A', lineHeight: 1.3 }}>
          {resource.name}
        </p>
        <p className="text-xs mb-3" style={{ color: '#b5b0a4', letterSpacing: '0.04em' }}>
          {resource.resourceCode}
        </p>

        {/* Type badge */}
        <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3"
          style={{ background: 'rgba(27,42,74,0.07)', color: '#1B2A4A', letterSpacing: '0.03em' }}>
          {typeLabels[resource.type] || resource.type.replace('_', ' ')}
        </span>

        {/* Details */}
        <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid #f0ede6' }}>
          {resource.location && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#8a8375' }}>
              <span style={{ color: '#C9A84C' }}>📍</span> {resource.location}
            </p>
          )}
          {resource.capacity && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#8a8375' }}>
              <span style={{ color: '#C9A84C' }}>👥</span> {resource.capacity} capacity
            </p>
          )}
          {resource.availabilityStart && resource.availabilityEnd && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: '#8a8375' }}>
              <span style={{ color: '#C9A84C' }}>🕐</span>{' '}
              {resource.availabilityStart.substring(0, 5)} – {resource.availabilityEnd.substring(0, 5)}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
