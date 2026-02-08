import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Menu, X, 
  TrendingUp, Zap, Globe,
  ArrowUpRight, Cpu, 
  Layers, ShieldCheck, Box
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* ULTRA-MODERN CSS (Mobile & Desktop Optimized)                              */
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
    overflow-x: hidden; 
    width: 100%;
    cursor: none; /* Hide default cursor for custom one */
  }

  /* --- CUSTOM CURSOR --- */
  .custom-cursor {
    position: fixed;
    top: 0; left: 0;
    width: 20px; height: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, background-color 0.3s;
    mix-blend-mode: difference;
  }
  .custom-cursor.hovered {
    width: 50px; height: 50px;
    background-color: white;
    border-color: transparent;
    opacity: 0.1;
  }

  /* --- GRAIN OVERLAY --- */
  .grain-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 99;
    opacity: 0.4;
  }

  /* --- DYNAMIC BACKGROUND GRID --- */
  .tech-grid {
    position: fixed;
    top: 0; left: 0; 
    width: 100%; height: 100%;
    background-image: 
      linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
    background-size: 40px 40px; 
    z-index: -1;
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }

  /* --- GLASS PANELS --- */
  .glass-panel {
    background: rgba(10, 10, 10, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* --- TYPOGRAPHY SCALING --- */
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

  /* --- UTILS --- */
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

/* -------------------------------------------------------------------------- */
/* CUSTOM CURSOR COMPONENT                                                    */
/* -------------------------------------------------------------------------- */
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('.interactive')) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div 
      className={`custom-cursor hidden md:block ${isHovered ? 'hovered' : ''}`}
      style={{ left: mousePosition.x, top: mousePosition.y }}
    />
  );
};

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

