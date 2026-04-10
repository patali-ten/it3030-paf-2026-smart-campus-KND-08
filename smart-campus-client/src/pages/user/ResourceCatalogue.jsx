import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllResources } from '../../api/resources';
import ResourceCard from '../../components/ResourceCard';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import { Search, X, ChevronLeft, SlidersHorizontal } from 'lucide-react';

// ── Hero: empty lecture theatre (image 4 — Uni_lecture_theatre.jpg) ───────────
// Replace with actual import: import theatreImg from '../../assets/lecture_theatre.jpg'
const THEATRE_IMG = '/src/assets/lecture_theatre.jpg'

const TYPE_META = {
  LECTURE_HALL: { icon: '🏛️', label: 'Lecture Halls' },
  LAB:          { icon: '🔬', label: 'Laboratories' },
  MEETING_ROOM: { icon: '🤝', label: 'Meeting Rooms' },
  EQUIPMENT:    { icon: '🎥', label: 'Equipment' },
}

export default function ResourceCatalogue() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (locationFilter) filters.location = locationFilter;
      if (capacityFilter) filters.minCapacity = capacityFilter;
      const res = await getAllResources(filters);
      setResources(res.data);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleSearch = () => fetchResources();

  const handleClear = () => {
    setTypeFilter(''); setStatusFilter(''); setLocationFilter(''); setCapacityFilter('');
    setTimeout(() => fetchResources(), 100);
  };

  // Group resources by type for display
  const grouped = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const activeFiltersCount = [typeFilter, statusFilter, locationFilter, capacityFilter].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .sw-cat * { font-family: 'Lato', sans-serif; }
        .sw-serif { font-family: 'Playfair Display', serif; }
        .sw-input-light { background: #fff; color: #1B2A4A; border: 1.5px solid #ddd8cc; border-radius: 10px; padding: 9px 14px; font-size: 13px; width: 100%; outline: none; transition: border 0.2s; font-family: 'Lato', sans-serif; }
        .sw-input-light:focus { border-color: #C9A84C; }
        .sw-input-light option { background: #fff; color: #1B2A4A; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(27,42,74,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
        .type-section-title { font-family: 'Playfair Display', serif; }
      `}</style>

      <div className="sw-cat min-h-screen" style={{ background: '#F5F4EF' }}>
        <Navbar />

        {/* ── Cinematic Hero ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 300, marginTop: 64 }}>
          <img
            src={THEATRE_IMG}
            alt="Lecture Theatre"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 40%', filter: 'brightness(0.4)' }}
            onError={e => e.target.style.display = 'none'}
          />
          {/* Fallback */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1B2A4A, #2c4a7a)', zIndex: -1 }} />
          {/* Overlay text positioned left with gold diagonal line */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(27,42,74,0.92) 40%, rgba(27,42,74,0.2) 100%)'
          }} />
          <div className="absolute inset-0 flex flex-col justify-center max-w-6xl mx-auto px-10">
            <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#C9A84C' }}>
              SILVERWOOD UNIVERSITY
            </p>
            <p className="sw-serif text-4xl font-bold text-white mb-3">
              Facilities &<br />Resources
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 380 }}>
              Browse all available campus spaces and equipment. Filter by type, location, or capacity.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mt-5 text-xs font-semibold transition"
              style={{ color: 'rgba(255,255,255,0.45)', width: 'fit-content' }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          </div>
          {/* Stats bar at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-10 py-3 flex gap-8"
            style={{ background: 'rgba(27,42,74,0.85)', backdropFilter: 'blur(8px)' }}>
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const count = resources.filter(r => r.type === type).length;
              return (
                <div key={type} className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <div>
                    <p className="text-white text-sm font-bold">{count}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{meta.label}</p>
                  </div>
                </div>
              )
            })}
            <div className="ml-auto flex items-center">
              <p className="text-sm font-bold" style={{ color: '#C9A84C' }}>{resources.length} Total</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* ── Filter Panel ─────────────────────────────────────────────── */}
          <div className="rounded-2xl mb-8 overflow-hidden"
            style={{ background: '#fff', border: '1px solid #e8e4d9', boxShadow: '0 2px 12px rgba(27,42,74,0.06)' }}>
            {/* Filter Header */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer"
              onClick={() => setShowFilters(!showFilters)}
              style={{ borderBottom: showFilters ? '1px solid #f0ede6' : 'none' }}
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center rounded-lg"
                  style={{ background: '#1B2A4A', width: 34, height: 34 }}>
                  <Search size={15} style={{ color: '#C9A84C' }} />
                </div>
                <p className="sw-serif font-semibold" style={{ color: '#1B2A4A' }}>Search & Filter</p>
                {activeFiltersCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#C9A84C', color: '#1B2A4A' }}>
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} style={{ color: '#8a8375' }} />
                <span className="text-xs font-semibold" style={{ color: '#8a8375' }}>
                  {showFilters ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            {showFilters && (
              <div className="px-6 pb-6 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>TYPE</label>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="sw-input-light">
                      <option value="">All Types</option>
                      <option value="LECTURE_HALL">🏛️ Lecture Hall</option>
                      <option value="LAB">🔬 Lab</option>
                      <option value="MEETING_ROOM">🤝 Meeting Room</option>
                      <option value="EQUIPMENT">🎥 Equipment</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>STATUS</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="sw-input-light">
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="OUT_OF_SERVICE">Out of Service</option>
                    </select>
                  </div>
                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>LOCATION</label>
                    <input type="text" placeholder="Search by location..." value={locationFilter}
                      onChange={e => setLocationFilter(e.target.value)} className="sw-input-light" />
                  </div>
                  {/* Capacity */}
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>MIN CAPACITY</label>
                    <input type="number" placeholder="e.g. 50" value={capacityFilter}
                      onChange={e => setCapacityFilter(e.target.value)} className="sw-input-light" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSearch}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition"
                    style={{ background: '#1B2A4A', color: '#C9A84C', boxShadow: '0 4px 12px rgba(27,42,74,0.2)' }}>
                    <Search size={14} /> Search
                  </button>
                  {activeFiltersCount > 0 && (
                    <button onClick={handleClear}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                      style={{ border: '1.5px solid #ddd8cc', color: '#8a8375', background: '#fff' }}>
                      <X size={14} /> Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Resource Grid ─────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent"
                style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#8a8375' }}>
              <p className="text-4xl mb-4">🔍</p>
              <p className="sw-serif text-xl font-semibold mb-2" style={{ color: '#1B2A4A' }}>No resources found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : typeFilter ? (
            // When filtered by type, flat grid
            <>
              <p className="text-sm mb-5" style={{ color: '#8a8375' }}>
                Showing <strong style={{ color: '#1B2A4A' }}>{resources.length}</strong> resource{resources.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} onClick={setSelectedResource} />
                ))}
              </div>
            </>
          ) : (
            // Grouped by type sections
            <div className="space-y-10">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="inline-flex items-center justify-center rounded-xl"
                      style={{ background: '#1B2A4A', width: 44, height: 44, fontSize: 22 }}>
                      {TYPE_META[type]?.icon || '📦'}
                    </div>
                    <div>
                      <p className="type-section-title text-xl font-semibold" style={{ color: '#1B2A4A' }}>
                        {TYPE_META[type]?.label || type.replace('_', ' ')}
                      </p>
                      <p className="text-xs" style={{ color: '#8a8375' }}>{items.length} available</p>
                    </div>
                    <div style={{ flex: 1, height: 1, background: '#e8e4d9', marginLeft: 8 }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {items.map(resource => (
                      <ResourceCard key={resource.id} resource={resource} onClick={setSelectedResource} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Resource Detail Modal ──────────────────────────────────────────── */}
      {selectedResource && (
        <div className="modal-overlay" onClick={() => setSelectedResource(null)}>
          <div
            className="rounded-2xl overflow-hidden w-full max-w-md"
            style={{ background: '#fff', boxShadow: '0 24px 80px rgba(27,42,74,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between"
              style={{ background: '#1B2A4A' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 26 }}>{TYPE_META[selectedResource.type]?.icon || '📦'}</span>
                <div>
                  <p className="sw-serif font-bold text-white text-lg">{selectedResource.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedResource.resourceCode}</p>
                </div>
              </div>
              <button onClick={() => setSelectedResource(null)}
                className="rounded-full p-1.5" style={{ background: 'rgba(255,255,255,0.1)', color: '#C9A84C' }}>
                <X size={18} />
              </button>
            </div>

            {/* Status Bar */}
            <div className="px-6 py-3 flex items-center gap-3"
              style={{ background: selectedResource.status === 'ACTIVE' ? '#f0faf5' : '#fff5f5', borderBottom: '1px solid #f0ede6' }}>
              <div className="w-2 h-2 rounded-full"
                style={{ background: selectedResource.status === 'ACTIVE' ? '#38a169' : '#e53e3e' }} />
              <p className="text-sm font-semibold"
                style={{ color: selectedResource.status === 'ACTIVE' ? '#276749' : '#c53030' }}>
                {selectedResource.status === 'ACTIVE' ? 'Available' : 'Out of Service'}
              </p>
            </div>

            {/* Details */}
            <div className="px-6 py-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a8375' }}>TYPE</p>
                  <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    {TYPE_META[selectedResource.type]?.label || selectedResource.type.replace('_', ' ')}
                  </p>
                </div>
                {selectedResource.capacity && (
                  <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}>
                    <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a8375' }}>CAPACITY</p>
                    <p className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{selectedResource.capacity} people</p>
                  </div>
                )}
              </div>

              {selectedResource.location && (
                <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a8375' }}>LOCATION</p>
                  <p className="text-sm" style={{ color: '#1B2A4A' }}>📍 {selectedResource.location}</p>
                </div>
              )}

              {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a8375' }}>AVAILABLE HOURS</p>
                  <p className="text-sm" style={{ color: '#1B2A4A' }}>
                    🕐 {selectedResource.availabilityStart} – {selectedResource.availabilityEnd}
                  </p>
                </div>
              )}

              {selectedResource.description && (
                <div className="rounded-xl p-3" style={{ background: '#f8f7f4' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a8375' }}>DESCRIPTION</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5347' }}>{selectedResource.description}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button onClick={() => setSelectedResource(null)}
                className="w-full py-3 rounded-xl text-sm font-bold transition"
                style={{ background: '#1B2A4A', color: '#C9A84C' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
