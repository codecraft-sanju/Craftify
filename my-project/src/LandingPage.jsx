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
import { 
  ArrowRight, Menu, X, 
  TrendingUp, Zap, Globe,
  ArrowUpRight, Cpu, LogIn,
  Sun, Moon
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. ULTRA-MODERN CSS & GLOBAL STYLES (Dynamic Theming)                      */
/* -------------------------------------------------------------------------- */
const styleInjection = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&display=swap');

  :root { 
    --grid-color: rgba(255, 255, 255, 0.05); 
    --bg-main: #050505;
    --text-main: #e5e5e5;
    --text-muted: #71717a; /* zinc-500 */
    --border-color: rgba(255, 255, 255, 0.1);
    --panel-bg: rgba(10, 10, 10, 0.6);
    --accent-glow: #22c55e; /* Green */
    --blob-1: rgba(88, 28, 135, 0.3); /* Purple */
    --blob-2: rgba(20, 83, 45, 0.2); /* Green */
    --button-bg: #ffffff;
    --button-text: #000000;
    --logo-fill: #ffffff;
  }

  [data-theme='light'] {
    --grid-color: rgba(0, 0, 0, 0.04);
    /* Premium Cream/Porcelain Background */
    --bg-main: #FDFBF7; 
    --text-main: #1c1917; /* Warm Black */
    --text-muted: #57534e; /* Warm Grey */
    --border-color: rgba(0, 0, 0, 0.08);
    /* Frosted Glass Effect for Light Mode */
    --panel-bg: rgba(255, 255, 255, 0.4); 
    --accent-glow: #e11d48; /* Rose/Pink Accent */
    --blob-1: rgba(244, 63, 94, 0.15); /* Rose Blob */
    --blob-2: rgba(251, 146, 60, 0.15); /* Orange/Peach Blob */
    --button-bg: #1c1917;
    --button-text: #ffffff;
    --logo-fill: #1c1917;
  }

  html, body {
    background-color: var(--bg-main) !important;
    font-family: 'Space Grotesk', sans-serif;
    color: var(--text-main);
    overflow-x: hidden; 
    width: 100%;
    margin: 0;
    padding: 0;
    cursor: none;
    transition: background-color 0.7s ease, color 0.7s ease;
  }

  #root {
    overflow-x: hidden;
    width: 100%;
  }

  /* --- CUSTOM CURSOR --- */
  .custom-cursor {
    position: fixed; top: 0; left: 0;
    width: 20px; height: 20px;
    border: 1px solid var(--text-main);
    opacity: 0.5;
    border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, background-color 0.3s;
    mix-blend-mode: difference;
  }
  .custom-cursor.hovered {
    width: 60px; height: 60px;
    background-color: var(--text-main); 
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
    font-size: clamp(3.5rem, 13vw, 9rem); 
    line-height: 0.90; 
    letter-spacing: -0.04em; 
    font-weight: 800; 
    color: var(--text-main);
  }
  .stroked-text { 
    -webkit-text-stroke: 1px var(--text-muted); 
    color: transparent; 
    transition: all 0.5s ease; 
  }
  .stroked-text:hover { 
    color: var(--text-main); 
    -webkit-text-stroke: 0px; 
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  
  /* --- UTILS --- */
  .glass-panel {
    background: var(--panel-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
  }
  
  /* Neon Button Glow Animation */
  @keyframes neonPulse {
    0% { box-shadow: 0 0 5px var(--border-color); }
    50% { box-shadow: 0 0 15px var(--accent-glow); }
    100% { box-shadow: 0 0 5px var(--border-color); }
  }
  .neon-button {
    animation: neonPulse 2s infinite;
  }
  
  /* Theme Transition Utilities */
  .theme-transition {
    transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

/* -------------------------------------------------------------------------- */
/* 2. RESPONSIVE BACKGROUND                                                   */
/* -------------------------------------------------------------------------- */
const HeroBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* 2. Animated Blob (Top Right) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -right-[10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen theme-transition"
        style={{ backgroundColor: 'var(--blob-1)' }}
      />

      {/* 3. Animated Blob (Bottom Left) */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[20%] -left-[10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen theme-transition"
        style={{ backgroundColor: 'var(--blob-2)' }}
      />
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

// --- 3D Tilt Card ---
const BentoBox3D = ({ children, className = "", title }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(x, [-0.5, 0.5], ["-5deg", "5deg"]);

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
      className={`glass-panel p-6 relative group overflow-hidden hover:shadow-2xl transition-all duration-500 ${className} interactive theme-transition`}
    >
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10 h-full flex flex-col">
         <div className="absolute top-0 right-0 p-0 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight size={16} />
         </div>
         {title && <h4 className="text-xs font-mono mb-4 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>[{title}]</h4>}
         {children}
      </div>
      
      {/* Dynamic Glow Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 z-0"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${useTransform(x, v => (v + 0.5) * 100)}% ${useTransform(y, v => (v + 0.5) * 100)}%, var(--border-color), transparent 80%)`
        }}
      />
    </motion.div>
  );
};

/* --- SCROLL PIPELINE COMPONENT --- */
const ProcessPipeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });
  
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps = [
    { title: "Upload Design", desc: "Drag & drop your artwork. We generate 50+ mockups instantly using our AI engine." },
    { title: "Store Sync", desc: "Connect with Shopify, WooCommerce, or use our custom store builder in one click." },
    { title: "Auto-Fulfillment", desc: "When an order comes in, we print, pack, and ship blindly. You track the profit." }
  ];

  return (
    <section ref={containerRef} className="px-6 md:px-12 py-24 md:py-32 relative max-w-7xl mx-auto">
      <div className="text-center mb-24 relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
        <p className="max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>From pixel to parcel in 3 simple steps. No code required.</p>
      </div>

      {/* Lines */}
      <div className="absolute left-8 md:left-1/2 top-40 bottom-20 w-px -translate-x-1/2" style={{ backgroundColor: 'var(--border-color)' }} />
      <motion.div 
        style={{ scaleY, transformOrigin: 'top', backgroundColor: 'var(--accent-glow)' }} 
        className="absolute left-8 md:left-1/2 top-40 bottom-20 w-px -translate-x-1/2 z-10" 
      />

      <div className="space-y-16 md:space-y-32 relative z-20">
        {steps.map((step, i) => (
          <div key={i} className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="flex-1 w-full md:w-[45%] pl-16 md:pl-0"
            >
              <div className={`p-8 glass-panel rounded-2xl relative group transition-all duration-500 hover:-translate-y-1 theme-transition`} style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-6xl font-black absolute -top-6 -right-4 select-none opacity-5 transition-opacity group-hover:opacity-10">0{i+1}</span>
                <h3 className="text-2xl font-bold mb-3 transition-colors group-hover:text-[var(--accent-glow)]">{step.title}</h3>
                <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            </motion.div>
            
            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
               <div className="w-4 h-4 rounded-full border shadow-[0_0_20px_rgba(0,0,0,0.2)] z-30 flex items-center justify-center theme-transition" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                 <motion.div 
                   initial={{ scale: 0 }}
                   whileInView={{ scale: 1 }}
                   className="w-2 h-2 rounded-full"
                   style={{ backgroundColor: 'var(--accent-glow)' }}
                 />
               </div>
               <motion.div 
                 initial={{ opacity: 0, scale: 1 }}
                 whileInView={{ opacity: [0, 0.5, 0], scale: [1, 2, 3] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute w-4 h-4 rounded-full z-0"
                 style={{ backgroundColor: 'var(--accent-glow)' }}
               />
            </div>
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
  const [theme, setTheme] = useState('dark');

  // Toggle Theme Function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Ensure default is dark
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);
  
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
    <div className="min-h-screen w-full relative overflow-x-hidden theme-transition" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <style>{styleInjection}</style>
      <CustomCursor />
      <div className="grain-overlay" />
      <div className="tech-grid" />
      
      {/* Ambient Color Orbs (Color controlled via CSS vars) */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-700" style={{ backgroundColor: 'var(--blob-1)' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-700" style={{ backgroundColor: 'var(--blob-2)' }} />

      {/* --- SIDEBAR NAVIGATION (Desktop) --- */}
      <nav className="hidden md:flex flex-col justify-between fixed left-0 top-0 h-full w-20 border-r backdrop-blur-md z-50 py-8 items-center theme-transition" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
        <div className="hover:scale-110 transition-transform duration-300 cursor-pointer interactive">
           {/* Logo SVG */}
           <div className="w-10 h-10 relative flex items-center justify-center">
             <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none">
               <path d="M8 8H32V12H12V28H24V20H20V16H28V32H8V8Z" style={{ fill: 'var(--logo-fill)' }} />
               <rect x="20" y="20" width="4" height="4" style={{ fill: 'var(--accent-glow)' }} className="animate-pulse"/>
             </svg>
           </div>
        </div>
        
        <div className="flex flex-col gap-8 [writing-mode:vertical-lr] rotate-180 items-center">
          <a href="#work" className="text-xs font-mono transition-colors tracking-widest uppercase interactive" style={{ color: 'var(--text-muted)' }}>Work</a>
          <a href="#about" className="text-xs font-mono transition-colors tracking-widest uppercase interactive" style={{ color: 'var(--text-muted)' }}>Agency</a>
        </div>
        
        {/* Desktop Theme Toggle */}
        <div className="flex flex-col gap-6 items-center">
            <button onClick={toggleTheme} className="interactive p-2 rounded-full hover:bg-white/10 transition-all">
                {theme === 'dark' ? <Sun size={20} color="var(--text-muted)" /> : <Moon size={20} color="var(--text-muted)" />}
            </button>
            <Menu className="cursor-pointer interactive" size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
      </nav>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center p-5 backdrop-blur-xl border-b theme-transition" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-tight text-lg">GIFTOMIZE</span>
        </div>
        <div className="flex items-center gap-4">
            {/* Mobile Theme Toggle */}
            <button onClick={toggleTheme} className="interactive p-2 rounded-full hover:bg-black/5 transition-all">
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 pt-24 px-6 md:hidden flex flex-col h-screen w-screen"
            style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}
          >
            <div className="flex flex-col gap-6 text-3xl font-bold">
              <a href="#platform" onClick={() => setIsMobileMenuOpen(false)} className="border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>Platform</a>
              <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>Solutions</a>
              <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className="border-b pb-4" style={{ borderColor: 'var(--border-color)' }}>Work</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="md:pl-20 relative z-10 pt-20 md:pt-0 w-full max-w-[100vw]">
        
        {/* HERO SECTION */}
        <section className="min-h-[85dvh] md:min-h-[95vh] flex flex-col justify-between px-6 md:px-12 py-6 md:py-12 relative overflow-hidden">
          
          <HeroBackground />
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="hidden md:flex justify-between items-start z-10"
          >
            <div>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>EST. 2025</p>
              <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>INFRASTRUCTURE V2.1</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => onLoginClick('customer')} className="text-sm font-medium hover:underline interactive">Log In</button>
              <button 
                onClick={() => onLoginClick('seller')} 
                className="px-6 py-2 font-bold text-sm transition-colors interactive"
                style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
              >
                START SELLING
              </button>
            </div>
          </motion.div>

          {/* Text Container */}
          <div className="relative my-4 md:my-12 z-10 pointer-events-none">
            <h1 className="massive-text leading-[0.9] tracking-tighter break-words">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2 md:mb-0">
                <motion.span initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="block pointer-events-auto">
                  <HackerText text="DESIGN" />
                </motion.span>
              </div>
              <motion.span initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="stroked-text block pointer-events-auto mb-2 md:mb-0">
                CRAFT
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.6 }} 
                className="block mb-2 md:mb-0"
                style={{ color: 'var(--text-muted)' }}
              >
                SELL
              </motion.span>
            </h1>

            {/* === MOBILE ONLY ACTION BUTTONS === */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              // mt-16 for gap from text
              className="md:hidden mt-16 flex flex-col gap-3 pointer-events-auto w-full max-w-sm"
            >
              <button 
                onClick={() => onLoginClick('seller')} 
                className="neon-button w-full py-3 font-bold text-sm rounded-lg flex items-center justify-center gap-2 interactive active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
              >
                START SELLING <ArrowRight size={16} />
              </button>
              
              <button 
                onClick={() => onLoginClick('customer')} 
                className="w-full py-3 backdrop-blur-md border font-medium text-sm rounded-lg flex items-center justify-center gap-2 interactive active:scale-95 transition-all"
                style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}
              >
                LOG IN <LogIn size={16} className="opacity-70"/>
              </button>
            </motion.div>
            {/* ================================== */}

          </div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 1, duration: 1 }} 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t pt-5 md:pt-8 z-10 backdrop-blur-sm"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="col-span-1">
              <p className="text-base md:text-lg leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
                We built the backbone for the next 10,000 brands. Zero inventory. Global scale. Pure aesthetics.
              </p>
            </div>
            <div className="col-span-2 flex flex-col md:flex-row md:items-center gap-6 md:justify-end">
              <button onClick={() => navigate('/shop')} className="interactive group w-full md:w-auto flex items-center justify-between md:justify-start gap-4 pl-6 pr-2 py-3 border rounded-full transition-all duration-300 active:scale-95" 
                style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--panel-bg)' }}
              >
                <span className="text-sm font-bold uppercase tracking-wider">Explore Platform</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--text-main)', color: 'var(--bg-main)' }}>
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </motion.div>
        </section>

        {/* BENTO GRID SECTION */}
        <section className="py-12 border-t perspective-[2000px] overflow-hidden theme-transition" style={{ borderColor: 'var(--border-color)' }}>
          
          <div className="px-6 md:px-12 mb-6 md:hidden">
            <h3 className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>System Modules <span className="animate-pulse" style={{ color: 'var(--accent-glow)' }}>●</span></h3>
            <p className="text-lg font-bold">Explore Modules</p>
          </div>

          <div className="flex flex-col gap-6 px-6 pb-8 md:grid md:grid-cols-4 md:grid-rows-2 md:gap-4 md:px-12 md:h-[800px] md:pb-0 md:overflow-visible">
            
            {/* Box 1: Core Engine */}
            <div className="w-full md:w-auto md:col-span-2 md:row-span-2 h-full">
              <BentoBox3D className="h-full flex flex-col justify-between min-h-[400px]" style={{ backgroundColor: 'var(--bg-main)' }} title="Core Engine">
                <div className="z-10 mt-6 md:mt-10">
                  <Cpu size={40} className="mb-6" style={{ color: 'var(--text-main)' }} />
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">Neural Production.</h3>
                  <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Our API automatically routes your order to the print facility closest to the customer.
                  </p>
                </div>
                <div className="w-full h-40 border mt-8 rounded-lg relative overflow-hidden flex flex-col justify-end p-4 font-mono text-[10px] md:text-xs shadow-inner" 
                     style={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'var(--border-color)', color: 'var(--accent-glow)' }}>
                    {logs.map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        {log}
                      </motion.div>
                    ))}
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-glow)' }}></div>
                </div>
              </BentoBox3D>
            </div>
            
            {/* Box 2: Analytics */}
            <div className="w-full md:w-auto md:col-span-2 h-full">
              <BentoBox3D className="h-full min-h-[250px] flex flex-col" title="Analytics">
                <div className="flex items-end justify-between flex-1 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold">Real-time Insights</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track every penny.</p>
                  </div>
                  <TrendingUp size={40} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                  <svg viewBox="0 0 100 20" className="w-full h-full fill-none" preserveAspectRatio="none">
                    <path d="M0 20 Q 20 5 40 10 T 80 5 T 100 15" strokeWidth="0.5" stroke="var(--text-main)" />
                  </svg>
                </div>
              </BentoBox3D>
            </div>

            {/* Box 3: Global */}
            <div className="w-full md:w-auto md:col-span-1 h-full">
              <BentoBox3D className="h-full min-h-[250px]" title="Global">
                <Globe size={32} className="mb-4" style={{ color: 'var(--text-muted)' }} />
                <h3 className="text-xl font-bold">Worldwide</h3>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Shipping to 195 nations.</p>
              </BentoBox3D>
            </div>

            {/* Box 4: Start CTA */}
            <div className="w-full md:w-auto md:col-span-1 h-full">
              <BentoBox3D className="h-full min-h-[250px]" title="Start" style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}>
                <div className="flex flex-col h-full justify-between">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full shadow-xl" style={{ backgroundColor: 'var(--button-text)', color: 'var(--button-bg)' }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold leading-tight tracking-tight">Launch in<br/>Seconds</h3>
                  </div>
                </div>
              </BentoBox3D>
            </div>
          </div>
        </section>
        
        <ProcessPipeline />

        {/* INFINITE TICKER */}
        <div className="w-full overflow-hidden my-16 md:my-20">
            <div className="py-12 md:py-20 rotate-[-2deg] scale-105 border-y-4" style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)', borderColor: 'var(--button-text)' }}>
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

        {/* FEATURES */}
        <section className="px-6 md:px-12 py-16 md:py-20 max-w-7xl mx-auto">
          <div className="mb-16 max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                Not just a platform.<br/><span style={{ color: 'var(--text-muted)' }}>A power plant.</span>
              </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <BentoBox3D className="relative group rounded-2xl overflow-hidden border-none aspect-[4/3] md:aspect-auto md:h-[500px]" style={{ backgroundColor: 'var(--bg-main)' }}>
               <div className="absolute inset-0 z-10 transition-all duration-700 ease-out" style={{ backgroundColor: 'var(--panel-bg)', opacity: 0.1 }} />
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
                  className="group border-b py-8 active:bg-white/5 transition-all cursor-default interactive"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-4">
                    <span className="text-xs font-mono border px-2 py-1 rounded" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>0{i+1}</span> 
                    {item.title}
                  </h3>
                  <p className="text-base md:text-lg transition-colors pl-12" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t pt-16 md:pt-20 pb-10 px-6 md:px-12 mb-0 theme-transition" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 md:mb-20">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-[15vw] md:text-[8vw] font-bold leading-none tracking-tighter select-none" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                GIFTOMIZE
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Sitemap</h4>
              <a href="#" className="hover:opacity-100 opacity-60 interactive">Home</a>
              <a href="#" className="hover:opacity-100 opacity-60 interactive">Marketplace</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Legal</h4>
              <a href="#" className="hover:opacity-100 opacity-60 interactive">Privacy</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between border-t pt-8 gap-4" style={{ borderColor: 'var(--border-color)' }}>
             <div className="text-xs font-mono flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
               <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-glow)' }}></span>
               SYSTEM STATUS: OPERATIONAL
             </div>
             <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 GIFTOMIZE INC.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;