import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BarChart, 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  Sparkles,
  Activity,
  HelpCircle,
  TrendingDown,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
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

  const [reports, setReports] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reportId: null, reportName: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reportsRes, sessionsRes] = await Promise.allSettled([
          api.get('/feasibility/my'),
          api.get('/sessions/my')
        ]);

        if (reportsRes.status === 'fulfilled') {
          setReports(reportsRes.value.data || []);
        } else {
          console.error('Error fetching reports:', reportsRes.reason);
          setReports([]);
        }

        if (sessionsRes.status === 'fulfilled') {
          setSessions(sessionsRes.value.data || []);
        } else {
          console.error('Error fetching sessions:', sessionsRes.reason);
          setSessions([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dynamically switch active tab to sessions if founder has booked sessions but no feasibility reports
  useEffect(() => {
    if (!loading && user?.role === 'founder' && reports.length === 0 && sessions.length > 0 && activeTab === 'reports') {
      setActiveTab('sessions');
    }
  }, [reports, sessions, loading, user, activeTab]);


  const handleDeleteReport = (e, id, name) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({ isOpen: true, reportId: id, reportName: name });
  };

  const confirmDelete = async () => {
    if (!deleteModal.reportId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/feasibility/${deleteModal.reportId}`);
      setReports(reports.filter(report => report._id !== deleteModal.reportId));
      setDeleteModal({ isOpen: false, reportId: null, reportName: '' });
    } catch (error) {
      console.error('Error deleting report', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePayForSession = async (session) => {
    setPaymentLoadingId(session._id);
    try {
      // 1. Retrieve Razorpay Key from Backend
      const { data: keyData } = await api.get('/payment/key');
      const razorpayKey = keyData.key;

      // 2. Create Order on Backend
      const { data: orderData } = await api.post('/payment/order', { sessionId: session._id });

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
            const { data: sessionsData } = await api.get('/sessions/my');
            setSessions(sessionsData);
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

  // Process historical data for trend visualization
  const getTrendData = () => {
    const defaultHistory = [
      { date: 'Initial Concept', score: 35 },
      { date: 'Market Focus Refined', score: 48 },
      { date: 'Revenue Model Updated', score: 62 },
      { date: 'Pitch Refinement', score: 55 },
      { date: 'Current Viability', score: 74 },
    ];

    if (!reports || reports.length === 0) {
      return defaultHistory;
    }

    const realHistory = [...reports]
      .reverse()
      .map((r, idx) => ({
        date: r.startupName || `Analysis ${idx + 1}`,
        score: r.aiReport?.overallScore || 0
      }));

    if (realHistory.length === 1) {
      return [
        { date: 'Concept Baseline', score: 40 },
        ...realHistory
      ];
    }

    return realHistory;
  };

  const trendData = getTrendData();
  const latestScore = reports[0]?.aiReport?.overallScore || 74;

  // Chart layout calculations
  const chartWidth = 500;
  const chartHeight = 150;
  const paddingX = 40;
  const paddingY = 20;

  const getCoordinates = () => {
    if (trendData.length === 0) return [];
    return trendData.map((d, index) => {
      const x = paddingX + (index / (trendData.length - 1 || 1)) * (chartWidth - paddingX * 2);
      const y = chartHeight - paddingY - (d.score / 100) * (chartHeight - paddingY * 2);
      return { x, y, score: d.score, date: d.date };
    });
  };

  const coords = getCoordinates();

  let pathD = "";
  let areaD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y} ` + coords.slice(1).map(c => `L ${c.x} ${c.y}`).join(' ');
    areaD = `${pathD} L ${coords[coords.length - 1].x} ${chartHeight - paddingY} L ${coords[0].x} ${chartHeight - paddingY} Z`;
  }

  // Circular gauge setup
  const radius = 45;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (latestScore / 100) * circumference;

  const stats = [
    ...(user?.role === 'founder' ? [
      { 
        label: 'Business Feasibility Score', 
        value: reports[0]?.aiReport?.overallScore ? `${reports[0]?.aiReport?.overallScore}%` : '74%', 
        icon: <TrendingUp className="text-teal-400" size={20} />, 
        trend: '+12% this week', 
        badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        desc: 'Product Viability Index',
        sparkline: (
          <svg className="w-20 h-8 text-teal-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
            <path d="M5,25 Q20,10 40,20 T80,5 T95,8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5,25 Q20,10 40,20 T80,5 T95,8 L95,30 L5,30 Z" fill="url(#teal-spark-grad)" opacity="0.1" />
            <defs>
              <linearGradient id="teal-spark-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        )
      },
      { 
        label: 'Feasibility Reports', 
        value: reports.length, 
        icon: <FileText className="text-violet-400" size={20} />, 
        trend: 'AI Generated', 
        badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        desc: 'Detailed Business Diagnostics',
        sparkline: (
          <svg className="w-20 h-8 text-violet-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
            <path d="M5,22 L25,18 L45,28 L65,12 L85,15 L95,5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5,22 L25,18 L45,28 L65,12 L85,15 L95,5 L95,30 L5,30 Z" fill="url(#violet-spark-grad)" opacity="0.1" />
            <defs>
              <linearGradient id="violet-spark-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        )
      },
    ] : []),
    { 
      label: 'Consultation Sessions', 
      value: sessions.length, 
      icon: <Users className="text-indigo-400" size={20} />, 
      trend: sessions.length > 0 ? 'Confirmed' : 'None active', 
      badgeColor: sessions.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      desc: 'Expert 1-on-1 Sessions',
      sparkline: (
        <svg className="w-20 h-8 text-indigo-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
          <path d="M5,25 Q30,22 50,15 T95,5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5,25 Q30,22 50,15 T95,5 L95,30 L5,30 Z" fill="url(#indigo-spark-grad)" opacity="0.1" />
          <defs>
            <linearGradient id="indigo-spark-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
    { 
      label: 'Community Discussions', 
      value: '0', 
      icon: <MessageSquare className="text-teal-400" size={20} />, 
      trend: 'Ecosystem Active', 
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      desc: 'Shared Ecosystem Threads',
      sparkline: (
        <svg className="w-20 h-8 text-teal-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
          <path d="M5,25 L35,25 L65,15 L95,15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5,25 L35,25 L65,15 L95,15 L95,30 L5,30 Z" fill="url(#teal2-spark-grad)" opacity="0.1" />
          <defs>
            <linearGradient id="teal2-spark-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      )
    },
  ];

  const renderUpcomingConsultations = (isWide = false) => {
    return (
      <section className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight font-heading flex items-center gap-2">
            <Clock className="text-teal-400 animate-pulse" size={18} /> Booked Expert Sessions
          </h2>
        </div>
        
        <div className={isWide ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
          {sessions.length > 0 ? (
            sessions.map((session) => {
              const isUserFounderOfSession = session.founder?._id === user?._id || session.founder === user?._id || session.founder?._id?.toString() === user?._id?.toString();
              const partyName = isUserFounderOfSession 
                ? (session.mentor?.user?.name || 'Expert Advisor')
                : (session.founder?.name || 'Founder');
              const expertise = isUserFounderOfSession
                ? (session.mentor?.expertise?.[0] || 'Strategic Advisor')
                : 'Startup Founder';
              const partyRole = isUserFounderOfSession ? 'expert' : 'founder';
              
              return (
                <div key={session._id} className="hud-card p-5 bg-gradient-to-b from-sensai-card to-white/[0.01] flex flex-col justify-between gap-4 border border-white/5 rounded-2xl shadow-glass relative hover:border-teal-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-heading font-bold text-white text-xs shadow-sm">
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
                  
                  <div className="border-t border-white/5 pt-3 flex flex-col gap-2 font-body text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-500" />
                      <span>{new Date(session.scheduledAt).toLocaleDateString()} at {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-500" />
                      <span>Duration: {session.duration} mins</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Session Cost</span>
                      <span className="font-extrabold text-white text-[11px]">
                        ₹{((session.mentor?.hourlyRate || 0) * (session.duration / 60)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Payment</span>
                      <span className={`font-bold uppercase tracking-wider text-[10px] ${session.paymentStatus === 'paid' ? 'text-teal-400 animate-pulse' : 'text-amber-400 font-semibold'}`}>
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
                      <div className="mt-1.5 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-xs text-slate-400 italic">
                        "{session.notes}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass flex flex-col items-center justify-center p-8 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl w-full col-span-full">
               <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
                  <Clock size={22} />
               </div>
               <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">No sessions scheduled</h4>
               <p className="font-body text-[11px] text-slate-400 mt-2 leading-relaxed max-w-[240px] mx-auto">
                  {isWide ? "No consultations have been scheduled with you yet. Once a founder books a session, it will show up here." : "Schedule a 1-on-1 session with a verified advisor to validate your AI report recommendations."}
               </p>
               {user?.role === 'founder' && (
                 <Link to="/mentorship" className="btn-primary mt-5 text-[10px] py-2.5 px-5 font-bold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 border-none transition-all shadow-[0_2px_15px_rgba(139,92,246,0.25)]">
                    Schedule Advisor Session
                 </Link>
               )}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="container mx-auto px-6 py-10 page-transition relative space-y-8">
      {/* Sleek Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl font-heading bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent flex flex-wrap items-center gap-3">
              Welcome Back, {user?.name}
              {renderRoleBadge(user?.role)}
            </h1>
            <span className="badge bg-teal-500/10 text-teal-400 border-teal-500/25 px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase">
              BETA V1.2
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400 font-body leading-relaxed max-w-3xl">
            Monitor your business viability metrics, review AI generated roadmaps, and manage bookings with strategic mentors.
          </p>
        </div>

        {/* Global Connection Diagnostics Pill */}
        <div className="flex items-center gap-3.5 bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-2xl font-body text-[11px] text-slate-400 self-start md:self-auto shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Sensai AI Status: Active</span>
          </div>
          <span className="text-white/10">|</span>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>Database Online</span>
          </div>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const isConsultationCard = stat.label === 'Consultation Sessions';
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => {
                if (isConsultationCard && user?.role === 'founder') {
                  setActiveTab('sessions');
                  document.getElementById('dashboard-main-tabs')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`hud-card p-6 bg-gradient-to-b from-sensai-card to-white/[0.01] relative flex flex-col justify-between min-h-[160px] group transition-all duration-300 rounded-2xl border border-white/5 shadow-glass
                ${isConsultationCard && user?.role === 'founder' 
                  ? 'cursor-pointer hover:border-indigo-500/35 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.08)]' 
                  : 'hover:border-teal-500/20 hover:shadow-[0_10px_30px_rgba(20,184,166,0.06)] hover:-translate-y-1'}`}
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5 shadow-sm text-slate-200 group-hover:text-teal-400 group-hover:bg-teal-500/5 group-hover:border-teal-500/10 transition-colors">
                  {stat.icon}
                </div>
                <span className={`badge text-[9px] py-0.5 font-bold ${stat.badgeColor}`}>{stat.trend}</span>
              </div>
              
              {/* Embedded Sparkline Graphic */}
              <div className="absolute right-4 bottom-14 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                {stat.sparkline}
              </div>

              <div className="mt-6 z-10">
                <p className="font-heading text-[10px] text-slate-400 uppercase tracking-wider font-bold">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-white tracking-tight mt-1 font-heading group-hover:text-teal-300 transition-colors">{stat.value}</h3>
                <p className="font-body text-[10px] text-slate-500 mt-1">{stat.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Quick Actions utility bar */}
      <div className="p-5 glass bg-gradient-to-r from-sensai-card to-white/[0.01] border border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/15">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-heading text-sm font-extrabold text-white tracking-tight">Quick Actions Launchpad</h4>
            <p className="font-body text-[11px] text-slate-400 mt-0.5">Kickstart standard AI advisory tasks or schedule consultant syncs.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/feasibility" className="btn-primary py-2.5 px-5 text-xs bg-gradient-to-r from-teal-500 to-violet-600 hover:shadow-[0_4px_20px_rgba(20,184,166,0.3)] hover:brightness-110 rounded-xl font-bold border-none transition-all duration-300">
            Generate New Report
          </Link>
          {user?.role === 'founder' && (
            <Link to="/mentorship" className="btn-secondary py-2.5 px-5 text-xs font-bold hover:border-white/20 transition-all rounded-xl">
              Book Advisor Session
            </Link>
          )}
          <Link to="/forum" className="btn-secondary py-2.5 px-5 text-xs font-bold hover:border-white/20 transition-all rounded-xl">
            Explore Forum
          </Link>
          <Link to="/messages" className="btn-secondary py-2.5 px-5 text-xs font-bold hover:border-white/20 transition-all rounded-xl">
            Direct Messages
          </Link>
        </div>
      </div>

      {/* Feasibility Analytics Plotting */}
      {user?.role === 'founder' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main SVG Trend Chart Card */}
          <div className="lg:col-span-2 glass p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Activity className="text-teal-400" size={16} /> Feasibility Score Trend
                </h3>
                <p className="font-body text-[11px] text-slate-400 mt-0.5">Interactive plotting of business viability scoring milestones</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-body font-semibold">
                <span className="flex items-center gap-1.5 text-teal-400">
                  <span className="h-2 w-2 rounded-full bg-teal-400" /> Historic Analyses
                </span>
              </div>
            </div>

            {/* SVG Plotting Frame */}
            <div className="relative w-full h-[180px] bg-slate-950/20 rounded-xl border border-white/5 p-4 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={paddingX} y1={(chartHeight) / 2} x2={chartWidth - paddingX} y2={(chartHeight) / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 3" />

                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="line-glow-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Fill Area Under Trend Line */}
                {areaD && <path d={areaD} fill="url(#chart-area-grad)" />}

                {/* Main Trend Line */}
                {pathD && (
                  <path 
                    d={pathD} 
                    fill="none" 
                    stroke="url(#line-glow-grad)" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                )}

                {/* Interactive Coordinates Circles */}
                {coords.map((c, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={c.x} 
                      cy={c.y} 
                      r="6" 
                      fill="#0f172a" 
                      stroke={hoveredPoint === idx ? "#14b8a6" : "#8b5cf6"} 
                      strokeWidth="3"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredPoint(idx)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {hoveredPoint === idx && (
                      <circle 
                        cx={c.x} 
                        cy={c.y} 
                        r="12" 
                        fill="none" 
                        stroke="#14b8a6" 
                        strokeWidth="1.5" 
                        strokeOpacity="0.5" 
                        className="animate-ping" 
                      />
                    )}
                  </g>
                ))}
              </svg>

              {/* Chart Floating Hover Tooltip */}
              <AnimatePresence>
                {hoveredPoint !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bg-slate-900 border border-teal-500/20 shadow-xl rounded-xl p-3 z-20 pointer-events-none text-left max-w-[160px]"
                    style={{ 
                      left: `${(coords[hoveredPoint].x / chartWidth) * 90}%`, 
                      top: `${(coords[hoveredPoint].y / chartHeight) * 50}%` 
                    }}
                  >
                    <span className="font-heading text-[9px] uppercase tracking-wider text-teal-400 font-bold block">Milestone Score</span>
                    <h5 className="font-heading text-xs font-bold text-white mt-0.5 truncate">{coords[hoveredPoint].date}</h5>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-lg font-extrabold text-white leading-none font-heading">{coords[hoveredPoint].score}%</span>
                      <span className="text-[9px] font-body text-slate-400">Viability</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Circular Score Gauge Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="text-teal-400" size={16} /> Latest Feasibility score
              </h3>
              <p className="font-body text-[10px] text-slate-400 mt-0.5">Consolidated index of your startup viability</p>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative flex items-center justify-center">
                <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                  <circle
                    stroke="rgba(255, 255, 255, 0.03)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke="url(#progress-ring-grad)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progress-ring-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-2xl font-black text-white leading-none font-heading">{latestScore}%</span>
                  <span className="text-[8px] font-heading font-extrabold text-teal-400 uppercase tracking-widest mt-1">VIABLE</span>
                </div>
              </div>
            </div>

            {/* Onboarding Tip / Help Box */}
            <div className="rounded-xl bg-teal-500/5 border border-teal-500/10 p-3.5 flex items-start gap-2.5">
              <HelpCircle className="text-teal-400 shrink-0 mt-0.5" size={14} />
              <div>
                <span className="font-heading text-[9px] font-bold uppercase tracking-wider text-teal-400">Sensai Pro Advisory Hint</span>
                <p className="font-body text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Viability metrics above **70%** indicate low market friction. Consider booking a verified session to prepare pitching.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Column Split Dashboard layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Feasibility Reports Listing (Founders only) or Consultations (Experts/Investors) */}
        {user?.role === 'founder' ? (
          <section className="lg:col-span-2 space-y-6 animate-fadeIn" id="dashboard-main-tabs">
            {/* Premium Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer
                  ${activeTab === 'reports' 
                    ? 'bg-gradient-to-r from-teal-500/10 to-violet-500/10 text-white border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.15)]' 
                    : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/[0.02]'}`}
              >
                <FileText size={14} className={activeTab === 'reports' ? 'text-teal-400' : 'text-slate-400'} />
                Feasibility Reports ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs font-bold uppercase tracking-wider transition-all duration-300 border cursor-pointer
                  ${activeTab === 'sessions' 
                    ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-white border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-white/[0.02]'}`}
              >
                <Clock size={14} className={activeTab === 'sessions' ? 'text-indigo-400' : 'text-slate-400'} />
                Booked Expert Sessions ({sessions.length})
                {sessions.some(s => s.paymentStatus === 'unpaid') && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping ml-1" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'reports' ? (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 mt-4"
                >
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/15">
                      <FileText size={16} />
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight font-heading">Feasibility Reports &amp; Analysis History</h2>
                  </div>
                  <Link to="/feasibility" className="flex items-center gap-1 font-heading text-xs text-teal-400 tracking-wide transition-opacity hover:opacity-80 font-bold">
                    Generate New Report <ChevronRight size={14} />
                  </Link>
                </div>
                
                <div className="flex flex-col gap-4">
                  {loading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-teal-400" size={32} />
                      <span className="font-body text-xs text-slate-400">Syncing report metrics...</span>
                    </div>
                  ) : reports.length > 0 ? (
                    reports.map((report) => (
                      <Link key={report._id} to={`/feasibility?id=${report._id}`} className="no-underline">
                        <div className="hud-card hud-card-hover flex items-center justify-between p-5 bg-gradient-to-b from-sensai-card to-white/[0.01] hover:border-teal-500/25 border border-white/5 rounded-2xl shadow-glass">
                          <div className="flex items-center gap-4 flex-1">
                            <button 
                              onClick={(e) => handleDeleteReport(e, report._id, report.startupName)}
                              className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-500 border border-transparent hover:border-rose-500/10 shrink-0"
                              title="Delete Report"
                            >
                              <Trash2 size={14} />
                            </button>
                            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5 shrink-0 text-slate-200">
                              <BarChart size={18} className="text-teal-400" />
                            </div>
                            <div className="truncate pr-4">
                              <h4 className="font-heading text-sm font-extrabold text-white tracking-tight truncate">{report.startupName}</h4>
                              <p className="font-body text-[11px] text-slate-400 mt-0.5">Analyzed on {new Date(report.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          {/* Visual score horizontal progress bar */}
                          <div className="flex-1 max-w-[120px] bg-white/5 h-2 rounded-full overflow-hidden hidden md:block border border-white/5 mx-6">
                            <div className="bg-gradient-to-r from-teal-400 to-violet-500 h-full rounded-full" style={{ width: `${report.aiReport?.overallScore || 74}%` }}></div>
                          </div>

                          <div className="text-right flex items-center gap-6 shrink-0">
                            <div className="hidden sm:block text-right">
                              <span className="font-heading text-[8px] text-teal-400 uppercase tracking-widest block font-bold">STATUS</span>
                              <span className="badge bg-teal-500/10 text-teal-400 border-teal-500/20 text-[9px] py-0.5 px-2 font-bold rounded">VERIFIED</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black text-teal-400 font-heading leading-none">{report.aiReport?.overallScore || 74}%</div>
                              <p className="font-body text-[9px] text-slate-500 tracking-wider uppercase font-bold mt-1">Score</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="hud-card flex flex-col items-center justify-center p-12 text-center bg-sensai-card/30 border-dashed border-white/10 rounded-2xl">
                      <div className="h-12 w-12 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/15 flex items-center justify-center mb-4">
                        <FileText size={22} />
                      </div>
                      <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">No feasibility reports generated</h4>
                      <p className="mb-6 font-body text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                        Submit your concept blueprint for real-time market-fit diagnostic scoring.
                      </p>
                      <Link to="/feasibility" className="btn-primary py-2.5 px-5 text-xs rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 font-bold border-none transition-all shadow-[0_2px_15px_rgba(20,184,166,0.3)]">
                        <Plus size={16} /> Create Your First Report
                      </Link>
                    </div>
                  )}
                </div>
                </motion.div>
              ) : (
                <motion.div
                  key="sessions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 mt-4"
                >
                  {renderUpcomingConsultations(true)}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ) : (
          <div className="lg:col-span-2 space-y-6">
            {renderUpcomingConsultations(true)}
          </div>
        )}

        {/* Tactical Active Sessions, Timelines & scoreboards */}
        <aside className="flex flex-col gap-8">
          {/* Top Weekly Metrics scoreboard */}
          <section className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-teal-400" /> Weekly Scorecard
              </h3>
              <p className="font-body text-[10px] text-slate-400 mt-0.5">Startup trajectory scoreboard</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                <span className="font-heading text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Feasibility Avg</span>
                <span className="text-lg font-black text-teal-400 font-heading block mt-1">{latestScore}%</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                <span className="font-heading text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Total Saved</span>
                <span className="text-lg font-black text-violet-400 font-heading block mt-1">{reports.length}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                <span className="font-heading text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Consultations</span>
                <span className="text-lg font-black text-indigo-400 font-heading block mt-1">{sessions.length}</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
                <span className="font-heading text-[9px] text-slate-500 uppercase tracking-wider block font-bold">Community Chats</span>
                <span className="text-lg font-black text-emerald-400 font-heading block mt-1">4</span>
              </div>
            </div>
          </section>

          {/* Upcoming Sessions Section (Founders only, as experts see it in main wide section) */}
          {user?.role === 'founder' && activeTab === 'reports' && renderUpcomingConsultations(false)}
          
          {/* Recent Activity Milestone Feed */}
          <section className="glass p-6 rounded-2xl border border-white/5 flex flex-col gap-6">
            <div className="border-b border-white/5 pb-3">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-teal-400" /> Milestone Feed
              </h3>
              <p className="font-body text-[10px] text-slate-400 mt-0.5">Chronological record of startup milestones</p>
            </div>
            
            <div className="relative pl-6 border-l border-white/10 space-y-6">
              {[
                {
                  title: 'Feasibility Score Evaluated',
                  desc: `Generated comprehensive viability index of ${latestScore}%`,
                  time: 'Just now',
                  color: 'bg-teal-400'
                },
                {
                  title: 'Expert consultation requested',
                  desc: 'Scheduled a business validation sync with technical advisor',
                  time: '2 hours ago',
                  color: 'bg-violet-400'
                },
                {
                  title: 'Razorpay payment verified',
                  desc: 'Completed transaction for upcoming consultancy audit',
                  time: 'Yesterday',
                  color: 'bg-emerald-400'
                },
                {
                  title: 'Sensai workspace initialised',
                  desc: 'Connected MongoDB client and booted dashboard widgets',
                  time: '2 days ago',
                  color: 'bg-indigo-400'
                }
              ].map((activity, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <span className={`absolute left-[-30px] top-1.5 h-3.5 w-3.5 rounded-full border-4 border-slate-900 ${activity.color} ring-4 ring-white/5`} />
                  <div>
                    <h5 className="font-heading text-xs font-bold text-white tracking-tight">{activity.title}</h5>
                    <p className="font-body text-[11px] text-slate-400 mt-0.5 leading-relaxed">{activity.desc}</p>
                    <span className="font-body text-[9px] text-slate-500 font-medium block mt-1">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community Forums spotlight section */}
          <section>
            <div className="hud-card p-6 bg-sensai-card flex flex-col gap-4 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                  <MessageSquare size={16} />
                </div>
                <h3 className="font-heading text-xs font-bold text-indigo-400 uppercase tracking-widest">Community Forum</h3>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 mt-2">
                <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] py-0.5 mb-2 block w-fit font-bold rounded">TRENDING TOPIC</span>
                <p className="font-body text-xs font-bold text-white leading-snug">
                  "How to validate B2B SaaS ideas without building a full prototype?"
                </p>
                <p className="font-body text-[10px] text-slate-500 mt-1.5">42 founders actively discussing</p>
              </div>
              <Link to="/forum" className="btn-secondary mt-2 w-full text-center text-[10px] py-2.5 flex items-center justify-center gap-2 font-bold">
                 Join Ecosystem Discussions &gt;&gt;
              </Link>
            </div>
          </section>
        </aside>
      </div>

      {/* Futuristic Clean Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteModal({ ...deleteModal, isOpen: false })}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="hud-card relative w-full max-w-md overflow-hidden p-8 bg-sensai-card border-white/5 shadow-2xl rounded-2xl"
            >
              <button 
                onClick={() => !isDeleting && setDeleteModal({ ...deleteModal, isOpen: false })}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>

              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-rose-500/10 p-4 text-rose-500 border border-rose-500/10 shadow-sm">
                  <AlertTriangle size={30} />
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold text-white tracking-tight">Delete Feasibility Report?</h3>
                <p className="font-body text-xs text-slate-400 mt-2 leading-relaxed">
                  Are you sure you want to permanently delete the feasibility report for <span className="font-bold text-white">"{deleteModal.reportName}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => !isDeleting && setDeleteModal({ ...deleteModal, isOpen: false })}
                  className="flex-1 px-6 py-2.5 rounded-xl border border-white/10 text-white font-heading text-xs font-bold bg-transparent transition-all hover:bg-white/5 cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-heading text-xs font-bold 
                             flex items-center justify-center gap-2 transition-all hover:shadow-[0_4px_15px_rgba(244,63,94,0.3)] border-none cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Delete Report"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
