import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import {
  createBooking, getMyBookings, cancelBooking,
  checkAvailability, deleteBooking, getActiveResources
} from '../../api/bookings'
import { CalendarCheck, Clock, Users, Plus, X, ChevronDown, Trash2, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  PENDING:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  APPROVED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  REJECTED:  'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

// Resource type display labels matching Member 1's ResourceType enum
const TYPE_LABELS = {
  LECTURE_HALL: '🏛️ Lecture Halls',
  LAB:          '🔬 Labs',
  MEETING_ROOM: '🤝 Meeting Rooms',
  EQUIPMENT:    '🎥 Equipment',
}

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function UserBookings() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [conflicts, setConflicts] = useState([])

  // Resources loaded dynamically from Member 1's API
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)

  const [form, setForm] = useState({
    resourceId: '',
    resourceName: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  })

  // Load resources and bookings when page opens
  useEffect(() => {
    fetchResources()
    fetchBookings()
  }, [])

  // Filter bookings when filter tab changes
  useEffect(() => {
    if (activeFilter === 'ALL') {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(b => b.status === activeFilter))
    }
  }, [activeFilter, bookings])

  // Check availability when resource or date changes
  useEffect(() => {
    if (form.resourceId && form.bookingDate) fetchAvailability()
  }, [form.resourceId, form.bookingDate])

  // Load ACTIVE resources from Member 1's API
  const fetchResources = async () => {
    setLoadingResources(true)
    try {
      const res = await getActiveResources()
      setResources(res.data)
    } catch {
      toast.error('Failed to load resources')
    } finally {
      setLoadingResources(false)
    }
  }

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await getMyBookings()
      const sorted = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setBookings(sorted)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoadingBookings(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const res = await checkAvailability(form.resourceId, form.bookingDate)
      setConflicts(res.data)
    } catch { /* silently ignore */ }
  }

  const handleResourceChange = (e) => {
    const id = parseInt(e.target.value)
    const resource = resources.find(r => r.id === id)
    setSelectedResource(resource)
    setForm(prev => ({
      ...prev,
      resourceId: id,
      resourceName: resource?.name || '',
    }))
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Check if selected time is within resource availability window
  const isTimeAvailable = () => {
    if (!selectedResource) return true
    if (!selectedResource.availabilityStart || !selectedResource.availabilityEnd) return true
    if (!form.startTime || !form.endTime) return true
    const start = form.startTime
    const end = form.endTime
    const availStart = selectedResource.availabilityStart.substring(0, 5)
    const availEnd = selectedResource.availabilityEnd.substring(0, 5)
    return start >= availStart && end <= availEnd
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time')
      return
    }

    // Warn if outside availability window
    if (!isTimeAvailable()) {
      toast.error(
        `This resource is only available from ` +
        `${selectedResource.availabilityStart?.substring(0, 5)} to ` +
        `${selectedResource.availabilityEnd?.substring(0, 5)}`
      )
      return
    }

    setSubmitting(true)
    try {
      await createBooking({
        ...form,
        resourceId: parseInt(form.resourceId),
        expectedAttendees: form.expectedAttendees
          ? parseInt(form.expectedAttendees)
          : null,
      })
      toast.success('Booking request submitted! Awaiting admin approval.')
      setShowForm(false)
      setForm({
        resourceId: '', resourceName: '', bookingDate: '',
        startTime: '', endTime: '', purpose: '', expectedAttendees: ''
      })
      setSelectedResource(null)
      setConflicts([])
      fetchBookings()
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('⚠️ ' + (err.response.data.error || 'This time slot is already booked!'))
      } else {
        toast.error(err.response?.data?.error || 'Failed to submit booking')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await cancelBooking(id)
      toast.success('Booking cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this booking? This cannot be undone.')) return
    try {
      await deleteBooking(id)
      toast.success('Booking deleted')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete booking')
    }
  }

  const countByStatus = (status) =>
    bookings.filter(b => b.status === status).length

  // Group resources by type for the dropdown
  const groupedResources = resources.reduce((groups, resource) => {
    const type = resource.type
    if (!groups[type]) groups[type] = []
    groups[type].push(resource)
    return groups
  }, {})

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Bookings</h1>
            <p className="text-slate-400 mt-1">Book and manage campus resources</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>

        {/* Booking Form */}
        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <CalendarCheck size={20} className="text-indigo-400" />
                New Booking Request
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Resource Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Select Resource *
                </label>

                {/* Loading spinner while resources load */}
                {loadingResources ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                    <Loader size={16} className="animate-spin" />
                    Loading resources...
                  </div>
                ) : resources.length === 0 ? (
                  <p className="text-slate-500 text-sm py-2">
                    No resources available. Please contact admin.
                  </p>
                ) : (
                  <div className="relative">
                    <select
                      name="resourceId"
                      value={form.resourceId}
                      onChange={handleResourceChange}
                      required
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="">-- Choose a resource --</option>
                      {Object.entries(groupedResources).map(([type, typeResources]) => (
                        <optgroup key={type} label={TYPE_LABELS[type] || type}>
                          {typeResources.map(r => (
                            <option key={r.id} value={r.id} className="bg-slate-800">
                              {r.name}
                              {r.resourceCode ? ` (${r.resourceCode})` : ''}
                              {r.capacity ? ` — Cap: ${r.capacity}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-3 text-slate-500 pointer-events-none"
                    />
                  </div>
                )}
              </div>

              {/* Resource details card - shows after selecting */}
              {selectedResource && (
                <div className="bg-slate-800/50 rounded-xl p-3 text-sm space-y-1">
                  {selectedResource.location && (
                    <p className="text-slate-400">
                      📍 Location:{' '}
                      <span className="text-slate-300">{selectedResource.location}</span>
                    </p>
                  )}
                  {selectedResource.capacity && (
                    <p className="text-slate-400">
                      👥 Capacity:{' '}
                      <span className="text-slate-300">{selectedResource.capacity} people</span>
                    </p>
                  )}
                  {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                    <p className="text-slate-400">
                      🕐 Available:{' '}
                      <span className="text-slate-300">
                        {selectedResource.availabilityStart.substring(0, 5)} –{' '}
                        {selectedResource.availabilityEnd.substring(0, 5)}
                      </span>
                    </p>
                  )}
                  {selectedResource.description && (
                    <p className="text-slate-400">
                      📝 <span className="text-slate-300">{selectedResource.description}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Booking Date *
                </label>
                <input
                  type="date" name="bookingDate" value={form.bookingDate}
                  onChange={handleChange} min={today} required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Conflict Warning */}
              {conflicts.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-amber-400 text-sm font-medium mb-2">
                    ⚠️ Already booked on this day:
                  </p>
                  {conflicts.map(c => (
                    <p key={c.id} className="text-amber-300/70 text-sm">
                      {c.startTime} – {c.endTime}
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </p>
                  ))}
                </div>
              )}

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    Start Time *
                  </label>
                  <input
                    type="time" name="startTime" value={form.startTime}
                    onChange={handleChange} required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    End Time *
                  </label>
                  <input
                    type="time" name="endTime" value={form.endTime}
                    onChange={handleChange} required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                  Purpose *
                </label>
                <input
                  type="text" name="purpose" value={form.purpose}
                  onChange={handleChange}
                  placeholder="e.g. CS3030 Lecture, Project Meeting"
                  required maxLength={255}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600"
                />
              </div>

              {/* Expected Attendees - hide for equipment */}
              {selectedResource && selectedResource.type !== 'EQUIPMENT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">
                    Expected Attendees
                    {selectedResource.capacity && ` (max: ${selectedResource.capacity})`}
                  </label>
                  <input
                    type="number" name="expectedAttendees"
                    value={form.expectedAttendees}
                    onChange={handleChange}
                    min={1}
                    max={selectedResource.capacity || undefined}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              <button
                type="submit" disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </form>
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CalendarCheck size={18} className="text-indigo-400" />
              My Booking History
            </h2>
            <span className="text-slate-500 text-sm">{filteredBookings.length} bookings</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-slate-800 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {f}
                {f !== 'ALL' && countByStatus(f) > 0 && (
                  <span className="ml-1.5 bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full text-xs">
                    {countByStatus(f)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loadingBookings ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              {activeFilter === 'ALL'
                ? 'No bookings yet. Click New Booking to get started.'
                : `No ${activeFilter.toLowerCase()} bookings.`}
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredBookings.map(booking => (
                <div
                  key={booking.id}
                  className="px-6 py-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-medium">
                          {booking.resourceName}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <CalendarCheck size={13} /> {booking.bookingDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} /> {booking.startTime} – {booking.endTime}
                        </span>
                        {booking.expectedAttendees && (
                          <span className="flex items-center gap-1">
                            <Users size={13} /> {booking.expectedAttendees} attendees
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{booking.purpose}</p>
                      {booking.adminRemarks && (
                        <p className="text-slate-600 text-xs mt-1 italic">
                          Admin: {booking.adminRemarks}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Cancel - PENDING or APPROVED */}
                      {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-xs px-3 py-1.5 rounded-lg text-amber-400 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {/* Delete - REJECTED or CANCELLED */}
                      {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && (
                        <button
                          onClick={() => handleDelete(booking.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete permanently"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
