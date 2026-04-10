import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader, GraduationCap } from 'lucide-react'

const SYSTEM_PROMPT = `You are SmartCampus Assistant, a helpful chatbot for the Smart Campus Operations Hub web system at SiverWood university.

You help students and staff with:

ABOUT THE SYSTEM:
- SmartCampus is a web platform to manage facility bookings and maintenance tickets
- Users can register with email/password or login with Google OAuth
- There are three roles: USER, ADMIN, and TECHNICIAN

BOOKING SYSTEM:
- Users can book: Lecture Halls (101,102,201,202,203,301,302,303,405,501), Labs (402,403,404), Meeting Rooms (101,102,203), Equipment (Projector-01, Projector-02, Camera-01)
- To book: Login → Dashboard → Click "Book a Resource" → Fill the form
- Bookings go through: PENDING → APPROVED or REJECTED
- Approved bookings can be CANCELLED
- You cannot book a resource that is already booked at the same time (conflict checking)
- You will receive a notification when your booking is approved or rejected

REGISTRATION & LOGIN:
- Register at /register with your name, email and password
- Or use Google Sign-In for quick access
- After login, USER role goes to /user/dashboard
- ADMIN role goes to /admin/dashboard

NOTIFICATIONS:
- You get notifications for booking approvals, rejections, and ticket updates
- Check notifications by clicking the bell icon in the navbar

MAINTENANCE TICKETS:
- Report facility issues by clicking "Report an Issue" on your dashboard
- Tickets go through: OPEN → IN_PROGRESS → RESOLVED → CLOSED
- You can attach images as evidence

NAVIGATION:
- Dashboard: Overview of your bookings and tickets
- Bookings: View and manage all your bookings
- My Tickets: View and manage your maintenance tickets
- Notifications: Your latest updates
- Profile: Your account settings

Always be helpful, friendly and concise. If you don't know something specific, suggest the user contact campus administration.`

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! 👋 I\'m the SilverWood Campus Assistant. I can help you with bookings, tickets, and anything about this platform. What can I help you with?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.slice(-10)
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error.message)
      setMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment. 🙏'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
        .sw-chat * { font-family: 'Lato', sans-serif; }
        .sw-chat-messages::-webkit-scrollbar { width: 4px; }
        .sw-chat-messages::-webkit-scrollbar-track { background: transparent; }
        .sw-chat-messages::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.2); border-radius: 4px; }
        .sw-fab { transition: transform 0.2s, box-shadow 0.2s; }
        .sw-fab:hover { transform: scale(1.08); }
        .sw-chat-window {
          animation: chatSlideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="sw-chat sw-chat-window fixed bottom-24 right-6 w-80 sm:w-96 flex flex-col z-50 overflow-hidden"
          style={{
            height: 500,
            background: '#0d1829',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 20,
            boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,168,76,0.08)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1B2A4A 0%, #162238 100%)',
              borderBottom: '1px solid rgba(201,168,76,0.2)',
              padding: '14px 16px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Gold avatar */}
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: 'linear-gradient(135deg, #C9A84C, #e8c96a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(201,168,76,0.35)',
                  flexShrink: 0,
                }}>
                  <GraduationCap size={20} color="#1B2A4A" />
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                    Campus Assistant
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>SilverWood University</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.07)',
                  border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="sw-chat-messages"
            style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8,
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? '#C9A84C' : '#1B2A4A',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(201,168,76,0.3)',
                }}>
                  {msg.role === 'user'
                    ? <User size={13} color="#1B2A4A" />
                    : <Bot size={13} color="#C9A84C" />
                  }
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '75%', padding: '9px 13px', fontSize: 13, lineHeight: 1.55,
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #C9A84C, #d4b05e)'
                    : 'rgba(255,255,255,0.06)',
                  color: msg.role === 'user' ? '#1B2A4A' : 'rgba(255,255,255,0.85)',
                  fontWeight: msg.role === 'user' ? 600 : 400,
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#1B2A4A', border: '1px solid rgba(201,168,76,0.3)',
                }}>
                  <Bot size={13} color="#C9A84C" />
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '4px 16px 16px 16px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <Loader size={15} color="rgba(201,168,76,0.7)" className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(201,168,76,0.12)',
            background: 'rgba(27,42,74,0.4)',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 12, padding: '8px 12px',
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'rgba(255,255,255,0.85)', fontSize: 13,
                  fontFamily: 'Lato, sans-serif',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                style={{
                  background: input.trim() && !loading ? '#C9A84C' : 'transparent',
                  border: 'none', borderRadius: 8, padding: 6, cursor: input.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <Send size={15} color={input.trim() && !loading ? '#1B2A4A' : 'rgba(255,255,255,0.2)'} />
              </button>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 10, textAlign: 'center', marginTop: 6, letterSpacing: '0.05em' }}>
              SILVERWOOD UNIVERSITY · SMART CAMPUS HUB
            </p>
          </div>
        </div>
      )}

      {/* ── Floating Button ───────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sw-fab"
        title="Campus Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: isOpen
            ? '#1B2A4A'
            : 'linear-gradient(135deg, #C9A84C 0%, #e8c96a 100%)',
          boxShadow: isOpen
            ? '0 4px 20px rgba(27,42,74,0.4)'
            : '0 4px 20px rgba(201,168,76,0.5), 0 0 0 4px rgba(201,168,76,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 50,
        }}
      >
        {isOpen
          ? <X size={22} color="#C9A84C" />
          : <MessageCircle size={22} color="#1B2A4A" />
        }
      </button>
    </>
  )
}
