// src/CustomerAuth.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  User, Phone, ArrowRight, ArrowLeft,
  Mail, Lock, Loader2, Sparkles,
  ShoppingBag, Star, Key, MessageCircle,
  Eye, EyeOff // --- CHANGE: Added Eye icons for password toggle ---
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

/* -------------------------------------------------------------------------- */
/* ANIMATIONS                                                                 */
/* -------------------------------------------------------------------------- */

const fadeInUp = {
  initial: { opacity: 0, y: 20 }, // --- CHANGE: Changed x to y for a smoother upward reveal ---
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } }, // --- CHANGE: Advanced easing curve ---
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

/* -------------------------------------------------------------------------- */
/* VISUAL COMPONENTS                                                          */
/* -------------------------------------------------------------------------- */

const BackgroundAurora = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-50 dark:bg-black">
    {/* --- CHANGE: Added a subtle noise texture mask for a premium aesthetic --- */}
    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-400/10 rounded-full blur-[120px] animate-pulse delay-1000" />
  </div>
);

// --- CHANGE: Upgraded InputGroup to handle password visibility and better focus states ---
const InputGroup = ({ icon: Icon, type, label, name, value, onChange, required = true, placeholder = " ", autoFocus = false, maxLength, prefix, helpText }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
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
        type={inputType}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        className={`inputText peer w-full bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 focus:bg-white dark:focus:bg-black border-b-2 border-zinc-200 dark:border-zinc-800 py-3 ${prefix ? 'pl-9' : 'pl-3'} pr-10 outline-none 
                    focus:border-black dark:focus:border-white rounded-t-lg transition-all duration-300 text-zinc-900 dark:text-white placeholder-transparent font-medium`}
      />
      <span className={`absolute ${prefix ? 'left-9' : 'left-3'} top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
                        peer-focus:-top-5 peer-focus:left-0 peer-focus:text-black dark:peer-focus:text-white
                        peer-[:not(:placeholder-shown)]:-top-5 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-zinc-500`}>
        {label}
      </span>
      
      <Icon className="absolute right-3 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />

      {/* Password Toggle Icon */}
      {isPassword && (
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-10 top-3 text-zinc-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}

      {/* Helper text */}
      {helpText && (
         <p className="absolute -bottom-5 left-0 text-[10px] font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
           {helpText}
         </p>
      )}
    </div>
  );
};

