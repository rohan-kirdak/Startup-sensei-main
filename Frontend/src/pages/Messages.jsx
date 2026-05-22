import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  User, 
  MessageSquare, 
  MoreVertical,
  ChevronLeft,
  Loader2,
  Clock,
  Pencil,
  Check,
  X
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();

  const renderRoleBadge = (role) => {
    if (!role) return null;
    const roleLower = role.toLowerCase();
    let badgeStyle = "";
    let displayRole = "";
    
    if (roleLower === 'founder') {
      badgeStyle = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      displayRole = "Founder";
    } else if (roleLower === 'expert' || roleLower === 'mentor') {
      badgeStyle = "bg-teal-500/10 text-teal-400 border-teal-500/20";
      displayRole = "Expert";
    } else if (roleLower === 'investor') {
      badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/20";
      displayRole = "Investor";
    } else {
      badgeStyle = "bg-slate-500/10 text-slate-400 border-slate-500/20";
      displayRole = role.charAt(0).toUpperCase() + role.slice(1);
    }

    return (
      <span className={`badge text-[9px] py-0.5 px-2 font-bold rounded uppercase tracking-wider border ${badgeStyle} ml-1.5`}>
        {displayRole}
      </span>
    );
  };
  const socket = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setMessages([]);
      setActiveConversation(null);
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket listeners for real-time messages, presence, and read receipts
  useEffect(() => {
    if (socket && user?._id) {
      // Register current user on socket connection
      socket.emit('register_user', user._id);
      
      // Request initial list of online users
      socket.emit('request_online_users');

      // Listen for updates to the online users list
      socket.on('update_online_users', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off('update_online_users');
      };
    }
  }, [socket, user?._id]);

  useEffect(() => {
    if (socket) {
      socket.on('receive_message', (data) => {
        // Only add if it's from the other user (sender will update optimistically/immediately)
        if (conversationId && data.sessionId === conversationId && data.senderId !== user._id) {
          setMessages(prev => [...prev, {
            _id: data.messageId || Date.now(),
            conversationId: data.sessionId,
            senderId: { _id: data.senderId },
            text: data.message,
            readBy: [user._id], // Mark as read since we are viewing it
            createdAt: new Date()
          }]);

          // Since we are viewing it in active thread, mark it read on backend and emit messages_read
          api.put(`/messages/read/${conversationId}`).catch(err => console.error(err));
          socket.emit('messages_read', { sessionId: conversationId, userId: user._id });
        }
        fetchConversations();
      });

      socket.on('message_edited', (data) => {
        if (conversationId && data.sessionId === conversationId) {
          setMessages(prev => prev.map(msg => 
            msg._id === data.messageId ? { ...msg, text: data.message, isEdited: true } : msg
          ));
        }
        fetchConversations();
      });

      socket.on('messages_read', (data) => {
        if (conversationId && data.sessionId === conversationId) {
          // Add reading user's ID to readBy for all messages that are not sent by them
          setMessages(prev => prev.map(msg => {
            const isMe = (msg.senderId._id || msg.senderId) === user._id;
            if (isMe) {
              const currentReadBy = msg.readBy || [];
              if (!currentReadBy.includes(data.userId)) {
                return { ...msg, readBy: [...currentReadBy, data.userId] };
              }
            }
            return msg;
          }));
        }
      });

      return () => {
        socket.off('receive_message');
        socket.off('message_edited');
        socket.off('messages_read');
      };
    }
  }, [socket, conversationId, user?._id]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
      
      if (conversationId) {
        const current = data.find(c => c._id === conversationId);
        if (current) setActiveConversation(current);
      }
    } catch (err) {
      console.error('Error fetching conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id) => {
    setMsgLoading(true);
    try {
      const { data } = await api.get(`/messages/history/${id}`);
      setMessages(data);
      
      // Join socket room for this conversation
      if (socket) {
        socket.emit('join_session', id);
      }

      // Mark messages as read in backend
      await api.put(`/messages/read/${id}`);

      // Emit read receipt via socket
      if (socket) {
        socket.emit('messages_read', { sessionId: id, userId: user._id });
      }

      // Re-fetch conversations to update unread badge on sidebar
      const { data: convData } = await api.get('/messages/conversations');
      setConversations(convData);
      const current = convData.find(c => c._id === id);
      if (current) setActiveConversation(current);

    } catch (err) {
      console.error('Error fetching messages', err);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleEditMessage = async (messageId, newText) => {
    if (!newText.trim()) return;
    try {
      await api.put(`/messages/edit/${messageId}`, { text: newText });
      
      // Update local state
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, text: newText, isEdited: true } : msg
      ));

      // Emit socket event
      if (socket && activeConversation) {
        socket.emit('edit_message', {
          sessionId: activeConversation._id,
          messageId,
          message: newText
        });
      }
      
      setEditingMessageId(null);
      setEditText('');
      fetchConversations(); // Update sidebar last message
    } catch (err) {
      console.error('Error editing message', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const messageData = {
      conversationId: activeConversation._id,
      text: inputText,
      receiverId: activeConversation.participants.find(p => p._id !== user._id)._id
    };

    try {
      const { data } = await api.post('/messages/send', messageData);
      
      // Optimistic/Immediate update for sender profile
      setMessages(prev => [...prev, {
        _id: data._id,
        conversationId: activeConversation._id,
        senderId: { _id: user._id },
        text: inputText,
        createdAt: new Date()
      }]);

      if (socket) {
        socket.emit('send_message', {
          sessionId: activeConversation._id,
          senderId: user._id,
          messageId: data._id,
          message: inputText
        });
      }
      setInputText('');
      fetchConversations(); // Update sidebar last message
    } catch (err) {
      console.error('Error sending message', err);
    }
  };

  const getTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-sensai-primary" size={48} />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <div className="glass flex h-[calc(100vh-160px)] overflow-hidden">
        
        {/* Sidebar - Conversation List */}
        <div className={`w-full border-r border-glass lg:w-96 ${conversationId ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <div className="p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">Messages</h2>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
              <input 
                className="input-field pl-11 py-2.5 text-sm" 
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const otherUser = conv.participants.find(p => p._id !== user?._id);
                const isActive = conversationId === conv._id;
                const isOnline = otherUser && onlineUsers.includes(otherUser._id);
                
                return (
                  <motion.div 
                    key={conv._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveConversation(conv);
                      navigate(`/messages/${conv._id}`);
                    }}
                    className={`mb-2 cursor-pointer rounded-2xl p-4 transition-all duration-200 
                      ${isActive ? 'bg-sensai-primary shadow-[0_4px_15px_rgba(139,92,246,0.3)]' : 'hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 animate-pulse-slow">
                        {otherUser?.profilePic ? (
                          <img src={otherUser.profilePic} className="h-full w-full rounded-xl object-cover" alt="" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-sensai-primary/20 to-sensai-secondary/20 font-bold text-white">
                            {otherUser?.name.charAt(0)}
                          </div>
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-0.5 flex-wrap gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h4 className={`truncate text-sm font-bold ${isActive ? 'text-white' : 'text-slate-100'}`}>
                              {otherUser?.name}
                            </h4>
                            {renderRoleBadge(otherUser?.role)}
                          </div>
                          <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-sensai-muted'}`}>
                            {conv.updatedAt ? getTime(conv.updatedAt) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`truncate text-[11px] ${isActive ? 'text-white/80' : 'text-sensai-muted'} max-w-[80%]`}>
                            {conv.lastMessage?.text || 'No messages yet'}
                          </p>
                          {conv.unreadCount > 0 && !isActive && (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-black text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-pulse">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-sensai-muted">
                <MessageSquare size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex flex-1 flex-col ${!conversationId ? 'hidden lg:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center justify-between border-b border-glass px-6 py-4">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate('/messages')} className="text-sensai-muted hover:text-white lg:hidden">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0">
                      {activeConversation.participants.find(p => p._id !== user?._id)?.profilePic ? (
                        <img 
                          src={activeConversation.participants.find(p => p._id !== user?._id).profilePic} 
                          className="h-full w-full rounded-xl object-cover" 
                          alt="" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl bg-sensai-primary/20 font-bold text-white">
                          {activeConversation.participants.find(p => p._id !== user?._id)?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white">
                          {activeConversation.participants.find(p => p._id !== user?._id)?.name}
                        </h3>
                        {renderRoleBadge(activeConversation.participants.find(p => p._id !== user?._id)?.role)}
                      </div>
                      {onlineUsers.includes(activeConversation.participants.find(p => p._id !== user?._id)?._id) ? (
                        <div className="flex items-center gap-1.5 font-bold tracking-widest text-emerald-400 uppercase text-[9px]">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-bold tracking-widest text-slate-500 uppercase text-[9px]">
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                          Offline
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-sensai-muted hover:text-white">
                  <MoreVertical size={20} />
                </button>
              </header>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {msgLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sensai-primary" /></div>
                ) : (
                  <>
                    {messages.map((msg, i) => {
                      const isMe = (msg.senderId._id || msg.senderId) === user._id;
                      const isEditing = editingMessageId === msg._id;
                      
                      if (isEditing) {
                        return (
                          <motion.div 
                            key={msg._id || i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                          >
                            <div className="w-full max-w-[80%] rounded-2xl px-4 py-3 bg-white/5 border border-violet-500/30 text-white shadow-lg">
                              <div className="flex items-center gap-2">
                                <input 
                                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500/40" 
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditMessage(msg._id, editText);
                                    if (e.key === 'Escape') setEditingMessageId(null);
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleEditMessage(msg._id, editText)}
                                  className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200"
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <span className="mt-1.5 block text-[8px] text-slate-500">Press Enter to save, Esc to cancel</span>
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div 
                          key={msg._id || i}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`group relative max-w-[80%] rounded-2xl px-5 py-3 
                            ${isMe ? 'bg-sensai-primary text-white rounded-tr-none shadow-[0_4px_15px_rgba(139,92,246,0.2)]' : 'bg-white/5 text-slate-100 rounded-tl-none border border-glass'}`}
                          >
                            {isMe && (
                              <button 
                                onClick={() => {
                                  setEditingMessageId(msg._id);
                                  setEditText(msg.text);
                                }}
                                className="absolute -left-10 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 hover:bg-white/10 border border-glass text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center"
                                title="Edit message"
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <span className={`mt-1.5 block text-[9px] font-medium opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                              <span className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span>{getTime(msg.createdAt)}</span>
                                {msg.isEdited && <span className="text-[8px] italic tracking-normal opacity-70">(edited)</span>}
                                {isMe && (() => {
                                  const otherParticipant = activeConversation?.participants.find(p => p._id !== user._id);
                                  const isRead = otherParticipant && msg.readBy && msg.readBy.some(id => {
                                    const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
                                    return idStr === otherParticipant._id.toString();
                                  });
                                  return (
                                    <span className={`text-[11px] leading-none ${isRead ? 'text-emerald-400 font-extrabold' : 'text-slate-400'}`} title={isRead ? "Read" : "Delivered"}>
                                      {isRead ? "✓✓" : "✓"}
                                    </span>
                                  );
                                })()}
                              </span>
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 pt-2">
                <form onSubmit={handleSendMessage} className="glass flex items-center gap-3 rounded-2xl border border-glass p-1.5">
                  <input 
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-sensai-muted" 
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary flex h-10 w-10 items-center justify-center p-0 transition-transform active:scale-90"
                    disabled={!inputText.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-sensai-muted">
              <div className="mb-6 rounded-3xl bg-white/5 p-8">
                <MessageSquare size={64} className="opacity-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Your Inbox</h3>
              <p className="max-w-[280px] text-center text-sm leading-relaxed">
                Connect with mentors and founders to share insights and build together.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
