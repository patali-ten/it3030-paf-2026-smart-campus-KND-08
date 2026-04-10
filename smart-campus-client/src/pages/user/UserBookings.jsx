import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import {
  createBooking, getMyBookings, cancelBooking,
  checkAvailability, deleteBooking, getActiveResources
} from '../../api/bookings'
import { CalendarCheck, Clock, Users, Plus, X, ChevronDown, Trash2, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const LECTURE_HALL_IMG = '/src/assets/lecture_hall.jpg'

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED:  'bg-red-100 text-red-700 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const TYPE_LABELS = {
  LECTURE_HALL: '🏛️ Lecture Halls',
  LAB:          '🔬 Labs',
  MEETING_ROOM: '🤝 Meeting Rooms',
  EQUIPMENT:    '🎥 Equipment',
}

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const FieldError = ({ msg }) =>
  msg ? <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{msg}</p> : null

export default function UserBookings() {
  const { user } = useAuth()
  const [showForm, setShowForm]               = useState(false)
  const [bookings, setBookings]               = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [activeFilter, setActiveFilter]       = useState('ALL')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [submitting, setSubmitting]           = useState(false)
  const [conflicts, setConflicts]             = useState([])
  const [formErrors, setFormErrors]           = useState({})
  const [resources, setResources]             = useState([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [selectedResource, setSelectedResource] = useState(null)

  const [form, setForm] = useState({
    resourceId: '', resourceName: '', bookingDate: '',
    startTime: '', endTime: '', purpose: '', expectedAttendees: '',
  })

  useEffect(() => { fetchResources(); fetchBookings() }, [])

  useEffect(() => {
    setFilteredBookings(
      activeFilter === 'ALL' ? bookings : bookings.filter(b => b.status === activeFilter)
    )
  }, [activeFilter, bookings])

  useEffect(() => {
    if (form.resourceId && form.bookingDate) fetchAvailability()
  }, [form.resourceId, form.bookingDate])

  const fetchResources = async () => {
    setLoadingResources(true)
    try { const res = await getActiveResources(); setResources(res.data) }
    catch { toast.error('Failed to load resources') }
    finally { setLoadingResources(false) }
  }

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await getMyBookings()
      setBookings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch { toast.error('Failed to load bookings') }
    finally { setLoadingBookings(false) }
  }

  const fetchAvailability = async () => {
    try { const res = await checkAvailability(form.resourceId, form.bookingDate); setConflicts(res.data) }
    catch {}
  }

  const handleResourceChange = (e) => {
    const id = parseInt(e.target.value)
    const resource = resources.find(r => r.id === id)
    setSelectedResource(resource)
    setForm(prev => ({ ...prev, resourceId: id, resourceName: resource?.name || '' }))
    setFormErrors(prev => ({ ...prev, resourceId: undefined }))
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFormErrors(prev => ({ ...prev, [e.target.name]: undefined }))
  }

  const isTimeAvailable = () => {
    if (!selectedResource?.availabilityStart || !selectedResource?.availabilityEnd) return true
    if (!form.startTime || !form.endTime) return true
    const availStart = selectedResource.availabilityStart.substring(0, 5)
    const availEnd   = selectedResource.availabilityEnd.substring(0, 5)
    return form.startTime >= availStart && form.endTime <= availEnd
  }

  const validate = () => {
    const errors = {}
    if (!form.resourceId) errors.resourceId = 'Please select a resource.'
    if (!form.bookingDate) errors.bookingDate = 'Please select a date.'
    if (!form.startTime) errors.startTime = 'Start time is required.'
    if (!form.endTime) errors.endTime = 'End time is required.'
    if (form.startTime && form.endTime) {
      if (form.startTime >= form.endTime) {
        errors.endTime = 'End time must be after start time.'
      } else {
        const [sh, sm] = form.startTime.split(':').map(Number)
        const [eh, em] = form.endTime.split(':').map(Number)
        if ((eh * 60 + em) - (sh * 60 + sm) < 15) errors.endTime = 'Booking must be at least 15 minutes.'
      }
    }
    if (form.startTime && form.endTime && !errors.startTime && !errors.endTime && !isTimeAvailable()) {
      errors.startTime = `Available ${selectedResource.availabilityStart?.substring(0, 5)} – ${selectedResource.availabilityEnd?.substring(0, 5)} only.`
    }
    if (!form.purpose.trim()) errors.purpose = 'Purpose is required.'
    else if (form.purpose.trim().length < 5) errors.purpose = 'At least 5 characters required.'
    if (selectedResource && selectedResource.type !== 'EQUIPMENT' && form.expectedAttendees) {
      const count = parseInt(form.expectedAttendees)
      if (isNaN(count) || count < 1) errors.expectedAttendees = 'Must be at least 1.'
      else if (selectedResource.capacity && count > selectedResource.capacity)
        errors.expectedAttendees = `Exceeds capacity of ${selectedResource.capacity}.`
    }
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return
    setSubmitting(true)
    try {
      await createBooking({
        ...form,
        resourceId: parseInt(form.resourceId),
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
      })
      toast.success('Booking submitted! Awaiting approval.')
      setShowForm(false)
      setForm({ resourceId: '', resourceName: '', bookingDate: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' })
      setSelectedResource(null); setConflicts([]); setFormErrors({})
      fetchBookings()
    } catch (err) {
      if (err.response?.status === 409) toast.error('⚠️ ' + (err.response.data.error || 'This time slot is already booked!'))
      else toast.error(err.response?.data?.error || 'Failed to submit booking')
    } finally { setSubmitting(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try { await cancelBooking(id); toast.success('Cancelled'); fetchBookings() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to cancel') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this booking?')) return
    try { await deleteBooking(id); toast.success('Deleted'); fetchBookings() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to delete') }
  }

  const countByStatus = (s) => bookings.filter(b => b.status === s).length

  const groupedResources = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  const today = new Date().toISOString().split('T')[0]

  const inputStyle = (field) => ({
    backgroundColor: '#f8f9fb',
    color: '#1e3a5f',
    border: `1.5px solid ${formErrors[field] ? '#dc2626' : '#dde3ea'}`,
    borderRadius: 10,
    padding: '10px 16px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ height: 240, marginTop: 64 }}>
        <img
          src={LECTURE_HALL_IMG}
          alt="Lecture Hall"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 30%', filter: 'brightness(0.45)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e4a7a 100%)', zIndex: -1,
        }} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(30,58,95,0.92) 0%, rgba(30,58,95,0.3) 100%)',
        }} />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#c9a227' }}>
            CAMPUS RESOURCE MANAGEMENT
          </p>
          <p className="text-4xl font-bold text-white mb-2">My Bookings</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Reserve lecture halls, labs, meeting rooms &amp; equipment
          </p>
        </div>
        <div className="absolute top-0 right-0" style={{
          width: 200, height: 200,
          background: 'linear-gradient(225deg, rgba(201,162,39,0.2) 0%, transparent 60%)',
        }} />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div style={{ width: 24, height: 2, backgroundColor: '#c9a227' }} />
              <p className="text-xl font-semibold" style={{ color: '#1e3a5f' }}>Manage Reservations</p>
            </div>
            <p className="text-sm" style={{ color: '#5a6a7a' }}>
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1e3a5f', color: '#c9a227', boxShadow: '0 4px 16px rgba(30,58,95,0.2)' }}
          >
            <Plus size={17} /> New Booking
          </button>
        </div>

        {/* ── Booking Form ── */}
        {showForm && (
          <div
            className="rounded-2xl mb-8 overflow-hidden shadow-md"
            style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
          >
            <div className="flex items-center justify-between px-7 py-5" style={{ backgroundColor: '#1e3a5f' }}>
              <div className="flex items-center gap-3">
                <CalendarCheck size={20} style={{ color: '#c9a227' }} />
                <p className="font-semibold text-lg text-white">New Booking Request</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setFormErrors({}) }}
                className="rounded-full p-1.5 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#c9a227' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-7 py-6 space-y-5">

              {/* Resource */}
              <div>
                <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>
                  SELECT RESOURCE *
                </label>
                {loadingResources ? (
                  <div className="flex items-center gap-2 text-sm py-2" style={{ color: '#5a6a7a' }}>
                    <Loader size={15} className="animate-spin" /> Loading resources...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="resourceId"
                      value={form.resourceId}
                      onChange={handleResourceChange}
                      className="appearance-none"
                      style={inputStyle('resourceId')}
                    >
                      <option value="">— Choose a resource —</option>
                      {Object.entries(groupedResources).map(([type, typeResources]) => (
                        <optgroup key={type} label={TYPE_LABELS[type] || type}>
                          {typeResources.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.name}{r.resourceCode ? ` (${r.resourceCode})` : ''}{r.capacity ? ` — Cap: ${r.capacity}` : ''}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={15} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: '#8a9bb0' }} />
                  </div>
                )}
                <FieldError msg={formErrors.resourceId} />
              </div>

              {/* Resource info */}
              {selectedResource && (
                <div className="rounded-xl p-4 text-sm space-y-1.5"
                  style={{ backgroundColor: '#f8f9fb', border: '1px solid #dde3ea' }}>
                  {selectedResource.location && (
                    <p style={{ color: '#374151' }}>📍 <strong>Location:</strong> {selectedResource.location}</p>
                  )}
                  {selectedResource.capacity && (
                    <p style={{ color: '#374151' }}>👥 <strong>Capacity:</strong> {selectedResource.capacity} people</p>
                  )}
                  {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                    <p style={{ color: '#374151' }}>
                      🕐 <strong>Available:</strong> {selectedResource.availabilityStart.substring(0, 5)} – {selectedResource.availabilityEnd.substring(0, 5)}
                    </p>
                  )}
                  {selectedResource.description && (
                    <p style={{ color: '#374151' }}>📝 {selectedResource.description}</p>
                  )}
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>
                  BOOKING DATE *
                </label>
                <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} min={today}
                  style={inputStyle('bookingDate')} />
                <FieldError msg={formErrors.bookingDate} />
              </div>

              {/* Conflict warning */}
              {conflicts.length > 0 && (
                <div className="rounded-xl p-4" style={{ backgroundColor: '#fff8e8', border: '1px solid #fcd34d' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: '#92400e' }}>⚠️ Already booked on this day:</p>
                  {conflicts.map(c => (
                    <p key={c.id} className="text-sm" style={{ color: '#b45309' }}>
                      {c.startTime} – {c.endTime}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#fcd34d', color: '#92400e' }}>{c.status}</span>
                    </p>
                  ))}
                </div>
              )}

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>START TIME *</label>
                  <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
                    style={inputStyle('startTime')} />
                  <FieldError msg={formErrors.startTime} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>END TIME *</label>
                  <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
                    style={inputStyle('endTime')} />
                  <FieldError msg={formErrors.endTime} />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>PURPOSE *</label>
                <input type="text" name="purpose" value={form.purpose} onChange={handleChange}
                  placeholder="e.g. CS3030 Lecture, Project Meeting" maxLength={255}
                  style={inputStyle('purpose')} />
                <div className="flex justify-between mt-1">
                  <FieldError msg={formErrors.purpose} />
                  <span className="text-xs ml-auto" style={{ color: '#8a9bb0' }}>{form.purpose.length}/255</span>
                </div>
              </div>

              {/* Attendees */}
              {selectedResource && selectedResource.type !== 'EQUIPMENT' && (
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1e3a5f' }}>
                    EXPECTED ATTENDEES{selectedResource.capacity && (
                      <span style={{ color: '#8a9bb0', fontWeight: 400 }}> (max {selectedResource.capacity})</span>
                    )}
                  </label>
                  <input type="number" name="expectedAttendees" value={form.expectedAttendees}
                    onChange={handleChange} min={1} max={selectedResource.capacity || undefined}
                    placeholder="e.g. 30" style={inputStyle('expectedAttendees')} />
                  <FieldError msg={formErrors.expectedAttendees} />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full font-bold py-3.5 rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: '#c9a227',
                  color: '#1e3a5f',
                  letterSpacing: '0.06em',
                  boxShadow: '0 4px 16px rgba(201,162,39,0.3)',
                }}
              >
                {submitting ? 'SUBMITTING...' : 'SUBMIT BOOKING REQUEST'}
              </button>
            </form>
          </div>
        )}

        {/* ── Bookings List ── */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
        >
          {/* List header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ backgroundColor: '#1e3a5f', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <CalendarCheck size={18} style={{ color: '#c9a227' }} />
              <p className="font-semibold text-white">Booking History</p>
            </div>
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(201,162,39,0.15)', color: '#c9a227' }}
            >
              {filteredBookings.length} records
            </span>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 px-6 py-4 flex-wrap" style={{ borderBottom: '1px solid #f0f2f5' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={
                  activeFilter === f
                    ? { backgroundColor: '#1e3a5f', color: '#c9a227', border: '1.5px solid #1e3a5f' }
                    : { backgroundColor: '#ffffff', color: '#5a6a7a', border: '1.5px solid #dde3ea' }
                }
              >
                {f}
                {f !== 'ALL' && countByStatus(f) > 0 && (
                  <span
                    className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: activeFilter === f ? 'rgba(201,162,39,0.2)' : '#f0f2f5',
                      color: 'inherit',
                    }}
                  >
                    {countByStatus(f)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Rows */}
          {loadingBookings ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }} />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 text-sm" style={{ color: '#5a6a7a' }}>
              {activeFilter === 'ALL'
                ? 'No bookings yet. Click New Booking to get started.'
                : `No ${activeFilter.toLowerCase()} bookings.`}
            </div>
          ) : (
            <div>
              {filteredBookings.map((booking, i) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between px-6 py-4 transition-colors hover:bg-[#f8f9fb]"
                  style={{ borderBottom: i < filteredBookings.length - 1 ? '1px solid #f0f2f5' : 'none' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm" style={{ color: '#1e3a5f' }}>{booking.resourceName}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLES[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#5a6a7a' }}>
                      <span className="flex items-center gap-1"><CalendarCheck size={11} /> {booking.bookingDate}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {booking.startTime} – {booking.endTime}</span>
                      {booking.expectedAttendees && (
                        <span className="flex items-center gap-1"><Users size={11} /> {booking.expectedAttendees} attendees</span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#8a9bb0' }}>{booking.purpose}</p>
                    {booking.adminRemarks && (
                      <p className="text-xs mt-1 italic" style={{ color: '#c9a227' }}>Admin: {booking.adminRemarks}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors hover:bg-gray-50"
                        style={{ border: '1px solid #dde3ea', color: '#5a6a7a', backgroundColor: '#fff' }}
                      >
                        Cancel
                      </button>
                    )}
                    {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#8a9bb0' }}
                        title="Delete permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
