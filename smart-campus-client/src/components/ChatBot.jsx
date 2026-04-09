import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader } from 'lucide-react'

// This is the "brain" of the chatbot
// It tells OpenAI who it is and what it knows about your campus
const SYSTEM_PROMPT = `You are SmartCampus Assistant, a helpful chatbot for the Smart Campus Operations Hub web system at SLIIT university.

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
      content: 'Hi! 👋 I\'m the SmartCampus Assistant. I can help you with bookings, tickets, and anything about this platform. What can I help you with?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message to chat
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
          model: 'gpt-3.5-turbo', // cheap and fast, perfect for a chatbot
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            // Send last 10 messages for context (not all - saves API cost)
            ...newMessages.slice(-10)
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const assistantMessage = data.choices[0].message.content

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage
      }])

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment. 🙏'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Send message when user presses Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">SmartCampus Assistant</p>
                <p className="text-indigo-200 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {msg.role === 'user'
                    ? <User size={14} />
                    : <Bot size={14} />
                  }
                </div>

                {/* Message bubble */}
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                  <Bot size={14} className="text-slate-300" />
                </div>
                <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <Loader size={16} className="text-slate-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800">
            <div className="flex gap-2 items-center bg-slate-800 rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 transition-colors flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-slate-700 text-xs text-center mt-1.5">Powered by OpenAI</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center transition-all hover:scale-110 z-50"
        title="SmartCampus Assistant"
      >
        {isOpen
          ? <X size={24} />
          : <MessageCircle size={24} />
        }
      </button>
    </>
  )
}