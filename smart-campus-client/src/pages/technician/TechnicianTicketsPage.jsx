import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { getAssignedTickets, updateTicketStatus, addComment, editComment, deleteComment } from '../../api/tickets'
import { Wrench, ChevronDown, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  OPEN:        ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
}

const STATUS_COLORS = {
  OPEN:        'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-400',
  RESOLVED:    'bg-green-500/20 text-green-400',
  CLOSED:      'bg-slate-500/20 text-slate-400',
  REJECTED:    'bg-red-500/20 text-red-400',
}

const PRIORITY_COLORS = {
  LOW:      'text-green-400',
  MEDIUM:   'text-amber-400',
  HIGH:     'text-orange-400',
  CRITICAL: 'text-red-400',
}

// ─────────────────────────────────────────────────────────────────────────────
// TechnicianTicketsContent — logic + UI only, no Navbar, no page shell
// Used as a widget inside TechnicianDashboard AND inside the full page below
// ─────────────────────────────────────────────────────────────────────────────
export function TechnicianTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comment, setComment]               = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [statusForm, setStatusForm]         = useState({ status: '', resolutionNote: '' })
  const [updating, setUpdating]             = useState(false)

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await getAssignedTickets(user.userId)
      setTickets(res.data)
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id)
      if (updated) setSelectedTicket(updated)
    }
  }, [tickets])

  const handleStatusUpdate = async (ticketId) => {
    if (!statusForm.status) return
    try {
      setUpdating(true)
      await updateTicketStatus(ticketId, {
        status: statusForm.status,
        resolutionNote: statusForm.resolutionNote || null,
        updatedByUserId: user.userId,
      })
      toast.success('Status updated!')
      setStatusForm({ status: '', resolutionNote: '' })
      fetchTickets()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleComment = async (ticketId) => {
    if (!comment.trim()) return
    try {
      await addComment(ticketId, { content: comment, authorId: user.userId })
      toast.success('Comment added!')
      setComment('')
      fetchTickets()
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleEditComment = async (commentId) => {
    if (!editingComment?.content.trim()) return
    try {
      await editComment(commentId, { content: editingComment.content, authorId: user.userId })
      toast.success('Comment updated!')
      setEditingComment(null)
      fetchTickets()
    } catch {
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId, user.userId)
      toast.success('Comment deleted')
      fetchTickets()
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <Wrench size={18} className="text-amber-400" /> Assigned Tickets
      </h2>

      {loading ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-sm">
          No tickets assigned to you yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const allowedStatuses = STATUS_FLOW[ticket.status] || []

            return (
              <div
                key={ticket.id}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 cursor-pointer hover:border-slate-500 transition"
                onClick={() => {
                  setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)
                  setComment('')
                  setEditingComment(null)
                  setStatusForm({ status: '', resolutionNote: '' })
                }}
              >
                {/* Summary */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm">{ticket.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      {ticket.location} · {ticket.category} · reported by {ticket.reporterName}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${selectedTicket?.id === ticket.id ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Expanded */}
                {selectedTicket?.id === ticket.id && (
                  <div
                    className="mt-4 border-t border-slate-700 pt-4 space-y-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-slate-300 text-sm">{ticket.description}</p>

                    {/* Attachments */}
                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">
                          Attachments ({ticket.attachments.length})
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {ticket.attachments.map(a => (
                            <img
                              key={a.id}
                              src={a.fileUrl}
                              alt={a.fileName}
                              className="w-24 h-24 object-cover rounded-lg border border-slate-700 cursor-pointer hover:scale-105 transition"
                              onClick={() => window.open(a.fileUrl, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolution Note */}
                    {ticket.resolutionNote && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <p className="text-green-400 text-xs font-medium">Resolution Note</p>
                        <p className="text-green-300 text-sm mt-1">{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {/* Update Status */}
                    {allowedStatuses.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs mb-2">Update Status</p>
                        <div className="space-y-2">
                          <select
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm"
                            value={statusForm.status}
                            onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                          >
                            <option value="">Select status...</option>
                            {allowedStatuses.map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>

                          {statusForm.status === 'RESOLVED' && (
                            <textarea
                              className="w-full bg-slate-900 border border-green-500/30 text-white rounded-xl px-3 py-2 text-sm resize-none"
                              placeholder="Resolution note (optional)"
                              rows={2}
                              value={statusForm.resolutionNote}
                              onChange={e => setStatusForm({ ...statusForm, resolutionNote: e.target.value })}
                            />
                          )}

                          {statusForm.status && (
                            <button
                              onClick={() => handleStatusUpdate(ticket.id)}
                              disabled={updating}
                              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-xl text-sm transition"
                            >
                              {updating ? 'Updating...' : `Set to ${statusForm.status.replace('_', ' ')}`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Terminal state notice */}
                    {allowedStatuses.length === 0 && (
                      <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                        <p className="text-slate-400 text-xs">
                          Ticket is <strong className="text-slate-300">{ticket.status}</strong> — no further changes allowed.
                        </p>
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <p className="text-slate-400 text-xs mb-2">
                        Comments ({ticket.comments?.length || 0})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {ticket.comments?.length === 0 && (
                          <p className="text-slate-600 text-xs text-center py-2">No comments yet.</p>
                        )}
                        {ticket.comments?.map(c => (
                          <div key={c.id} className="bg-slate-900 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-indigo-400 text-xs font-medium">{c.authorName}</p>
                              {c.authorId === user.userId && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                                    className="text-xs text-slate-400 hover:text-white transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingComment?.id === c.id ? (
                              <div className="flex gap-2 mt-1">
                                <input
                                  className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl px-3 py-1 text-sm"
                                  value={editingComment.content}
                                  onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                                  onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                />
                                <button
                                  onClick={() => handleEditComment(c.id)}
                                  className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingComment(null)}
                                  className="text-slate-400 px-2"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-slate-300 text-sm">{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <input
                          className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(ticket.id)}
                        />
                        <button
                          onClick={() => handleComment(ticket.id)}
                          disabled={!comment.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-2 rounded-xl transition"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TechnicianTicketsPage — full standalone page, used by /technician/tickets route
// ─────────────────────────────────────────────────────────────────────────────
export default function TechnicianTicketsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <TechnicianTicketsContent />
      </div>
    </div>
  )
}
