import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useMotionValue, 
  useMotionTemplate,
  AnimatePresence 
} from 'framer-motion';
// Removed Three.js imports to improve performance and responsiveness
import { 
  ArrowRight, Menu, X, 
  TrendingUp, Zap, Globe,
  ArrowUpRight, Cpu
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. ULTRA-MODERN CSS & GLOBAL STYLES                                        */
/* -------------------------------------------------------------------------- */
const styleInjection = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  :root { 
    --grid-color: rgba(255, 255, 255, 0.05); 
  }

  html, body {
    background-color: #050505 !important;
    font-family: 'Space Grotesk', sans-serif;
    color: #e5e5e5;
    /* Strict overflow handling to prevent scroll leaks */
    overflow-x: hidden; 
    width: 100%;
    margin: 0;
    padding: 0;
    cursor: none;
  }

  #root {
    overflow-x: hidden;
    width: 100%;
  }

  /* --- CUSTOM CURSOR --- */
  .custom-cursor {
    position: fixed; top: 0; left: 0;
    width: 20px; height: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, background-color 0.3s;
    mix-blend-mode: difference;
  }
  .custom-cursor.hovered {
    width: 60px; height: 60px;
    background-color: white; 
    border-color: transparent;
    opacity: 0.1;
  }

  /* --- TEXTURE & GRID BACKGROUND --- */
  .grain-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 90; opacity: 0.4;
  }
  .tech-grid {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-image: linear-gradient(to right, var(--grid-color) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
    background-size: 40px 40px; z-index: -1;
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }

  /* --- TYPOGRAPHY --- */
  .massive-text { 
    font-size: clamp(2.5rem, 11vw, 9rem); 
    line-height: 0.95; 
    letter-spacing: -0.04em; 
    font-weight: 700; 
  }
  .stroked-text { 
    -webkit-text-stroke: 1px rgba(255,255,255,0.3); 
    color: transparent; 
    transition: all 0.5s ease; 
  }
  .stroked-text:hover { 
    color: white; 
    -webkit-text-stroke: 0px; 
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  
  /* --- UTILS --- */
  .glass-panel {
    background: rgba(10, 10, 10, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

/* -------------------------------------------------------------------------- */
/* 2. RESPONSIVE BACKGROUND (Replaces Three.js)                               */
/* -------------------------------------------------------------------------- */
const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Subtle Grid Overlay for depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* 2. Animated Nebula Glow (Top Right) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -right-[10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-purple-900/30 blur-[80px] md:blur-[120px] rounded-full mix-blend-screen"
      />

      {/* 3. Animated Nebula Glow (Bottom Left) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[20%] -left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-green-900/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-screen"
      />
      
      {/* 4. Shooting Stars / Particles (Optional subtle movement) */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s'}}></div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. INTERACTIVE COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateMouse = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleOver = (e) => setIsHovered(!!e.target.closest('.interactive'));
    
    window.addEventListener('mousemove', updateMouse);
    window.addEventListener('mouseover', handleOver);
    
    return () => {
      window.removeEventListener('mousemove', updateMouse);
      window.removeEventListener('mouseover', handleOver);
    };
  }, []);

  return <div className={`custom-cursor hidden md:block ${isHovered ? 'hovered' : ''}`} style={{ left: mousePosition.x, top: mousePosition.y }} />;
};

const HackerText = ({ text, className }) => {
  const [display, setDisplay] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

  const scramble = () => {
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((letter, index) => {
          if (index < iterations) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      if (iterations >= text.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 30);
  };

  return (
    <span onMouseEnter={scramble} className={`cursor-default ${className}`}>
      {display}
    </span>
  );
};

// --- 3D Tilt Card (Physics Based) ---
const BentoBox3D = ({ children, className = "", title }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-panel p-6 relative group overflow-hidden hover:border-white/40 hover:shadow-2xl hover:shadow-white/5 transition-colors duration-500 ${className} interactive`}
    >
      <div style={{ transform: "translateZ(50px)" }} className="relative z-10 h-full flex flex-col">
         <div className="absolute top-0 right-0 p-0 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={16} />
         </div>
         {title && <h4 className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">[{title}]</h4>}
         {children}
      </div>
      
      {/* Dynamic Glow Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 z-0"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${useTransform(x, v => (v + 0.5) * 100)}% ${useTransform(y, v => (v + 0.5) * 100)}%, rgba(255, 255, 255, 0.1), transparent 80%)`
        }}
      />
    </motion.div>
  );
};

/* --- SCROLL PIPELINE COMPONENT (Preserved) --- */
const ProcessPipeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  
  // Creates a smoother curve for the line filling
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
    { title: "Upload Design", desc: "Drag & drop your artwork. We generate 50+ mockups instantly using our AI engine." },
    { title: "Store Sync", desc: "Connect with Shopify, WooCommerce, or use our custom store builder in one click." },
    { title: "Auto-Fulfillment", desc: "When an order comes in, we print, pack, and ship blindly. You track the profit." }
  ];

  return (
    <section ref={containerRef} className="px-6 md:px-12 py-24 md:py-32 relative max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-24 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
        <p className="text-zinc-400 max-w-md mx-auto">From pixel to parcel in 3 simple steps. No code required.</p>
      </div>

      {/* THE SPINAL CORD LINES */}
      {/* Base gray line - Responsive positioning (left on mobile, center on desktop) */}
      <div className="absolute left-8 md:left-1/2 top-40 bottom-20 w-px bg-white/10 -translate-x-1/2" />
      
      {/* Active green line - fills on scroll */}
      <motion.div 
        style={{ scaleY, transformOrigin: 'top' }} 
        className="absolute left-8 md:left-1/2 top-40 bottom-20 w-px bg-green-500 -translate-x-1/2 z-10" 
      />

      <div className="space-y-16 md:space-y-32 relative z-20">
        {steps.map((step, i) => (
          <div key={i} className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
            
            {/* The Content Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="flex-1 w-full md:w-[45%] pl-16 md:pl-0"
            >
              <div className={`p-8 glass-panel border border-white/5 rounded-2xl relative group hover:border-green-500/30 transition-all duration-500 hover:-translate-y-1`}>
                <span className="text-6xl font-black text-white/5 absolute -top-6 -right-4 select-none group-hover:text-white/10 transition-colors">0{i+1}</span>
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-green-400 transition-colors">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
            
            {/* The Center Node (Connection Point) */}
            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
               {/* Core Dot */}
               <div className="w-4 h-4 rounded-full bg-black border border-white/20 shadow-[0_0_20px_rgba(0,0,0,1)] z-30 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
               </div>
               {/* Pulse effect */}
               <motion.div 
                 initial={{ opacity: 0, scale: 1 }}
                 whileInView={{ opacity: [0, 0.5, 0], scale: [1, 2, 3] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute w-4 h-4 bg-green-500 rounded-full z-0"
               />
            </div>

            {/* Empty Spacer for Desktop Layout Balance */}
            <div className="flex-1 hidden md:block" /> 
          </div>
        ))}
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. MAIN LANDING PAGE                                                       */
/* -------------------------------------------------------------------------- */

const LandingPage = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- Live Terminal Simulation ---
  const [logs, setLogs] = useState(["> system_init: OK", "> neural_net: ACTIVE"]);
  useEffect(() => {
    const commands = ["routing order #821 -> Berlin", "optimizing mesh...", "seller_joined: ID_92", "printing: batch_21", "shipping_label: OK"];
    const interval = setInterval(() => {
      setLogs(p => {
        const n = [...p, `> ${commands[Math.floor(Math.random()*commands.length)]}`];
        if (n.length>5) n.shift(); return n;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black w-full relative overflow-x-hidden">
      <style>{styleInjection}</style>
      <CustomCursor />
      <div className="grain-overlay" />
      <div className="tech-grid" />
      
      {/* Ambient Color Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- SIDEBAR NAVIGATION (Desktop) --- */}
      <nav className="hidden md:flex flex-col justify-between fixed left-0 top-0 h-full w-20 border-r border-white/10 bg-black/50 backdrop-blur-md z-50 py-8 items-center">
        <div className="hover:scale-110 transition-transform duration-300 cursor-pointer interactive">
           {/* Logo SVG */}
           <div className="w-10 h-10 relative flex items-center justify-center">
             <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none">
               <path d="M8 8H32V12H12V28H24V20H20V16H28V32H8V8Z" fill="white"/>
               <rect x="20" y="20" width="4" height="4" fill="#22c55e" className="animate-pulse"/>
             </svg>
           </div>
        </div>
        
        <div className="flex flex-col gap-8 [writing-mode:vertical-lr] rotate-180 items-center">
          <a href="#work" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors tracking-widest uppercase interactive">Work</a>
          <a href="#about" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors tracking-widest uppercase interactive">Agency</a>
        </div>
        
        <Menu className="text-zinc-500 hover:text-white cursor-pointer interactive" size={20} />
      </nav>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center p-5 bg-black/85 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-lg">GIFTOMIZE</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 md:hidden flex flex-col h-screen w-screen"
          >
            <div className="flex flex-col gap-6 text-3xl font-bold">
              <a href="#platform" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/10 pb-4">Platform</a>
              <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/10 pb-4">Solutions</a>
            </div>
            <div className="mt-auto mb-10 flex flex-col gap-4">
                <button onClick={() => onLoginClick('customer')} className="w-full py-4 border border-white/20 rounded-lg text-lg font-medium">Log In</button>
                <button onClick={() => onLoginClick('seller')} className="w-full py-4 bg-white text-black rounded-lg text-lg font-bold">Start Selling</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="md:pl-20 relative z-10 pt-20 md:pt-0 w-full max-w-[100vw]">
        
        {/* HERO SECTION */}
        <section className="min-h-[95vh] flex flex-col justify-between px-6 md:px-12 py-8 md:py-12 relative overflow-hidden">
          
          {/* Replaced 3D Scene with Responsive Background */}
          <HeroBackground />
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="hidden md:flex justify-between items-start z-10"
          >
            <div>
              <p className="text-xs text-zinc-500 font-mono">EST. 2025</p>
              <p className="text-xs text-zinc-500 font-mono">INFRASTRUCTURE V2.1</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => onLoginClick('customer')} className="text-sm font-medium hover:underline interactive">Log In</button>
              <button onClick={() => onLoginClick('seller')} className="px-6 py-2 bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors interactive">START SELLING</button>
            </div>
          </motion.div>

          <div className="relative my-8 md:my-12 z-10 pointer-events-none">
            <h1 className="massive-text leading-[0.9] tracking-tighter break-words">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <motion.span initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="block pointer-events-auto">
                  <HackerText text="DIGITAL" />
                </motion.span>
              </div>
              <motion.span initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="stroked-text block pointer-events-auto">
                MERCHANDISE
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="block text-zinc-600">
                REDEFINED.
              </motion.span>
            </h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1, duration: 1 }} 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8 z-10 bg-black/20 backdrop-blur-sm"
          >
            <div className="col-span-1">
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-sm">
                We built the backbone for the next 10,000 brands. Zero inventory. Global scale. Pure aesthetics.
              </p>
            </div>
            <div className="col-span-2 flex flex-col md:flex-row md:items-center gap-6 md:justify-end">
              <button onClick={() => navigate('/shop')} className="interactive group w-full md:w-auto flex items-center justify-between md:justify-start gap-4 pl-6 pr-2 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-300 active:scale-95">
                <span className="text-sm font-bold uppercase tracking-wider">Explore Platform</span>
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </motion.div>
        </section>

        {/* BENTO GRID SECTION */}
        <section className="px-4 md:px-12 py-12 border-t border-white/10 perspective-[2000px]">
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-4 h-auto md:h-[800px]">
            
            {/* Box 1: Core Engine */}
            <BentoBox3D className="md:col-span-2 md:row-span-2 flex flex-col justify-between bg-zinc-900 min-h-[400px]" title="Core Engine">
              <div className="z-10 mt-6 md:mt-10">
                <Cpu size={40} className="mb-6 text-white" />
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Neural Production.</h3>
                <p className="text-zinc-400 text-base md:text-lg max-w-md leading-relaxed">
                  Our API automatically routes your order to the print facility closest to the customer.
                </p>
              </div>
              <div className="w-full h-40 bg-black/80 border border-white/10 mt-8 rounded-lg relative overflow-hidden flex flex-col justify-end p-4 font-mono text-[10px] md:text-xs text-green-500/80 shadow-inner">
                  {logs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                      {log}
                    </motion.div>
                  ))}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </BentoBox3D>
            
            {/* Box 2: Analytics */}
            <BentoBox3D className="md:col-span-2 min-h-[200px] flex flex-col" title="Analytics">
              <div className="flex items-end justify-between flex-1 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold">Real-time Insights</h3>
                  <p className="text-zinc-500 text-sm">Track every penny.</p>
                </div>
                <TrendingUp size={40} className="text-zinc-600" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                <svg viewBox="0 0 100 20" className="w-full h-full fill-none stroke-white" preserveAspectRatio="none">
                  <path d="M0 20 Q 20 5 40 10 T 80 5 T 100 15" strokeWidth="0.5" />
                </svg>
              </div>
            </BentoBox3D>

            {/* Box 3: Global */}
            <BentoBox3D className="md:col-span-1 min-h-[200px]" title="Global">
              <Globe size={32} className="mb-4 text-zinc-400" />
              <h3 className="text-xl font-bold">Worldwide</h3>
              <p className="text-xs text-zinc-500 mt-2">Shipping to 195 nations instantly.</p>
            </BentoBox3D>

            {/* Box 4: Start CTA */}
            <BentoBox3D className="md:col-span-1 bg-white text-black min-h-[200px]" title="Start">
              <div className="flex flex-col h-full justify-between">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full shadow-xl">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight tracking-tight text-white">Launch in<br/>Seconds</h3>
                </div>
              </div>
            </BentoBox3D>
          </div>
        </section>
        
        {/* --- CONNECTING LINE PROCESS --- */}
        <ProcessPipeline />

        {/* INFINITE TICKER */}
        <div className="w-full overflow-hidden my-16 md:my-20">
            <div className="py-12 md:py-20 bg-white text-black rotate-[-2deg] scale-105 border-y-4 border-black">
              <motion.div 
                animate={{ x: ["0%", "-50%"] }} 
                transition={{ ease: "linear", duration: 15, repeat: Infinity }} 
                className="flex whitespace-nowrap gap-8 md:gap-12"
              >
                  {[...Array(10)].map((_, i) => (
                    <span key={i} className="text-4xl md:text-6xl font-black italic tracking-tighter">
                      CREATE • SELL • SCALE • 
                    </span>
                  ))}
              </motion.div>
            </div>
        </div>

        {/* FEATURES (SCROLL REVEAL) */}
        <section className="px-6 md:px-12 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                Not just a platform.<br/><span className="text-zinc-500">A power plant.</span>
              </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <BentoBox3D className="relative group rounded-2xl overflow-hidden border-none bg-zinc-900 aspect-[4/3] md:aspect-auto md:h-[500px]">
               <div className="absolute inset-0 bg-transparent md:bg-black/40 mix-blend-multiply z-10 md:group-hover:bg-transparent transition-all duration-700 ease-out" />
               <img 
                 src="/giftomize.png" 
                 alt="Giftomize Mockup" 
                 className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-100 md:opacity-80 md:group-hover:opacity-100" 
               />
            </BentoBox3D>
            
            <div className="space-y-4">
              {[
                { title: 'Zero Inventory', desc: 'Never pay for stock.' }, 
                { title: 'White Label', desc: 'Your brand on the box.' }, 
                { title: 'Auto Taxes', desc: 'Global VAT handling.' }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: 50 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: i * 0.1 }} 
                  className="group border-b border-white/10 py-8 active:bg-white/5 transition-all cursor-default interactive"
                >
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-4">
                    <span className="text-xs font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">0{i+1}</span> 
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-300 transition-colors pl-12">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black pt-16 md:pt-20 pb-10 px-6 md:px-12 mb-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 md:mb-20">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-[15vw] md:text-[8vw] font-bold leading-none tracking-tighter text-zinc-800 select-none">
                GIFTOMIZE
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase text-zinc-500">Sitemap</h4>
              <a href="#" className="hover:text-white text-zinc-400 interactive">Home</a>
              <a href="#" className="hover:text-white text-zinc-400 interactive">Marketplace</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase text-zinc-500">Legal</h4>
              <a href="#" className="hover:text-white text-zinc-400 interactive">Privacy</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between border-t border-white/10 pt-8 gap-4">
             <div className="text-xs font-mono text-zinc-600 flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               SYSTEM STATUS: OPERATIONAL
             </div>
             <p className="text-xs text-zinc-600">© 2026 GIFTOMIZE INC.</p>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default LandingPage;