import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
  getAllTickets,
  updateTicketStatus,
  assignTicket,
  addComment,
  editComment,
  deleteComment,
  deleteTicket,
  getUserById,
} from '../../api/tickets'
import { Wrench, ChevronDown, Send, Paperclip, X, User, MapPin, Tag, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Updated Palette based on "Option B — Navy & Gold"
const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-700 border border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200',
  RESOLVED:    'bg-green-100 text-green-700 border border-green-200',
  CLOSED:      'bg-gray-100 text-gray-600 border border-gray-200',
  REJECTED:    'bg-red-100 text-red-700 border border-red-200',
}

const PRIORITY_COLORS = {
  LOW:      'bg-green-50 text-green-600 border border-green-100',
  MEDIUM:   'bg-amber-50 text-amber-600 border border-amber-100',
  HIGH:     'bg-orange-50 text-orange-600 border border-orange-100',
  CRITICAL: 'bg-red-50 text-red-600 border border-red-100',
}

const STATUS_FLOW = {
  OPEN:        ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED:    ['CLOSED'],
  CLOSED:      [],
  REJECTED:    [],
}

export function AdminTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]                 = useState([])
  const [loading, setLoading]                 = useState(true)
  const [selectedTicket, setSelectedTicket]   = useState(null)
  const [statusForm, setStatusForm]           = useState({ status: '', rejectionReason: '', resolutionNote: '' })
  const [updating, setUpdating]               = useState(false)
  const [assigneeId, setAssigneeId]           = useState('')
  const [comment, setComment]                 = useState('')
  const [editingComment, setEditingComment]   = useState(null)
  const [filterStatus, setFilterStatus]       = useState('ALL')
  const [filterPriority, setFilterPriority]   = useState('ALL')
  const [search, setSearch]                   = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

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

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id)
      if (updated) setSelectedTicket(updated)
    }
  }, [tickets])

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
    const userRes = await getUserById(parseInt(assigneeId))
    const targetUser = userRes.data
    if (!targetUser.roles || !targetUser.roles.includes('TECHNICIAN')) {
      toast.error('This user is not a technician!')
      return
    }

    await assignTicket(ticketId, {
      assigneeId: parseInt(assigneeId),
      adminUserId: user.userId,
    })
    toast.success('Technician assigned!')
    setAssigneeId('')
    fetchTickets()
  } catch {
    toast.error('User not found or not a technician')
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

  const handleDeleteTicket = async (ticketId) => {
    try {
      await deleteTicket(ticketId, user.userId)
      toast.success('Ticket deleted!')
      setConfirmDeleteId(null)
      setSelectedTicket(null)
      fetchTickets()
    } catch {
      toast.error('Failed to delete ticket')
    }
  }

  const filtered = tickets.filter(t => {
    const matchStatus   = filterStatus   === 'ALL' || t.status   === filterStatus
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    const matchSearch   = !search || [t.title, t.reporterName, t.location, t.category]
      .join(' ').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchPriority && matchSearch
  })

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-[#1e3a5f] font-bold flex items-center gap-2 text-2xl">
          <Wrench size={24} className="text-[#d4a017]" /> All Tickets
          {!loading && (
            <span className="text-gray-400 text-sm font-normal">({filtered.length} shown)</span>
          )}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm flex-1 min-w-[200px] focus:ring-2 focus:ring-[#1e3a5f] outline-none"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          {['LOW','MEDIUM','HIGH','CRITICAL'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No tickets match your filters.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ticket => {
            const isExpanded      = selectedTicket?.id === ticket.id
            const allowedStatuses = STATUS_FLOW[ticket.status] || []

            return (
              <div
                key={ticket.id}
                className={`bg-white border transition-all duration-200 rounded-2xl overflow-hidden shadow-sm ${isExpanded ? 'border-[#1e3a5f] ring-1 ring-[#1e3a5f]/10' : 'border-gray-200 hover:border-[#d4a017]'}`}
              >
                <div
                  className="p-5 cursor-pointer"
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
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-[#1e3a5f] font-bold text-base">{ticket.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${STATUS_COLORS[ticket.status]}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${PRIORITY_COLORS[ticket.priority]}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-gray-500 text-xs flex items-center gap-1.5">
                          <User size={14} className="text-[#1e3a5f]" /> {ticket.reporterName}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#1e3a5f]" /> {ticket.location}
                        </span>
                        <span className="text-gray-500 text-xs flex items-center gap-1.5">
                          <Tag size={14} className="text-[#1e3a5f]" /> {ticket.category}
                        </span>
                        {ticket.createdAt && (
                          <span className="text-gray-400 text-xs flex items-center gap-1.5 ml-auto">
                            <Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {ticket.assigneeName && (
                        <div className="mt-3 flex items-center gap-2">
                           <div className="h-1.5 w-1.5 rounded-full bg-[#d4a017]"></div>
                           <p className="text-[#1e3a5f] text-xs font-medium">
                            Assigned to: <span className="font-bold">{ticket.assigneeName}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {ticket.attachments?.length > 0 && (
                        <span className="text-gray-400 text-xs flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                          <Paperclip size={12} /> {ticket.attachments.length}
                        </span>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setConfirmDeleteId(ticket.id)
                        }}
                        className="text-red-400 hover:text-red-600 transition p-1.5 rounded-full hover:bg-red-50"
                        title="Delete ticket"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180 text-[#1e3a5f]' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="bg-gray-50/50 border-t border-gray-100 p-6 space-y-6"
                    onClick={e => e.stopPropagation()}
                  >
                    <div>
                      <p className="text-[#1e3a5f] text-[10px] font-bold mb-2 uppercase tracking-widest">Description</p>
                      <p className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm">{ticket.description}</p>
                    </div>

                    {ticket.resolutionNote && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-green-800 text-[10px] font-bold uppercase tracking-widest mb-1">Resolution Note</p>
                        <p className="text-green-700 text-sm">{ticket.resolutionNote}</p>
                      </div>
                    )}

                    {ticket.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-800 text-[10px] font-bold uppercase tracking-widest mb-1">Rejection Reason</p>
                        <p className="text-red-700 text-sm">{ticket.rejectionReason}</p>
                      </div>
                    )}

                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="text-[#1e3a5f] text-[10px] font-bold mb-2 uppercase tracking-widest">
                          Attachments ({ticket.attachments.length}/3)
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {ticket.attachments.map(a => (
                            <a
                              key={a.id}
                              href={a.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 bg-white border border-gray-200 hover:border-[#1e3a5f] text-[#1e3a5f] text-xs px-4 py-2 rounded-xl transition shadow-sm font-medium"
                            >
                              <Paperclip size={12} /> {a.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[#1e3a5f] text-[10px] font-bold mb-3 uppercase tracking-widest">
                          {ticket.assigneeName ? 'Reassign Technician' : 'Assign Technician'}
                        </p>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                            placeholder="Enter technician user ID"
                            value={assigneeId}
                            onChange={e => setAssigneeId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAssign(ticket.id)}
                          />
                          <button
                            onClick={() => handleAssign(ticket.id)}
                            disabled={updating || !assigneeId.trim()}
                            className="bg-[#1e3a5f] hover:bg-[#162a45] disabled:opacity-50 text-white px-6 py-2 rounded-xl text-sm transition font-bold"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    )}

                    {allowedStatuses.length > 0 && (
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[#1e3a5f] text-[10px] font-bold mb-3 uppercase tracking-widest">Update Status</p>
                        <div className="space-y-3">
                          <select
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-[#1e3a5f] outline-none"
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
                              className="w-full bg-red-50 border border-red-200 text-red-900 rounded-xl px-4 py-2 text-sm placeholder:text-red-400 focus:ring-1 focus:ring-red-500 outline-none"
                              placeholder="Rejection reason (required) *"
                              value={statusForm.rejectionReason}
                              onChange={e => setStatusForm({ ...statusForm, rejectionReason: e.target.value })}
                            />
                          )}
                          {statusForm.status === 'RESOLVED' && (
                            <textarea
                              className="w-full bg-green-50 border border-green-200 text-green-900 rounded-xl px-4 py-2 text-sm placeholder:text-green-400 resize-none focus:ring-1 focus:ring-green-500 outline-none"
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
                              className="w-full bg-[#d4a017] hover:bg-[#b88a14] disabled:opacity-50 text-[#1e3a5f] py-2.5 rounded-xl text-sm transition font-bold"
                            >
                              {updating ? 'Updating...' : `Set to ${statusForm.status.replace('_', ' ')}`}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {allowedStatuses.length === 0 && (
                      <div className="bg-gray-100 rounded-xl p-4 text-center border border-gray-200">
                        <p className="text-gray-500 text-xs font-medium">
                          Status locked: <strong className="text-[#1e3a5f]">{ticket.status}</strong>
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-[#1e3a5f] text-[10px] font-bold mb-3 uppercase tracking-widest">
                        Comments ({ticket.comments?.length || 0})
                      </p>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {ticket.comments?.length === 0 && (
                          <p className="text-gray-400 text-xs text-center py-4 bg-white rounded-xl border border-dashed border-gray-200">No comments yet.</p>
                        )}
                        {ticket.comments?.map(c => (
                          <div key={c.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className="text-[#1e3a5f] text-xs font-bold">{c.authorName}</p>
                                {c.createdAt && (
                                  <p className="text-gray-400 text-[10px]">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              {c.authorId === user.userId && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                                    className="text-[10px] font-bold text-[#d4a017] hover:underline transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-[10px] font-bold text-red-500 hover:underline transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingComment?.id === c.id ? (
                              <div className="flex gap-2 mt-2">
                                <input
                                  className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-1.5 text-sm outline-none"
                                  value={editingComment.content}
                                  onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                                  onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                />
                                <button
                                  onClick={() => handleEditComment(c.id)}
                                  className="bg-[#1e3a5f] text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingComment(null)}
                                  className="text-gray-400 hover:text-gray-600 transition"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <p className="text-gray-600 text-sm">{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <input
                          className="flex-1 bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-[#1e3a5f] outline-none"
                          placeholder="Add a detailed comment..."
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(ticket.id)}
                        />
                        <button
                          onClick={() => handleComment(ticket.id)}
                          disabled={!comment.trim()}
                          className="bg-[#1e3a5f] hover:bg-[#162a45] disabled:opacity-40 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                        >
                          <Send size={18} />
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

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-[#1e3a5f]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-100">
            <h3 className="text-[#1e3a5f] font-bold text-xl mb-2">Delete Ticket?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              This action cannot be undone. The ticket and all its attachments and comments will be permanently removed from the SmartCampus system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm transition font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTicket(confirmDeleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm transition font-bold shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function AdminTicketsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-20">
        <AdminTicketsContent />
      </div>
    </div>
  )
}