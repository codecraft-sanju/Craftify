import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Menu, X, 
  TrendingUp, Zap, Globe,
  ArrowUpRight, Cpu, 
  Layers, ShieldCheck
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
    overflow-x: hidden; /* Critical for mobile to prevent side-scroll */
    -webkit-font-smoothing: antialiased;
  }

  /* --- DYNAMIC BACKGROUND GRID --- */
  .tech-grid {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background-image: 
      linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
    background-size: 40px 40px; /* Slightly smaller grid for mobile density */
    z-index: -1;
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
  }

  /* --- GLOW EFFECTS --- */
  .glow-point {
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(60px);
  }

  /* --- GLASS PANELS --- */
  .glass-panel {
    background: rgba(10, 10, 10, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px); /* Safari Mobile Support */
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* --- TYPOGRAPHY SCALING --- */
  /* This clamp ensures text is massive on desktop but fits on mobile */
  .massive-text {
    font-size: clamp(2.5rem, 10vw, 9rem); 
    line-height: 0.95;
    letter-spacing: -0.04em;
    font-weight: 700;
  }

  .stroked-text {
    -webkit-text-stroke: 1px rgba(255,255,255,0.3);
    color: transparent;
    transition: all 0.5s ease;
  }
  
  /* Mobile touch interaction: Fill text on touch/hover */
  .stroked-text:hover, .stroked-text:active {
    color: white;
    -webkit-text-stroke: 0px;
  }

  /* --- ANIMATIONS --- */
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee { animation: marquee 20s linear infinite; }

  /* Mobile Menu Animation */
  .mobile-menu-enter {
    animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Hide scrollbar for horizontal scrolling stats */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

/* -------------------------------------------------------------------------- */
/* REUSABLE COMPONENTS                                                        */
/* -------------------------------------------------------------------------- */

const StatBadge = ({ label, value }) => (
  <div className="flex flex-col border-l border-white/10 pl-4 py-1 min-w-[120px] shrink-0">
    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{label}</span>
    <span className="text-lg font-mono font-medium text-white">{value}</span>
  </div>
);

const BentoBox = ({ children, className = "", title }) => (
  <div className={`glass-panel p-6 relative group overflow-hidden transition-all duration-500 active:scale-[0.98] ${className}`}>
    <div className="absolute top-0 right-0 p-4 opacity-50 md:opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowUpRight size={16} />
    </div>
    {title && <h4 className="text-xs font-mono text-zinc-500 mb-4 uppercase tracking-wider">[{title}]</h4>}
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/* MAIN LANDING PAGE                                                          */
/* -------------------------------------------------------------------------- */

const LandingPage = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      <style>{styleInjection}</style>
      
      {/* Background Elements */}
      <div className="tech-grid" />
      <div className="glow-point top-0 left-[-100px]" />
      <div className="glow-point bottom-0 right-[-100px]" />

      {/* --- SIDEBAR NAVIGATION (Desktop Only) --- */}
      <nav className="hidden md:flex flex-col justify-between fixed left-0 top-0 h-full w-20 border-r border-white/10 bg-black/50 backdrop-blur-md z-50 py-8 items-center">
        <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-bold text-xl rounded-sm">G</div>
        <div className="flex flex-col gap-8 [writing-mode:vertical-lr] rotate-180 items-center">
          <a href="#work" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors tracking-widest uppercase">Work</a>
          <a href="#about" className="text-xs font-mono text-zinc-500 hover:text-white transition-colors tracking-widest uppercase">Agency</a>
        </div>
        <Menu className="text-zinc-500 hover:text-white cursor-pointer" size={20} />
      </nav>

      {/* --- MOBILE HEADER (Sticky Top) --- */}
      <div className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center p-5 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold text-lg rounded-sm">G</div>
          <span className="font-bold tracking-tight">GIFTOMIZE</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 active:bg-white/10 rounded-full transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- FULL SCREEN MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black pt-24 px-6 mobile-menu-enter md:hidden flex flex-col">
          <div className="flex flex-col gap-6 text-3xl font-bold">
            <a href="#platform" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/10 pb-4">Platform</a>
            <a href="#solutions" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/10 pb-4">Solutions</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="border-b border-white/10 pb-4">Pricing</a>
          </div>
          <div className="mt-auto mb-10 flex flex-col gap-4">
             <button onClick={() => onLoginClick('customer')} className="w-full py-4 border border-white/20 rounded-lg text-lg font-medium">Log In</button>
             <button onClick={() => onLoginClick('seller')} className="w-full py-4 bg-white text-black rounded-lg text-lg font-bold">Start Selling</button>
          </div>
        </div>
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className="md:pl-20 relative z-10 pt-20 md:pt-0">
        
        {/* --- HERO SECTION --- */}
        <section className="min-h-[85vh] flex flex-col justify-between px-6 md:px-12 py-6 md:py-12 relative overflow-hidden">
          
          {/* Top Bar (Desktop) */}
          <div className="hidden md:flex justify-between items-start">
            <div>
              <p className="text-xs text-zinc-500 font-mono">EST. 2025</p>
              <p className="text-xs text-zinc-500 font-mono">INFRASTRUCTURE V2.1</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => onLoginClick('customer')} className="text-sm font-medium hover:underline">Log In</button>
              <button onClick={() => onLoginClick('seller')} className="px-6 py-2 bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors">START SELLING</button>
            </div>
          </div>

          {/* Massive Text (Optimized for Mobile Wrapping) */}
          <div className="relative my-8 md:my-12">
            <h1 className="massive-text leading-[0.9] tracking-tighter break-words">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="block">DIGITAL</span>
                {/* Badge wraps correctly on mobile */}
                <span className="w-fit text-xs md:text-xl font-mono border border-white/20 px-3 py-1 rounded-full text-zinc-400 mb-2 md:mb-0 md:mt-4 tracking-wide bg-black/50 backdrop-blur-sm">
                  (FUTURE_COMMERCE)
                </span>
              </div>
              {/* Responsive break to prevent overflow */}
              <span className="stroked-text block">MERCHANDISE</span>
              <span className="block text-zinc-600">REDEFINED.</span>
            </h1>
          </div>

          {/* Hero Footer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div className="col-span-1">
              <p className="text-base md:text-lg text-zinc-300 leading-relaxed max-w-sm">
                We built the backbone for the next 10,000 brands. Zero inventory. Global scale. Pure aesthetics.
              </p>
            </div>
            
            {/* Scrollable Stats for Mobile */}
            <div className="col-span-2 flex flex-col md:flex-row md:items-center gap-6 md:justify-end">
               <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                  <StatBadge label="Sellers" value="8.2K+" />
                  <StatBadge label="Shipped" value="1.4M" />
                  <StatBadge label="Countries" value="190+" />
               </div>
              
              <button 
                onClick={() => navigate('/shop')}
                className="group w-full md:w-auto flex items-center justify-between md:justify-start gap-4 pl-6 pr-2 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-300 active:scale-95"
              >
                <span className="text-sm font-bold uppercase tracking-wider">Explore Platform</span>
                <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white">
                  <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* --- BENTO GRID (Mobile Stacked) --- */}
        <section className="px-4 md:px-12 py-12 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-auto md:grid-rows-2 gap-4 h-auto md:h-[800px]">
            
            {/* Core Engine (Tall on Mobile) */}
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
              <div className="w-full h-32 bg-gradient-to-t from-black/80 to-transparent border-t border-white/10 mt-8 rounded-lg relative overflow-hidden flex items-end">
                 <div className="p-4 font-mono text-[10px] md:text-xs text-green-500/80">
                   {`> initiating_sequence(ORDER_ID)`}<br/>
                   {`> routing... node_tokyo [OK]`}<br/>
                   {`> production_status: ACTIVE`}
                 </div>
              </div>
            </BentoBox>

            {/* Analytics */}
            <BentoBox className="md:col-span-2 min-h-[200px]" title="Analytics">
              <div className="flex items-end justify-between h-full relative z-10">
                <div>
                  <h3 className="text-2xl font-bold">Real-time Insights</h3>
                  <p className="text-zinc-500 text-sm">Track every penny.</p>
                </div>
                <TrendingUp size={40} className="text-zinc-600" />
              </div>
            </BentoBox>

            {/* Global Reach */}
            <BentoBox className="md:col-span-1 min-h-[200px]" title="Global">
              <Globe size={32} className="mb-4 text-zinc-400" />
              <h3 className="text-xl font-bold">Worldwide</h3>
              <p className="text-xs text-zinc-500 mt-2">Shipping to 195 nations instantly.</p>
            </BentoBox>

            {/* Quick Start (White Card) */}
            <BentoBox className="md:col-span-1 bg-white text-black min-h-[200px]" title="Start">
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

        {/* --- TICKER (Overflow Protected) --- */}
        <div className="py-12 md:py-20 overflow-hidden bg-white text-black rotate-[-2deg] scale-105 border-y-4 border-black my-16 md:my-20">
          <div className="flex animate-marquee whitespace-nowrap gap-8 md:gap-12">
             {[...Array(10)].map((_, i) => (
               <span key={i} className="text-4xl md:text-6xl font-black italic tracking-tighter">
                 CREATE • SELL • SCALE • 
               </span>
             ))}
          </div>
        </div>

        {/* --- FEATURES --- */}
        <section className="px-6 md:px-12 py-16 md:py-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight">
                Not just a platform.<br/><span className="text-zinc-500">A power plant.</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-400 mb-8">
                We stripped away the complexity of e-commerce. You design the product, we handle the physics.
              </p>
              <button 
                 onClick={() => onLoginClick('seller')}
                 className="text-white border-b border-white pb-1 hover:pb-2 transition-all font-mono text-sm"
              >
                READ_DOCUMENTATION -{'>'}
              </button>
            </div>
            
            <div className="space-y-2">
              {[
                { title: 'Zero Inventory Risk', desc: 'Never pay for stock. We print on demand.' },
                { title: 'White Label', desc: 'Your brand on the box. Your brand on the neck label.' },
                { title: 'Automated Taxes', desc: 'We handle VAT and sales tax globally.' }
              ].map((item, i) => (
                <div key={i} className="group border-b border-white/10 py-6 active:bg-white/5 transition-all cursor-default">
                  <h3 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-600">0{i+1}</span> {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-300 transition-colors">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/10 bg-black pt-16 md:pt-20 pb-10 px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 md:mb-20">
            <div className="col-span-1 md:col-span-2">
              {/* Responsive Text Size for Footer Logo */}
              <h2 className="text-[15vw] md:text-[8vw] font-bold leading-none tracking-tighter text-zinc-800 select-none">
                GIFTOMIZE
              </h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase text-zinc-500">Sitemap</h4>
              <a href="#" className="hover:text-white text-zinc-400">Home</a>
              <a href="#" className="hover:text-white text-zinc-400">Marketplace</a>
              <a href="#" className="hover:text-white text-zinc-400">Sellers</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-mono text-xs uppercase text-zinc-500">Legal</h4>
              <a href="#" className="hover:text-white text-zinc-400">Privacy</a>
              <a href="#" className="hover:text-white text-zinc-400">Terms</a>
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