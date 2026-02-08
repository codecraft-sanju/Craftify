// src/CustomerAuth.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Sparkles, ArrowLeft, Phone, KeyRound } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

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
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all placeholder:text-slate-400 text-slate-900"
        />
    </div>
);

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

const CustomerAuth = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRegisterRoute = location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);

  // --- CHANGED: Added Phone & OTP ---
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
  
  // --- NEW: Step State (1 = Form, 2 = Verify OTP) ---
  const [verificationStep, setVerificationStep] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state on route change
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
    setFormData({ name: '', email: '', password: '', phone: '', otp: '' });
    setVerificationStep(false); // Reset OTP step
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
          // === LOGIN FLOW ===
          const res = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email: formData.email, password: formData.password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Authentication failed");
          onLoginSuccess(data);

      } else {
          // === REGISTER FLOW ===
          if (!verificationStep) {
              // STEP 1: SEND OTP
              const res = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone // Send Phone
                })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Registration failed");
              
              // Success: Move to OTP Step
              setVerificationStep(true);
              
          } else {
              // STEP 2: VERIFY OTP
              const res = await fetch(`${API_URL}/api/users/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    phone: formData.phone,
                    otp: formData.otp
                })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.message || "Verification failed");

              // Success: Log User In
              onLoginSuccess(data);
          }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
      setVerificationStep(false); // Reset if switching
      if(isLogin) navigate('/register');
      else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      <style>{styleInjection}</style>
      
      {/* --- LEFT SIDE: BRANDING --- */}
      <div className="hidden lg:flex w-1/2 bg-[#020617] relative flex-col justify-between p-16 text-white overflow-hidden">
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
                   {isLogin ? (
                       <>Welcome back,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Trendsetter.</span></>
                   ) : (
                       verificationStep ? 
                       <>Verify your<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Number</span></> :
                       <>Join the<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Club</span> today.</>
                   )}
                </h1>
                
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                   {isLogin 
                    ? "Track your orders, chat with sellers, and discover unique products tailored for you."
                    : verificationStep 
                      ? `We've sent a WhatsApp OTP to ${formData.phone}. Please enter it to complete registration.`
                      : "Create an account to unlock exclusive customizations and faster checkout."
                   }
                </p>
            </div>
         </div>

         <div className="relative z-10 glass-panel p-6 rounded-2xl max-w-md mt-auto">
            <div className="flex gap-1 text-amber-400 mb-3">
               {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 fill-current"/>)}
            </div>
            <p className="text-white/90 font-medium italic mb-4 leading-relaxed">"I love customizing my outfits here. The process is seamless and the quality is amazing!"</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">AK</div>
               <div>
                  <p className="font-bold text-sm text-white">Anjali K.</p>
                  <p className="text-xs text-slate-400">Verified Customer</p>
               </div>
            </div>
         </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white/50 relative">
         <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-3xl -z-10 opacity-50"></div>
         
         <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 transition-all duration-300 relative">
            
            <button onClick={() => navigate('/')} className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-100 transition-colors lg:hidden">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>

            {/* Header */}
            <div className="mb-8 mt-4 lg:mt-0">
               <h2 className="text-3xl font-black text-slate-900 mb-2">
                   {isLogin ? 'Sign In' : (verificationStep ? 'Verify OTP' : 'Create Account')}
               </h2>
               <p className="text-slate-500 text-sm">
                   {isLogin ? 'Enter your credentials to access your account' : (verificationStep ? 'Enter the code sent to your WhatsApp' : 'Fill in the details below to get started')}
               </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
               
               {/* --- LOGIN FORM --- */}
               {isLogin && (
                   <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
                           <InputGroup icon={Mail} type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                           <InputGroup icon={Lock} type="password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required />
                       </div>
                   </div>
               )}

               {/* --- REGISTER FORM (STEP 1) --- */}
               {!isLogin && !verificationStep && (
                   <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
                           <InputGroup icon={User} type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sanjay Choudhary" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
                           <InputGroup icon={Mail} type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone Number (WhatsApp)</label>
                           <InputGroup icon={Phone} type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="e.g. 9876543210" required />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
                           <InputGroup icon={Lock} type="password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required />
                       </div>
                   </div>
               )}

               {/* --- VERIFY OTP FORM (STEP 2) --- */}
               {!isLogin && verificationStep && (
                   <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-4">
                            <p className="text-sm text-indigo-800 font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4" /> OTP sent to {formData.phone} via WhatsApp
                            </p>
                        </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Enter OTP</label>
                           <InputGroup icon={KeyRound} type="text" name="otp" value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} placeholder="123456" required autoFocus maxLength={6} />
                       </div>
                   </div>
               )}

               <Button type="submit" loading={loading} className="w-full mt-6">
                   {isLogin 
                    ? <>{'Sign In'} <ArrowRight className="w-4 h-4"/></> 
                    : verificationStep 
                      ? 'Verify & Create Account' 
                      : 'Send OTP & Register'
                   }
               </Button>

            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
               <p className="text-sm text-slate-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"} 
                  <button 
                    onClick={handleSwitchMode} 
                    className="text-indigo-600 font-bold hover:underline ml-1 transition-all"
                  >
                    {isLogin ? "Register Now" : "Login here"}
                  </button>
               </p>
               
               {/* Back to Edit Button for OTP Screen */}
               {!isLogin && verificationStep && (
                    <button 
                        onClick={() => setVerificationStep(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 mt-4 underline"
                    >
                        Incorrect number? Edit details
                    </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerAuth;