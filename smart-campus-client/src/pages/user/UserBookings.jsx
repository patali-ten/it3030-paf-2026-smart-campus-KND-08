import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import {
  createBooking, getMyBookings, cancelBooking,
  checkAvailability, deleteBooking, getActiveResources
} from '../../api/bookings'
import { CalendarCheck, Clock, Users, Plus, X, ChevronDown, Trash2, Loader, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Hero: busy lecture hall (image 3 — university_lecture_hall.jpg) ───────────
// Replace with your actual import: import lectureHallImg from '../../assets/lecture_hall.jpg'
const LECTURE_HALL_IMG = '/src/assets/lecture_hall.jpg'

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED:  'bg-red-100 text-red-700 border border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border border-gray-200',
}

const STATUS_STYLES_DARK = {
  PENDING:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  APPROVED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  REJECTED:  'bg-red-500/10 text-red-400 border border-red-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

const TYPE_LABELS = {
  LECTURE_HALL: '🏛️ Lecture Halls',
  LAB:          '🔬 Labs',
  MEETING_ROOM: '🤝 Meeting Rooms',
  EQUIPMENT:    '🎥 Equipment',
}

const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const FieldError = ({ msg }) =>
  msg ? <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 4 }}>{msg}</p> : null

export default function UserBookings() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [conflicts, setConflicts] = useState([])
  const [formErrors, setFormErrors] = useState({})
  const [resources, setResources] = useState([])
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
    const availEnd = selectedResource.availabilityEnd.substring(0, 5)
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
      await createBooking({ ...form, resourceId: parseInt(form.resourceId), expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null })
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

  const fieldBorder = (field) => formErrors[field] ? '1.5px solid #e53e3e' : '1.5px solid #ddd8cc'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;700&display=swap');
        .sw-book * { font-family: 'Lato', sans-serif; }
        .sw-serif { font-family: 'Playfair Display', serif; }
        .sw-input { background: #fff; color: #1B2A4A; border-radius: 10px; padding: 10px 16px; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        .sw-input:focus { border: 1.5px solid #C9A84C !important; }
        .sw-input option { background: #fff; color: #1B2A4A; }
        .sw-filter-btn { border: 1.5px solid #e8e4d9; background: #fff; color: #8a8375; border-radius: 8px; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em; }
        .sw-filter-btn.active { background: #1B2A4A; color: #C9A84C; border-color: #1B2A4A; }
        .sw-filter-btn:hover:not(.active) { border-color: #C9A84C; color: #1B2A4A; }
        .booking-row:hover { background: #f8f7f4; }
        select option { background: white; color: #1B2A4A; }
      `}</style>

      <div className="sw-book min-h-screen" style={{ background: '#F5F4EF' }}>
        <Navbar />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ height: 260, marginTop: 64 }}>
          <img
            src={LECTURE_HALL_IMG}
            alt="Lecture Hall"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 30%', filter: 'brightness(0.45)' }}
            onError={e => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg, #1B2A4A 0%, #243660 100%)', zIndex: -1
          }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to right, rgba(27,42,74,0.9) 0%, rgba(27,42,74,0.3) 100%)'
          }} />
          <div className="absolute inset-0 flex flex-col justify-center px-10">
            <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#C9A84C' }}>
              CAMPUS RESOURCE MANAGEMENT
            </p>
            <p className="sw-serif text-4xl font-bold text-white mb-2">My Bookings</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              Reserve lecture halls, labs, meeting rooms & equipment
            </p>
          </div>
          {/* Gold corner accent */}
          <div className="absolute top-0 right-0" style={{
            width: 200, height: 200,
            background: 'linear-gradient(225deg, rgba(201,168,76,0.2) 0%, transparent 60%)'
          }} />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Header actions */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div style={{ width: 24, height: 2, background: '#C9A84C' }} />
                <p className="sw-serif text-xl font-semibold" style={{ color: '#1B2A4A' }}>Manage Reservations</p>
              </div>
              <p className="text-sm" style={{ color: '#8a8375' }}>
                {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-all"
              style={{ background: '#1B2A4A', color: '#C9A84C', boxShadow: '0 4px 16px rgba(27,42,74,0.2)' }}
            >
              <Plus size={17} />
              New Booking
            </button>
          </div>

          {/* ── Booking Form ───────────────────────────────────────────────── */}
          {showForm && (
            <div className="rounded-2xl mb-8 overflow-hidden"
              style={{ background: '#fff', border: '1px solid #e8e4d9', boxShadow: '0 8px 40px rgba(27,42,74,0.10)' }}>
              {/* Form header */}
              <div className="flex items-center justify-between px-7 py-5"
                style={{ background: '#1B2A4A' }}>
                <div className="flex items-center gap-3">
                  <CalendarCheck size={20} style={{ color: '#C9A84C' }} />
                  <p className="sw-serif font-semibold text-lg text-white">New Booking Request</p>
                </div>
                <button onClick={() => { setShowForm(false); setFormErrors({}) }}
                  className="rounded-full p-1.5 transition"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#C9A84C' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} noValidate className="px-7 py-6 space-y-5">

                {/* Resource */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>
                    SELECT RESOURCE *
                  </label>
                  {loadingResources ? (
                    <div className="flex items-center gap-2 text-sm py-2" style={{ color: '#8a8375' }}>
                      <Loader size={15} className="animate-spin" /> Loading resources...
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        name="resourceId"
                        value={form.resourceId}
                        onChange={handleResourceChange}
                        className="sw-input appearance-none"
                        style={{ border: fieldBorder('resourceId') }}
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
                      <ChevronDown size={15} className="absolute right-4 top-3.5 pointer-events-none" style={{ color: '#8a8375' }} />
                    </div>
                  )}
                  <FieldError msg={formErrors.resourceId} />
                </div>

                {/* Resource Info Card */}
                {selectedResource && (
                  <div className="rounded-xl p-4 text-sm space-y-1.5"
                    style={{ background: '#f8f7f4', border: '1px solid #e8e4d9' }}>
                    {selectedResource.location && (
                      <p style={{ color: '#5a5347' }}>📍 <strong>Location:</strong> {selectedResource.location}</p>
                    )}
                    {selectedResource.capacity && (
                      <p style={{ color: '#5a5347' }}>👥 <strong>Capacity:</strong> {selectedResource.capacity} people</p>
                    )}
                    {selectedResource.availabilityStart && selectedResource.availabilityEnd && (
                      <p style={{ color: '#5a5347' }}>
                        🕐 <strong>Available:</strong> {selectedResource.availabilityStart.substring(0, 5)} – {selectedResource.availabilityEnd.substring(0, 5)}
                      </p>
                    )}
                    {selectedResource.description && (
                      <p style={{ color: '#5a5347' }}>📝 {selectedResource.description}</p>
                    )}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>
                    BOOKING DATE *
                  </label>
                  <input type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} min={today}
                    className="sw-input" style={{ border: fieldBorder('bookingDate') }} />
                  <FieldError msg={formErrors.bookingDate} />
                </div>

                {/* Conflict Warning */}
                {conflicts.length > 0 && (
                  <div className="rounded-xl p-4" style={{ background: '#fff8e8', border: '1px solid #f5d87e' }}>
                    <p className="text-sm font-bold mb-2" style={{ color: '#92640a' }}>⚠️ Already booked on this day:</p>
                    {conflicts.map(c => (
                      <p key={c.id} className="text-sm" style={{ color: '#b07d1a' }}>
                        {c.startTime} – {c.endTime}
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#f5d87e', color: '#92640a' }}>{c.status}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Time Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>START TIME *</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
                      className="sw-input" style={{ border: fieldBorder('startTime') }} />
                    <FieldError msg={formErrors.startTime} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>END TIME *</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
                      className="sw-input" style={{ border: fieldBorder('endTime') }} />
                    <FieldError msg={formErrors.endTime} />
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>PURPOSE *</label>
                  <input type="text" name="purpose" value={form.purpose} onChange={handleChange}
                    placeholder="e.g. CS3030 Lecture, Project Meeting" maxLength={255}
                    className="sw-input" style={{ border: fieldBorder('purpose') }} />
                  <div className="flex justify-between mt-1">
                    <FieldError msg={formErrors.purpose} />
                    <span className="text-xs ml-auto" style={{ color: '#b5b0a4' }}>{form.purpose.length}/255</span>
                  </div>
                </div>

                {/* Attendees */}
                {selectedResource && selectedResource.type !== 'EQUIPMENT' && (
                  <div>
                    <label className="block text-xs font-bold mb-2 tracking-wider" style={{ color: '#1B2A4A' }}>
                      EXPECTED ATTENDEES {selectedResource.capacity && <span style={{ color: '#8a8375', fontWeight: 400 }}>(max {selectedResource.capacity})</span>}
                    </label>
                    <input type="number" name="expectedAttendees" value={form.expectedAttendees}
                      onChange={handleChange} min={1} max={selectedResource.capacity || undefined}
                      placeholder="e.g. 30" className="sw-input" style={{ border: fieldBorder('expectedAttendees') }} />
                    <FieldError msg={formErrors.expectedAttendees} />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit" disabled={submitting}
                  className="w-full font-bold py-3.5 rounded-xl text-sm transition-all"
                  style={{
                    background: submitting ? '#ccc' : '#C9A84C',
                    color: submitting ? '#888' : '#1B2A4A',
                    letterSpacing: '0.06em',
                    boxShadow: submitting ? 'none' : '0 4px 16px rgba(201,168,76,0.3)',
                  }}
                >
                  {submitting ? 'SUBMITTING...' : 'SUBMIT BOOKING REQUEST'}
                </button>
              </form>
            </div>
          )}

          {/* ── Bookings List ──────────────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#fff', border: '1px solid #e8e4d9', boxShadow: '0 2px 12px rgba(27,42,74,0.06)' }}>

            {/* List Header */}
            <div className="flex items-center justify-between px-6 py-5"
              style={{ borderBottom: '1px solid #f0ede6', background: '#1B2A4A' }}>
              <div className="flex items-center gap-3">
                <CalendarCheck size={18} style={{ color: '#C9A84C' }} />
                <p className="sw-serif font-semibold text-white">Booking History</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                {filteredBookings.length} records
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 px-6 py-4 flex-wrap" style={{ borderBottom: '1px solid #f0ede6' }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`sw-filter-btn ${activeFilter === f ? 'active' : ''}`}>
                  {f}
                  {f !== 'ALL' && countByStatus(f) > 0 && (
                    <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: activeFilter === f ? 'rgba(201,168,76,0.2)' : '#f0ede6', color: 'inherit' }}>
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
                  style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16 text-sm" style={{ color: '#8a8375' }}>
                {activeFilter === 'ALL'
                  ? 'No bookings yet. Click New Booking to get started.'
                  : `No ${activeFilter.toLowerCase()} bookings.`}
              </div>
            ) : (
              <div>
                {filteredBookings.map((booking, i) => (
                  <div
                    key={booking.id}
                    className="booking-row flex items-start justify-between px-6 py-4 transition"
                    style={{ borderBottom: i < filteredBookings.length - 1 ? '1px solid #f0ede6' : 'none' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-sm" style={{ color: '#1B2A4A' }}>{booking.resourceName}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: '#8a8375' }}>
                        <span className="flex items-center gap-1"><CalendarCheck size={11} /> {booking.bookingDate}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {booking.startTime} – {booking.endTime}</span>
                        {booking.expectedAttendees && (
                          <span className="flex items-center gap-1"><Users size={11} /> {booking.expectedAttendees} attendees</span>
                        )}
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#b5b0a4' }}>{booking.purpose}</p>
                      {booking.adminRemarks && (
                        <p className="text-xs mt-1 italic" style={{ color: '#C9A84C' }}>Admin: {booking.adminRemarks}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                        <button onClick={() => handleCancel(booking.id)}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                          style={{ border: '1px solid #ddd8cc', color: '#8a8375', background: '#fff' }}>
                          Cancel
                        </button>
                      )}
                      {(booking.status === 'REJECTED' || booking.status === 'CANCELLED') && (
                        <button onClick={() => handleDelete(booking.id)}
                          className="p-1.5 rounded-lg transition"
                          style={{ color: '#b5b0a4' }}
                          title="Delete permanently">
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
    </>
  )
}