// --- CHANGE: Added a real visual shine sweep effect inside the button on hover ---
const ShimmerButton = ({ children, isLoading, className = "", onClick, type="submit", disabled }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type={type}
    onClick={onClick}
    disabled={isLoading || disabled}
    className={`group relative overflow-hidden bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 w-full shadow-lg hover:shadow-xl ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent" style={{ animationName: 'shimmer', animationDuration: '2s', animationIterationCount: 'infinite' }} />
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    
    {isLoading ? <Loader2 className="animate-spin relative z-10" size={20} /> : <span className="relative z-10 flex items-center gap-2">{children}</span>}
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
  
  const [otp, setOtp] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync state with URL
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
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
          
          if (data.bypassOtp) {
              // Direct registration if OTP service is down/disabled
              const registerRes = await fetch(`${API_URL}/api/users/register`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                      name: formData.name,
                      email: formData.email,
                      password: formData.password,
                      phone: formData.phone,
                      otp: 'bypass'
                  })
              });
              const registerData = await registerRes.json();
              
              if (!registerRes.ok) throw new Error(registerData.message || "Registration failed");
              
              onLoginSuccess(registerData);
          } else {
              // Show OTP screen
              setShowOtpScreen(true);
          }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      className="h-[100dvh] w-full bg-zinc-50 dark:bg-black flex items-center justify-center p-4 pt-24 relative overflow-hidden font-sans"
    >
      <BackgroundAurora />

      {/* --- GLASS HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md rounded-full px-2 py-2 pr-6 border border-white/50 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => {
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
          className="order-2 lg:order-1 max-h-[calc(100dvh-7rem)] overflow-y-auto pr-2 
                       [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <motion.div variants={fadeInUp} className="mb-10 mt-6">
            <h1 className="text-5xl lg:text-6xl font-light uppercase tracking-tighter text-zinc-900 dark:text-white mb-4">
              {isLogin ? 'Welcome Back' : showOtpScreen ? 'Verify OTP' : 'Join The Club'}
            </h1>
            
            {/* Dynamic Subtext with WhatsApp Indicator */}
            <div className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              {isLogin ? (
                 "Sign in to track orders and view your wishlist."
              ) : showOtpScreen ? (
                 <div className="flex flex-col items-start gap-1">
                    <span>We sent a 6-digit code to your WhatsApp:</span>
                    <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-500 font-bold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm mt-1">
                        <MessageCircle size={16} fill="currentColor" className="text-green-600 dark:text-green-500" /> 
                        +91 {formData.phone}
                    </span>
                 </div>
              ) : (
                 "Discover unique products tailored for you."
              )}
            </div>
          </motion.div>

          {/* Error Toast */}
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 shadow-sm"
            >
                <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}

          {/* FORM AREA */}
          <div className="space-y-4 pb-2">
            <AnimatePresence mode="wait">
                
                {/* === LOGIN FORM === */}
                {isLogin && (
                    <motion.form onSubmit={handleSubmit} key="login" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                        <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" autoFocus />
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Password" />
                        
                        <div className="pt-6">
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
                        
                        {/* CLEAN PHONE INPUT - Hint removed as requested */}
                        <InputGroup 
                            icon={Phone} 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            type="tel" 
                            label="Phone Number" 
                            maxLength={10} 
                            prefix="+91" 
                        />
                        
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Create Password" />
                        
                        <div className="pt-6">
                            <ShimmerButton isLoading={loading} className="w-full text-base">
                                Send OTP on WhatsApp <ArrowRight size={18} />
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
                            label="Enter 6-digit WhatsApp Code" 
                            maxLength={6} 
                            autoFocus 
                        />
                        
                        <div className="pt-6 space-y-3">
                            <ShimmerButton isLoading={loading} disabled={otp.length !== 6} className="w-full text-base">
                                Verify & Join <ArrowRight size={18} />
                            </ShimmerButton>
                            
                            <button 
                                type="button" 
                                disabled={loading}
                                onClick={handleSubmit} // Resends the OTP
                                className="w-full text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={14} /> Resend code on WhatsApp
                            </button>
                        </div>
                    </motion.form>
                )}

            </AnimatePresence>
          </div>

          {/* --- Bottom switch text --- */}
          {!showOtpScreen && (
            <motion.div variants={fadeInUp} className="mt-4 text-center pb-10 flex flex-col items-center">
              <p className="text-zinc-500 text-sm font-medium">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={handleSwitchMode} className="text-black dark:text-white font-bold hover:underline transition-all">
                  {isLogin ? "Register Now" : "Login Here"}
                </button>
              </p>

              {/* Added Seller Redirect Link Here */}
              <div className="mt-8 pt-6 w-full max-w-sm border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  Want to sell your products on Giftomize?{' '}
                  <Link to="/seller-register" className="font-bold text-black dark:text-white hover:underline transition-all">
                    Become a Seller
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* RIGHT SIDE: ILLUSTRATION CARD */}
        <motion.div variants={fadeInUp} className="hidden lg:block order-1 lg:order-2 sticky top-24">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/60 dark:border-zinc-800 p-12 flex flex-col justify-center shadow-2xl transition-all duration-500 hover:shadow-3xl group">
            {/* --- CHANGE: Added a subtle animated gradient glow behind the right side content --- */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-50 pointer-events-none" />
            
            {isLogin ? (
                 <div className="space-y-6 relative z-10">
                    <div className="size-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <ShoppingBag className="text-white dark:text-black" size={32} />
                    </div>
                    <h3 className="text-4xl font-light italic leading-tight text-zinc-900 dark:text-white">
                      "I love customizing my outfits here. The process is seamless and quality is amazing."
                    </h3>
                    <div className="flex items-center gap-4 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
                      <div className="size-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/40 dark:to-pink-900/20 rounded-full flex items-center justify-center font-bold text-pink-700 dark:text-pink-400 shadow-inner">AK</div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white">Anjali K.</p>
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Verified Customer</p>
                      </div>
                    </div>
                 </div>
            ) : (
                <div className="space-y-8 w-full relative z-10">
                    {/* --- CHANGE: Upgraded cards with gradients, better shadows, and hover scale --- */}
                    <div className="p-8 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-black rounded-[2.5rem] shadow-xl border border-white/80 dark:border-zinc-800 relative overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Star size={100} /></div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Member Perks</p>
                      <h2 className="text-4xl font-light text-zinc-900 dark:text-white">Priority Shipping</h2>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-100 dark:to-white rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-transform duration-500 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700"><Sparkles size={100} className="text-white dark:text-black" /></div>
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