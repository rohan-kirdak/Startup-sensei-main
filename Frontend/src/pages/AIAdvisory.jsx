import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  Send, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Target, 
  PieChart,
  Loader2,
  ChevronLeft,
  Download,
  Cpu
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const AIAdvisory = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('id');

  const [formData, setFormData] = useState({
    startupName: '',
    ideaDescription: '',
    targetMarket: '',
    founderName: '',
    industry: '',
    startupStage: '',
    problemStatement: '',
    usp: '',
    businessModel: '',
    revenueStrategy: '',
    budget: '',
    location: '',
    teamSize: '',
    competitors: '',
    shortGoals: '',
    longGoals: '',
    marketingPlan: '',
    additionalNotes: '',
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Custom Terminal Logs Animation State
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [terminalIndex, setTerminalIndex] = useState(0);

  const reportRef = useRef();

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    }
  }, [reportId]);

  // Clean, professional loading logs sequence to cycle through
  const logsSequence = [
    "[INIT] Booting Business Feasibility Analyzer...",
    "[AI CORE] Connecting securely to Gemini Intelligence Services...",
    "[PARSING] Analyzing startup concept parameters...",
    "[RESEARCH] Assessing market opportunity & consumer adoption vectors...",
    "[COMPETITIVE] Evaluating competitor threat matrices and barriers to entry...",
    "[FINANCE] Modeling projected revenue structures and monetization streams...",
    "[RISK] Analyzing potential viability threats & critical pitfalls...",
    "[FINALIZING] Synthesizing comprehensive feasibility scorecard...",
    "[COMPLETE] Feasibility report generated successfully."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setTerminalLogs([logsSequence[0]]);
      setTerminalIndex(1);
      
      interval = setInterval(() => {
        setTerminalIndex((prevIndex) => {
          if (prevIndex < logsSequence.length) {
            setTerminalLogs((prevLogs) => [...prevLogs, logsSequence[prevIndex]]);
            return prevIndex + 1;
          } else {
            clearInterval(interval);
            return prevIndex;
          }
        });
      }, 1300); // Feed logs progressively
    } else {
      setTerminalLogs([]);
      setTerminalIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchReport = async (id) => {
    setFetching(true);
    try {
      const { data } = await api.get(`/feasibility/${id}`);
      setReport(data);
    } catch (err) {
      console.error('Error fetching report', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/feasibility/generate', formData);
      // Let the terminal logs complete before transitioning
      setTimeout(() => {
        setReport(data);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error generating report', err);
      setError(err.response?.data?.message || 'Failed to generate feasibility report. Please check your network and try again.');
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;
    setExporting(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();   // 210mm
      const ph = doc.internal.pageSize.getHeight();  // 297mm
      const pad = 15;
      const contentW = pw - pad * 2;

      // ─── Minimal SaaS Color Palette ───────────────────────────────────────
      const BG        = [7,   8,  10];   // #07080a
      const CARD      = [13, 16,  26];   // #0d101a
      const BORDER    = [139, 92, 246];  // #8b5cf6 (violet)
      const PRIMARY   = [139, 92, 246];  // #8b5cf6 violet
      const SECONDARY = [79,  70, 229];  // #4f46e5 indigo
      const EMERALD   = [16,  185, 129]; // #10b981
      const RED       = [244,  63,  94]; // #f43f5e
      const WHITE     = [255, 255, 255];
      const MUTED     = [148, 163, 184]; // #94a3b8

      // ─── Helpers ──────────────────────────────────────────────────────
      const setFill   = (c) => doc.setFillColor(...c);
      const setStroke = (c) => doc.setDrawColor(...c);
      const setTxt    = (c) => doc.setTextColor(...c);

      // Rounded rect helper
      const roundRect = (x, y, w, h, r = 5) => {
        doc.roundedRect(x, y, w, h, r, r, 'FD');
      };

      let y = 0; // current cursor

      // ─── FULL PAGE BACKGROUND ─────────────────────────────────────────
      setFill(BG);
      setStroke(BG);
      doc.rect(0, 0, pw, ph, 'F');

      // ─── HEADER CARD ──────────────────────────────────────────────────
      const headerH = 46;
      setFill(CARD); 
      setStroke(BORDER);
      doc.setLineWidth(0.3);
      roundRect(pad, pad, contentW, headerH, 6);

      // Startup name
      setTxt(WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(report.startupName || 'Business Report', pad + 8, pad + 14);

      // Generated date
      setTxt(MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const dateStr = `SENSEI BUSINESS FEASIBILITY REPORT // Generated on ${new Date(report.createdAt || Date.now()).toLocaleDateString()}`;
      doc.text(dateStr, pad + 8, pad + 21);

      // Score badge (right side)
      const score = report.aiReport?.overallScore ?? 0;
      const scorePct = Math.min(100, Math.max(0, score));
      const badgeColor = scorePct >= 70 ? EMERALD : scorePct >= 40 ? SECONDARY : RED;
      setTxt(WHITE);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('FEASIBILITY INDEX', pw - pad - 30, pad + 12, { align: 'center' });
      setTxt(badgeColor);
      doc.setFontSize(32);
      doc.text(`${score}%`, pw - pad - 30, pad + 35, { align: 'center' });

      y = pad + headerH + 6;

      // ─── SECTION HELPER ───────────────────────────────────────────────
      const sections = [
        { label: 'Market Opportunity',    icon: '◈', color: PRIMARY,   key: 'marketAnalysis' },
        { label: 'Competitive Landscape', icon: '◎', color: SECONDARY, key: 'competitorOverview' },
        { label: 'Revenue & Monetization',icon: '◆', color: EMERALD,   key: 'revenueProjection' },
        { label: 'Risk Assessment',       icon: '⚠', color: RED,       key: 'riskAssessment' },
      ];

      for (const sec of sections) {
        if (y > ph - 30) {
          // New page with same background
          doc.addPage();
          setFill(BG); setStroke(BG);
          doc.rect(0, 0, pw, ph, 'F');
          y = pad;
        }

        const text   = report.aiReport?.[sec.key] || 'N/A';
        const lines  = doc.setFont('helvetica', 'normal').setFontSize(9)
                          .splitTextToSize(text, contentW - 16);
        const cardH  = 6 + 6 + lines.length * 4.8 + 6;

        // Page-break inside card
        if (y + cardH > ph - pad) {
          doc.addPage();
          setFill(BG); setStroke(BG);
          doc.rect(0, 0, pw, ph, 'F');
          y = pad;
        }

        // Card background
        setFill(CARD); setStroke(BORDER);
        doc.setLineWidth(0.3);
        roundRect(pad, y, contentW, cardH, 5);

        // Coloured left accent bar
        setFill(sec.color); setStroke(sec.color);
        doc.roundedRect(pad, y, 3, cardH, 1.5, 1.5, 'F');

        // Section title
        setTxt(sec.color);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(sec.label.toUpperCase(), pad + 8, y + 8);

        // Body text
        setTxt(MUTED);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(lines, pad + 8, y + 15);

        y += cardH + 5;
      }

      // ─── FOOTER ───────────────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        setTxt(PRIMARY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(
          `SENSEI BUSINESS ADVISOR • REPORT ID: ${report._id?.substring(0, 8)} • PAGE ${i} OF ${totalPages}`,
          pw / 2, ph - 6,
          { align: 'center' }
        );
      }

      doc.save(`${report.startupName}_Sensei_Feasibility_Report.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (fetching) return (
    <div className="flex flex-col justify-center items-center py-40 gap-4 font-body text-sm text-slate-400">
      <Loader2 className="animate-spin text-violet-500" size={40} />
      <span>Loading Feasibility scorecard...</span>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-10 page-transition relative">
      <AnimatePresence mode="wait">
        {loading ? (
          /* Animated Minimal SaaS Loading Experience */
          <motion.div
            key="terminal-loader"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="glass mx-auto max-w-[750px] p-8 md:p-12 bg-sensai-card border-white/5 shadow-2xl min-h-[450px] relative flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
                <div className="flex items-center gap-2.5">
                  <Cpu size={18} className="text-violet-400 animate-pulse" />
                  <span className="font-heading font-bold text-white text-sm">Business Viability Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                  <span>Analyzer Active</span>
                </div>
              </div>

              {/* Progress Logs */}
              <div className="flex flex-col gap-3 min-h-[220px] font-body text-xs text-slate-300 select-none">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <span className="text-violet-500 font-bold">&bull;</span>
                    <span className={index === terminalLogs.length - 1 ? "text-violet-300 font-semibold" : "text-slate-400"}>{log}</span>
                  </div>
                ))}
                {terminalLogs.length < logsSequence.length && (
                  <div className="flex items-center gap-2 text-violet-400 font-medium pl-4 mt-1">
                    <span>Evaluating concept viability parameters</span>
                    <span className="w-1.5 h-3 bg-violet-500 animate-pulse"></span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>System Core: Active</span>
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-violet-500" size={14} />
                <span>Computing neural coefficients...</span>
              </div>
            </div>
          </motion.div>
        ) : !report ? (
          /* Sleek Minimalist Form */
          <motion.div 
            key="form"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="glass mx-auto max-w-[750px] p-8 md:p-12 bg-sensai-card border-white/5 shadow-2xl"
          >
            <header className="mb-8 text-center relative z-10">
              <div className="relative mx-auto mb-4 w-12 h-12 flex items-center justify-center bg-white/[0.02] border border-white/10 rounded-2xl shadow-sm">
                <Sparkles className="text-violet-400 animate-pulse" size={22} />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white tracking-tight font-heading md:text-3xl">Business Viability Analysis</h1>
              <p className="font-body text-xs text-slate-400 leading-normal">Evaluate your startup concept parameters against real-time market viability indices.</p>
            </header>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/10 p-4 text-rose-400 flex items-center gap-3 font-body text-xs"
              >
                <ShieldAlert size={18} className="shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider block">Analysis Exception:</span>
                  <p className="mt-0.5">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10 font-body">
              <div className="flex flex-col gap-2">
                <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Startup / Project Name</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Ecosphere Intelligence, Finflow Core" 
                  value={formData.startupName}
                  onChange={(e) => setFormData({...formData, startupName: e.target.value})}
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Idea Description</label>
                <textarea 
                  className="input-field min-h-[120px] resize-none" 
                  placeholder="Explain your business value proposition, monetization plans, and the core problems you aim to solve..." 
                  value={formData.ideaDescription}
                  onChange={(e) => setFormData({...formData, ideaDescription: e.target.value})}
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Target Market / Demographic</label>
                <input 
                  className="input-field" 
                  placeholder="e.g. Small enterprise sector in SEA, tech-savvy Gen Z consumers" 
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                  required 
                />
              </div>

              {/* Advanced Expander Toggle */}
              <div className="border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer"
                >
                  {showAdvanced ? 'Hide Advanced Investor Parameters' : 'Expand Advanced Investor Parameters (+15 fields)'}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-6 pt-4 border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Founder Name</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Rohan Joshi" 
                        value={formData.founderName}
                        onChange={(e) => setFormData({...formData, founderName: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Industry / Sector</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Agritech, Fintech SaaS" 
                        value={formData.industry}
                        onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Startup Stage</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Ideation, MVP Developed, Early Traction" 
                        value={formData.startupStage}
                        onChange={(e) => setFormData({...formData, startupStage: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Location</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Pune, Maharashtra" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Current Budget / Runway</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. ₹5L runway, bootstrapped" 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Team Size</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. 3 founders, 2 interns" 
                        value={formData.teamSize}
                        onChange={(e) => setFormData({...formData, teamSize: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Problem Statement</label>
                    <textarea 
                      className="input-field min-h-[80px] resize-none" 
                      placeholder="What exact pain point are you solving for your target market?" 
                      value={formData.problemStatement}
                      onChange={(e) => setFormData({...formData, problemStatement: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Unique Selling Proposition (USP)</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. 10x cheaper telemetry nodes" 
                        value={formData.usp}
                        onChange={(e) => setFormData({...formData, usp: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Business Model</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. B2B Subscription + Commission" 
                        value={formData.businessModel}
                        onChange={(e) => setFormData({...formData, businessModel: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Revenue Strategy</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Monthly SaaS licenses + commission" 
                        value={formData.revenueStrategy}
                        onChange={(e) => setFormData({...formData, revenueStrategy: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Competitors</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. local agri-brokers, basic IoT trackers" 
                        value={formData.competitors}
                        onChange={(e) => setFormData({...formData, competitors: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Short-Term Goals (Next 6 months)</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Build MVP, secure 3 pilot farm clients" 
                        value={formData.shortGoals}
                        onChange={(e) => setFormData({...formData, shortGoals: e.target.value})}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Long-Term Vision</label>
                      <input 
                        className="input-field" 
                        placeholder="e.g. Become India's leading agri telemetry network" 
                        value={formData.longGoals}
                        onChange={(e) => setFormData({...formData, longGoals: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Marketing & Customer Acquisition Plan</label>
                    <textarea 
                      className="input-field min-h-[80px] resize-none" 
                      placeholder="How will you reach your target customers organically or paid?" 
                      value={formData.marketingPlan}
                      onChange={(e) => setFormData({...formData, marketingPlan: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-heading text-xs font-bold text-slate-300 uppercase tracking-wide">Additional Notes or Context</label>
                    <textarea 
                      className="input-field min-h-[80px] resize-none" 
                      placeholder="Any other specific constraints, regional regulations, or team backgrounds..." 
                      value={formData.additionalNotes}
                      onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary py-3 text-xs font-bold mt-2"
              >
                <Send className="mr-1.5" size={14} fill="currentColor" /> Run Feasibility Analysis
              </button>
            </form>
          </motion.div>
        ) : (
          /* Refined SaaS Advisory Report */
          <motion.div 
            key="report"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`page-transition ${exporting ? 'p-12' : ''}`}
            ref={reportRef}
          >
            <div className={`mb-8 flex items-center justify-between ${exporting ? 'hidden' : ''}`}>
              <button 
                onClick={() => setReport(null)} 
                className="flex items-center gap-2 border-none bg-transparent font-heading text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Analyzer
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={exporting}
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs font-bold text-violet-400 border-white/5"
              >
                 {exporting ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                 {exporting ? 'Exporting...' : 'Export PDF Report'}
              </button>
            </div>

            <header className="hud-card mb-8 flex flex-col items-center justify-between gap-6 p-8 md:flex-row md:p-10 bg-sensai-card border-white/5">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start bg-white/[0.03] border border-white/5 px-3 py-1 rounded-xl w-fit mb-3 font-heading text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
                  <Cpu size={10} className="animate-pulse" />
                  <span>Feasibility Evaluation Verified</span>
                </div>
                <h1 className="mb-2 text-3xl font-extrabold text-white tracking-tight font-heading md:text-4xl">{report.startupName}</h1>
                <p className="font-body text-xs text-slate-400">Analysis generated on {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Polished Overall Score Ring */}
              <div className="text-center flex flex-col items-center relative">
                <div className="absolute -inset-4 bg-violet-500 rounded-full blur-xl opacity-10 animate-pulse"></div>
                <div className="text-6xl font-extrabold text-violet-400 font-heading md:text-7xl leading-none">
                  {report.aiReport?.overallScore}%
                </div>
                <p className="font-heading text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-2">Viability Index</p>
              </div>
            </header>

            {/* Glowing Tech Report Modules */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AnalysisSection 
                color="border-white/5"
                icon={<Target className="text-violet-400" size={20} />}
                title="Market Opportunity"
                content={report.aiReport?.marketAnalysis}
              />
              <AnalysisSection 
                color="border-white/5 animate-delay-100"
                icon={<PieChart className="text-indigo-400" size={20} />}
                title="Competitive Landscape"
                content={report.aiReport?.competitorOverview}
              />
              <AnalysisSection 
                color="border-white/5 animate-delay-200"
                icon={<TrendingUp className="text-emerald-400" size={20} />}
                title="Revenue & Business Model"
                content={report.aiReport?.revenueProjection}
              />
              <AnalysisSection 
                color="border-white/5 animate-delay-300"
                icon={<ShieldAlert className="text-rose-400" size={20} />}
                title="Viability Risk Assessment"
                content={report.aiReport?.riskAssessment}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnalysisSection = ({ color, icon, title, content }) => (
  <div className={`hud-card p-6 md:p-8 bg-sensai-card flex flex-col gap-4 relative border border-white/5 ${color}`}>
    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
      <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2 shadow-sm">{icon}</div>
      <h3 className="font-heading text-sm font-bold text-white tracking-tight uppercase">{title}</h3>
    </div>
    <div className="whitespace-pre-wrap font-body text-xs leading-relaxed text-slate-300 mt-1 select-text">
      {content}
    </div>
  </div>
);

export default AIAdvisory;
