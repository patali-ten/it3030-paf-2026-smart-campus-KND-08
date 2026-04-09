export default function ResourceCard({ resource, onClick }) {
  const statusColor = resource.status === 'ACTIVE'
    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
    : 'bg-red-500/20 text-red-400 border border-red-500/30';

  const typeIcons = {
    LECTURE_HALL: '🏛️',
    LAB: '🔬',
    MEETING_ROOM: '🤝',
    EQUIPMENT: '🎥',
  };

  return (
    <div
      onClick={() => onClick && onClick(resource)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-500 
                 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeIcons[resource.type] || '📦'}</span>
          <div>
            <h3 className="text-white font-semibold text-sm">{resource.name}</h3>
            <p className="text-slate-400 text-xs">{resource.resourceCode}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
          {resource.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
        </span>
      </div>

      <div className="space-y-1 mt-3">
        {resource.location && (
          <p className="text-slate-400 text-xs flex items-center gap-1">
            📍 {resource.location}
          </p>
        )}
        {resource.capacity && (
          <p className="text-slate-400 text-xs flex items-center gap-1">
            👥 Capacity: {resource.capacity}
          </p>
        )}
        {resource.availabilityStart && resource.availabilityEnd && (
          <p className="text-slate-400 text-xs flex items-center gap-1">
            🕐 {resource.availabilityStart} - {resource.availabilityEnd}
          </p>
        )}
      </div>

      <div className="mt-3">
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
          {resource.type.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}