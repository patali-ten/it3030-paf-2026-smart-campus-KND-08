import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
  getMyTickets,
  createTicket,
  addComment,
  editComment,
  deleteComment,
  addAttachment,
  deleteAttachment,
} from '../../api/tickets'
import { Wrench, Plus, ChevronDown, Send, Paperclip, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'IT_HARDWARE', 'IT_SOFTWARE',
  'HVAC', 'FURNITURE', 'SECURITY', 'CLEANING', 'OTHER',
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

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

const EMPTY_FORM = {
  title: '',
  description: '',
  location: '',
  category: 'IT_HARDWARE',
  priority: 'MEDIUM',
  contactDetails: '',
}

// ─────────────────────────────────────────────────────────────
// Inner component — reusable in dashboard embed AND full page
// ─────────────────────────────────────────────────────────────
export function MyTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [showForm, setShowForm]             = useState(false)
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [submitting, setSubmitting]         = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comment, setComment]               = useState('')
  const [editingComment, setEditingComment] = useState(null)

  // ── Fetch ────────────────────────────────────────────────────
  const fetchTickets = async () => {
    try {
      setLoading(true)
      const res = await getMyTickets(user.userId)
      setTickets(res.data)
    } catch {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTickets() }, [])

  // ── Create ticket ─────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await createTicket({ ...form, reporterId: user.userId })
      const newTicketId = res.data.id
      for (const file of attachmentFiles) {
        await addAttachment(newTicketId, file)
      }
      toast.success('Ticket created!')
      setShowForm(false)
      setForm(EMPTY_FORM)
      setAttachmentFiles([])
      fetchTickets()
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files)
    setAttachmentFiles(prev => [...prev, ...picked].slice(0, 3))
    e.target.value = ''
  }

  const removeAttachmentFile = (index) =>
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index))

  // ── Attachment on saved ticket ────────────────────────────────
  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId, user.userId)
      toast.success('Attachment removed')
      fetchTickets()
    } catch {
      toast.error('Failed to remove attachment')
    }
  }

  // ── Comments ──────────────────────────────────────────────────
  const handleComment = async () => {
    if (!comment.trim() || !selectedTicket) return
    try {
      await addComment(selectedTicket.id, { content: comment, authorId: user.userId })
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

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Wrench size={18} className="text-amber-400" /> My Tickets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-xl transition"
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* ── Create Form ── */}
      {showForm && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <h3 className="text-white font-medium mb-4">Report an Issue</h3>

          <form onSubmit={handleCreate} className="space-y-3">
            <input
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
              placeholder="Description *"
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
            />
            <input
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
              placeholder="Location (e.g. Lab 3) *"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <input
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
              placeholder="Contact details (optional)"
              value={form.contactDetails}
              onChange={e => setForm({ ...form, contactDetails: e.target.value })}
            />

            {/* Attachments */}
            <div>
              <p className="text-slate-400 text-xs mb-1">
                Attachments — up to 3 images
                {attachmentFiles.length > 0 && (
                  <span className="text-amber-400 ml-1">({attachmentFiles.length}/3 selected)</span>
                )}
              </p>
              {attachmentFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {attachmentFiles.map((f, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-24 h-24 object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        onClick={() => removeAttachmentFile(i)}
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-red-400 hover:text-red-300"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {attachmentFiles.length < 3 && (
                <label className="flex items-center gap-2 cursor-pointer w-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-xl px-4 py-2 text-sm transition">
                  <Paperclip size={14} />
                  Choose image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setAttachmentFiles([]) }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-xl transition"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tickets List ── */}
      {loading ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-sm">
          No tickets yet. Click "New Ticket" to report an issue.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-slate-600 transition"
              onClick={() => {
                setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)
                setComment('')
                setEditingComment(null)
              }}
            >
              {/* Summary row */}
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
                    {ticket.location} · {ticket.category}
                  </p>
                  {ticket.assigneeName && (
                    <p className="text-indigo-400 text-xs mt-0.5">
                      Assigned to: {ticket.assigneeName}
                    </p>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform ${selectedTicket?.id === ticket.id ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Expanded detail */}
              {selectedTicket?.id === ticket.id && (
                <div
                  className="mt-4 border-t border-slate-800 pt-4 space-y-4"
                  onClick={e => e.stopPropagation()}
                >
                  <p className="text-slate-300 text-sm">{ticket.description}</p>

                  {ticket.resolutionNote && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                      <p className="text-green-400 text-xs font-medium">Resolution Note</p>
                      <p className="text-green-300 text-sm mt-1">{ticket.resolutionNote}</p>
                    </div>
                  )}

                  {ticket.rejectionReason && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-xs font-medium">Rejection Reason</p>
                      <p className="text-red-300 text-sm mt-1">{ticket.rejectionReason}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {ticket.attachments?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-2">
                        Attachments ({ticket.attachments.length}/3)
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {ticket.attachments.map(a => (
                          <div key={a.id} className="relative">
                            <img
                              src={a.fileUrl}
                              alt={a.fileName}
                              className="w-24 h-24 object-cover rounded-lg border border-slate-700 cursor-pointer hover:scale-105 transition"
                              onClick={() => window.open(a.fileUrl, '_blank')}
                            />
                            {ticket.status === 'OPEN' && (
                              <button
                                onClick={e => { e.stopPropagation(); handleDeleteAttachment(a.id) }}
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-red-400 hover:text-red-300"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div>
                    <p className="text-slate-400 text-xs mb-2">
                      Comments ({ticket.comments?.length || 0})
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {ticket.comments?.map(c => (
                        <div key={c.id} className="bg-slate-800 rounded-xl p-3">
                          <div className="flex items-center justify-between">
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
                            <div className="flex gap-2 mt-2">
                              <input
                                className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-xl px-3 py-1 text-sm"
                                value={editingComment.content}
                                onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
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
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <p className="text-slate-300 text-sm mt-1">{c.content}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add comment */}
                    <div className="flex gap-2 mt-3">
                      <input
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleComment()}
                      />
                      <button
                        onClick={handleComment}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl transition"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Full standalone page — used by /user/tickets route
// ─────────────────────────────────────────────────────────────
export default function MyTicketsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <MyTicketsContent />
      </div>
    </div>
  )
}
