import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
  getMyTickets,
  createTicket,
  deleteTicket,
  addComment,
  editComment,
  deleteComment,
  addAttachment,
  deleteAttachment,
} from '../../api/tickets'
import { Wrench, Plus, ChevronDown, Send, Paperclip, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'IT_HARDWARE', 'IT_SOFTWARE',
  'HVAC', 'FURNITURE', 'SECURITY', 'CLEANING', 'OTHER',
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

// Only OPEN tickets can be deleted by the user
const DELETABLE_STATUSES = ['OPEN']

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

const EMPTY_ERRORS = {
  title: '',
  description: '',
  location: '',
  contactDetails: '',
}

const TITLE_MAX       = 100
const DESCRIPTION_MAX = 1000
const LOCATION_MAX    = 100
const CONTACT_MAX     = 200
const COMMENT_MAX     = 500

function validateForm(form) {
  const errors = { ...EMPTY_ERRORS }
  let valid = true

  const title = form.title.trim()
  if (!title) {
    errors.title = 'Title is required.'
    valid = false
  } else if (title.length < 5) {
    errors.title = 'Title must be at least 5 characters.'
    valid = false
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`
    valid = false
  }

  const description = form.description.trim()
  if (!description) {
    errors.description = 'Description is required.'
    valid = false
  } else if (description.length < 10) {
    errors.description = 'Please provide at least 10 characters.'
    valid = false
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`
    valid = false
  }

  const location = form.location.trim()
  if (!location) {
    errors.location = 'Location is required.'
    valid = false
  } else if (location.length > LOCATION_MAX) {
    errors.location = `Location must be ${LOCATION_MAX} characters or fewer.`
    valid = false
  }

  const contact = form.contactDetails.trim()
  if (contact.length > CONTACT_MAX) {
    errors.contactDetails = `Contact details must be ${CONTACT_MAX} characters or fewer.`
    valid = false
  }

  return { errors, valid }
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="text-red-400 text-xs mt-1">{msg}</p>
}

function CharCount({ current, max }) {
  const near = current > max * 0.85
  const over  = current > max
  return (
    <span className={`text-xs ml-auto ${over ? 'text-red-400' : near ? 'text-amber-400' : 'text-slate-500'}`}>
      {current}/{max}
    </span>
  )
}

// ── Confirmation dialog ───────────────────────────────────────
function DeleteConfirmDialog({ ticket, onConfirm, onCancel, loading }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-red-500/20 rounded-full p-2 shrink-0">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <h3 className="text-white font-medium">Delete ticket?</h3>
        </div>
        <p className="text-slate-400 text-sm mb-1">You are about to delete:</p>
        <p className="text-white text-sm font-medium mb-2 truncate">"{ticket.title}"</p>
        <p className="text-slate-500 text-xs mb-5">This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
          >
            {loading ? 'Deleting…' : 'Delete ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
export function MyTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [showForm, setShowForm]             = useState(false)
  const [form, setForm]                     = useState(EMPTY_FORM)
  const [errors, setErrors]                 = useState(EMPTY_ERRORS)
  const [touched, setTouched]               = useState({})
  const [submitting, setSubmitting]         = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comment, setComment]               = useState('')
  const [commentError, setCommentError]     = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [editCommentError, setEditCommentError] = useState('')
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [deleting, setDeleting]             = useState(false)

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

  // ── Delete ticket ─────────────────────────────────────────────
  const handleDeleteTicket = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await deleteTicket(deleteTarget.id, user.userId)
      toast.success('Ticket deleted')
      if (selectedTicket?.id === deleteTarget.id) setSelectedTicket(null)
      setDeleteTarget(null)
      fetchTickets()
    } catch {
      toast.error('Failed to delete ticket')
    } finally {
      setDeleting(false)
    }
  }

  // ── Validation ────────────────────────────────────────────────
  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value }
    setForm(updated)
    if (touched[field]) {
      const { errors: newErrors } = validateForm(updated)
      setErrors(prev => ({ ...prev, [field]: newErrors[field] }))
    }
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const { errors: newErrors } = validateForm(form)
    setErrors(prev => ({ ...prev, [field]: newErrors[field] }))
  }

  // ── Create ticket ─────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    setTouched({ title: true, description: true, location: true, contactDetails: true })
    const { errors: validationErrors, valid } = validateForm(form)
    setErrors(validationErrors)
    if (!valid) return
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
      setErrors(EMPTY_ERRORS)
      setTouched({})
      setAttachmentFiles([])
      fetchTickets()
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setForm(EMPTY_FORM)
    setErrors(EMPTY_ERRORS)
    setTouched({})
    setAttachmentFiles([])
  }

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files)
    const invalid = picked.filter(f => !f.type.startsWith('image/'))
    if (invalid.length > 0) {
      toast.error('Only image files are allowed.')
      e.target.value = ''
      return
    }
    const tooBig = picked.filter(f => f.size > 5 * 1024 * 1024)
    if (tooBig.length > 0) {
      toast.error('Each image must be 5 MB or smaller.')
      e.target.value = ''
      return
    }
    setAttachmentFiles(prev => [...prev, ...picked].slice(0, 3))
    e.target.value = ''
  }

  const removeAttachmentFile = (index) =>
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index))

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
  const validateComment = (value) => {
    if (!value.trim()) return 'Comment cannot be empty.'
    if (value.trim().length > COMMENT_MAX) return `Comment must be ${COMMENT_MAX} characters or fewer.`
    return ''
  }

  const handleComment = async () => {
    const err = validateComment(comment)
    if (err) { setCommentError(err); return }
    if (!selectedTicket) return
    try {
      await addComment(selectedTicket.id, { content: comment, authorId: user.userId })
      toast.success('Comment added!')
      setComment('')
      setCommentError('')
      fetchTickets()
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleEditComment = async (commentId) => {
    const err = validateComment(editingComment?.content ?? '')
    if (err) { setEditCommentError(err); return }
    try {
      await editComment(commentId, { content: editingComment.content, authorId: user.userId })
      toast.success('Comment updated!')
      setEditingComment(null)
      setEditCommentError('')
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
    <div className="space-y-6">

      {deleteTarget && (
        <DeleteConfirmDialog
          ticket={deleteTarget}
          onConfirm={handleDeleteTicket}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

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
          <form onSubmit={handleCreate} noValidate className="space-y-3">

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 text-xs">Title *</label>
                <CharCount current={form.title.length} max={TITLE_MAX} />
              </div>
              <input
                className={`w-full bg-slate-900 border text-white rounded-xl px-4 py-2 text-sm transition ${errors.title ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="e.g. Projector not working in Room 3"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
              />
              <FieldError msg={errors.title} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 text-xs">Description *</label>
                <CharCount current={form.description.length} max={DESCRIPTION_MAX} />
              </div>
              <textarea
                className={`w-full bg-slate-900 border text-white rounded-xl px-4 py-2 text-sm transition ${errors.description ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="Describe the issue in detail…"
                rows={3}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}
              />
              <FieldError msg={errors.description} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 text-xs">Location *</label>
                <CharCount current={form.location.length} max={LOCATION_MAX} />
              </div>
              <input
                className={`w-full bg-slate-900 border text-white rounded-xl px-4 py-2 text-sm transition ${errors.location ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="e.g. Lab 3, Floor 2"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                onBlur={() => handleBlur('location')}
              />
              <FieldError msg={errors.location} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Category</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
                  value={form.category}
                  onChange={e => handleChange('category', e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Priority</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm"
                  value={form.priority}
                  onChange={e => handleChange('priority', e.target.value)}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 text-xs">Contact details (optional)</label>
                <CharCount current={form.contactDetails.length} max={CONTACT_MAX} />
              </div>
              <input
                className={`w-full bg-slate-900 border text-white rounded-xl px-4 py-2 text-sm transition ${errors.contactDetails ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="e.g. ext. 1234 or slack @handle"
                value={form.contactDetails}
                onChange={e => handleChange('contactDetails', e.target.value)}
                onBlur={() => handleBlur('contactDetails')}
              />
              <FieldError msg={errors.contactDetails} />
            </div>

            <div>
              <p className="text-slate-400 text-xs mb-1">
                Attachments — up to 3 images, 5 MB each
                {attachmentFiles.length > 0 && (
                  <span className="text-amber-400 ml-1">({attachmentFiles.length}/3 selected)</span>
                )}
              </p>
              {attachmentFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {attachmentFiles.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-24 h-24 object-cover rounded-lg border border-slate-700" />
                      <button type="button" onClick={() => removeAttachmentFile(i)} className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-red-400 hover:text-red-300">
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
              <button type="button" onClick={handleCancelForm} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-xl transition"
              >
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tickets List ── */}
      {loading ? (
        <div className="text-center py-8 text-slate-500 text-sm">Loading…</div>
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
                setCommentError('')
                setEditingComment(null)
                setEditCommentError('')
              }}
            >
              {/* Summary row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{ticket.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}>
                      {ticket.status}
                    </span>
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{ticket.location} · {ticket.category}</p>
                  {ticket.assigneeName && (
                    <p className="text-indigo-400 text-xs mt-0.5">Assigned to: {ticket.assigneeName}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Trash icon — only for OPEN tickets */}
                  {DELETABLE_STATUSES.includes(ticket.status) && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(ticket) }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete ticket"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform ${selectedTicket?.id === ticket.id ? 'rotate-180' : ''}`}
                  />
                </div>
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

                  {ticket.attachments?.length > 0 && (
                    <div>
                      <p className="text-slate-400 text-xs mb-2">Attachments ({ticket.attachments.length}/3)</p>
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

                  <div>
                    <p className="text-slate-400 text-xs mb-2">Comments ({ticket.comments?.length || 0})</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {ticket.comments?.map(c => (
                        <div key={c.id} className="bg-slate-800 rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-indigo-400 text-xs font-medium">{c.authorName}</p>
                            {c.authorId === user.userId && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingComment({ id: c.id, content: c.content }); setEditCommentError('') }}
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
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500 text-xs">Edit comment</span>
                                <CharCount current={editingComment.content.length} max={COMMENT_MAX} />
                              </div>
                              <div className="flex gap-2">
                                <input
                                  className={`flex-1 bg-slate-900 border text-white rounded-xl px-3 py-1 text-sm ${editCommentError ? 'border-red-500' : 'border-slate-600'}`}
                                  value={editingComment.content}
                                  onChange={e => {
                                    setEditingComment({ ...editingComment, content: e.target.value })
                                    if (editCommentError) setEditCommentError(validateComment(e.target.value))
                                  }}
                                  onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                />
                                <button onClick={() => handleEditComment(c.id)} className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-sm">Save</button>
                                <button onClick={() => { setEditingComment(null); setEditCommentError('') }} className="text-slate-400 px-2 text-sm">Cancel</button>
                              </div>
                              <FieldError msg={editCommentError} />
                            </div>
                          ) : (
                            <p className="text-slate-300 text-sm mt-1">{c.content}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            {commentError ? <span className="text-red-400 text-xs">{commentError}</span> : <span />}
                            <CharCount current={comment.length} max={COMMENT_MAX} />
                          </div>
                          <input
                            className={`w-full bg-slate-800 border text-white rounded-xl px-3 py-2 text-sm ${commentError ? 'border-red-500' : 'border-slate-700'}`}
                            placeholder="Add a comment…"
                            value={comment}
                            onChange={e => {
                              setComment(e.target.value)
                              if (commentError) setCommentError(validateComment(e.target.value))
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                          />
                        </div>
                        <button onClick={handleComment} className="self-end bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl transition">
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete link at bottom of expanded view */}
                  {DELETABLE_STATUSES.includes(ticket.status) && (
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setDeleteTarget(ticket)}
                        className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs transition"
                      >
                        <Trash2 size={12} />
                        Delete this ticket
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
