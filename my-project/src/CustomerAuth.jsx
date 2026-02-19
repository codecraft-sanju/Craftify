// src/CustomerAuth.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User, Phone, ArrowRight, ArrowLeft,
  Mail, Lock, Loader2, Sparkles,
  ShoppingBag, Star, Key
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* -------------------------------------------------------------------------- */
/* ANIMATIONS                                                                 */
/* -------------------------------------------------------------------------- */

const fadeInUp = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

/* -------------------------------------------------------------------------- */
/* VISUAL COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

const BackgroundAurora = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50 dark:bg-black">
    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-400/10 rounded-full blur-[120px] animate-pulse delay-1000" />
  </div>
);

// --- CHANGES MADE: Added 'prefix' prop and styling for the +91 visual ---
const InputGroup = ({ icon: Icon, type, label, name, value, onChange, required = true, placeholder = " ", autoFocus = false, maxLength, prefix }) => (
  <div className="relative w-full mb-6 group">
    {prefix && (
      <span className="absolute left-0 top-3 text-zinc-800 dark:text-zinc-200 font-medium z-10">
        {prefix}
      </span>
    )}
    <input
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      required={required}
      placeholder={placeholder}
      autoFocus={autoFocus}
      maxLength={maxLength}
      className={`inputText peer w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 ${prefix ? 'pl-9' : 'pl-2'} outline-none 
                 focus:border-black dark:focus:border-white transition-all duration-300 text-zinc-900 dark:text-white placeholder-transparent font-medium`}
    />
    <span className={`absolute ${prefix ? 'left-9' : 'left-0'} top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
                     peer-focus:-top-4 peer-focus:left-0 peer-focus:text-black dark:peer-focus:text-white
                     peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-zinc-500`}>
      {label}
    </span>
    <Icon className="absolute right-2 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />
  </div>
);

const ShimmerButton = ({ children, isLoading, className = "", onClick, type="submit", disabled }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type={type}
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 w-full ${className}`}
  >
    {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
  </motion.button>
);

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const CustomerAuth = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Route determination
  const isRegisterRoute = location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  
  // --- CHANGES MADE: Added OTP state ---
  const [otp, setOtp] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state with URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
    // --- CHANGES MADE: Reset OTP screen when switching routes ---
    setShowOtpScreen(false); 
    setOtp('');
  }, [location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Strict number check for phone
    if (name === 'phone' && !/^\d*$/.test(value)) return;
    
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  /* -------------------------- SUBMISSION LOGIC ---------------------------- */
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
          // === REGISTER FLOW (Step 1: Send OTP) ===
          const res = await fetch(`${API_URL}/api/users/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone
            })
          });
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.message || "Failed to send OTP");
          
          // Show OTP screen
          setShowOtpScreen(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CHANGES MADE: Added logic for Step 2 (Verify OTP & Register) ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const res = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                otp: otp
            })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Registration failed");
        
        onLoginSuccess(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSwitchMode = () => {
      if(isLogin) navigate('/register');
      else navigate('/login');
  };

  /* ---------------------------- RENDER ---------------------------------- */
  return (
    <motion.main
      initial="initial"
      animate="animate"
      className="min-h-screen w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4 pt-24 relative overflow-hidden font-sans"
    >
      <BackgroundAurora />

      {/* --- GLASS HEADER --- */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-full px-2 py-2 pr-6 border border-white/50 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => {
                  // --- CHANGES MADE: Handle back button behavior for OTP screen ---
                  if(showOtpScreen) setShowOtpScreen(false);
                  else navigate('/');
              }}
              className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-90 group"
            >
              <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Customer Hub</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-white">Giftomize</span>
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* LEFT SIDE: FORM CONTAINER */}
        <motion.div
          variants={staggerContainer}
          className="order-2 lg:order-1 max-h-[85vh] overflow-y-auto pr-2 
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <motion.div variants={fadeInUp} className="mb-10 mt-6">
            <h1 className="text-5xl lg:text-6xl font-light uppercase tracking-tighter text-zinc-900 dark:text-white mb-4">
              {/* --- CHANGES MADE: Dynamic heading based on OTP screen --- */}
              {isLogin ? 'Welcome Back' : showOtpScreen ? 'Verify OTP' : 'Join The Club'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              {isLogin 
                ? "Sign in to track orders and view your wishlist." 
                : showOtpScreen 
                  ? `We've sent a 6-digit code to +91 ${formData.phone}` // Added +91 text here too
                  : "Discover unique products tailored for you."}
            </p>
          </motion.div>

          {/* Error Toast */}
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400"
            >
                <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}

          {/* FORM AREA */}
          <div className="space-y-2 pb-10">
            <AnimatePresence mode="wait">
                
                {/* === LOGIN FORM === */}
                {isLogin && (
                    <motion.form onSubmit={handleSubmit} key="login" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                        <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" autoFocus />
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Password" />
                        
                        <div className="pt-4">
                            <ShimmerButton isLoading={loading} className="w-full text-base">
                                Sign In <ArrowRight size={18} />
                            </ShimmerButton>
                        </div>
                    </motion.form>
                )}

                {/* === REGISTER FORM (Step 1: Get Details) === */}
                {!isLogin && !showOtpScreen && (
                    <motion.form onSubmit={handleSubmit} key="register-details" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                        <InputGroup icon={User} name="name" value={formData.name} onChange={handleChange} type="text" label="Full Name" autoFocus />
                        <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" />
                        
                        {/* --- CHANGES MADE: Added prefix="+91" --- */}
                        <InputGroup icon={Phone} name="phone" value={formData.phone} onChange={handleChange} type="tel" label="Phone Number" maxLength={10} prefix="+91" />
                        
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Create Password" />
                        
                        <div className="pt-4">
                            <ShimmerButton isLoading={loading} className="w-full text-base">
                                Send OTP <ArrowRight size={18} />
                            </ShimmerButton>
                        </div>
                    </motion.form>
                )}

                {/* === REGISTER FORM (Step 2: Verify OTP) === */}
                {!isLogin && showOtpScreen && (
                    <motion.form onSubmit={handleVerifyOtp} key="register-otp" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                        <InputGroup 
                            icon={Key} 
                            name="otp" 
                            value={otp} 
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) setOtp(e.target.value);
                            }} 
                            type="text" 
                            label="Enter 6-digit OTP" 
                            maxLength={6} 
                            autoFocus 
                        />
                        
                        <div className="pt-4 space-y-3">
                            <ShimmerButton isLoading={loading} disabled={otp.length !== 6} className="w-full text-base">
                                Verify & Join <ArrowRight size={18} />
                            </ShimmerButton>
                            
                            <button 
                                type="button" 
                                disabled={loading}
                                onClick={handleSubmit} // Resends the OTP
                                className="w-full text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors py-2"
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>
                    </motion.form>
                )}

            </AnimatePresence>
          </div>

          {/* --- Bottom switch text --- */}
          {!showOtpScreen && (
            <motion.p variants={fadeInUp} className="mt-4 text-center text-zinc-500 text-sm font-medium pb-10">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={handleSwitchMode} className="text-black dark:text-white font-bold hover:underline">
                  {isLogin ? "Register Now" : "Login Here"}
              </button>
            </motion.p>
          )}
        </motion.div>

        {/* RIGHT SIDE: ILLUSTRATION CARD */}
        <motion.div variants={fadeInUp} className="hidden lg:block order-1 lg:order-2 sticky top-24">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col justify-center shadow-2xl">
            {isLogin ? (
                 <div className="space-y-6">
                    <div className="size-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="text-white dark:text-black" size={32} />
                    </div>
                    <h3 className="text-4xl font-light italic leading-tight text-zinc-900 dark:text-white">
                      "I love customizing my outfits here. The process is seamless and quality is amazing."
                    </h3>
                    <div className="flex items-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="size-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center font-bold text-pink-700 dark:text-pink-400">AK</div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">Anjali K.</p>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Verified Customer</p>
                      </div>
                    </div>
                 </div>
            ) : (
                <div className="space-y-8 w-full">
                    <div className="p-8 bg-white dark:bg-black rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Star size={100} /></div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Member Perks</p>
                      <h2 className="text-4xl font-light text-zinc-900 dark:text-white">Priority Shipping</h2>
                    </div>
                    <div className="p-8 bg-black dark:bg-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100} /></div>
                      <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">Exclusive</p>
                      <h2 className="text-4xl font-light text-white dark:text-black">Early Access</h2>
                    </div>
                </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.main>
  );
};

export default CustomerAuth;