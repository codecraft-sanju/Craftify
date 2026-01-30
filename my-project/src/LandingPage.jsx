import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ShoppingBag, Store, ShieldCheck, Zap, Globe, 
  CreditCard, Play, Star, Menu, X, ChevronRight, Lock, 
  TrendingUp, Users, Package, Box, Check, Activity, Heart, Gift, Timer
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* STYLES & ANIMATIONS                                                        */
/* -------------------------------------------------------------------------- */
const styleInjection = `
  /* Global Fix for Mobile White Bar */
  html, body {
    background-color: #020617; /* Matches slate-950 */
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    width: 100%;
  }

  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  @keyframes grid-move {
    0% { background-position: 0 0; }
    100% { background-position: 40px 40px; }
  }
  @keyframes scroll-left {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes float-hearts {
    0% { transform: translateY(100vh) scale(0); opacity: 0; }
    50% { opacity: 0.8; }
    100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
  }
  @keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.4); }
    70% { box-shadow: 0 0 0 20px rgba(225, 29, 72, 0); }
    100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
  }
  
  .animate-blob { animation: blob 10s infinite; }
  .animate-grid { animation: grid-move 3s linear infinite; }
  .animate-scroll-left { animation: scroll-left 30s linear infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-heart { animation: float-hearts 4s linear infinite; }
  .animate-pulse-red { animation: pulse-red 2s infinite; }
  
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  .perspective-1000 { perspective: 1000px; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  
  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  .glass-nav {
    background: rgba(2, 6, 23, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  .text-gradient {
    background: linear-gradient(135deg, #FFF 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-primary {
    background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-love {
    background: linear-gradient(135deg, #f43f5e 0%, #fb7185 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .cyber-grid {
    background-size: 40px 40px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
  }

  /* Reveal on Scroll Classes */
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
  }
  .reveal.active {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* -------------------------------------------------------------------------- */
/* HOOKS & UTILITIES                                                          */
/* -------------------------------------------------------------------------- */

// Hook to handle scroll reveal animations
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
/* -------------------------------------------------------------------------- */

// --- 3D Tilt Card Component ---
const TiltCard = ({ children, className }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const onMouseMove = (e) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;

    setRotate({ x: rotateX, y: rotateY });
  };

  const onMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
      }}
    >
      {children}
    </div>
  );
};

// --- Reusable Button ---
const Button = ({ children, variant = 'primary', className = '', icon: Icon, onClick }) => {
  const baseStyle = "group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-sm transition-all duration-300 rounded-full active:scale-95 overflow-hidden";
  
  const variants = {
    primary: "bg-white text-slate-950 hover:bg-indigo-50 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]",
    glow: "bg-indigo-600 text-white shadow-[0_0_30px_-5px_rgba(79,70,229,0.4)] hover:bg-indigo-500 hover:shadow-[0_0_50px_-10px_rgba(79,70,229,0.6)]",
    love: "bg-rose-600 text-white shadow-[0_0_30px_-5px_rgba(225,29,72,0.6)] hover:bg-rose-500 hover:shadow-[0_0_50px_-10px_rgba(225,29,72,0.8)]",
    outline: "bg-transparent text-white border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {(variant === 'glow' || variant === 'love') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      )}
      {Icon && <Icon className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

// --- Live Activity Toast ---
const LiveActivity = () => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState({ name: '', action: '', time: '' });

  const activities = [
    { name: 'Rahul from Delhi', action: 'started a new store', time: '2s ago' },
    { name: 'Sarah from Mumbai', action: 'sold a Custom Hoodie', time: '12s ago' },
    { name: 'Amit from Bangalore', action: 'earned ₹12,000', time: '1m ago' },
    { name: 'Priya from Pune', action: 'bought Valentine Gift', time: '5s ago' },
  ];

  useEffect(() => {
    const loop = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setData(randomActivity);
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    }, 8000);
    return () => clearInterval(loop);
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 z-40 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="glass-card p-4 rounded-xl flex items-center gap-4 max-w-sm border-l-4 border-l-green-500">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <Activity className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{data.name}</p>
          <p className="text-xs text-slate-400">{data.action} • {data.time}</p>
        </div>
      </div>
    </div>
  );
};

// --- Navbar ---
const Navbar = ({ onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <Box className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Craftify<span className="text-indigo-500">.</span></span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
          {['Marketplace', 'Features', 'Showcase', 'Offers'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="px-5 py-2 rounded-full text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              {item}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => onLoginClick('seller')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Sign In
          </button>
          <Button variant="primary" size="sm" className="px-6 py-2.5 text-xs h-10" onClick={() => navigate('/shop')}>
            Start Free
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-slate-950 border-b border-slate-800 p-6 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-2xl">
           <Button variant="outline" className="w-full justify-center" onClick={() => navigate('/shop')}>Shop Marketplace</Button>
           <Button variant="glow" className="w-full justify-center" onClick={() => onLoginClick('seller')}>Become a Seller</Button>
        </div>
      )}
    </nav>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

const LandingPage = ({ onLoginClick }) => {
  const navigate = useNavigate();
  useScrollReveal();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <style>{styleInjection}</style>
      <Navbar onLoginClick={onLoginClick} />
      <LiveActivity />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 cyber-grid animate-grid opacity-30"></div>
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
          <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center">
            
            {/* Announcement Badge */}
            <div className="animate-float inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-10 cursor-pointer hover:bg-indigo-500/20 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              V2.0 is live: Now with AI Design Studio
              <ChevronRight className="w-3 h-3" />
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1] reveal active">
              <span className="text-gradient block">Design. Sell.</span>
              <span className="text-gradient-primary block">Dominate.</span>
            </h1>

            <p className="max-w-2xl text-lg md:text-xl text-slate-400 mb-10 leading-relaxed reveal active delay-100">
              Craftify is the enterprise-grade infrastructure for modern creators. 
              Launch your custom brand in minutes, not months. Zero inventory, infinite scale.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto reveal active delay-200">
              <Button variant="glow" icon={ShoppingBag} onClick={() => navigate('/shop')}>
                Explore Marketplace
              </Button>
              <Button variant="outline" icon={Store} onClick={() => onLoginClick('seller')}>
                Launch Your Brand
              </Button>
            </div>

            {/* Floating Dashboard Mockup */}
            <div className="mt-24 relative w-full max-w-5xl mx-auto px-6 reveal">
               <TiltCard className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10 bg-slate-900/80 backdrop-blur-xl relative group">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  {/* Mock UI Header */}
                  <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                  </div>
                  {/* Image Placeholder */}
                  <div className="aspect-[16/9] bg-slate-900 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 to-purple-900/20"></div>
                      <img 
                        src="/dashboard.png" 
                        alt="Analytics Dashboard" 
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                        onError={(e) => {
                          e.target.style.display='none'; 
                          e.target.parentNode.innerHTML += '<span class="text-slate-600 font-mono">Dashboard Preview Unavailable</span>'
                        }}
                      />
                      {/* Overlay Stats */}
                      <div className="absolute bottom-8 left-8 p-4 glass-card rounded-xl animate-float">
                         <p className="text-xs text-slate-400 mb-1">Total Revenue</p>
                         <p className="text-2xl font-bold text-white">₹14,20,590</p>
                         <div className="flex items-center gap-1 text-green-400 text-xs mt-1">
                           <TrendingUp className="w-3 h-3" /> +24% this week
                         </div>
                      </div>
                  </div>
               </TiltCard>
               {/* Glow behind card */}
               <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl -z-10 rounded-[3rem]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MARQUEE SECTION --- */}
      <div className="py-12 border-y border-white/5 bg-slate-950/50 overflow-hidden">
        <div className="flex animate-scroll-left w-[200%] gap-16 items-center">
             {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-16 shrink-0">
                  {['Google', 'Spotify', 'Amazon', 'Stripe', 'Nike', 'Adobe', 'Shopify', 'Webflow'].map((brand) => (
                    <span key={brand} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-600 uppercase tracking-widest hover:to-white transition-all cursor-default">
                      {brand}
                    </span>
                  ))}
                </div>
             ))}
        </div>
      </div>

      {/* --- VALENTINE'S DAY SPECIAL SECTION (Replaces Pricing) --- */}
      <section className="py-24 relative overflow-hidden" id="offers">
         {/* Background Decoration */}
         <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 to-slate-950"></div>
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
               <Heart 
                 key={i} 
                 className="absolute text-rose-500/20 w-8 h-8 animate-heart" 
                 style={{ 
                   left: `${Math.random() * 100}%`, 
                   animationDelay: `${Math.random() * 5}s`,
                   fontSize: `${Math.random() * 20 + 20}px`
                 }} 
               />
            ))}
         </div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="glass-card rounded-[3rem] border-rose-500/30 overflow-hidden relative shadow-[0_0_100px_-20px_rgba(225,29,72,0.3)]">
               <div className="grid grid-cols-1 lg:grid-cols-2">
                  
                  {/* Left: Content */}
                  <div className="p-10 md:p-16 flex flex-col justify-center">
                     <div className="inline-flex items-center gap-2 text-rose-400 font-bold tracking-widest uppercase text-xs mb-4">
                        <Gift className="w-4 h-4" /> Valentine's Exclusive
                     </div>
                     <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Share the <br/>
                        <span className="text-gradient-love">Love & Merch.</span>
                     </h2>
                     <p className="text-lg text-rose-200/70 mb-8 max-w-md">
                        Get the limited edition <strong>Couple's Creator Pack</strong>. 
                        Design matching hoodies, tees, and mugs for you and your partner.
                     </p>
                     
                     <div className="flex items-center gap-4 mb-10 bg-rose-900/20 p-4 rounded-2xl w-fit border border-rose-500/20">
                        <div className="text-center px-4 border-r border-rose-500/20">
                           <span className="block text-3xl font-bold text-white">50%</span>
                           <span className="text-xs text-rose-300">OFF</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-sm font-bold text-white">Using Code: LOVE2026</span>
                           <span className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                              <Timer className="w-3 h-3" /> Valid 1st - 14th Feb
                           </span>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Button variant="love" icon={Heart} className="animate-pulse-red" onClick={() => navigate('/shop?collection=valentine')}>
                           Claim Offer
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/shop')}>
                           View Collection
                        </Button>
                     </div>
                  </div>

                  {/* Right: Visuals */}
                  <div className="relative h-[400px] lg:h-auto bg-gradient-to-br from-rose-600/20 to-purple-900/20 flex items-center justify-center p-10">
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                     
                     {/* Floating Cards Effect */}
                     <div className="relative w-full max-w-md aspect-square">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500 rounded-full blur-[80px] opacity-40 animate-pulse"></div>
                        
                        <div className="absolute top-10 left-0 w-48 glass-card p-3 rounded-2xl rotate-[-12deg] animate-float">
                           <div className="w-full aspect-[4/5] bg-slate-800 rounded-xl mb-3 overflow-hidden">
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500 text-xs">His Hoodie</div>
                           </div>
                           <div className="h-2 w-2/3 bg-slate-700 rounded-full"></div>
                        </div>

                        <div className="absolute bottom-10 right-0 w-48 glass-card p-3 rounded-2xl rotate-[12deg] animate-float animation-delay-2000">
                           <div className="w-full aspect-[4/5] bg-slate-800 rounded-xl mb-3 overflow-hidden">
                              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500 text-xs">Her Hoodie</div>
                           </div>
                           <div className="h-2 w-2/3 bg-slate-700 rounded-full"></div>
                        </div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                           <Heart className="w-8 h-8 text-rose-500 fill-current" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-32 bg-slate-950 relative" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 reveal">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need to <br/><span className="text-indigo-500">scale globally.</span></h2>
            <p className="text-slate-400 max-w-xl text-lg">We've built the infrastructure so you can focus on creativity. From payments to logistics, we handle the complex bits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[650px]">
             {/* Large Left Block */}
             <div className="col-span-1 md:col-span-2 row-span-2 glass-card rounded-3xl p-10 relative overflow-hidden group reveal">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-30 transition-opacity duration-500">
                   <Globe className="w-64 h-64 text-indigo-500" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                   <div>
                     <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                        <Globe className="w-7 h-7 text-indigo-400" />
                     </div>
                     <h3 className="text-3xl font-bold text-white mb-3">Global Logistics Network</h3>
                     <p className="text-slate-400 max-w-md leading-relaxed">Our automated shipping partners deliver to 25,000+ pincodes. Real-time tracking, automated labels, and COD support built-in.</p>
                   </div>
                   
                   {/* Interactive Map Visual */}
                   <div className="mt-8 p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md max-w-sm hover:border-indigo-500/50 transition-colors cursor-crosshair">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                         <span className="text-xs text-slate-300 font-mono tracking-wide">LIVE SHIPMENTS</span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((_, k) => (
                          <div key={k} className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Order #882{k}</span>
                            <span className="text-indigo-400">In Transit</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>

             {/* Top Right Block */}
             <div className="glass-card rounded-3xl p-8 group hover:bg-white/5 transition-all duration-300 reveal delay-100">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Escrow Payments</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Funds are released only after customer satisfaction. 100% fraud protection.</p>
             </div>

             {/* Bottom Right Block */}
             <div className="glass-card rounded-3xl p-8 group hover:bg-white/5 transition-all duration-300 reveal delay-200">
                <Zap className="w-12 h-12 text-amber-400 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">Instant Setup</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Go from sign-up to first sale in less than 5 minutes. No coding required.</p>
             </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS (Moving Rail) --- */}
      <section className="py-20 overflow-hidden bg-slate-900/30 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6 mb-10 text-center reveal">
            <h2 className="text-2xl font-bold text-white">Trusted by modern entrepreneurs</h2>
         </div>
         <div className="flex animate-scroll-left w-[200%] gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6 shrink-0">
                {[1,2,3,4].map((n) => (
                  <div key={n} className="w-[350px] glass-card p-6 rounded-2xl shrink-0">
                     <div className="flex gap-1 text-amber-400 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-slate-300 text-sm mb-6 leading-relaxed">"Craftify completely changed how I run my business. The automated shipping is a lifesaver!"</p>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500"></div>
                        <div>
                           <p className="text-white text-sm font-bold">Alex Johnson</p>
                           <p className="text-slate-500 text-xs">Founder, PrintStyle</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            ))}
         </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute inset-0 bg-indigo-600/10"></div>
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center reveal">
            <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight">Ready to revolutionize <br/>your business?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Join 10,000+ creators who are earning over ₹1 Lakh/month on Craftify. No credit card required.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button variant="primary" className="py-5 px-12 text-lg h-14" onClick={() => onLoginClick('seller')}>
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
               </Button>
            </div>
            <div className="mt-12 flex justify-center gap-8 text-slate-500 text-sm font-medium">
               <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Free 14-day trial</span>
               <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Cancel anytime</span>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Box className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-white">Craftify.</span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
                The world's most advanced marketplace for custom merchandise. Built for speed, security, and scale.
              </p>
              <div className="flex gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all cursor-pointer">
                    <Globe className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {['Marketplace', 'Features', 'Sellers', 'Login'].map(item => (
                  <li key={item} className="hover:text-indigo-400 cursor-pointer transition-colors">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
                  <li key={item} className="hover:text-indigo-400 cursor-pointer transition-colors">{item}</li>
                ))}
                <li>
                  <button onClick={() => onLoginClick('founder')} className="flex items-center gap-2 text-slate-600 hover:text-red-400 transition-colors mt-4 text-xs font-bold uppercase tracking-widest">
                     <Lock className="w-3 h-3" /> Founder Access
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">© 2026 Craftify Inc. All rights reserved.</p>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-slate-400 text-xs font-mono">Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;