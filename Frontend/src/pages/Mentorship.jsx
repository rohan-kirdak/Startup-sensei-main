import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  MapPin, 
  Star, 
  MessageCircle, 
  Award,
  Filter,
  CheckCircle2,
  Loader2,
  Plus,
  Briefcase,
  IndianRupee,
  Calendar,
  Clock,
  X,
  CreditCard,
  User
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Mentorship = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expertise: '',
    hourlyRate: '',
    availability: 'Weekdays 6-9 PM',
    bio: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState(60); // default 60 minutes
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/mentors');
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/sessions/my');
      setSessions(data);
    } catch (error) {
      console.error('Error fetching mentorship sessions', error);
    }
  };

  useEffect(() => {
    fetchMentors();
    fetchSessions();
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const expertiseArray = formData.expertise ? formData.expertise.split(',').map(s => s.trim()).filter(s => s !== '') : [];
      const payload = {
        ...formData,
        expertise: expertiseArray
      };
      await api.post('/mentors/apply', payload);
      
      // Update local user state
      if (user && setUser) {
        setUser({ ...user, role: 'mentor' });
      }
      
      setIsModalOpen(false);
      setShowSuccess(true);
      fetchMentors(); // Refresh list
    } catch (err) {
      console.error('Error applying as mentor', err);
      alert(err.response?.data?.message || 'Failed to apply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenBooking = (mentor) => {
    setSelectedMentor(mentor);
    // Set default date to tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setBookingDate(dateStr);
    setBookingTime('10:00');
    setBookingDuration(60);
    setBookingNotes('');
    setIsBookingModalOpen(true);
  };

  const handleConfirmBookingAndPay = async (e) => {
    e.preventDefault();
    if (!selectedMentor) return;

    setBookingLoading(true);
    try {
      // 1. Combine date and time
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}:00`);

      // 2. Book Session on the backend (creates a pending unpaid session)
      const bookingPayload = {
        mentorId: selectedMentor._id,
        scheduledAt,
        duration: bookingDuration,
        notes: bookingNotes
      };
      
      const { data: session } = await api.post('/sessions/book', bookingPayload);
      const sessionId = session._id;

      // 3. Retrieve Razorpay Key from Backend
      const { data: keyData } = await api.get('/payment/key');
      const razorpayKey = keyData.key;

      // 4. Create Order on Backend
      const { data: orderData } = await api.post('/payment/order', { sessionId });

      // 5. Configure Razorpay Options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Startup Sensai",
        description: `Mentorship Session with ${selectedMentor.user?.name || 'Expert'}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Send payment details to Backend for verification
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              sessionId
            };

            await api.post('/payment/verify', verifyPayload);
            
            // Payment verified! Close modal, show success dialog
            setIsBookingModalOpen(false);
            setShowBookingSuccess(true);
            fetchSessions();
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed, but your booking is saved. Please check with support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#8B5CF6",
        },
        modal: {
          ondismiss: function () {
            setBookingLoading(false);
            alert("Payment cancelled. You can complete it later from your dashboard.");
          }
        }
      };

      // 6. Open Razorpay checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error initiating booking/payment', err);
      alert(err.response?.data?.message || 'Failed to initiate booking. Please try again.');
      setBookingLoading(false);
    }
  };

  const handleContactMentor = async (mentorId) => {
    try {
      const { data } = await api.get(`/messages/start/${mentorId}`);
      if (data.conversation) {
        navigate(`/messages/${data.conversation._id}`);
      } else {
        // Start conversation logic
        const res = await api.post('/messages/send', { 
          receiverId: mentorId, 
          text: `Hi! I found your profile on the Expert Network and would like to book a session to discuss my startup.` 
        });
        navigate(`/messages/${res.data.conversationId}`);
      }
    } catch (err) {
      console.error('Error starting conversation', err);
    }
  };

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
      <span className={`badge text-[9px] py-0.5 px-2 font-bold rounded uppercase tracking-wider border ${badgeStyle}`}>
        {displayRole}
      </span>
    );
  };

  const handlePayForSession = async (session) => {
    setPaymentLoadingId(session._id);
    try {
      // 1. Retrieve Razorpay Key from Backend
      const { data: keyData } = await api.get('/payment/key');
      const razorpayKey = keyData.key;

      // 2. Create Order on Backend
      const { data: orderData } = await api.post('/payment/order', { sessionId: session._id });

      if (orderData.isMock) {
        // Auto-verify mock payment
        const verifyPayload = {
          razorpay_payment_id: "pay_mock_" + Math.random().toString(36).substring(7),
          razorpay_order_id: orderData.orderId,
          razorpay_signature: "mock_signature",
          sessionId: session._id
        };
        await api.post('/payment/verify', verifyPayload);
        fetchSessions();
        alert("Payment verified and booking confirmed successfully!");
        setPaymentLoadingId(null);
        return;
      }

      const partyName = session.mentor?.user?.name || 'Expert Advisor';

      // 3. Configure Razorpay Options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Startup Sensai",
        description: `Mentorship Session with ${partyName}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              sessionId: session._id
            };

            await api.post('/payment/verify', verifyPayload);
            
            // Refresh sessions list
            fetchSessions();
            alert("Payment verified and booking confirmed successfully!");
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed, but your booking status will update once completed. Please check with support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#8B5CF6",
        },
        modal: {
          ondismiss: function () {
            setPaymentLoadingId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Error initiating payment', err);
      alert(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPaymentLoadingId(null);
    }
  };

  const categories = ['All', 'SaaS', 'Fintech', 'AI/ML', 'Marketing', 'E-commerce'];

  const filteredMentors = mentors.filter(m => 
    (filter === 'All' || m.expertise.includes(filter)) &&
    (m.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.user?.bio?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">Expert Mentorship</h1>
        <p className="mx-auto max-w-2xl text-lg text-sensai-muted md:text-xl">
          Connect with verified industry leaders for personalized guidance to scale your startup.
        </p>
        
        {(user?.role === 'founder' || (user?.role === 'mentor' && !mentors.some(m => m.user?._id === user?._id))) && (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3"
          >
            <Plus size={20} /> Join our Expert Network
          </motion.button>
        )}
      </header>

      {/* Booked Expert Sessions (Founder / Expert Booked sessions list) */}
      {user && sessions.length > 0 && (
        <section className="mb-12 space-y-6">
          <div className="border-b border-white/5 pb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight font-heading flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-pulse" />
              Booked Expert Sessions
              <span className="badge bg-teal-500/10 text-teal-400 border-teal-500/25 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ml-2">
                {sessions.length} ACTIVE
              </span>
            </h2>
            <Link to="/dashboard" className="text-xs text-teal-400 font-bold hover:underline no-underline flex items-center gap-1 font-heading">
              Go to Workspace Dashboard →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const isFounderOfSession = session.founder?._id === user?._id || session.founder === user?._id || session.founder?._id?.toString() === user?._id?.toString();
              const partyName = isFounderOfSession 
                ? (session.mentor?.user?.name || 'Expert Advisor')
                : (session.founder?.name || 'Founder');
              const expertise = isFounderOfSession
                ? (session.mentor?.expertise?.[0] || 'Strategic Advisor')
                : 'Startup Founder';
              const partyRole = isFounderOfSession ? 'expert' : 'founder';
              
              return (
                <div key={session._id} className="hud-card p-6 bg-gradient-to-b from-sensai-card to-white/[0.01] flex flex-col justify-between gap-4 border border-white/5 rounded-2xl shadow-glass relative hover:border-teal-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-heading font-bold text-white text-sm shadow-sm">
                        {partyName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-heading text-xs font-bold text-white tracking-tight">{partyName}</h4>
                          {renderRoleBadge(partyRole)}
                        </div>
                        <p className="font-body text-[10px] text-slate-400 mt-0.5">{expertise}</p>
                      </div>
                    </div>
                    <span className={`badge text-[9px] py-0.5 px-2 font-bold rounded uppercase tracking-wider
                      ${session.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        session.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                    >
                      {session.status}
                    </span>
                  </div>
                  
                  <div className="border-t border-white/5 pt-4 flex flex-col gap-2 font-body text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-teal-400" />
                      <span>{new Date(session.scheduledAt).toLocaleDateString()} at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-violet-400" />
                      <span>Duration: {session.duration} mins</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Payment Status</span>
                      <span className={`font-bold uppercase tracking-wider text-[10px] ${session.paymentStatus === 'paid' ? 'text-teal-400' : 'text-amber-400'}`}>
                        {session.paymentStatus}
                      </span>
                    </div>
                    
                    {session.paymentStatus === 'unpaid' && session.status !== 'cancelled' ? (
                      <button
                        disabled={paymentLoadingId === session._id}
                        onClick={() => handlePayForSession(session)}
                        className="mt-3 w-full btn-primary py-2 text-center text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all rounded-xl cursor-pointer text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-[1.02]"
                      >
                        {paymentLoadingId === session._id ? (
                          <>
                            <Loader2 className="animate-spin text-white" size={14} />
                            Initiating Checkout...
                          </>
                        ) : (
                          <>
                            <CreditCard size={14} />
                            Complete Payment (Pay Now)
                          </>
                         )}
                      </button>
                    ) : session.status === 'confirmed' && session.meetingLink ? (
                      <a 
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 w-full btn-primary py-2 text-center text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 border-none hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all rounded-xl cursor-pointer text-white no-underline shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:scale-[1.02]"
                      >
                        Join Video Session
                      </a>
                    ) : null}

                    {session.notes && (
                      <div className="mt-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-slate-400 italic">
                        "{session.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search and Filter */}
      <div className="glass mb-12 flex flex-wrap items-center gap-6 p-6">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-sensai-muted" />
          <input 
            className="input-field pl-12" 
            placeholder="Search mentors by name, expertise, or bio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 border border-glass
                ${filter === cat ? 'bg-sensai-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-sensai-muted hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-sensai-primary" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredMentors.length > 0 ? (
              filteredMentors.map((mentor, i) => (
                <motion.div 
                  key={mentor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass glass-hover flex flex-col gap-6 p-8"
                >
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sensai-primary to-sensai-secondary text-2xl font-bold text-white">
                        {mentor.user?.name?.charAt(0) || 'M'}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 rounded-full border-4 border-slate-900 bg-emerald-500 p-1">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-tight">{mentor.user?.name || 'Expert Advisor'}</h3>
                      <div className="mt-1 flex items-center gap-3">
                        <p className="text-xs font-bold text-sensai-secondary uppercase tracking-widest">{mentor.title || 'Mentor'}</p>
                        <span className="text-slate-500 text-xs">|</span>
                        <p className="text-xs text-emerald-400 font-bold tracking-wide">₹{mentor.hourlyRate}/hr</p>
                      </div>
                    </div>
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-sensai-muted">{mentor.user?.bio || 'No bio available yet.'}</p>

                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((exp, i) => (
                      <span key={i} className="rounded-lg bg-sensai-primary/10 px-3 py-1 text-[0.65rem] font-bold text-sensai-primary uppercase tracking-widest border border-sensai-primary/20">{exp}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-glass pt-6">
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span className="text-lg font-bold text-white">4.9</span>
                      <span className="text-xs text-sensai-muted ml-1">(120 reviews)</span>
                    </div>
                    <button 
                      onClick={() => handleOpenBooking(mentor)}
                      className="btn-primary py-2 px-5 text-xs inline-flex items-center gap-2"
                    >
                      <MessageCircle size={16} /> Book Session
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-sensai-muted">
                No mentors found matching your criteria.
              </div>
            )}
          </div>

          {/* Registration Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !submitting && setIsModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="glass relative w-full max-w-xl overflow-hidden p-8"
                >
                  <button 
                    onClick={() => !submitting && setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-sensai-muted hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Become a Mentor</h2>
                    <p className="text-sensai-muted">Share your expertise and help the next generation of founders.</p>
                  </div>

                  <form onSubmit={handleApply} className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                        <Briefcase size={16} className="text-sensai-primary" /> Expertise
                      </label>
                      <input 
                        required
                        className="input-field" 
                        placeholder="e.g. SaaS, Marketing, Fundraising (comma separated)"
                        value={formData.expertise}
                        onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                        <User size={16} className="text-sensai-primary" /> Professional Bio
                      </label>
                      <textarea 
                        required
                        rows={3}
                        className="input-field py-3.5 resize-none font-body" 
                        placeholder="Briefly describe your experience, successful exits, or advisory focus..."
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <IndianRupee size={16} className="text-sensai-primary" /> Hourly Rate (₹)
                        </label>
                        <input 
                          type="number"
                          required
                          className="input-field" 
                          placeholder="e.g. 500 or 1000"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <Calendar size={16} className="text-sensai-primary" /> Availability
                        </label>
                        <input 
                          required
                          className="input-field" 
                          placeholder="e.g. Weekdays 6-9 PM"
                          value={formData.availability}
                          onChange={(e) => setFormData({...formData, availability: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        type="button"
                        onClick={() => !submitting && setIsModalOpen(false)}
                        className="flex-1 px-6 py-3 rounded-xl border border-glass text-white font-semibold transition-all hover:bg-white/5"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Success Dialogue Box */}
          <AnimatePresence>
            {showSuccess && (
              <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  className="glass relative w-full max-w-md overflow-hidden p-10 text-center"
                >
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/20 to-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <motion.div
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <CheckCircle2 size={50} className="text-emerald-500" />
                    </motion.div>
                  </div>

                  <h2 className="mb-3 text-3xl font-bold text-white">Congratulations!</h2>
                  <p className="mb-8 text-sensai-muted text-lg">
                    You are now a verified mentor on Startup Sensai. Your expertise will help founders reach new heights.
                  </p>

                  <button 
                    onClick={() => setShowSuccess(false)}
                    className="w-full btn-primary py-4 text-lg font-bold shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                  >
                    Start Mentoring
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Booking Modal */}
          <AnimatePresence>
            {isBookingModalOpen && (
              <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !bookingLoading && setIsBookingModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="glass relative w-full max-w-xl overflow-hidden p-8"
                >
                  <button 
                    onClick={() => !bookingLoading && setIsBookingModalOpen(false)}
                    className="absolute top-4 right-4 text-sensai-muted hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>

                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">Book a Session</h2>
                    <p className="text-sensai-muted">Schedule a one-on-one session with <span className="font-bold text-sensai-secondary">{selectedMentor?.user?.name}</span></p>
                  </div>

                  <form onSubmit={handleConfirmBookingAndPay} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <Calendar size={16} className="text-sensai-primary" /> Date
                        </label>
                        <input 
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          className="input-field" 
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <Clock size={16} className="text-sensai-primary" /> Time
                        </label>
                        <input 
                          type="time"
                          required
                          className="input-field" 
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                          <Clock size={16} className="text-sensai-primary" /> Duration
                        </label>
                        <select 
                          className="input-field bg-slate-900 text-white border border-glass rounded-xl px-4 py-3"
                          value={bookingDuration}
                          onChange={(e) => setBookingDuration(Number(e.target.value))}
                        >
                          <option value={30}>30 Minutes</option>
                          <option value={60}>1 Hour</option>
                          <option value={90}>1.5 Hours</option>
                          <option value={120}>2 Hours</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="glass p-4 rounded-xl border border-glass flex justify-between items-center bg-white/5">
                          <div>
                            <p className="text-xs font-bold text-sensai-muted uppercase tracking-wider">Estimated Cost</p>
                            <p className="text-2xl font-black text-emerald-400">
                              ₹{((selectedMentor?.hourlyRate || 0) * (bookingDuration / 60)).toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right text-xs text-sensai-muted">
                            Rate: ₹{selectedMentor?.hourlyRate}/hr
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-white tracking-widest flex items-center gap-2">
                        <Briefcase size={16} className="text-sensai-primary" /> Session Notes (Optional)
                      </label>
                      <textarea 
                        className="input-field min-h-[100px] py-3" 
                        placeholder="Briefly describe what you would like to discuss (goals, questions, startup stage)..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        type="button"
                        onClick={() => !bookingLoading && setIsBookingModalOpen(false)}
                        className="flex-1 px-6 py-3 rounded-xl border border-glass text-white font-semibold transition-all hover:bg-white/5"
                        disabled={bookingLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-white font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? <Loader2 className="animate-spin" size={20} /> : "Pay and Book Session"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Booking Success Dialog */}
          <AnimatePresence>
            {showBookingSuccess && (
              <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  className="glass relative w-full max-w-md overflow-hidden p-10 text-center"
                >
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-500/20 to-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <motion.div
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      <CheckCircle2 size={50} className="text-emerald-500" />
                    </motion.div>
                  </div>

                  <h2 className="mb-3 text-3xl font-bold text-white">Payment Successful!</h2>
                  <p className="mb-8 text-sensai-muted text-lg">
                    Your session with <span className="font-bold text-white">{selectedMentor?.user?.name}</span> has been confirmed. You can view the details on your dashboard.
                  </p>

                  <button 
                    onClick={() => {
                      setShowBookingSuccess(false);
                      navigate('/dashboard');
                    }}
                    className="w-full btn-primary py-4 text-lg font-bold shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                  >
                    Go to Dashboard
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default Mentorship;