const ModernLogo = ({ className = "w-10 h-10" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none">
      <path d="M8 8H32V12H12V28H24V20H20V16H28V32H8V8Z" fill="white" />
      <rect x="20" y="20" width="4" height="4" fill="#22c55e" className="animate-pulse" /> 
      <rect x="30" y="8" width="2" height="2" fill="#22c55e" opacity="0.5" />
    </svg>
  </div>
);

const StatBadge = ({ label, value }) => (
  <div className="flex flex-col border-l border-white/10 pl-4 py-1 min-w-[120px] shrink-0">
    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
    <span className="text-lg font-mono font-medium text-white">{value}</span>
  </div>
);

// Advanced BentoBox with Mouse Tracking Glow
const BentoBox = ({ children, className = "", title }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      className={`glass-panel p-6 relative group overflow-hidden transition-all duration-500 hover:border-white/20 ${className} interactive`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      <div className="absolute top-0 right-0 p-4 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={16} />
      </div>
      {title && <h4 className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider relative z-10">[{title}]</h4>}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

// Helper for motion value (needed since we used it inside BentoBox)
import { useMotionValue, useMotionTemplate } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* MAIN LANDING PAGE                                                          */
/* -------------------------------------------------------------------------- */

const LandingPage = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // --- LIVE TERMINAL LOGIC ---
  const [logs, setLogs] = useState([
    "> system_init: OK",
    "> connecting to neural_net...",
    "> node_tokyo: connected"
  ]);

  useEffect(() => {
    const commands = [
      "routing order #8821 -> Berlin",
      "optimizing mesh_network...",
      "new_seller_joined: ID_992",
      "printing: batch_221 [100%]",
      "shipping_label_gen: success",
      "syncing global_inventory..."
    ];
    
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, `> ${commands[Math.floor(Math.random() * commands.length)]}`];
        if (newLogs.length > 5) newLogs.shift();
        return newLogs;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black overflow-x-hidden w-full relative">
      <style>{styleInjection}</style>
      <CustomCursor />
      <div className="grain-overlay" />
      
      {/* Background Elements */}
      <div className="tech-grid" />
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- SIDEBAR (Desktop) --- */}
      <nav className="hidden md:flex flex-col justify-between fixed left-0 top-0 h-full w-20 border-r border-white/10 bg-black/50 backdrop-blur-md z-50 py-8 items-center">
        <div className="hover:scale-110 transition-transform duration-300 cursor-pointer interactive">
           <ModernLogo className="w-10 h-10" />
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
          <ModernLogo className="w-8 h-8" />
          <span className="font-bold tracking-tight text-lg">GIFTOMIZE</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MOBILE MENU --- */}
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

      {/* --- MAIN CONTENT --- */}
      <main className="md:pl-20 relative z-10 pt-20 md:pt-0 w-full max-w-[100vw]">
        
        {/* HERO */}
        <section className="min-h-[90vh] flex flex-col justify-between px-6 md:px-12 py-8 md:py-12 relative overflow-hidden">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex justify-between items-start"
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

          <div className="relative my-8 md:my-12">
            <h1 className="massive-text leading-[0.9] tracking-tighter break-words">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <motion.span 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="block"
                >
                  DIGITAL
                </motion.span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                  className="w-fit text-xs md:text-xl font-mono border border-white/20 px-3 py-1 rounded-full text-zinc-400 mb-2 md:mb-0 md:mt-4 tracking-wide bg-black/50 backdrop-blur-sm"
                >
                  (FUTURE_COMMERCE)
                </motion.span>
              </div>
              <motion.span 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="stroked-text block break-words"
              >
                MERCHANDISE
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="block text-zinc-600"
              >
                REDEFINED.
              </motion.span>
            </h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8"
          >
            <div className="col-span-1">
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-sm">
                We built the backbone for the next 10,000 brands. Zero inventory. Global scale. Pure aesthetics.
              </p>
            </div>
            
            <div className="col-span-2 flex flex-col md:flex-row md:items-center gap-6 md:justify-end">
               <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                  <StatBadge label="Sellers" value="8.2K+" />
                  <StatBadge label="Shipped" value="1.4M" />
                  <StatBadge label="Countries" value="190+" />
               </div>
              
              <button 
                onClick={() => navigate('/shop')}
                className="interactive group w-full md:w-auto flex items-center justify-between md:justify-start gap-4 pl-6 pr-2 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-300 active:scale-95"
              >
                <span className="text-sm font-bold uppercase tracking-wider">Explore Platform</span>
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </motion.div>
        </section>

        {/* BENTO GRID */}
        <section className="px-4 md:px-12 py-12 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-4 h-auto md:h-[800px]">
            
            <BentoBox className="md:col-span-2 md:row-span-2 flex flex-col justify-between bg-zinc-900 min-h-[400px]" title="Core Engine">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.05]"></div>
              <div className="z-10 mt-6 md:mt-10">
                <Cpu size={40} className="mb-6 text-white" />
                <h3 className="text-3xl md:text-4xl font-bold mb-4">Neural Production.</h3>
                <p className="text-zinc-400 text-base md:text-lg max-w-md leading-relaxed">
                  Our API automatically routes your order to the print facility closest to the customer. 
                  Lowest shipping costs. Fastest delivery.
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
            </BentoBox>

            <BentoBox className="md:col-span-2 min-h-[200px] flex flex-col" title="Analytics">
              <div className="flex items-end justify-between flex-1 relative z-10">
                <div>
                  <h3 className="text-2xl font-bold">Real-time Insights</h3>
                  <p className="text-zinc-500 text-sm">Track every penny.</p>
                </div>
                <TrendingUp size={40} className="text-zinc-600" />
              </div>
              {/* Fake Graph Line */}
              <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                 <svg viewBox="0 0 100 20" className="w-full h-full fill-none stroke-white" preserveAspectRatio="none">
                    <path d="M0 20 Q 20 5 40 10 T 80 5 T 100 15" strokeWidth="0.5" />
                 </svg>
              </div>
            </BentoBox>

            <BentoBox className="md:col-span-1 min-h-[200px]" title="Global">
              <Globe size={32} className="mb-4 text-zinc-400" />
              <h3 className="text-xl font-bold">Worldwide</h3>
              <p className="text-xs text-zinc-500 mt-2">Shipping to 195 nations instantly.</p>
            </BentoBox>

            <BentoBox className="md:col-span-1 bg-white text-black min-h-[200px] interactive cursor-pointer" title="Start">
              <div className="flex flex-col h-full justify-between">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-full shadow-xl">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold leading-tight tracking-tight">Launch in<br/>Seconds</h3>
                </div>
              </div>
            </BentoBox>

          </div>
        </section>

        {/* TICKER */}
        <div className="py-12 md:py-20 overflow-hidden bg-white text-black rotate-[-2deg] scale-105 border-y-4 border-black my-16 md:my-20">
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

        {/* FEATURES SECTION */}
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
              <p className="text-lg md:text-xl text-zinc-400">
                We stripped away the complexity of e-commerce. You design the product, we handle the physics.
              </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-[4/3] md:aspect-auto md:h-[500px]"
            >
               <div className="absolute inset-0 z-20 border-2 border-white/5 rounded-2xl pointer-events-none"></div>
               <div className="absolute inset-0 bg-transparent md:bg-black/40 mix-blend-multiply z-10 md:group-hover:bg-transparent transition-all duration-700 ease-out" />
               <img 
                 src="/giftomize.png" 
                 alt="Giftomize Personalized Products" 
                 className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out opacity-100 md:opacity-80 md:group-hover:opacity-100 grayscale-0 md:grayscale-[30%] md:group-hover:grayscale-0"
               />
            </motion.div>
            
            <div className="space-y-4">
              {[
                { title: 'Zero Inventory Risk', desc: 'Never pay for stock. We print on demand.' },
                { title: 'White Label', desc: 'Your brand on the box. Your brand on the neck label.' },
                { title: 'Automated Taxes', desc: 'We handle VAT and sales tax globally.' }
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
              
              <div className="pt-8 pl-12">
                <button 
                   onClick={() => onLoginClick('seller')}
                   className="text-white border-b border-white pb-1 hover:pb-2 transition-all font-mono text-sm flex items-center gap-2 interactive"
                >
                  READ_DOCUMENTATION <ArrowRight size={12}/>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black pt-16 md:pt-20 pb-10 px-6 md:px-12">
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
              <a href="#" className="hover:text-white text-zinc-400 interactive">Sellers</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase text-zinc-500">Legal</h4>
              <a href="#" className="hover:text-white text-zinc-400 interactive">Privacy</a>
              <a href="#" className="hover:text-white text-zinc-400 interactive">Terms</a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-t border-white/10 pt-8 gap-4">
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