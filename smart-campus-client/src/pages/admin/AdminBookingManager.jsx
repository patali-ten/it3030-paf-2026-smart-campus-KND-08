import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { getAllBookings, reviewBooking, adminDeleteBooking } from '../../api/bookings'
import { CalendarCheck, Clock, Users, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-700 border border-amber-200',
  APPROVED:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  REJECTED:  'bg-rose-100 text-rose-700 border border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-200',
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
      toast.error(err.response?.data?.error || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminDelete = async (id, resourceName) => {
    if (!confirm(`Permanently delete booking for "${resourceName}"?`)) return
    try {
      await adminDeleteBooking(id)
      toast.success('Booking deleted')
      fetchBookings()
    } catch {
      toast.error('Failed to delete booking')
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Booking Management</h1>
          <p className="text-slate-500 mt-1">Review and manage campus resource requests</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                filter === f
                  ? 'bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-[#c9a84c] hover:text-[#c9a84c]'
              }`}>
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-[#1e3a5f] font-bold flex items-center gap-2">
              <CalendarCheck size={18} className="text-[#c9a84c]" />
              {filter === 'ALL' ? 'All Records' : `${filter} Requests`}
            </h2>
            <span className="text-slate-400 text-xs font-bold tracking-widest">{bookings.length} TOTAL</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic">No bookings found for this filter.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map(booking => (
                <div key={booking.id} className="px-6 py-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-lg font-bold text-[#1e3a5f]">{booking.resourceName}</span>
                        <span className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center text-white text-xs font-bold">
                          {booking.userName?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700 leading-none">{booking.userName}</p>
                          <p className="text-xs text-slate-400 mt-1">{booking.userEmail}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-2"><CalendarCheck size={14} className="text-[#1e3a5f]" /> {booking.bookingDate}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[#1e3a5f]" /> {booking.startTime} – {booking.endTime}</span>
                        {booking.expectedAttendees && (
                          <span className="flex items-center gap-2"><Users size={14} className="text-[#1e3a5f]" /> {booking.expectedAttendees} Persons</span>
                        )}
                      </div>
                      
                      {booking.purpose && <p className="text-slate-600 text-sm mt-3 font-medium">Purpose: <span className="font-normal">{booking.purpose}</span></p>}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {booking.status === 'PENDING' && reviewingId !== booking.id && (
                        <button onClick={() => { setReviewingId(booking.id); setRemarks('') }}
                          className="text-xs px-5 py-2 bg-[#c9a84c] hover:bg-[#b08d3a] text-white rounded-lg font-bold transition-all shadow-sm">
                          REVIEW
                        </button>
                      )}
                      <button onClick={() => handleAdminDelete(booking.id, booking.resourceName)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors" title="Delete record">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {reviewingId === booking.id && (
                    <div className="mt-6 p-5 bg-white rounded-2xl border-2 border-[#c9a84c]/20 shadow-inner">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Decision Remarks</label>
                      <input type="text" placeholder="Explain the reason for approval/rejection..."
                        value={remarks} onChange={e => setRemarks(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#c9a84c]/20 outline-none mb-4" />
                      <div className="flex gap-3">
                        <button onClick={() => handleReview(booking.id, true)} disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
                          <CheckCircle size={16} /> APPROVE
                        </button>
                        <button onClick={() => handleReview(booking.id, false)} disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
                          <XCircle size={16} /> REJECT
                        </button>
                        <button onClick={() => setReviewingId(null)}
                          className="px-6 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">
                          CANCEL
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