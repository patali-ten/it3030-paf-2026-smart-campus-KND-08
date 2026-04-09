import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { getAllBookings, reviewBooking, adminDeleteBooking } from '../../api/bookings'
import { CalendarCheck, Clock, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  PENDING:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  APPROVED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  REJECTED:  'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

const FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ALL']

export default function AdminBookingManager() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [reviewingId, setReviewingId] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchBookings() }, [filter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await getAllBookings(filter === 'ALL' ? undefined : filter)
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setBookings(sorted)
    } catch {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (bookingId, approved) => {
    setSubmitting(true)
    try {
      await reviewBooking(bookingId, {
        approved,
        remarks: remarks || (approved ? 'Approved by admin.' : 'Rejected by admin.'),
      })
      toast.success(approved ? 'Booking approved ✓' : 'Booking rejected')
      setReviewingId(null)
      setRemarks('')
      fetchBookings()
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('⚠️ Conflict: ' + (err.response.data.error || 'Another booking overlaps this time.'))
      } else {
        toast.error(err.response?.data?.error || 'Action failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminDelete = async (id, resourceName) => {
    if (!confirm(`Permanently delete booking for "${resourceName}"? This cannot be undone.`)) return
    try {
      await adminDeleteBooking(id)
      toast.success('Booking deleted permanently')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete booking')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Booking Management</h1>
          <p className="text-slate-400 mt-1">Review and manage all campus resource bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <CalendarCheck size={18} className="text-amber-400" />
              {filter === 'ALL' ? 'All Bookings' : `${filter} Bookings`}
            </h2>
            <span className="text-slate-500 text-sm">{bookings.length} results</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              No {filter === 'ALL' ? '' : filter.toLowerCase()} bookings found.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {bookings.map(booking => (
                <div key={booking.id} className="px-6 py-5 hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">

                    {/* Booking info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="text-white font-semibold">{booking.resourceName}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>

                      {/* User info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {booking.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-slate-300 text-sm">{booking.userName}</span>
                        <span className="text-slate-600 text-xs">{booking.userEmail}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1"><CalendarCheck size={13} /> {booking.bookingDate}</span>
                        <span className="flex items-center gap-1"><Clock size={13} /> {booking.startTime} – {booking.endTime}</span>
                        {booking.expectedAttendees && (
                          <span className="flex items-center gap-1"><Users size={13} /> {booking.expectedAttendees} attendees</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1">{booking.purpose}</p>
                      {booking.adminRemarks && (
                        <p className="text-slate-600 text-xs mt-1 italic">Remarks: {booking.adminRemarks}</p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Review button — PENDING only */}
                      {booking.status === 'PENDING' && reviewingId !== booking.id && (
                        <button onClick={() => { setReviewingId(booking.id); setRemarks('') }}
                          className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors">
                          Review
                        </button>
                      )}
                      {/* Delete button — admin can delete any booking */}
                      <button
                        onClick={() => handleAdminDelete(booking.id, booking.resourceName)}
                        className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete permanently">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Review panel */}
                  {reviewingId === booking.id && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                      <input type="text" placeholder="Optional remarks for the user..."
                        value={remarks} onChange={e => setRemarks(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600 text-sm mb-3" />
                      <div className="flex gap-3">
                        <button onClick={() => handleReview(booking.id, true)} disabled={submitting}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button onClick={() => handleReview(booking.id, false)} disabled={submitting}
                          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">
                          <XCircle size={16} /> Reject
                        </button>
                        <button onClick={() => setReviewingId(null)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
