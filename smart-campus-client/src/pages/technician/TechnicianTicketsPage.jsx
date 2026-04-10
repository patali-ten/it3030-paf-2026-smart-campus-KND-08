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
  OPEN:        'bg-blue-100 text-blue-700 border border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200',
  RESOLVED:    'bg-green-100 text-green-700 border border-green-200',
  CLOSED:      'bg-gray-100 text-gray-500 border border-gray-200',
  REJECTED:    'bg-red-100 text-red-600 border border-red-200',
}

const PRIORITY_COLORS = {
  LOW:      'text-green-600 bg-green-50 border border-green-200',
  MEDIUM:   'text-amber-600 bg-amber-50 border border-amber-200',
  HIGH:     'text-orange-600 bg-orange-50 border border-orange-200',
  CRITICAL: 'text-red-600 bg-red-50 border border-red-200',
}

// ─────────────────────────────────────────────────────────────────────────────
// TechnicianTicketsContent — logic + UI only, no Navbar, no page shell
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
      {/* Section header */}
      <h2 className="font-semibold flex items-center gap-2 text-base" style={{ color: '#1e3a5f' }}>
        <Wrench size={18} style={{ color: '#c9a227' }} />
        Assigned Tickets
      </h2>

      {loading ? (
        <div className="text-center py-10 text-sm" style={{ color: '#8a9bb0' }}>Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: '#8a9bb0' }}>
          No tickets assigned to you yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const allowedStatuses = STATUS_FLOW[ticket.status] || []
            const isOpen = selectedTicket?.id === ticket.id

            return (
              <div
                key={ticket.id}
                className="bg-white border rounded-2xl p-4 cursor-pointer transition-shadow hover:shadow-md"
                style={{ borderColor: isOpen ? '#c9a227' : '#dde3ea' }}
                onClick={() => {
                  setSelectedTicket(isOpen ? null : ticket)
                  setComment('')
                  setEditingComment(null)
                  setStatusForm({ status: '', resolutionNote: '' })
                }}
              >
                {/* Summary row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: '#1e3a5f' }}>
                        {ticket.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#5a6a7a' }}>
                      {ticket.location} · {ticket.category} · reported by {ticket.reporterName}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform mt-0.5 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: '#8a9bb0' }}
                  />
                </div>

                {/* Expanded panel */}
                {isOpen && (
                  <div
                    className="mt-4 pt-4 space-y-4"
                    style={{ borderTop: '1px solid #dde3ea' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-sm" style={{ color: '#374151' }}>{ticket.description}</p>

                    {/* Attachments */}
                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: '#5a6a7a' }}>
                          Attachments ({ticket.attachments.length})
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {ticket.attachments.map(a => (
                            <img
                              key={a.id}
                              src={a.fileUrl}
                              alt={a.fileName}
                              className="w-24 h-24 object-cover rounded-xl border cursor-pointer hover:scale-105 transition-transform"
                              style={{ borderColor: '#dde3ea' }}
                              onClick={() => window.open(a.fileUrl, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resolution Note */}
                    {ticket.resolutionNote && (
                      <div
                        className="rounded-xl p-3"
                        style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
                      >
                        <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>Resolution Note</p>
                        <p className="text-sm mt-1" style={{ color: '#15803d' }}>{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {/* Update Status */}
                    {allowedStatuses.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: '#5a6a7a' }}>Update Status</p>
                        <div className="space-y-2">
                          <select
                            className="w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a227]/40"
                            style={{
                              backgroundColor: '#f8f9fb',
                              border: '1px solid #dde3ea',
                              color: '#1e3a5f',
                            }}
                            value={statusForm.status}
                            onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                          >
                            <option value="">Select status…</option>
                            {allowedStatuses.map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>

                          {statusForm.status === 'RESOLVED' && (
                            <textarea
                              className="w-full rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-green-300"
                              style={{
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                color: '#1e3a5f',
                              }}
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
                              className="w-full py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 hover:opacity-90"
                              style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}
                            >
                              {updating ? 'Updating…' : `Set to ${statusForm.status.replace('_', ' ')}`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Terminal state notice */}
                    {allowedStatuses.length === 0 && (
                      <div
                        className="rounded-xl p-3 text-center text-xs"
                        style={{ backgroundColor: '#f8f9fb', border: '1px solid #dde3ea', color: '#5a6a7a' }}
                      >
                        Ticket is <strong style={{ color: '#1e3a5f' }}>{ticket.status}</strong> — no further changes allowed.
                      </div>
                    )}

                    {/* Comments */}
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#5a6a7a' }}>
                        Comments ({ticket.comments?.length || 0})
                      </p>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {ticket.comments?.length === 0 && (
                          <p className="text-xs text-center py-3" style={{ color: '#8a9bb0' }}>No comments yet.</p>
                        )}
                        {ticket.comments?.map(c => (
                          <div
                            key={c.id}
                            className="rounded-xl p-3"
                            style={{ backgroundColor: '#f8f9fb', border: '1px solid #dde3ea' }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold" style={{ color: '#1e3a5f' }}>{c.authorName}</p>
                              {c.authorId === user.userId && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                                    className="text-xs hover:underline"
                                    style={{ color: '#5a6a7a' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-xs hover:underline"
                                    style={{ color: '#dc2626' }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>

                            {editingComment?.id === c.id ? (
                              <div className="flex gap-2 mt-1">
                                <input
                                  className="flex-1 rounded-xl px-3 py-1 text-sm outline-none"
                                  style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #c9a227',
                                    color: '#1e3a5f',
                                  }}
                                  value={editingComment.content}
                                  onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                                  onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                />
                                <button
                                  onClick={() => handleEditComment(c.id)}
                                  className="px-3 py-1 rounded-xl text-sm font-medium text-white"
                                  style={{ backgroundColor: '#1e3a5f' }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingComment(null)}
                                  className="px-2"
                                  style={{ color: '#8a9bb0' }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm" style={{ color: '#374151' }}>{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add comment */}
                      <div className="flex gap-2 mt-3">
                        <input
                          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a227]/40"
                          style={{
                            backgroundColor: '#f8f9fb',
                            border: '1px solid #dde3ea',
                            color: '#1e3a5f',
                          }}
                          placeholder="Add a comment…"
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(ticket.id)}
                        />
                        <button
                          onClick={() => handleComment(ticket.id)}
                          disabled={!comment.trim()}
                          className="px-3 py-2 rounded-xl transition-opacity disabled:opacity-40 hover:opacity-90"
                          style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}
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
// TechnicianTicketsPage — full standalone page
// ─────────────────────────────────────────────────────────────────────────────
export default function TechnicianTicketsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="bg-white border border-[#dde3ea] rounded-2xl p-6 shadow-sm">
          <TechnicianTicketsContent />
        </div>
      </div>
    </div>
  )
}
