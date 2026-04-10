import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
  getMyTickets, createTicket, deleteTicket,
  addComment, editComment, deleteComment,
  addAttachment, deleteAttachment,
} from '../../api/tickets'
import { Wrench, Plus, ChevronDown, Send, Paperclip, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const TECH_IMG = '/src/assets/tech.jpg'

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'IT_HARDWARE', 'IT_SOFTWARE',
  'HVAC', 'FURNITURE', 'SECURITY', 'CLEANING', 'OTHER',
]
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const DELETABLE_STATUSES = ['OPEN']

const STATUS_COLORS = {
  OPEN:        'bg-blue-100 text-blue-700 border border-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 border border-amber-200',
  RESOLVED:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  CLOSED:      'bg-gray-100 text-gray-500 border border-gray-200',
  REJECTED:    'bg-red-100 text-red-700 border border-red-200',
}

const PRIORITY_COLORS = {
  LOW:      'bg-green-100 text-green-700 border border-green-200',
  MEDIUM:   'bg-amber-100 text-amber-700 border border-amber-200',
  HIGH:     'bg-orange-100 text-orange-700 border border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
}

const EMPTY_FORM = {
  title: '', description: '', location: '',
  category: 'IT_HARDWARE', priority: 'MEDIUM', contactDetails: '',
}
const EMPTY_ERRORS = { title: '', description: '', location: '', contactDetails: '' }

const TITLE_MAX       = 100
const DESCRIPTION_MAX = 1000
const LOCATION_MAX    = 100
const CONTACT_MAX     = 200
const COMMENT_MAX     = 500

function validateForm(form) {
  const errors = { ...EMPTY_ERRORS }
  let valid = true
  const title = form.title.trim()
  if (!title) { errors.title = 'Title is required.'; valid = false }
  else if (title.length < 5) { errors.title = 'Title must be at least 5 characters.'; valid = false }
  else if (title.length > TITLE_MAX) { errors.title = `Max ${TITLE_MAX} characters.`; valid = false }
  const description = form.description.trim()
  if (!description) { errors.description = 'Description is required.'; valid = false }
  else if (description.length < 10) { errors.description = 'At least 10 characters required.'; valid = false }
  else if (description.length > DESCRIPTION_MAX) { errors.description = `Max ${DESCRIPTION_MAX} characters.`; valid = false }
  const location = form.location.trim()
  if (!location) { errors.location = 'Location is required.'; valid = false }
  else if (location.length > LOCATION_MAX) { errors.location = `Max ${LOCATION_MAX} characters.`; valid = false }
  const contact = form.contactDetails.trim()
  if (contact.length > CONTACT_MAX) { errors.contactDetails = `Max ${CONTACT_MAX} characters.`; valid = false }
  return { errors, valid }
}

function FieldError({ msg }) {
  if (!msg) return null
  return <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{msg}</p>
}

function CharCount({ current, max }) {
  const near = current > max * 0.85
  const over  = current > max
  return (
    <span className="text-xs ml-auto" style={{ color: over ? '#dc2626' : near ? '#d97706' : '#8a9bb0' }}>
      {current}/{max}
    </span>
  )
}

