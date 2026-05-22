import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  ChevronLeft,
  Loader2,
  FileBadge,
  MessageSquare
} from 'lucide-react';

const Chat = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      fetchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/chat/${sessionId}`);
      setSession(data);
      setMessages(data.messages);
    } catch (err) {
      console.error('Error fetching chat session', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      const { data } = await api.post(`/chat/${sessionId}/message`, { message: input });
      const assistantMessage = { role: 'assistant', content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const generatePlan = async () => {
    try {
      const { data } = await api.post(`/chat/${sessionId}/generate-plan`);
      alert('Structured Plan Generated! Check your dashboard.');
    } catch (err) {
      console.error('Error generating plan', err);
    }
  };

  if (loading) return <div className="flex justify-center py-40"><Loader2 className="animate-spin text-sensai-primary" size={48} /></div>;

  return (
    <div className="container mx-auto flex h-[calc(100vh-140px)] flex-col gap-4 px-6 py-6 lg:h-[calc(100vh-120px)] lg:py-8">
      {/* Chat Header */}
      <header className="glass flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="border-none bg-transparent text-sensai-muted transition-colors hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sensai-primary/10 p-2 text-sensai-primary">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white md:text-base">{session?.startupName || 'Sensai Advisor'}</h3>
              <p className="text-[0.65rem] font-bold tracking-widest text-emerald-400 uppercase">Sensai AI</p>
            </div>
          </div>
        </div>
        <button onClick={generatePlan} className="glass flex items-center gap-2 border-none px-4 py-2 text-xs font-bold text-white transition-opacity hover:opacity-80 md:text-sm">
           <FileBadge size={18} className="text-sensai-secondary" /> 
           <span className="hidden md:block">Generate Plan</span>
        </button>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="glass flex flex-1 flex-col gap-8 overflow-y-auto p-6 md:p-8"
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex max-w-[85%] gap-4 md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse self-end' : 'flex-row self-start'}`}
          >
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl 
              ${msg.role === 'user' ? 'bg-sensai-secondary/10 text-sensai-secondary' : 'bg-sensai-primary/10 text-sensai-primary'}`}>
              {msg.role === 'user' ? <UserIcon size={22} /> : <Bot size={22} />}
            </div>
            <div className={`rounded-3xl p-5 text-sm leading-relaxed md:text-base 
              ${msg.role === 'user' ? 'bg-sensai-secondary shadow-[0_4px_15px_rgba(79,70,229,0.2)] text-white' : 'bg-white/5 text-slate-100'}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {sending && (
          <div className="flex gap-4 self-start">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sensai-primary/10 text-sensai-primary">
               <Bot size={22} />
             </div>
             <div className="glass flex items-center gap-3 rounded-3xl p-4 px-6">
                <Loader2 className="animate-spin text-sensai-primary" size={16} />
                <span className="text-sm font-medium text-sensai-muted">Sensai is thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="flex gap-4 mt-2">
        <input 
          className="glass flex-1 border border-glass bg-transparent px-6 py-4 text-sm text-white outline-none focus:border-sensai-primary md:text-base"
          placeholder="Type your message to Sensai..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary w-20 md:w-28" disabled={sending}>
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
