// src/SellerRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, ArrowRight, CheckCircle, Mail, Lock, User, 
  ShoppingBag, Sparkles, Loader2, ChevronRight, Phone, AlertCircle, ArrowLeft
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

/* -------------------------------------------------------------------------- */
/* STYLES & ANIMATIONS (CSS-IN-JS)                                            */
/* -------------------------------------------------------------------------- */
const styleInjection = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 10s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  
  .glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  }
`;

// ==========================================
// 1. UI COMPONENTS
// ==========================================

const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
  const base = "flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-slate-200/50",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 shadow-none px-4"
  };
  return (
    <button disabled={loading} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
};

const InputGroup = ({ icon: Icon, ...props }) => (
    <div className="group relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Icon className="w-5 h-5" />
        </div>
        <input 
            {...props}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all placeholder:text-slate-400"
        />
    </div>
);

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function SellerRegister({ onLoginSuccess, initialMode = 'register' }) {
  const navigate = useNavigate();
  const isLoginView = initialMode === 'login'; 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    category: 'Clothing',
    phone: '', 
    description: 'Welcome to my new shop on Giftomize!' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        if (isLoginView) {
            // === LOGIN LOGIC ===
            const res = await fetch(`${API_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");

            // Check Role
            if(data.role !== 'seller' && data.role !== 'founder' && data.role !== 'admin') {
                 throw new Error("This account is not registered as a Seller.");
            }

            onLoginSuccess(data);

        } else {
            // === REGISTER LOGIC (2 Steps) ===
            
            // 1. Create User
            const userRes = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                })
            });

            const userData = await userRes.json();
            if (!userRes.ok) throw new Error(userData.message || "User registration failed");

            // 2. Create Shop
            const shopRes = await fetch(`${API_URL}/api/shops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', 
                body: JSON.stringify({
                    name: formData.shopName,
                    description: formData.description,
                    phone: formData.phone,
                    categories: [formData.category]
                })
            });

            const shopData = await shopRes.json();
            if (!shopRes.ok) throw new Error(shopData.message || "Shop creation failed");

            // 3. Success
            const finalUser = { ...userData, role: 'seller', shop: shopData._id };
            onLoginSuccess(finalUser);
        }

    } catch (err) {
        setError(err.message);
        setLoading(false);
    }
  };

  // Helper to switch routes
  const handleSwitchMode = () => {
      setError("");
      setStep(1);
      if(isLoginView) {
          navigate('/seller-register');
      } else {
          navigate('/seller-login');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      <style>{styleInjection}</style>
      
      {/* --- LEFT SIDE: VALUE PROP (Animated Background) --- */}
      <div className="hidden lg:flex w-1/2 bg-[#020617] relative flex-col justify-between p-16 text-white overflow-hidden">
         {/* Animated Blobs */}
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] animate-blob"></div>
         <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>

         <div className="relative z-10">
            <div onClick={() => navigate('/')} className="flex items-center gap-3 mb-10 cursor-pointer group w-fit">
               <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">C</div>
               <span className="font-bold text-xl tracking-tight">Giftomize</span>
            </div>
            
            <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-black leading-[1.1]">
                   {isLoginView ? (
                       <>Welcome back,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Partner.</span></>
                   ) : (
                       <>Build your<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Empire</span> here.</>
                   )}
                </h1>
                
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                   {isLoginView 
                    ? "Manage your inventory, track analytics, and handle orders from your command center."
                    : "Join the fastest-growing marketplace for creators. Zero setup fees. Infinite potential."
                   }
                </p>
            </div>
         </div>

         {/* Testimonial Card */}
         <div className="relative z-10 glass-panel p-6 rounded-2xl max-w-md mt-auto">
            <div className="flex gap-1 text-amber-400 mb-3">
               {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 fill-current"/>)}
            </div>
            <p className="text-white/90 font-medium italic mb-4 leading-relaxed">"The seller tools are incredible. I set up my shop in 5 minutes and got my first order the same day."</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">SJ</div>
               <div>
                  <p className="font-bold text-sm text-white">Sarah Jenkins</p>
                  <p className="text-xs text-slate-400">Founder, StreetStyle</p>
               </div>
            </div>
         </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white/50 relative">
         {/* Mobile Background Decoration */}
         <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -z-10 opacity-50"></div>
         
         <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 transition-all duration-300">
            
            {/* Header */}
            <div className="mb-8">
               <h2 className="text-3xl font-black text-slate-900 mb-2">
                   {isLoginView ? 'Seller Login' : 'Start Selling'}
               </h2>
               <div className="flex items-center justify-between">
                   <p className="text-slate-500 text-sm">
                       {isLoginView ? 'Access your seller dashboard' : 'Create your business account'}
                   </p>
                   {!isLoginView && (
                       <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                           Step {step} of 2
                       </span>
                   )}
               </div>
               
               {/* Progress Bar */}
               {!isLoginView && (
                   <div className="w-full h-1.5 bg-slate-100 mt-5 rounded-full overflow-hidden">
                      <div className={`h-full bg-indigo-600 transition-all duration-500 ease-out ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                   </div>
               )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               
               {/* === LOGIN VIEW === */}
               {isLoginView && (
                   <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
                           <InputGroup icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="store@example.com" required autoFocus />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                           <InputGroup icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                       </div>
                       <Button type="submit" loading={loading} className="w-full mt-4">Access Dashboard <ArrowRight className="w-4 h-4"/></Button>
                   </div>
               )}

               {/* === REGISTER VIEW === */}
               {!isLoginView && (
                   <>
                       {/* STEP 1: ACCOUNT DETAILS */}
                       {step === 1 && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
                                <InputGroup icon={User} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Founder Name" required autoFocus />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
                                <InputGroup icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="business@example.com" required />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                                <InputGroup icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
                             </div>

                             <div className="pt-2">
                                <Button 
                                   type="button" 
                                   className="w-full" 
                                   onClick={() => {
                                      if(formData.name && formData.email && formData.password) setStep(2);
                                      else setError("Please fill all fields to continue.");
                                   }}
                                >
                                   Continue <ArrowRight className="w-4 h-4" />
                                </Button>
                             </div>
                          </div>
                       )}

                       {/* STEP 2: STORE DETAILS */}
                       {step === 2 && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Shop Name</label>
                                <InputGroup icon={Store} type="text" name="shopName" value={formData.shopName} onChange={handleChange} placeholder="e.g. Urban Threads" required autoFocus />
                             </div>

                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Contact Phone</label>
                                <InputGroup icon={Phone} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" required />
                             </div>
                             
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Category</label>
                                <div className="relative group">
                                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                      <ShoppingBag className="w-5 h-5" />
                                   </div>
                                   <select 
                                      name="category"
                                      value={formData.category}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium appearance-none transition-all cursor-pointer text-slate-900"
                                   >
                                      <option>Clothing & Apparel</option>
                                      <option>Art & Decor</option>
                                      <option>Tech Accessories</option>
                                      <option>Handmade Goods</option>
                                   </select>
                                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                      <ChevronRight className="w-4 h-4 rotate-90" />
                                   </div>
                                </div>
                             </div>

                             <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start border border-indigo-100">
                                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-800 leading-relaxed font-medium">
                                   By clicking "Launch Store", you agree to our Seller Terms. You'll get instant access to your dashboard.
                                </p>
                             </div>

                             <div className="flex gap-3 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="px-2"><ArrowLeft className="w-5 h-5"/></Button>
                                <Button type="submit" loading={loading} className="flex-1">Launch Store</Button>
                             </div>
                          </div>
                       )}
                   </>
               )}

            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
               <p className="text-sm text-slate-500">
                  {isLoginView ? "Don't have a seller account?" : "Already have a seller account?"} 
                  <button 
                    onClick={handleSwitchMode} 
                    className="text-indigo-600 font-bold hover:underline ml-1 transition-all"
                  >
                    {isLoginView ? "Register Now" : "Login here"}
                  </button>
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}