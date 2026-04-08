import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getAllTickets,
  updateTicketStatus,
  assignTicket,
  addComment,
  editComment,
  deleteComment,
} from '../../api/tickets'
import { Wrench, ChevronDown, Send, Paperclip, X, User, MapPin, Tag, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

const STATUS_COLORS = {
  OPEN:        'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  RESOLVED:    'bg-green-500/20 text-green-400 border border-green-500/30',
  CLOSED:      'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  REJECTED:    'bg-red-500/20 text-red-400 border border-red-500/30',
}

const PRIORITY_COLORS = {
  LOW:      'bg-green-500/10 text-green-400 border border-green-500/20',
  MEDIUM:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  HIGH:     'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const STATUS_FLOW = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
}

export default function AdminTicketsPage() {
  const { user } = useAuth()

  const [tickets, setTickets]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedTicket, setSelectedTicket] = useState(null)

  // Status update form
  const [statusForm, setStatusForm]     = useState({ status: '', rejectionReason: '', resolutionNote: '' })
  const [updating, setUpdating]         = useState(false)

  // Assign technician
  const [assigneeId, setAssigneeId]     = useState('')

  // Comments
  const [comment, setComment]           = useState('')
  const [editingComment, setEditingComment] = useState(null)

  // Filter / search
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [search, setSearch]             = useState('')

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await getAllTickets()
      setTickets(res.data)
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  // Sync selectedTicket with refreshed data
  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id)
      if (updated) setSelectedTicket(updated)
    }
  }, [tickets])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (ticketId) => {
    if (!statusForm.status) return toast.error('Select a status')
    if (statusForm.status === 'REJECTED' && !statusForm.rejectionReason.trim())
      return toast.error('Rejection reason is required')
    try {
      setUpdating(true)
      await updateTicketStatus(ticketId, {
        status: statusForm.status,
        rejectionReason: statusForm.rejectionReason || null,
        resolutionNote: statusForm.resolutionNote || null,
        updatedByUserId: user.userId,
      })
      toast.success('Status updated!')
      setStatusForm({ status: '', rejectionReason: '', resolutionNote: '' })
      fetchTickets()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleAssign = async (ticketId) => {
    if (!assigneeId.trim()) return toast.error('Enter a technician user ID')
    try {
      setUpdating(true)
      await assignTicket(ticketId, {
        assigneeId: parseInt(assigneeId),
        adminUserId: user.userId,
      })
      toast.success('Technician assigned!')
      setAssigneeId('')
      fetchTickets()
    } catch {
      toast.error('Failed to assign technician')
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

  // ── Filtered tickets ──────────────────────────────────────────────────────
  const filtered = tickets.filter(t => {
    const matchStatus   = filterStatus   === 'ALL' || t.status   === filterStatus
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    const matchSearch   = !search || [t.title, t.reporterName, t.location, t.category]
      .join(' ').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white font-semibold flex items-center gap-2 text-lg">
          <Wrench size={20} className="text-rose-400" /> All Tickets
          {!loading && (
            <span className="text-slate-500 text-sm font-normal">({filtered.length} shown)</span>
          )}
        </h2>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2">
        <input
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm flex-1 min-w-[160px]"
          placeholder="Search title, reporter, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* ── Tickets List ── */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600 text-sm">No tickets match your filters.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => {
            const isExpanded = selectedTicket?.id === ticket.id
            const allowedStatuses = STATUS_FLOW[ticket.status] || []

            return (
              <div
                key={ticket.id}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition"
              >
                {/* ── Summary Row (clickable) ── */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(isExpanded ? null : ticket)
                    setComment('')
                    setEditingComment(null)
                    setStatusForm({ status: '', rejectionReason: '', resolutionNote: '' })
                    setAssigneeId('')
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{ticket.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <User size={10} /> {ticket.reporterName}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <MapPin size={10} /> {ticket.location}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Tag size={10} /> {ticket.category}
                        </span>
                        {ticket.createdAt && (
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={10} /> {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Assignee */}
                      {ticket.assigneeName && (
                        <p className="text-indigo-400 text-xs mt-1">
                          🔧 Assigned to: <strong>{ticket.assigneeName}</strong>
                        </p>
                      )}

                      {/* Contact details preview */}
                      {ticket.contactDetails && (
                        <p className="text-slate-500 text-xs mt-0.5">
                          Contact: {ticket.contactDetails}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Attachment & comment count badges */}
                      {ticket.attachments?.length > 0 && (
                        <span className="text-slate-400 text-xs flex items-center gap-0.5">
                          <Paperclip size={11} /> {ticket.attachments.length}
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Expanded Admin Panel ── */}
                {isExpanded && (
                  <div
                    className="border-t border-slate-700 p-4 space-y-5 bg-slate-850"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Full description */}
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-1 uppercase tracking-wide">Description</p>
                      <p className="text-slate-200 text-sm leading-relaxed">{ticket.description}</p>
                    </div>

                    {/* Resolution Note */}
                    {ticket.resolutionNote && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <p className="text-green-400 text-xs font-semibold uppercase tracking-wide mb-1">Resolution Note</p>
                        <p className="text-green-200 text-sm">{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {ticket.rejectionReason && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
                        <p className="text-red-200 text-sm">{ticket.rejectionReason}</p>
                      </div>
                    )}

                    {/* ── Attachments ── */}
                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">
                          Attachments ({ticket.attachments.length}/3)
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {ticket.attachments.map(a => (
                            <a
                              key={a.id}
                              href={a.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              <Paperclip size={11} />
                              {a.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Assign Technician ── */}
                    {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                      <div>
                        <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">
                          {ticket.assigneeName ? 'Reassign Technician' : 'Assign Technician'}
                        </p>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm placeholder:text-slate-500"
                            placeholder="Enter technician user ID"
                            value={assigneeId}
                            onChange={e => setAssigneeId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAssign(ticket.id)}
                          />
                          <button
                            onClick={() => handleAssign(ticket.id)}
                            disabled={updating || !assigneeId.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm transition font-medium"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Update Status ── */}
                    {allowedStatuses.length > 0 && (
                      <div>
                        <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">Update Status</p>
                        <div className="space-y-2">
                          <select
                            className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-3 py-2 text-sm"
                            value={statusForm.status}
                            onChange={e => setStatusForm({ status: e.target.value, rejectionReason: '', resolutionNote: '' })}
                          >
                            <option value="">Select new status...</option>
                            {allowedStatuses.map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>

                          {statusForm.status === 'REJECTED' && (
                            <input
                              className="w-full bg-slate-900 border border-red-500/50 text-white rounded-xl px-3 py-2 text-sm placeholder:text-slate-500"
                              placeholder="Rejection reason (required) *"
                              value={statusForm.rejectionReason}
                              onChange={e => setStatusForm({ ...statusForm, rejectionReason: e.target.value })}
                            />
                          )}

                          {statusForm.status === 'RESOLVED' && (
                            <textarea
                              className="w-full bg-slate-900 border border-green-500/30 text-white rounded-xl px-3 py-2 text-sm placeholder:text-slate-500 resize-none"
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
                              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white py-2 rounded-xl text-sm transition font-medium"
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
                          This ticket is <strong className="text-slate-300">{ticket.status}</strong> — no further status changes allowed.
                        </p>
                      </div>
                    )}

                    {/* ── Comments ── */}
                    <div>
                      <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wide">
                        Comments ({ticket.comments?.length || 0})
                      </p>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {ticket.comments?.length === 0 && (
                          <p className="text-slate-600 text-xs text-center py-2">No comments yet.</p>
                        )}
                        {ticket.comments?.map(c => (
                          <div key={c.id} className="bg-slate-900 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="text-indigo-400 text-xs font-semibold">{c.authorName}</p>
                                {c.createdAt && (
                                  <p className="text-slate-600 text-xs">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              {/* Admin can edit/delete own comments */}
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
                                  className="text-slate-400 px-2 text-sm"
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

                      {/* Add comment */}
                      <div className="flex gap-2 mt-3">
                        <input
                          className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm placeholder:text-slate-500"
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