function DeleteConfirmDialog({ ticket, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(30,58,95,0.5)', backdropFilter: 'blur(4px)' }} onClick={onCancel}>
      <div className="rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-full p-2 flex-shrink-0" style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}>
            <Trash2 size={18} style={{ color: '#dc2626' }} />
          </div>
          <h3 className="font-semibold" style={{ color: '#1e3a5f' }}>Delete ticket?</h3>
        </div>
        <p className="text-sm mb-1" style={{ color: '#5a6a7a' }}>You are about to delete:</p>
        <p className="text-sm font-semibold mb-2 truncate" style={{ color: '#1e3a5f' }}>"{ticket.title}"</p>
        <p className="text-xs mb-5" style={{ color: '#8a9bb0' }}>This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm transition-opacity hover:opacity-70" style={{ color: '#5a6a7a' }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm rounded-xl font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
            {loading ? 'Deleting…' : 'Delete ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function MyTicketsContent() {
  const { user } = useAuth()

  const [tickets, setTickets]                   = useState([])
  const [loading, setLoading]                   = useState(true)
  const [showForm, setShowForm]                 = useState(false)
  const [form, setForm]                         = useState(EMPTY_FORM)
  const [errors, setErrors]                     = useState(EMPTY_ERRORS)
  const [touched, setTouched]                   = useState({})
  const [submitting, setSubmitting]             = useState(false)
  const [attachmentFiles, setAttachmentFiles]   = useState([])
  const [selectedTicket, setSelectedTicket]     = useState(null)
  const [comment, setComment]                   = useState('')
  const [commentError, setCommentError]         = useState('')
  const [editingComment, setEditingComment]     = useState(null)
  const [editCommentError, setEditCommentError] = useState('')
  const [deleteTarget, setDeleteTarget]         = useState(null)
  const [deleting, setDeleting]                 = useState(false)

  const fetchTickets = async () => {
    try { setLoading(true); const res = await getMyTickets(user.userId); setTickets(res.data) }
    catch { toast.error('Failed to load tickets') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTickets() }, [])

  const handleDeleteTicket = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await deleteTicket(deleteTarget.id, user.userId)
      toast.success('Ticket deleted')
      if (selectedTicket?.id === deleteTarget.id) setSelectedTicket(null)
      setDeleteTarget(null)
      fetchTickets()
    } catch { toast.error('Failed to delete ticket') }
    finally { setDeleting(false) }
  }

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
      for (const file of attachmentFiles) { await addAttachment(newTicketId, file) }
      toast.success('Ticket created!')
      setShowForm(false); setForm(EMPTY_FORM); setErrors(EMPTY_ERRORS); setTouched({}); setAttachmentFiles([])
      fetchTickets()
    } catch { toast.error('Failed to create ticket') }
    finally { setSubmitting(false) }
  }

  const handleCancelForm = () => {
    setShowForm(false); setForm(EMPTY_FORM); setErrors(EMPTY_ERRORS); setTouched({}); setAttachmentFiles([])
  }

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files)
    if (picked.some(f => !f.type.startsWith('image/'))) { toast.error('Only image files allowed.'); e.target.value = ''; return }
    if (picked.some(f => f.size > 5 * 1024 * 1024)) { toast.error('Each image must be 5 MB or smaller.'); e.target.value = ''; return }
    setAttachmentFiles(prev => [...prev, ...picked].slice(0, 3))
    e.target.value = ''
  }

  const handleDeleteAttachment = async (id) => {
    try { await deleteAttachment(id, user.userId); toast.success('Attachment removed'); fetchTickets() }
    catch { toast.error('Failed to remove attachment') }
  }

  const validateComment = (v) => {
    if (!v.trim()) return 'Comment cannot be empty.'
    if (v.trim().length > COMMENT_MAX) return `Max ${COMMENT_MAX} characters.`
    return ''
  }

  const handleComment = async () => {
    const err = validateComment(comment)
    if (err) { setCommentError(err); return }
    if (!selectedTicket) return
    try {
      await addComment(selectedTicket.id, { content: comment, authorId: user.userId })
      toast.success('Comment added!'); setComment(''); setCommentError(''); fetchTickets()
    } catch { toast.error('Failed to add comment') }
  }

  const handleEditComment = async (commentId) => {
    const err = validateComment(editingComment?.content ?? '')
    if (err) { setEditCommentError(err); return }
    try {
      await editComment(commentId, { content: editingComment.content, authorId: user.userId })
      toast.success('Comment updated!'); setEditingComment(null); setEditCommentError(''); fetchTickets()
    } catch { toast.error('Failed to update comment') }
  }

  const handleDeleteComment = async (commentId) => {
    try { await deleteComment(commentId, user.userId); toast.success('Comment deleted'); fetchTickets() }
    catch { toast.error('Failed to delete comment') }
  }

  const inputStyle = (field) => ({
    backgroundColor: '#f8f9fb',
    color: '#1e3a5f',
    border: `1.5px solid ${errors[field] ? '#dc2626' : '#dde3ea'}`,
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    width: '100%',
    outline: 'none',
  })

  return (
    <div className="space-y-5">
      {deleteTarget && (
        <DeleteConfirmDialog
          ticket={deleteTarget}
          onConfirm={handleDeleteTicket}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2 text-sm" style={{ color: '#1e3a5f' }}>
          <Wrench size={16} style={{ color: '#c9a227' }} /> My Tickets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#1e3a5f', color: '#c9a227' }}
        >
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ backgroundColor: '#1e3a5f' }}>
            <p className="font-semibold text-white text-sm">Report an Issue</p>
            <button onClick={handleCancelForm} className="rounded-full p-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#c9a227' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} noValidate className="px-5 py-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold tracking-wider" style={{ color: '#1e3a5f' }}>TITLE *</label>
                <CharCount current={form.title.length} max={TITLE_MAX} />
              </div>
              <input
                style={inputStyle('title')}
                placeholder="e.g. Projector not working in Room 3"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
              />
              <FieldError msg={errors.title} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold tracking-wider" style={{ color: '#1e3a5f' }}>DESCRIPTION *</label>
                <CharCount current={form.description.length} max={DESCRIPTION_MAX} />
              </div>
              <textarea
                style={{ ...inputStyle('description'), resize: 'none' }}
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
                <label className="text-xs font-bold tracking-wider" style={{ color: '#1e3a5f' }}>LOCATION *</label>
                <CharCount current={form.location.length} max={LOCATION_MAX} />
              </div>
              <input
                style={inputStyle('location')}
                placeholder="e.g. Lab 3, Floor 2"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                onBlur={() => handleBlur('location')}
              />
              <FieldError msg={errors.location} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 tracking-wider" style={{ color: '#1e3a5f' }}>CATEGORY</label>
                <select style={inputStyle('category')} value={form.category}
                  onChange={e => handleChange('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 tracking-wider" style={{ color: '#1e3a5f' }}>PRIORITY</label>
                <select style={inputStyle('priority')} value={form.priority}
                  onChange={e => handleChange('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold tracking-wider" style={{ color: '#1e3a5f' }}>CONTACT (OPTIONAL)</label>
                <CharCount current={form.contactDetails.length} max={CONTACT_MAX} />
              </div>
              <input
                style={inputStyle('contactDetails')}
                placeholder="e.g. ext. 1234 or Slack @handle"
                value={form.contactDetails}
                onChange={e => handleChange('contactDetails', e.target.value)}
                onBlur={() => handleBlur('contactDetails')}
              />
              <FieldError msg={errors.contactDetails} />
            </div>

            <div>
              <p className="text-xs font-bold tracking-wider mb-1" style={{ color: '#1e3a5f' }}>
                ATTACHMENTS{' '}
                <span style={{ color: '#8a9bb0', fontWeight: 400 }}>— up to 3 images, 5 MB each</span>
                {attachmentFiles.length > 0 && (
                  <span style={{ color: '#c9a227' }}> ({attachmentFiles.length}/3 selected)</span>
                )}
              </p>
              {attachmentFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {attachmentFiles.map((f, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(f)} alt={f.name} className="w-20 h-20 object-cover rounded-xl" style={{ border: '1px solid #dde3ea' }} />
                      <button type="button" onClick={() => setAttachmentFiles(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 rounded-full p-0.5" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#dc2626' }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {attachmentFiles.length < 3 && (
                <label className="flex items-center gap-2 cursor-pointer text-sm rounded-xl px-4 py-2.5 transition-colors hover:bg-gray-50"
                  style={{ backgroundColor: '#f8f9fb', border: '1.5px dashed #dde3ea', color: '#5a6a7a' }}>
                  <Paperclip size={14} /> Choose image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={handleCancelForm} className="px-4 py-2 text-sm transition-opacity hover:opacity-70" style={{ color: '#5a6a7a' }}>
                Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="px-5 py-2 text-sm font-bold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#c9a227', color: '#1e3a5f' }}
              >
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: '#8a9bb0' }}>
          No tickets yet. Click "New Ticket" to report an issue.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const isOpen = selectedTicket?.id === ticket.id
            return (
              <div
                key={ticket.id}
                className="rounded-2xl cursor-pointer transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${isOpen ? '#c9a227' : '#dde3ea'}`,
                }}
                onClick={() => {
                  setSelectedTicket(isOpen ? null : ticket)
                  setComment(''); setCommentError(''); setEditingComment(null); setEditCommentError('')
                }}
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: '#1e3a5f' }}>{ticket.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#5a6a7a' }}>{ticket.location} · {ticket.category}</p>
                    {ticket.assigneeName && (
                      <p className="text-xs mt-0.5" style={{ color: '#1e3a5f' }}>Assigned to: {ticket.assigneeName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {DELETABLE_STATUSES.includes(ticket.status) && (
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteTarget(ticket) }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#8a9bb0' }}
                        title="Delete ticket"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <ChevronDown
                      size={15}
                      className={`transition-transform mt-0.5 ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: '#8a9bb0' }}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div
                    className="px-4 pb-4 space-y-4"
                    style={{ borderTop: '1px solid #f0f2f5' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-sm pt-4" style={{ color: '#374151' }}>{ticket.description}</p>
                    {ticket.resolutionNote && (
                      <div className="rounded-xl p-3" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>Resolution Note</p>
                        <p className="text-sm mt-1" style={{ color: '#15803d' }}>{ticket.resolutionNote}</p>
                      </div>
                    )}
                    {ticket.rejectionReason && (
                      <div className="rounded-xl p-3" style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca' }}>
                        <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>Rejection Reason</p>
                        <p className="text-sm mt-1" style={{ color: '#b91c1c' }}>{ticket.rejectionReason}</p>
                      </div>
                    )}
                    {ticket.attachments?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: '#5a6a7a' }}>
                          Attachments ({ticket.attachments.length}/3)
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {ticket.attachments.map(a => (
                            <div key={a.id} className="relative">
                              <img src={a.fileUrl} alt={a.fileName}
                                className="w-20 h-20 object-cover rounded-xl cursor-pointer hover:scale-105 transition-transform"
                                style={{ border: '1px solid #dde3ea' }}
                                onClick={() => window.open(a.fileUrl, '_blank')} />
                              {ticket.status === 'OPEN' && (
                                <button onClick={e => { e.stopPropagation(); handleDeleteAttachment(a.id) }}
                                  className="absolute top-1 right-1 rounded-full p-0.5"
                                  style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#dc2626' }}>
                                  <X size={11} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#5a6a7a' }}>
                        Comments ({ticket.comments?.length || 0})
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {ticket.comments?.map(c => (
                          <div key={c.id} className="rounded-xl p-3" style={{ backgroundColor: '#f8f9fb', border: '1px solid #dde3ea' }}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold" style={{ color: '#1e3a5f' }}>{c.authorName}</p>
                              {c.authorId === user.userId && (
                                <div className="flex gap-3">
                                  <button onClick={() => { setEditingComment({ id: c.id, content: c.content }); setEditCommentError('') }}
                                    className="text-xs hover:underline" style={{ color: '#5a6a7a' }}>Edit</button>
                                  <button onClick={() => handleDeleteComment(c.id)}
                                    className="text-xs hover:underline" style={{ color: '#dc2626' }}>Delete</button>
                                </div>
                              )}
                            </div>
                            {editingComment?.id === c.id ? (
                              <div className="mt-1 space-y-1">
                                <div className="flex gap-2">
                                  <input
                                    className="flex-1 rounded-xl px-3 py-1 text-sm outline-none"
                                    style={{ backgroundColor: '#ffffff', border: `1.5px solid ${editCommentError ? '#dc2626' : '#c9a227'}`, color: '#1e3a5f' }}
                                    value={editingComment.content}
                                    onChange={e => { setEditingComment({ ...editingComment, content: e.target.value }); if (editCommentError) setEditCommentError(validateComment(e.target.value)) }}
                                    onKeyDown={e => e.key === 'Enter' && handleEditComment(c.id)}
                                  />
                                  <button onClick={() => handleEditComment(c.id)}
                                    className="px-3 py-1 rounded-xl text-sm font-semibold text-white"
                                    style={{ backgroundColor: '#1e3a5f' }}>Save</button>
                                  <button onClick={() => { setEditingComment(null); setEditCommentError('') }}
                                    className="px-2 text-sm" style={{ color: '#8a9bb0' }}>
                                    <X size={14} />
                                  </button>
                                </div>
                                <FieldError msg={editCommentError} />
                              </div>
                            ) : (
                              <p className="text-sm" style={{ color: '#374151' }}>{c.content}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          {commentError ? <span style={{ color: '#dc2626', fontSize: 12 }}>{commentError}</span> : <span />}
                          <CharCount current={comment.length} max={COMMENT_MAX} />
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: '#f8f9fb', border: `1.5px solid ${commentError ? '#dc2626' : '#dde3ea'}`, color: '#1e3a5f' }}
                            placeholder="Add a comment…"
                            value={comment}
                            onChange={e => { setComment(e.target.value); if (commentError) setCommentError(validateComment(e.target.value)) }}
                            onKeyDown={e => e.key === 'Enter' && handleComment()}
                          />
                          <button
                            onClick={handleComment}
                            className="px-3 py-2 rounded-xl transition-opacity hover:opacity-90"
                            style={{ backgroundColor: '#1e3a5f', color: '#c9a227' }}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {DELETABLE_STATUSES.includes(ticket.status) && (
                      <div className="pt-2" style={{ borderTop: '1px solid #f0f2f5' }}>
                        <button onClick={() => setDeleteTarget(ticket)}
                          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
                          style={{ color: '#dc2626' }}>
                          <Trash2 size={12} /> Delete this ticket
                        </button>
                      </div>
                    )}
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

export default function MyTicketsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f5' }}>
      <Navbar />

      <div className="relative overflow-hidden" style={{ height: 240, marginTop: 64 }}>
        <img
          src={TECH_IMG}
          alt="Technical Support"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%', filter: 'brightness(0.45)' }}
          onError={e => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2a1f 100%)', zIndex: -1 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(30,58,95,0.92) 0%, rgba(30,58,95,0.3) 100%)' }} />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: '#c9a227' }}>CAMPUS MAINTENANCE & SUPPORT</p>
          <p className="text-4xl font-bold text-white mb-2">My Tickets</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Report and track maintenance issues across campus</p>
        </div>
        <div className="absolute top-0 right-0" style={{ width: 200, height: 200, background: 'linear-gradient(225deg, rgba(201,162,39,0.2) 0%, transparent 60%)' }} />
      </div>

      {/* CHANGED: max-w-3xl -> max-w-7xl for full window expansion */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div
          className="rounded-2xl p-6 shadow-sm"
          style={{ backgroundColor: '#ffffff', border: '1px solid #dde3ea' }}
        >
          <MyTicketsContent />
        </div>
      </div>
    </div>
  )
}