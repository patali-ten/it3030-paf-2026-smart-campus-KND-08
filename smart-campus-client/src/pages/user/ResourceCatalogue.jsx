import { useState, useEffect } from 'react'
import { getAllResources } from '../../api/resources'
import ResourceCard from '../../components/ResourceCard'
import Navbar from '../../components/Navbar'
import toast from 'react-hot-toast'
import { Search, X, SlidersHorizontal } from 'lucide-react'

const THEATRE_IMG = '/src/assets/lecture_theatre.jpg'

const TYPE_META = {
  LECTURE_HALL: { icon: '🏛️', label: 'Lecture Halls' },
  LAB:          { icon: '🔬', label: 'Laboratories'  },
  MEETING_ROOM: { icon: '🤝', label: 'Meeting Rooms'  },
  EQUIPMENT:    { icon: '🎥', label: 'Equipment'      },
}

export default function ResourceCatalogue() {
  const [resources, setResources]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)
  const [showFilters, setShowFilters]         = useState(true)

  const [typeFilter, setTypeFilter]           = useState('')
  const [statusFilter, setStatusFilter]       = useState('')
  const [locationFilter, setLocationFilter]   = useState('')
  const [capacityFilter, setCapacityFilter]   = useState('')

  const fetchResources = async () => {
    try {
      setLoading(true)
      const filters = {}
      if (typeFilter)    filters.type        = typeFilter
      if (statusFilter)  filters.status      = statusFilter
      if (locationFilter) filters.location   = locationFilter
      if (capacityFilter) filters.minCapacity = capacityFilter
      const res = await getAllResources(filters)
      setResources(res.data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchResources() }, [])

  const handleSearch = () => fetchResources()

  const handleClear = () => {
    setTypeFilter(''); setStatusFilter(''); setLocationFilter(''); setCapacityFilter('')
    setTimeout(() => fetchResources(), 100)
  }

  const grouped = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const activeFiltersCount = [typeFilter, statusFilter, locationFilter, capacityFilter].filter(Boolean).length

  const inputStyle = {
    backgroundColor: '#ffffff',
    color: '#1e3a5f',
    border: '1.5px solid #dde3ea',
    borderRadius: 10,
    padding: '9px 14px',
    fontSize: 13,
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ height: 320, marginTop: 64 }}>
        <img
          src={THEATRE_IMG}
          alt="Lecture Theatre"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%', filter: 'brightness(0.4)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e4a7a)', zIndex: -1 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30,58,95,0.92) 40%, rgba(30,58,95,0.2) 100%)' }} />
        
        <div className="absolute inset-0 flex flex-col justify-center max-w-6xl mx-auto px-10 pb-20">
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#c9a227' }}>
            SILVERWOOD UNIVERSITY
          </p>
          <p className="text-4xl font-bold text-white mb-3">
            Facilities &amp;<br />Resources
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, maxWidth: 380 }}>
            Browse all available campus spaces and equipment. Filter by type, location, or capacity.
          </p>
        </div>

        {/* Stats bar - FONT SIZE INCREASED HERE */}
        <div
          className="absolute bottom-0 left-0 right-0 px-10 py-4 flex gap-10 flex-wrap"
          style={{ backgroundColor: 'rgba(30,58,95,0.88)', backdropFilter: 'blur(8px)' }}
        >
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = resources.filter(r => r.type === type).length
            return (
              <div key={type} className="flex items-center gap-3">
                <span style={{ fontSize: 24 }}>{meta.icon}</span>
                <div>
                  {/* Changed text-sm to text-xl and font-bold */}
                  <p className="text-white text-xl font-black leading-none">{count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>{meta.label}</p>
                </div>
              </div>
            )
          })}
          <div className="ml-auto flex items-center">
            <p className="text-lg font-bold" style={{ color: '#c9a227' }}>{resources.length} Total</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-2xl mb-8 overflow-hidden shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}>
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
            onClick={() => setShowFilters(!showFilters)}
            style={{ borderBottom: showFilters ? '1px solid #f0f2f5' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center rounded-xl" style={{ backgroundColor: '#1e3a5f', width: 34, height: 34 }}>
                <Search size={15} style={{ color: '#c9a227' }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: '#1e3a5f' }}>Search &amp; Filter</p>
              {activeFiltersCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#c9a227', color: '#1e3a5f' }}>
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} style={{ color: '#8a9bb0' }} />
              <span className="text-xs font-semibold" style={{ color: '#8a9bb0' }}>
                {showFilters ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>

          {showFilters && (
            <div className="px-6 pb-6 pt-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>TYPE</label>
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={inputStyle}>
                    <option value="">All Types</option>
                    <option value="LECTURE_HALL">🏛️ Lecture Hall</option>
                    <option value="LAB">🔬 Lab</option>
                    <option value="MEETING_ROOM">🤝 Meeting Room</option>
                    <option value="EQUIPMENT">🎥 Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>STATUS</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="OUT_OF_SERVICE">Out of Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>LOCATION</label>
                  <input type="text" placeholder="Search by location..." value={locationFilter} onChange={e => setLocationFilter(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>MIN CAPACITY</label>
                  <input type="number" placeholder="e.g. 50" value={capacityFilter} onChange={e => setCapacityFilter(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSearch} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90" style={{ backgroundColor: '#1e3a5f', color: '#c9a227', boxShadow: '0 4px 12px rgba(30,58,95,0.2)' }}>
                  <Search size={14} /> Search
                </button>
                {activeFiltersCount > 0 && (
                  <button onClick={handleClear} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-gray-50" style={{ border: '1.5px solid #dde3ea', color: '#5a6a7a', backgroundColor: '#fff' }}>
                    <X size={14} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent" style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }} />
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#5a6a7a' }}>
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-xl font-semibold mb-2" style={{ color: '#1e3a5f' }}>No resources found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : typeFilter ? (
          <>
            <p className="text-sm mb-5" style={{ color: '#5a6a7a' }}>
              Showing <strong style={{ color: '#1e3a5f' }}>{resources.length}</strong> resource{resources.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} onClick={setSelectedResource} />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="inline-flex items-center justify-center rounded-xl" style={{ backgroundColor: '#1e3a5f', width: 44, height: 44, fontSize: 22 }}>
                    {TYPE_META[type]?.icon || '📦'}
                  </div>
                  <div>
                    <p className="text-xl font-semibold" style={{ color: '#1e3a5f' }}>
                      {TYPE_META[type]?.label || type.replace('_', ' ')}
                    </p>
                    <p className="text-xs" style={{ color: '#5a6a7a' }}>{items.length} available</p>
                  </div>
                  <div style={{ flex: 1, height: 1, backgroundColor: '#dde3ea', marginLeft: 8 }} />
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

      {selectedResource && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(30,58,95,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelectedResource(null)}>
          <div className="rounded-2xl overflow-hidden w-full max-w-md" style={{ backgroundColor: '#ffffff', boxShadow: '0 24px 80px rgba(30,58,95,0.25)' }} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center justify-between" style={{ backgroundColor: '#1e3a5f' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 26 }}>{TYPE_META[selectedResource.type]?.icon || '📦'}</span>
                <div>
                  <p className="font-bold text-white text-lg">{selectedResource.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{selectedResource.resourceCode}</p>
                </div>
              </div>
              <button onClick={() => setSelectedResource(null)} className="rounded-full p-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#c9a227' }}>
                <X size={18} />
              </button>
            </div>
            {/* Modal Body */}
            <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: selectedResource.status === 'ACTIVE' ? '#f0fdf4' : '#fff5f5', borderBottom: '1px solid #f0f2f5' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedResource.status === 'ACTIVE' ? '#16a34a' : '#dc2626' }} />
              <p className="text-sm font-semibold" style={{ color: selectedResource.status === 'ACTIVE' ? '#15803d' : '#dc2626' }}>
                {selectedResource.status === 'ACTIVE' ? 'Available' : 'Out of Service'}
              </p>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f8f9fb' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a9bb0' }}>TYPE</p>
                  <p className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>{TYPE_META[selectedResource.type]?.label || selectedResource.type.replace('_', ' ')}</p>
                </div>
                {selectedResource.capacity && (
                  <div className="rounded-xl p-3" style={{ backgroundColor: '#f8f9fb' }}>
                    <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a9bb0' }}>CAPACITY</p>
                    <p className="text-sm font-semibold" style={{ color: '#1e3a5f' }}>{selectedResource.capacity} people</p>
                  </div>
                )}
              </div>
              {selectedResource.location && (
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f8f9fb' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a9bb0' }}>LOCATION</p>
                  <p className="text-sm" style={{ color: '#1e3a5f' }}>📍 {selectedResource.location}</p>
                </div>
              )}
              {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f8f9fb' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a9bb0' }}>AVAILABLE HOURS</p>
                  <p className="text-sm" style={{ color: '#1e3a5f' }}>🕐 {selectedResource.availabilityStart} – {selectedResource.availabilityEnd}</p>
                </div>
              )}
              {selectedResource.description && (
                <div className="rounded-xl p-3" style={{ backgroundColor: '#f8f9fb' }}>
                  <p className="text-xs font-bold mb-1 tracking-wider" style={{ color: '#8a9bb0' }}>DESCRIPTION</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{selectedResource.description}</p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedResource(null)} className="w-full py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90" style={{ backgroundColor: '#1e3a5f', color: '#c9a227' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}