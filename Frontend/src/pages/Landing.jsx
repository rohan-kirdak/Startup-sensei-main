import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  ChevronRight, 
  Sparkles, 
  Cpu, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  Lock, 
  Award,
  Star,
  Activity,
  Heart
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  // Interactive Simulator State
  const [selectedPreset, setSelectedPreset] = useState('saas');
  const [marketSize, setMarketSize] = useState(70);
  const [competition, setCompetition] = useState(40);
  const [feasibility, setFeasibility] = useState(80);
  const [regulatory, setRegulatory] = useState(30);

  // New interactive states for simulation & custom concept typing
  const [heroIdea, setHeroIdea] = useState('');
  const [customConceptName, setCustomConceptName] = useState('Custom Business');
  const [isSimulatingIdea, setIsSimulatingIdea] = useState(false);
  const [simulationStep, setSimulationStep] = useState('');
  
  // Interactive Step 2 (Roadmap Checklist) States
  const [step2Tasks, setStep2Tasks] = useState([
    { id: 1, label: 'Scrape competitor telemetry endpoints', done: true },
    { id: 2, label: 'Structure core revenue vectors', done: true },
    { id: 3, label: 'Configure regulatory NBFC sandboxes', done: false },
    { id: 4, label: 'Deploy secure Razorpay payment tunnels', done: false },
  ]);

  // Interactive Step 3 (Escrow Booking) States
  const [escrowLocked, setEscrowLocked] = useState(false);

  // Interactive Step 4 (Upvotes) States
  const [step4Upvotes, setStep4Upvotes] = useState(89);
  const [hasUpvotedStep4, setHasUpvotedStep4] = useState(false);
  const [showUpvotePop, setShowUpvotePop] = useState(false);

  const handleHeroSubmit = (e) => {
    e.preventDefault();
    if (!heroIdea.trim()) return;

    setCustomConceptName(heroIdea);
    
    // Procedural parameters calculation based on concept string length
    const len = heroIdea.length;
    const computedMarket = Math.min(Math.max(50 + (len % 40), 45), 95);
    const computedComp = Math.min(Math.max(20 + (len % 60), 15), 85);
    const computedFeas = Math.min(Math.max(55 + (len % 35), 40), 95);
    const computedReg = Math.min(Math.max(10 + (len % 75), 10), 85);

    // Scroll to the sandbox section smoothly
    const sandboxSec = document.getElementById('feasibility-sandbox');
    if (sandboxSec) {
      sandboxSec.scrollIntoView({ behavior: 'smooth' });
    }

    // Trigger visual diagnostic simulation
    setIsSimulatingIdea(true);
    setSelectedPreset('custom');
    
    const steps = [
      'Scraping target Indian market databases...',
      'Mapping competitive density parameters...',
      'Running compliance & regulatory NBFC cross-checks...',
      'Compiling Gemini viability metrics...'
    ];

    let currentStep = 0;
    setSimulationStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setSimulationStep(steps[currentStep]);
        // Jitter parameters for beautiful scanning effect
        setMarketSize(Math.round(computedMarket * 0.8 + Math.random() * 15));
        setCompetition(Math.round(computedComp * 0.8 + Math.random() * 15));
        setFeasibility(Math.round(computedFeas * 0.8 + Math.random() * 15));
        setRegulatory(Math.round(computedReg * 0.8 + Math.random() * 15));
      } else {
        clearInterval(interval);
        // Finalize parameter values
        setMarketSize(computedMarket);
        setCompetition(computedComp);
        setFeasibility(computedFeas);
        setRegulatory(computedReg);
        setIsSimulatingIdea(false);
        setHeroIdea('');
      }
    }, 600);
  };

  // Preset startup data mapping
  const startupPresets = {
    saas: {
      name: 'AI-Powered Crop Telemetry SaaS',
      marketSize: 82,
      competition: 35,
      feasibility: 85,
      regulatory: 20,
      description: 'Gemini Assessment: Extremely high scalability matrix. Agri-tech markets present wide whitespace in drone diagnostics. Low regulatory hurdle simplifies commercialization.'
    },
    fintech: {
      name: 'Micro-Lending for Freelancers',
      marketSize: 90,
      competition: 70,
      feasibility: 65,
      regulatory: 80,
      description: 'Gemini Assessment: Substantial target audience, but highly contested. Regulatory friction is substantial due to compliance. Advised to establish regional bank sandboxes.'
    },
    health: {
      name: 'Decentralized Clinical Trial Pipeline',
      marketSize: 75,
      competition: 20,
      feasibility: 50,
      regulatory: 95,
      description: 'Gemini Assessment: Unprecedented competitive moat. Medical trials present severe regulatory frameworks and compliance overhead. Tech integration latency is high.'
    },
    ecommerce: {
      name: 'Hyper-Local Circular Fashion Hub',
      marketSize: 60,
      competition: 55,
      feasibility: 90,
      regulatory: 15,
      description: 'Gemini Assessment: High immediate feasibility and low legal overhead. Scalability index is moderate due to logistic delivery bottlenecks. Focus on neighborhood density.'
    }
  };

  const handlePresetSelect = (key) => {
    setSelectedPreset(key);
    const p = startupPresets[key];
    setMarketSize(p.marketSize);
    setCompetition(p.competition);
    setFeasibility(p.feasibility);
    setRegulatory(p.regulatory);
  };

  // Live calculator index logic
  const calculatedScore = Math.round(
    (marketSize * 0.4) + 
    ((100 - competition) * 0.2) + 
    (feasibility * 0.3) + 
    ((100 - regulatory) * 0.1)
  );

  // Score description color and badge
  const getScoreVerdict = (score) => {
    if (score >= 75) return { text: 'Highly Viable', color: 'text-teal-400 border-teal-500/20 bg-teal-500/10' };
    if (score >= 55) return { text: 'Moderate Viability', color: 'text-violet-400 border-violet-500/20 bg-violet-500/10' };
    return { text: 'High Pivot Required', color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' };
  };

  const verdict = getScoreVerdict(calculatedScore);

  return (
    <div className="page-transition min-h-screen relative overflow-hidden pb-20">
      
      {/* Hero Section */}
      <section className="flex min-h-[90vh] flex-col justify-center px-6 py-20 text-center relative z-10">
        
        {/* Sleek Concentric AI Core Graphic */}
        <div className="relative mx-auto mb-10 w-44 h-44 flex items-center justify-center">
          {/* Inner Glowing Core */}
          <div className="absolute w-12 h-12 bg-violet-500 rounded-full blur-xl opacity-60 pulsate-core"></div>
          
          {/* Outer Ring 1 - Fast Clockwise */}
          <svg className="absolute w-32 h-32 spin-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="1.5" fill="none" strokeDasharray="30 15 10 5" />
          </svg>
          
          {/* Outer Ring 2 - Slow Counter-Clockwise */}
          <svg className="absolute w-40 h-40 spin-reverse-slow" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1.2" fill="none" strokeDasharray="40 25" />
          </svg>
          
          {/* Subtle Outer Radar Halo */}
          <div className="absolute w-28 h-28 rounded-full border border-violet-500/20 pulsate-core"></div>
          <Zap size={26} className="text-teal-400 relative z-20 filter drop-shadow-[0_0_12px_rgba(20,184,166,0.6)] animate-pulse" />
        </div>

        {/* Premium Product Value Pill */}
        <div className="mx-auto mb-8 flex items-center gap-2.5 bg-white/[0.04] border border-white/10 px-5 py-2 rounded-full font-heading text-xs tracking-wide text-teal-400 font-bold shadow-[0_4px_15px_rgba(20,184,166,0.05)] hover:border-teal-500/20 transition-all duration-300">
          <Sparkles size={14} className="animate-pulse text-teal-400" />
          <span>Business Viability, Evaluated with AI Cognitive Precision</span>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl leading-[1.1] max-w-5xl mx-auto"
        >
          Scale Your Business From <br />
          <span className="bg-gradient-to-r from-teal-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
            Concept to Validation with AI
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-8 max-w-3xl font-body text-base md:text-lg leading-relaxed text-slate-400 font-medium"
        >
          Project Sensai acts as your cognitive co-founder. Generate instant AI feasibility diagnostics, outline structural developmental roadmaps, collaborate in public panels, and consult vetted industry mentors in secure payment tunnels.
        </motion.p>

        {/* Elegant Minimalist Metrics Grid */}
        <div className="mx-auto mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-[800px] font-heading text-xs text-slate-400">
          <div className="bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl flex flex-col items-center hover:border-violet-500/20 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-slate-500 uppercase tracking-widest font-semibold text-[10px]">AI METRICS ENGINE</span>
            <span className="text-white font-bold tracking-tight mt-2 text-base md:text-lg">Gemini Pro 1.5</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl flex flex-col items-center hover:border-teal-500/20 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-slate-500 uppercase tracking-widest font-semibold text-[10px]">MARKET TELEMETRY</span>
            <span className="text-white font-bold tracking-tight mt-2 text-base md:text-lg">Dynamic Scrapes</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl flex flex-col items-center hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-slate-500 uppercase tracking-widest font-semibold text-[10px]">ESCROW PORTAL</span>
            <span className="text-white font-bold tracking-tight mt-2 text-base md:text-lg">Razorpay Tunnels</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 px-6 py-5 rounded-2xl flex flex-col items-center hover:border-violet-500/20 hover:bg-white/[0.04] transition-all duration-300">
            <span className="text-slate-500 uppercase tracking-widest font-semibold text-[10px]">MENTOR POOL</span>
            <span className="text-white font-bold tracking-tight mt-2 text-base md:text-lg">Vetted & Active</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 w-full max-w-2xl mx-auto px-4"
        >
          {user ? (
            <div className="flex justify-center">
              <Link to="/dashboard" className="btn-primary px-10 py-5 text-sm font-bold no-underline shadow-[0_4px_25px_rgba(139,92,246,0.3)]">
                Enter Workspace Dashboard <ChevronRight size={18} />
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Premium Gradient Quick Idea Evaluator Bar */}
              <form onSubmit={handleHeroSubmit} className="relative flex items-center p-1.5 rounded-2xl bg-white/[0.02] border border-white/10 focus-within:border-teal-500/40 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                <input 
                  type="text" 
                  placeholder="Apli business idea type kara... (e.g. Solar cold storage for rural farms)" 
                  value={heroIdea}
                  onChange={(e) => setHeroIdea(e.target.value)}
                  className="w-full bg-transparent px-5 py-4 text-base md:text-lg text-white placeholder-slate-500 outline-none border-none tracking-wide"
                />
                <button type="submit" className="btn-primary py-3.5 px-6 text-xs md:text-sm font-bold whitespace-nowrap bg-gradient-to-r from-teal-500 to-violet-600 border-none rounded-xl">
                  Analyze Instantly <Sparkles size={14} />
                </button>
              </form>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-primary px-8 py-4 text-xs md:text-sm font-bold no-underline">
                  Initialize Free Account <ChevronRight size={14} />
                </Link>
                <a href="#feasibility-sandbox" className="btn-secondary px-8 py-4 text-xs md:text-sm font-bold no-underline">
                  Run Diagnostic Simulator
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Ranks/Metrics Scrolling Grid bar */}
      <div className="w-full bg-white/[0.02] border-t border-b border-white/5 py-4.5 font-heading text-xs text-slate-400 tracking-widest uppercase flex items-center justify-center gap-6 overflow-hidden select-none">
        <span>FEASIBILITY INDEX • SECURED TRANSACTION TUNNELS • POWERED BY GEMINI CORE • RAZORPAY VERIFIED • ADVANCED AI EXPERT MATRIX</span>
      </div>

      {/* Visual Component 1: Interactive Feasibility Simulator */}
      <section id="feasibility-sandbox" className="container mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-sm font-heading font-bold tracking-widest text-teal-400 mb-2 uppercase">Interactive Sandbox</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Dynamic Idea Viability Simulator</h3>
          <p className="font-body text-sm text-slate-400 max-w-2xl mx-auto mt-3">Adjust core telemetry values below to watch Gemini’s viability algorithms assess mock enterprise viability scores in real time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Sliders Console */}
          <div className="lg:col-span-7 glass p-8 flex flex-col justify-between">
            <div>
              <h4 className="font-heading text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Cpu className="text-teal-400" size={20} /> Parameter Control Matrix
              </h4>

              {/* Presets Toggle */}
              <div className="grid grid-cols-4 gap-2 mb-8 bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
                {Object.keys(startupPresets).map((key) => (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`py-2 px-1 rounded-lg text-center font-heading text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${
                      selectedPreset === key 
                        ? 'bg-violet-600/90 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Range Sliders */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between font-heading text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
                    <span>Market Opportunity (TAM)</span>
                    <span className="text-teal-400 font-bold">{marketSize}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="100" value={marketSize} 
                    onChange={(e) => { setMarketSize(Number(e.target.value)); setSelectedPreset('custom'); }}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-teal-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-heading text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
                    <span>Competitor Intensity</span>
                    <span className="text-rose-400 font-bold">{competition}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" value={competition} 
                    onChange={(e) => { setCompetition(Number(e.target.value)); setSelectedPreset('custom'); }}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-rose-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-heading text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
                    <span>Technical Feasibility</span>
                    <span className="text-violet-400 font-bold">{feasibility}%</span>
                  </div>
                  <input 
                    type="range" min="10" max="100" value={feasibility} 
                    onChange={(e) => { setFeasibility(Number(e.target.value)); setSelectedPreset('custom'); }}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-violet-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-heading text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
                    <span>Regulatory / Compliance Risk</span>
                    <span className="text-amber-400 font-bold">{regulatory}%</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" value={regulatory} 
                    onChange={(e) => { setRegulatory(Number(e.target.value)); setSelectedPreset('custom'); }}
                    className="w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 font-body text-xs text-slate-400">
              <span className="font-heading font-bold text-slate-500 uppercase tracking-wider block mb-1">Preset Startup Model</span>
              <span className="text-white font-medium text-sm">
                {selectedPreset === 'custom' ? `Custom: ${customConceptName}` : startupPresets[selectedPreset].name}
              </span>
            </div>
          </div>

          {/* Visual Output Panel */}
          <div className="lg:col-span-5 glass p-8 flex flex-col justify-between relative overflow-hidden border-teal-500/20 bg-gradient-to-b from-teal-950/10 to-violet-950/10 shadow-[0_20px_50px_rgba(20,184,166,0.05)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            {isSimulatingIdea ? (
              <div className="flex flex-col items-center justify-center min-h-[300px] text-center my-auto py-10">
                <div className="relative mb-8 w-24 h-24 flex items-center justify-center">
                  <div className="absolute w-20 h-20 bg-teal-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                  {/* Rotating Scanning Ring */}
                  <svg className="absolute w-24 h-24 spin-slow" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" stroke="rgba(20, 184, 166, 0.6)" strokeWidth="3" fill="none" strokeDasharray="30 15" />
                  </svg>
                  <Cpu size={32} className="text-teal-400 relative z-20 animate-bounce" />
                </div>
                <h5 className="font-heading text-base font-bold text-white mb-2 tracking-wide uppercase">AI Viability Audit in Progress</h5>
                <div className="flex items-center gap-1.5 justify-center text-teal-400 font-heading text-xs font-semibold tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                  {simulationStep}
                </div>
                <p className="font-body text-xs text-slate-500 mt-4 max-w-[280px]">
                  Sensai AI is cross-referencing global sector telemetry metrics. Please hold...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <span className="font-heading text-xs font-bold text-teal-400 tracking-widest uppercase">Telemetry Diagnostic Result</span>
                  
                  {/* Massive Score Gauge */}
                  <div className="relative mx-auto my-8 w-44 h-44 flex items-center justify-center bg-white/[0.01] border border-white/5 rounded-full shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]">
                    
                    {/* SVG Progress Ring */}
                    <svg className="absolute w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.02)" strokeWidth="4" fill="none" />
                      <circle 
                        cx="50" cy="50" r="44" 
                        stroke="url(#sim-score-grad)" 
                        strokeWidth="5" 
                        fill="none" 
                        strokeDasharray={2 * Math.PI * 44} 
                        strokeDashoffset={2 * Math.PI * 44 * (1 - calculatedScore / 100)} 
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                      <defs>
                        <linearGradient id="sim-score-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="flex flex-col items-center">
                      <span className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tighter">{calculatedScore}%</span>
                      <span className="font-heading text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">VIABILITY</span>
                    </div>
                  </div>

                  {/* Dynamic Verdict Badge */}
                  <div className={`mx-auto w-fit px-4 py-1.5 rounded-full font-heading text-[10px] font-bold uppercase tracking-wider border ${verdict.color}`}>
                    {verdict.text}
                  </div>
                </div>

                {/* AI Diagnostics Commentary */}
                <div className="mt-8 p-4.5 rounded-xl bg-black/45 border border-white/5 relative">
                  <Sparkles size={14} className="text-teal-400 absolute top-4 right-4 animate-pulse" />
                  <h5 className="font-heading text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Algorithmic Advisory Summary</h5>
                  <p className="font-body text-xs text-slate-300 leading-relaxed italic">
                    {selectedPreset === 'custom' 
                      ? `AI Assessment: Custom concept "${customConceptName}" viability rated at ${calculatedScore}%. TAM opportunity is estimated to be ${marketSize >= 70 ? 'exceptionally favorable' : 'moderately restricted'}. Technical integration threshold is ${feasibility >= 60 ? 'optimal' : 'critical'}. Compliance regulations are ${regulatory >= 50 ? 'complex' : 'low'}. Adjust factors to optimize viability index.` 
                      : startupPresets[selectedPreset].description
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Visual Component 2: 4-Step Venture Pipeline Flow - Simple Visual Guide */}
      <section className="container mx-auto px-6 py-24 relative z-10 border-t border-white/5">
        <div className="text-center mb-20">
          <h2 className="text-sm font-heading font-bold tracking-widest text-violet-400 mb-2 uppercase">Integrative Flow</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">How It Works — The Simple Step-by-Step Flow</h3>
          <p className="font-body text-base md:text-lg text-slate-400 max-w-2xl mx-auto mt-3">Sensai leads you from a raw startup idea to a verified, fundable launch. Follow these 4 simple steps:</p>
        </div>

        <div className="relative max-w-5xl mx-auto space-y-20">
          {/* Vertical Connecting Dotted Matrix Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-[linear-gradient(to_bottom,rgba(20,184,166,0.5)_0%,rgba(139,92,246,0.5)_50%,transparent_100%)] bg-[size:2px_12px] -translate-x-1/2 pointer-events-none z-0" />

          {/* Step 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="md:text-right md:pr-12">
              <div className="flex items-center md:justify-end gap-3 mb-2">
                <span className="font-heading text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-violet-500 bg-clip-text text-transparent">01</span>
                <span className="font-heading text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Aapli Idea Check Kara</span>
              </div>
              <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-3">AI Idea Viability Diagnostic</h4>
              <p className="font-body text-sm md:text-base text-slate-400 leading-relaxed max-w-md md:ml-auto">
                <strong className="text-white block mb-1">Step 1: Just enter your startup idea.</strong>
                Write your idea in simple words. Our AI immediately checks real-time market data, competitor websites, and local funding trends to give you an instant viability score (0% to 100%) in just 15 seconds. You will know exactly if your idea is strong or needs a pivot.
              </p>
            </div>
            
            {/* Visual Preview */}
            <div className="md:pl-12 flex justify-start">
              <div className="glass p-6 w-full max-w-md border-teal-500/20 shadow-[0_8px_30px_rgba(20,184,166,0.05)] hover:border-teal-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping"></span>
                    <span className="font-heading text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                      {selectedPreset === 'custom' ? 'Custom Analysis' : 'Active Analysis'}
                    </span>
                  </div>
                  <span className="font-body text-[9px] text-slate-500 uppercase font-bold">TAM Scraped</span>
                </div>
                <div className="space-y-3 font-heading text-xs md:text-sm text-slate-300">
                  <div className="flex justify-between border-b border-white/5 pb-2.5">
                    <span className="text-slate-400">Business Concept</span>
                    <span className="text-white font-bold truncate max-w-[180px]">
                      {selectedPreset === 'custom' ? customConceptName : 'Crop Telemetry SaaS'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2.5">
                    <span className="text-slate-400">Viability Index</span>
                    <span className="text-teal-400 font-extrabold">{calculatedScore}% (Strong)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2.5">
                    <span className="text-slate-400">Competitor Saturation</span>
                    <span className="text-emerald-400 font-bold">{competition < 45 ? 'Low Saturation' : 'Highly Contested'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TAM Opportunity</span>
                    <span className="text-white font-bold">₹{Math.round(marketSize * 260)} Cr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="md:order-2 md:pl-12">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-heading text-5xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">02</span>
                <span className="font-heading text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Kaay ani Kasa Banvaycha</span>
              </div>
              <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-3">Adaptive Development Checklist</h4>
              <p className="font-body text-sm md:text-base text-slate-400 leading-relaxed max-w-md">
                <strong className="text-white block mb-1">Step 2: Get a step-by-step developer roadmap.</strong>
                Sensai doesn't just score your idea—it guides you on how to build it! AI synthesizes a highly structured developmental roadmap. It gives you custom checkmarks showing you exactly what feature to code next, how to resolve compliance risks, and how to get ready for seed rounds.
              </p>
            </div>
            
            {/* Visual Preview */}
            <div className="md:order-1 md:pr-12 flex justify-end">
              <div className="glass p-6 w-full max-w-md border-violet-500/20 shadow-[0_8px_30px_rgba(139,92,246,0.05)] hover:border-violet-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-heading text-xs font-bold text-violet-400 uppercase tracking-widest">Interactive Milestones</h5>
                  <span className="font-heading text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded font-bold">
                    {Math.round((step2Tasks.filter(t => t.done).length / step2Tasks.length) * 100)}% Complete
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-5">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${(step2Tasks.filter(t => t.done).length / step2Tasks.length) * 100}%` }}
                  />
                </div>

                <div className="space-y-2.5">
                  {step2Tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setStep2Tasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
                      }}
                      className={`w-full flex items-center justify-between text-left gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 cursor-pointer ${
                        task.done ? 'text-slate-200 border-violet-500/25 bg-violet-500/[0.02]' : 'text-slate-400/60 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {task.done ? (
                          <CheckCircle size={16} className="text-violet-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0 flex items-center justify-center font-bold text-[8px] text-slate-500">
                            {task.id}
                          </div>
                        )}
                        <span>{task.label}</span>
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        task.done ? 'bg-violet-500/10 text-violet-400' : 'bg-white/5 text-slate-500'
                      }`}>
                        {task.done ? 'Done' : 'Todo'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="md:text-right md:pr-12">
              <div className="flex items-center md:justify-end gap-3 mb-2">
                <span className="font-heading text-5xl font-extrabold bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent">03</span>
                <span className="font-heading text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Real Mentors Sobat Bola</span>
              </div>
              <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-3">Vetted Expert Consultation</h4>
              <p className="font-body text-sm md:text-base text-slate-400 leading-relaxed max-w-md md:ml-auto">
                <strong className="text-white block mb-1">Step 3: Book 1-on-1 advisory calls.</strong>
                Instantly connect and schedule face-to-face coaching calls with verified startup veterans, industry associate partners, and product managers. Standard payment bookings are protected inside a secure **Razorpay escrow payment tunnel**—your money is only paid to the mentor after the call ends successfully.
              </p>
            </div>
            
            {/* Visual Preview */}
            <div className="md:pl-12 flex justify-start">
              <div className="glass p-6 w-full max-w-md border-indigo-500/20 shadow-[0_8px_30px_rgba(79,70,229,0.05)] hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4.5 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">AS</div>
                    <div>
                      <h5 className="font-heading text-xs md:text-sm font-bold text-white leading-none">Aditya Sharma</h5>
                      <span className="font-body text-[9px] text-slate-500 uppercase font-bold tracking-wider mt-0.5 block">Lead Scaling Architect</span>
                    </div>
                  </div>
                  <span className="font-heading text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 animate-pulse">ONLINE</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs md:text-sm text-slate-300">
                    <div className="flex justify-between mb-1.5 font-semibold text-slate-400">
                      <span>Rate:</span>
                      <span className="text-white">₹2,500 / Hr</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-400">
                      <span>Escrow Safeguard:</span>
                      <span className="text-emerald-400">RBI Compliant</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setEscrowLocked(!escrowLocked)}
                    className={`w-full py-3.5 px-4 rounded-xl font-heading text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                      escrowLocked 
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_15px_rgba(79,70,229,0.25)] hover:scale-[1.01]'
                    }`}
                  >
                    {escrowLocked ? (
                      <>
                        <ShieldCheck size={14} className="text-emerald-400 animate-bounce" /> 
                        Razorpay Escrow Secured
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> 
                        Lock Booking Escrow
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="md:order-2 md:pl-12">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-heading text-5xl font-extrabold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">04</span>
                <span className="font-heading text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Launch ani Scale Kara</span>
              </div>
              <h4 className="font-heading text-xl md:text-2xl font-bold text-white mb-3">Community Hub & Launchpad</h4>
              <p className="font-body text-sm md:text-base text-slate-400 leading-relaxed max-w-md">
                <strong className="text-white block mb-1">Step 4: Pitch your score to get funding.</strong>
                Post your ideas on the forum to brainstorm with fellow founders, ask questions, get public upvotes, and share your verified feasibility score. High-scoring businesses gain direct, secure pipelines to collaborative investors and seed funding pools!
              </p>
            </div>
            
            {/* Visual Preview */}
            <div className="md:order-1 md:pr-12 flex justify-end">
              <div className="glass p-6 w-full max-w-md border-teal-500/20 shadow-[0_8px_30px_rgba(20,184,166,0.05)] hover:border-teal-500/30 transition-all duration-300 relative">
                
                {/* Floating upvote pop indicator */}
                {showUpvotePop && (
                  <span className="absolute right-6 top-1.5 font-heading text-xs font-bold text-teal-400 animate-float-up-fade pointer-events-none select-none z-50">
                    +1 Upvoted!
                  </span>
                )}

                <div className="flex items-center justify-between border-b border-white/5 pb-3.5 mb-3.5">
                  <span className="font-heading text-xs md:text-sm font-bold text-white">How to pitch pre-revenue?</span>
                  
                  <button 
                    onClick={() => {
                      if (!hasUpvotedStep4) {
                        setStep4Upvotes(prev => prev + 1);
                        setHasUpvotedStep4(true);
                        setShowUpvotePop(true);
                        setTimeout(() => setShowUpvotePop(false), 850);
                      } else {
                        setStep4Upvotes(prev => prev - 1);
                        setHasUpvotedStep4(false);
                      }
                    }}
                    className={`flex items-center gap-1.5 font-heading text-[10px] font-bold px-3 py-1 rounded-full border cursor-pointer transition-all duration-300 ${
                      hasUpvotedStep4 
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                        : 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:border-teal-500/30'
                    }`}
                  >
                    <TrendingUp size={12} className={hasUpvotedStep4 ? 'animate-bounce' : ''} /> 
                    +{step4Upvotes} upvotes
                  </button>
                </div>
                
                <p className="font-body text-[11px] text-slate-400 leading-normal mb-3 italic">
                  "Use your Sensai AI Report. Investors trust structured compliance checks and verified metrics from trusted Escrow channels..."
                </p>
                
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>64 active replies</span>
                  <span className="text-violet-400 font-bold hover:underline cursor-pointer">View thread →</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Live Regional Business Validation Ticker */}
      <section className="w-full bg-black/40 border-t border-b border-white/5 py-8 relative overflow-hidden z-10">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050608] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050608] to-transparent z-20 pointer-events-none" />
        
        <div className="text-center mb-6">
          <span className="font-heading text-[10px] font-bold text-teal-400 tracking-widest uppercase bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
            Live Sensai Ecosystem Activity
          </span>
        </div>

        <div className="w-full overflow-hidden flex whitespace-nowrap">
          <div className="animate-marquee flex gap-6 items-center">
            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Pune Founder:</strong> Verified "Drone Soil Diagnostic SaaS"
              <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">84% Score</span>
              <span className="text-slate-500">• Raised ₹45L</span>
            </div>
            
            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Mumbai Innovator:</strong> Verified "Zero-Waste Grocery Hub"
              <span className="text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">76% Score</span>
              <span className="text-slate-500">• Escrow Secured</span>
            </div>

            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Nashik Cooperative:</strong> Verified "Cold Chain IoT Telemetry"
              <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">92% Score</span>
              <span className="text-slate-500">• Mentorship Booked</span>
            </div>

            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Nagpur Startup:</strong> Verified "EV Last-Mile Agri Delivery"
              <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">81% Score</span>
              <span className="text-slate-500">• NBFC Compliant</span>
            </div>

            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Bangalore Founder:</strong> Verified "Peer-to-Peer Cohorts"
              <span className="text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">88% Score</span>
              <span className="text-slate-500">• Seed Pitch Live</span>
            </div>

            {/* Duplicate for infinite loop */}
            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Pune Founder:</strong> Verified "Drone Soil Diagnostic SaaS"
              <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">84% Score</span>
              <span className="text-slate-500">• Raised ₹45L</span>
            </div>
            
            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Mumbai Innovator:</strong> Verified "Zero-Waste Grocery Hub"
              <span className="text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">76% Score</span>
              <span className="text-slate-500">• Escrow Secured</span>
            </div>

            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Nashik Cooperative:</strong> Verified "Cold Chain IoT Telemetry"
              <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">92% Score</span>
              <span className="text-slate-500">• Mentorship Booked</span>
            </div>

            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Nagpur Startup:</strong> Verified "EV Last-Mile Agri Delivery"
              <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">81% Score</span>
              <span className="text-slate-500">• NBFC Compliant</span>
            </div>

            <div className="inline-flex items-center gap-2.5 bg-white/[0.02] border border-white/5 px-4.5 py-2.5 rounded-full font-heading text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white">Bangalore Founder:</strong> Verified "Peer-to-Peer Cohorts"
              <span className="text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">88% Score</span>
              <span className="text-slate-500">• Seed Pitch Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Component 3: Venture Dashboard Mockup Cockpit */}
      <section className="container mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-sm font-heading font-bold tracking-widest text-violet-400 mb-2 uppercase">Platform Dashboard</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">The Diagnostic Control Cockpit</h3>
          <p className="font-body text-sm text-slate-400 max-w-xl mx-auto mt-3">An executive administrative cockpit built to give you total visual mapping over every vector of startup growth.</p>
        </div>

        {/* Dense Glassmorphic Dashboard Showcase */}
        <div className="glass p-6 md:p-8 max-w-5xl mx-auto border-violet-500/15 shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Header Row Mock */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base">PS</div>
              <div>
                <h4 className="font-heading text-base font-bold text-white leading-none">Founder Command Center</h4>
                <span className="font-body text-[10px] text-slate-400">Beta Version 1.25 • Real-time Feasibility Scrapes</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 font-heading text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
                Founder Workspace
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-heading text-xs font-bold text-violet-400">
                JD
              </div>
            </div>
          </div>

          {/* Grid Layout Mock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Viability Summary Mock */}
            <div className="glass p-5 border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-3 text-slate-400 font-heading text-xs uppercase tracking-wider">
                <span>Business viability index</span>
                <TrendingUp size={16} className="text-teal-400" />
              </div>
              <h5 className="font-heading text-3xl font-extrabold text-white">74.8%</h5>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-heading text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  +12% this week
                </span>
                <span className="font-body text-[10px] text-slate-500">Product-Market Fit</span>
              </div>
              {/* Mini Sparkline polyline */}
              <div className="mt-6 h-12 w-full flex items-end">
                <svg className="w-full h-10 text-teal-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
                  <path d="M5,25 Q20,10 40,20 T80,5 T95,8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5,25 Q20,10 40,20 T80,5 T95,8 L95,30 L5,30 Z" fill="rgba(20, 184, 166, 0.05)" />
                </svg>
              </div>
            </div>

            {/* AI Diagnostics Metrics Mock */}
            <div className="glass p-5 border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-3 text-slate-400 font-heading text-xs uppercase tracking-wider">
                <span>Diagnostics executed</span>
                <Activity size={16} className="text-violet-400" />
              </div>
              <h5 className="font-heading text-3xl font-extrabold text-white">03 Reports</h5>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-heading text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  AI Generated
                </span>
                <span className="font-body text-[10px] text-slate-500">100% Comprehensive</span>
              </div>
              {/* Mini Sparkline polyline */}
              <div className="mt-6 h-12 w-full flex items-end">
                <svg className="w-full h-10 text-violet-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
                  <path d="M5,22 L25,18 L45,28 L65,12 L85,15 L95,5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5,22 L25,18 L45,28 L65,12 L85,15 L95,5 L95,30 L5,30 Z" fill="rgba(139, 92, 246, 0.05)" />
                </svg>
              </div>
            </div>

            {/* Escrow Advising Mock */}
            <div className="glass p-5 border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between mb-3 text-slate-400 font-heading text-xs uppercase tracking-wider">
                <span>Consultations Booked</span>
                <Users size={16} className="text-indigo-400" />
              </div>
              <h5 className="font-heading text-3xl font-extrabold text-white">02 Sessions</h5>
              <div className="mt-4 flex items-center gap-2">
                <span className="font-heading text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Confirmed Secure
                </span>
                <span className="font-body text-[10px] text-slate-500">Expert Verified</span>
              </div>
              {/* Mini Sparkline polyline */}
              <div className="mt-6 h-12 w-full flex items-end">
                <svg className="w-full h-10 text-indigo-400 stroke-current opacity-80" viewBox="0 0 100 30" fill="none">
                  <path d="M5,25 Q30,22 50,15 T95,5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5,25 Q30,22 50,15 T95,5 L95,30 L5,30 Z" fill="rgba(79, 70, 229, 0.05)" />
                </svg>
              </div>
            </div>

          </div>
          
          {/* Quick Mock Actions bar */}
          <div className="mt-6 bg-white/[0.02] p-4 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <span className="font-heading text-xs font-bold text-teal-400 tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles size={14} className="animate-pulse" /> Sensai Quick Navigation:
            </span>
            <div className="flex flex-wrap gap-2.5 font-heading text-[10px] font-bold uppercase tracking-wider">
              <button className="bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 px-4 py-2 rounded-lg border border-teal-500/20 cursor-pointer transition-all">
                Run diagnostics
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 cursor-pointer transition-all">
                Access strategy checklists
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 cursor-pointer transition-all">
                Strategic match matrix
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Component 4: Top Vetted Mentors Showroom */}
      <section className="container mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-sm font-heading font-bold tracking-widest text-teal-400 mb-2 uppercase">Vetted Mentors</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Active Industry Advisory Board</h3>
          <p className="font-body text-sm text-slate-400 max-w-xl mx-auto mt-3">Encrypt communication datalinks with vetted expert strategists backed by verified credentials and Razorpay transaction vaults.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Mentor 1 */}
          <div className="glass p-6 flex flex-col justify-between hover:border-teal-500/30 transition-all duration-300">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center font-heading text-lg font-bold text-white">
                    AS
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-bold text-white mb-0.5">Aditya Sharma</h4>
                    <span className="font-body text-[10px] text-slate-500 uppercase tracking-wide font-bold">Business Partner</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="font-heading text-xs font-bold text-white">4.92</span>
                </div>
              </div>
              <p className="font-body text-xs text-slate-400 mt-4 leading-relaxed">
                Expert in scaling pre-seed SaaS, circular marketplaces, and cloud API telemetry layers. Vetted former Lead Architect at Stripe India.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="font-heading text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-wide">
                  SaaS Architectures
                </span>
                <span className="font-heading text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 uppercase tracking-wide">
                  Series A Scaling
                </span>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <span className="font-heading text-xs font-bold text-white">₹2,500 <span className="text-slate-500 font-normal">/ session</span></span>
              <button className="btn-primary py-2 px-4 rounded-lg text-[10px] tracking-widest uppercase font-bold flex items-center gap-1">
                Consult Advisor <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* Mentor 2 */}
          <div className="glass p-6 flex flex-col justify-between hover:border-violet-500/30 transition-all duration-300">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-600 flex items-center justify-center font-heading text-lg font-bold text-white">
                    PM
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-bold text-white mb-0.5">Priya Mehta</h4>
                    <span className="font-body text-[10px] text-slate-500 uppercase tracking-wide font-bold">Fintech Compliance</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="font-heading text-xs font-bold text-white">4.98</span>
                </div>
              </div>
              <p className="font-body text-xs text-slate-400 mt-4 leading-relaxed">
                Advising on fintech regulatory frameworks, lending sandboxes, NBFC compliance, and digital banking API tunnels. Vetted Legal Counsel at Razorpay.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="font-heading text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 uppercase tracking-wide">
                  Fintech Legal
                </span>
                <span className="font-heading text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wide">
                  NBFC Compliance
                </span>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <span className="font-heading text-xs font-bold text-white">₹3,200 <span className="text-slate-500 font-normal">/ session</span></span>
              <button className="btn-primary py-2 px-4 rounded-lg text-[10px] tracking-widest uppercase font-bold flex items-center gap-1">
                Consult Advisor <ArrowRight size={10} />
              </button>
            </div>
          </div>

          {/* Mentor 3 */}
          <div className="glass p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-heading text-lg font-bold text-white">
                    RK
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-bold text-white mb-0.5">Rohan Kapoor</h4>
                    <span className="font-body text-[10px] text-slate-500 uppercase tracking-wide font-bold">VP of Product</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  <Star size={12} fill="currentColor" />
                  <span className="font-heading text-xs font-bold text-white">4.95</span>
                </div>
              </div>
              <p className="font-body text-xs text-slate-400 mt-4 leading-relaxed">
                Specializing in product positioning, growth-loops, circular supply chains, user acquisition models, and hyper-local marketplaces. Former Product VP at Zepto.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                <span className="font-heading text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-wide">
                  Product Growth
                </span>
                <span className="font-heading text-[9px] font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 uppercase tracking-wide">
                  Circular Supply
                </span>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <span className="font-heading text-xs font-bold text-white">₹2,800 <span className="text-slate-500 font-normal">/ session</span></span>
              <button className="btn-primary py-2 px-4 rounded-lg text-[10px] tracking-widest uppercase font-bold flex items-center gap-1">
                Consult Advisor <ArrowRight size={10} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Component 5: Discussion Hub & Community Buzz Preview */}
      <section className="container mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-sm font-heading font-bold tracking-widest text-violet-400 mb-2 uppercase">Platform Community</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Active Collaborative Discussion Hub</h3>
          <p className="font-body text-sm text-slate-400 max-w-xl mx-auto mt-3">Browse hot trending questions, brainstorm pivot tactics, and collaborate with active innovators.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Thread 1 */}
          <div className="glass p-6 hover:border-violet-500/25 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <span className="font-heading text-xs font-bold text-violet-400 uppercase tracking-wider">Fundraising Strategy</span>
                <span className="flex items-center gap-1 font-heading text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  <TrendingUp size={10} /> +89 upvotes
                </span>
              </div>
              <h4 className="font-heading text-base font-bold text-white mb-2 hover:text-violet-400 transition-colors cursor-pointer">
                How to pitch pre-revenue SaaS viability metrics in current markets?
              </h4>
              <p className="font-body text-xs text-slate-400 leading-relaxed line-clamp-2">
                "Investors are prioritizing technical feasibility and early compliance metrics over pure hypothetical scale indexes. Use Sensai’s automated feasibility index to validate..."
              </p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 font-heading text-[10px] text-slate-500 uppercase font-bold">
              <span>64 active replies • 8 minutes ago</span>
              <span className="text-teal-400 flex items-center gap-1 hover:underline cursor-pointer">Read Full Thread <ArrowRight size={10} /></span>
            </div>
          </div>

          {/* Thread 2 */}
          <div className="glass p-6 hover:border-teal-500/25 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <span className="font-heading text-xs font-bold text-teal-400 uppercase tracking-wider">Logistics & Operations</span>
                <span className="flex items-center gap-1 font-heading text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  <TrendingUp size={10} /> +56 upvotes
                </span>
              </div>
              <h4 className="font-heading text-base font-bold text-white mb-2 hover:text-teal-400 transition-colors cursor-pointer">
                Hyper-local circular commerce logistics: What is the optimal micro-hub density?
              </h4>
              <p className="font-body text-xs text-slate-400 leading-relaxed line-clamp-2">
                "We mapped out micro-hub logistics overlay across major urban hubs. Preserving an average 3.5km radial density optimizes circular collection models by up to 28%..."
              </p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 font-heading text-[10px] text-slate-500 uppercase font-bold">
              <span>42 active replies • 22 minutes ago</span>
              <span className="text-teal-400 flex items-center gap-1 hover:underline cursor-pointer">Read Full Thread <ArrowRight size={10} /></span>
            </div>
          </div>

        </div>
      </section>

      {/* Visual Component 6: Stark Cooperative Call To Action */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className="glass max-w-4xl mx-auto p-12 border-violet-500/20 bg-gradient-to-br from-violet-950/15 via-indigo-950/10 to-transparent shadow-[0_20px_50px_rgba(139,92,246,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <Sparkles size={32} className="mx-auto mb-6 text-teal-400 animate-bounce" />
          
          <h2 className="mb-3 font-heading text-xs font-bold text-teal-400 tracking-widest uppercase">
            Platform Cooperative Network
          </h2>
          <h3 className="mb-4 text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none">
            Ready to Validate Your Startup Idea?
          </h3>
          <p className="mx-auto mb-8 max-w-xl font-body text-sm text-slate-400 leading-relaxed">
            Gain immediate structural feedback, assess competitor viability, and link with vetted mentors inside secure, escrow payment channels.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-4.5 text-xs font-bold no-underline">
              Initialize Account Instantly <ChevronRight size={14} />
            </Link>
            <Link to="/register" className="btn-secondary px-8 py-4.5 text-xs font-bold no-underline">
              Become a Verified Advisor
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
