import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  MessageSquare, 
  User as UserIcon,
  Loader2,
  Minimize2
} from 'lucide-react';
import api from '../services/api';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (isOpen && !session) {
      fetchWidgetSession();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchWidgetSession = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/chat/sensai/widget');
      setSession(data);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error fetching widget session', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || !session) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post(`/chat/${session._id}/message`, { message: currentInput });
      const assistantMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message', err);
      // Keep input cleared on error as requested, but log the error
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass flex h-[500px] w-[350px] flex-col overflow-hidden shadow-2xl md:w-[400px]"
          >
            {/* Widget Header */}
            <header className="flex items-center justify-between border-b border-glass bg-sensai-primary/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-sensai-primary p-2 text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sensai Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-sensai-muted hover:text-white transition-colors"
                title="Minimize"
              >
                <Minimize2 size={18} />
              </button>
            </header>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin text-sensai-primary" size={24} />
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div 
                    key={i}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs
                      ${msg.role === 'user' ? 'bg-sensai-secondary/10 text-sensai-secondary' : 'bg-sensai-primary/10 text-sensai-primary'}`}>
                      {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                      ${msg.role === 'user' ? 'bg-sensai-secondary text-white' : 'bg-white/5 text-slate-100'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sending && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sensai-primary/10 text-sensai-primary">
                    <Bot size={14} />
                  </div>
                  <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="h-1 w-1 bg-sensai-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1 w-1 bg-sensai-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1 w-1 bg-sensai-primary rounded-full animate-bounce" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-glass p-4">
              <div className="relative flex items-center">
                <input 
                  className="w-full rounded-xl bg-white/5 border border-glass px-4 py-3 pr-12 text-sm text-white outline-none focus:border-sensai-primary/30 transition-colors"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="submit" 
                  disabled={sending || !input.trim()}
                  className="absolute right-2 p-2 text-sensai-primary disabled:opacity-50 disabled:cursor-not-allowed hover:text-sensai-primary/80 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300
          ${isOpen ? 'bg-red-500 text-white' : 'bg-sensai-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.5)]'}`}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default ChatWidget;
