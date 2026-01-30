import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, User, Star, MessageSquare, Truck, ShieldCheck, RefreshCcw, Store, ShoppingBag, Lock
} from 'lucide-react';

// --- Local Components ---

const Button = ({ children, variant = 'primary', className = '', icon: Icon, loading, ...props }) => {
  const base = "relative overflow-hidden transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
    ghost: "bg-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white/10"
  };
  const sizes = props.size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-6 py-3.5 text-sm';

  return (
    <button disabled={loading} className={`${base} ${variants[variant]} ${sizes} ${className} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} {...props}>
      {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
      {!loading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

// --- Local Hooks ---

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

// --- Main Landing Page Component ---

const LandingPage = ({ onLoginClick }) => {
  const mousePos = useMousePosition();
  const navigate = useNavigate();

  return (
    <>
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-900">
          {/* Dynamic Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] rounded-full bg-indigo-600 blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-purple-600 blur-[100px] animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8 animate-slide-in text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  India's #1 Custom Marketplace
               </div>
               <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                 Craft.<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Sell.</span><br/>
                 Scale.
               </h1>
               <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0">
                 The ultimate platform for creators and shoppers. Buy custom goods, chat with sellers directly, and launch your brand.
               </p>
               
               {/* DUAL BUTTONS FOR MARKETPLACE MODEL */}
               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={() => navigate('/shop')} size="lg" variant="accent" className="rounded-full px-8 py-4 text-base shadow-indigo-500/50">
                     <ShoppingBag className="w-5 h-5"/> Shop Marketplace
                  </Button>
                  <Button onClick={() => onLoginClick('seller')} size="lg" variant="outline" className="rounded-full px-8 py-4 text-base">
                     <Store className="w-5 h-5"/> Become a Seller
                  </Button>
               </div>
            </div>
            
            {/* Premium Kit Parallax Card */}
            <div className="relative flex justify-center perspective-1000">
               <div 
                  className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-3xl shadow-2xl transition-all duration-500 animate-float"
                  style={{ 
                    transform: typeof window !== 'undefined' && window.innerWidth > 1024 
                      ? `rotateY(${mousePos.x * 0.02}deg) rotateX(${mousePos.y * -0.02}deg)` 
                      : 'none' 
                  }}
               >
                  <div className="aspect-[4/3] w-full max-w-[500px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 overflow-hidden relative shadow-inner">
                      <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" className="object-cover w-full h-full mix-blend-overlay opacity-60" alt="Premium Kit" />
                      <div className="absolute bottom-6 left-6 text-white">
                         <p className="font-bold text-2xl">Create Your Brand</p>
                         <p className="text-white/80">Join 500+ Sellers</p>
                      </div>
                  </div>
                  <div className="flex items-center justify-between text-white">
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white/20 bg-slate-800 flex items-center justify-center text-xs">
                               <User className="w-4 h-4"/>
                            </div>
                         ))}
                      </div>
                      <p className="text-sm font-medium">10k+ Active Users</p>
                  </div>
               </div>
               {/* Floating Elements */}
               <div className="absolute -top-4 -right-4 lg:-top-10 lg:-right-10 bg-white p-3 lg:p-4 rounded-2xl shadow-xl animate-bounce delay-700 z-20">
                  <Star className="w-6 h-6 lg:w-8 lg:h-8 text-amber-400 fill-amber-400" />
               </div>
            </div>
          </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                  { icon: MessageSquare, title: "Chat Customization", desc: "Talk to sellers directly. Specify your engraving, colors, or bulk requirements." },
                  { icon: Truck, title: "Fast Shipping", desc: "Priority delivery across India within 3-5 business days." },
                  { icon: ShieldCheck, title: "Quality Guarantee", desc: "Premium materials or your money back. No questions asked." }
               ].map((feat, i) => (
                  <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-200">
                         <feat.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                      <p className="text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer with Founder Access */}
      <footer className="bg-[#0F172A] text-white py-16 border-t border-slate-800">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
            <div className="col-span-1 md:col-span-2">
               <h2 className="text-2xl font-bold mb-4">Craftify.</h2>
               <p className="text-slate-400 max-w-sm leading-relaxed">
                 Empowering creators and brands with premium custom merchandise. Built with cutting-edge tech in India.
               </p>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-slate-200">Marketplace</h3>
               <ul className="space-y-2 text-slate-400">
                  <li className="hover:text-white cursor-pointer" onClick={() => navigate('/shop')}>Shop Now</li>
                  <li className="hover:text-white cursor-pointer" onClick={() => onLoginClick('seller')}>Become a Seller</li>
                  <li>Success Stories</li>
               </ul>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-slate-200">Company</h3>
               <ul className="space-y-2 text-slate-400">
                  <li>About Us</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  {/* FOUNDER ACCESS BUTTON */}
                  <li>
                      <button onClick={() => onLoginClick('founder')} className="flex items-center gap-2 text-slate-600 hover:text-indigo-400 transition-colors mt-4 text-xs font-bold uppercase tracking-widest">
                         <Lock className="w-3 h-3" /> Founder Access
                      </button>
                  </li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
            © 2026 Craftify Inc. All rights reserved.
         </div>
      </footer>
    </>
  );
};

export default LandingPage;