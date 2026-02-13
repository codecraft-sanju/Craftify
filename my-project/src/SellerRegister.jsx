// src/SellerRegister.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import {
  Store, User, Phone, ArrowRight, ArrowLeft,
  Mail, Lock, ShoppingBag, ShieldCheck, 
  KeyRound, Sparkles, Loader2, Eye, EyeOff, Edit2
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
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400/10 rounded-full blur-[120px] animate-pulse delay-1000" />
  </div>
);

// Input Group with Password Toggle
const InputGroup = ({ icon: Icon, type, label, name, value, onChange, required = true, placeholder = " ", autoFocus = false, maxLength }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full mb-6 group">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={inputType}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        className="inputText peer w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 pl-2 pr-10 outline-none 
                   focus:border-black dark:focus:border-white transition-all duration-300 text-zinc-900 dark:text-white placeholder-transparent font-medium"
      />
      <span className="absolute left-0 top-3 text-zinc-400 pointer-events-none transition-all duration-300 uppercase text-[10px] font-bold tracking-widest
                        peer-focus:-top-4 peer-focus:text-black dark:peer-focus:text-white
                        peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-zinc-500">
        {label}
      </span>
      
      {/* Main Icon */}
      <Icon className="absolute right-2 top-3 text-zinc-300 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" size={18} />

      {/* Password Toggle Icon */}
      {isPassword && (
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-8 top-3 text-zinc-400 hover:text-black dark:hover:text-white transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

const CustomSelect = ({ icon: Icon, label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange({ target: { name: 'category', value: option } });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full mb-6 z-20">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 py-3 cursor-pointer flex justify-between items-center group"
      >
        <span className={`font-bold pl-2 ${value ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>
          {value || "Select Category"}
        </span>
        <Icon size={18} className={`text-zinc-300 transition-transform duration-300 group-hover:text-black dark:group-hover:text-white ${isOpen ? 'rotate-180' : ''}`} />
        
        <span className="absolute left-0 -top-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest pointer-events-none">
          {label}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full w-full z-50 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl mt-2 overflow-hidden p-2"
          >
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-colors ${value === opt ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
              >
                {opt}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ShimmerButton = ({ children, isLoading, className = "", onClick, type="submit" }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type={type}
    onClick={onClick}
    disabled={isLoading}
    className={`relative overflow-hidden bg-black dark:bg-white text-white dark:text-black font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 w-full ${className}`}
  >
    {isLoading ? <Loader2 className="animate-spin" size={20} /> : children}
  </motion.button>
);

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function SellerRegister({ onLoginSuccess, initialMode = 'register' }) {
  const navigate = useNavigate();
  const [isLoginView, setIsLoginView] = useState(initialMode === 'login');
  
  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Verification Method (whatsapp/email) - Default 'email' but waits for backend
  const [verificationMethod, setVerificationMethod] = useState('email'); 
  
  // Timer for Step 3
  const [timer, setTimer] = useState(30);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    category: 'Clothing & Apparel',
    description: 'Welcome to my new shop on Giftomize!',
    otp: ''
  });

  // Switcher Effect
  useEffect(() => {
    setIsLoginView(initialMode === 'login');
    setStep(1);
    setError("");
  }, [initialMode]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (step === 3 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Strict Number Validation for Phone
    if (name === 'phone') {
        if (!/^\d*$/.test(value)) return; // Only allows digits
    }

    setFormData({ ...formData, [name]: value });
    setError(""); 
  };

  const handleSwitchMode = () => {
    setError("");
    setStep(1);
    if(isLoginView) {
        setIsLoginView(false);
        navigate('/seller-register');
    } else {
        setIsLoginView(true);
        navigate('/seller-login');
    }
  };

  /* -------------------------- SUBMISSION LOGIC ---------------------------- */
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

            if(data.role !== 'seller' && data.role !== 'founder' && data.role !== 'admin') {
                 throw new Error("This account is not registered as a Seller.");
            }

            onLoginSuccess(data);

        } else {
            // === REGISTER LOGIC ===
            
            // Phase 1: Step 2 -> Create User (Triggers Smart OTP)
            if (step === 2) {
                const userRes = await fetch(`${API_URL}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        role: 'seller'
                    })
                });

                const userData = await userRes.json();
                if (!userRes.ok) throw new Error(userData.message || "User registration failed");

                setLoading(false);

                // --- CRITICAL: Check Backend Response for OTP Method ---
                if (userData.otpMethod === 'email') {
                    setVerificationMethod('email');
                } else if (userData.otpMethod === 'whatsapp') {
                    setVerificationMethod('whatsapp');
                }

                setTimer(30); // Reset timer
                setStep(3); // Move to OTP
                return;
            }

            // Phase 2: Step 3 -> Verify OTP & Create Shop
            if (step === 3) {
                // 1. Verify OTP
                const verifyRes = await fetch(`${API_URL}/api/users/verify-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        phone: formData.phone,
                        otp: formData.otp
                    })
                });

                const verifyData = await verifyRes.json();
                if (!verifyRes.ok) throw new Error(verifyData.message || "Invalid OTP");

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
                const finalUser = { ...verifyData, shop: shopData._id };
                onLoginSuccess(finalUser);
            }
        }

    } catch (err) {
        setError(err.message);
        setLoading(false);
    }
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
              onClick={() => navigate('/')}
              className="p-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-90 group"
            >
              <ArrowLeft size={20} className="text-zinc-600 dark:text-zinc-400 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Partner Hub</span>
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
              {isLoginView ? 'Welcome Back' : 'Create Empire'}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                {isLoginView 
                    ? "Manage your inventory, analytics, and orders." 
                    : step === 3 ? "Verify your identity." : "Join the fastest-growing creator marketplace."}
            </p>
          </motion.div>

          {/* Error Toast Inline */}
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400"
            >
                <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}

          {/* FORM AREA */}
          <form onSubmit={handleSubmit} className="space-y-2 pb-10">
            <AnimatePresence mode="wait">
                
                {/* === LOGIN FORM === */}
                {isLoginView && (
                    <motion.div key="login" variants={fadeInUp} initial="initial" animate="animate" exit="exit">
                        <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" autoFocus />
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Password" />
                        <div className="pt-4">
                            <ShimmerButton isLoading={loading} className="w-full text-base">
                                Access Dashboard <ArrowRight size={18} />
                            </ShimmerButton>
                        </div>
                    </motion.div>
                )}

                {/* === REGISTER STEPS === */}
                {!isLoginView && step === 1 && (
                    <motion.div key="step1" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="space-y-6">
                        <InputGroup icon={User} name="name" value={formData.name} onChange={handleChange} type="text" label="Founder Name" autoFocus />
                        <InputGroup icon={Mail} name="email" value={formData.email} onChange={handleChange} type="email" label="Email Address" />
                        <InputGroup icon={Phone} name="phone" value={formData.phone} onChange={handleChange} type="tel" label="Phone Number" maxLength={10} />
                        <InputGroup icon={Lock} name="password" value={formData.password} onChange={handleChange} type="password" label="Create Password" />
                        
                        <div className="pt-4">
                            <ShimmerButton 
                                type="button" 
                                onClick={() => {
                                    if(formData.name && formData.email && formData.password && formData.phone) {
                                        if(formData.phone.length < 10) setError("Phone number must be 10 digits");
                                        else setStep(2);
                                    }
                                    else setError("Please fill all fields to continue.");
                                }} 
                                className="w-full text-base"
                            >
                                Setup Store <ArrowRight size={18} />
                            </ShimmerButton>
                        </div>
                    </motion.div>
                )}

                {!isLoginView && step === 2 && (
                    <motion.div key="step2" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="space-y-6">
                        <InputGroup icon={Store} name="shopName" value={formData.shopName} onChange={handleChange} type="text" label="Shop Name" autoFocus />
                        
                        <CustomSelect 
                            icon={ShoppingBag}
                            label="Business Category"
                            value={formData.category}
                            options={['Clothing & Apparel', 'Art & Decor', 'Tech Accessories', 'Handmade Goods', 'Food & Beverage']}
                            onChange={handleChange}
                        />

                        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl flex gap-3 items-start border border-zinc-200 dark:border-zinc-800">
                            <ShieldCheck className="w-5 h-5 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                We will send a verification code to your {verificationMethod === 'email' ? 'Email' : 'WhatsApp'} to verify your identity.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setStep(1)} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                <ArrowLeft size={20} className="text-zinc-500" />
                            </button>
                            <ShimmerButton isLoading={loading} className="flex-1 text-base">
                                Verify & Launch <ArrowRight size={18} />
                            </ShimmerButton>
                        </div>
                    </motion.div>
                )}

                {/* === STEP 3: SMART OTP UI === */}
                {!isLoginView && step === 3 && (
                    <motion.div key="step3" variants={fadeInUp} initial="initial" animate="animate" exit="exit" className="space-y-6">
                        <div className="text-center py-6 mb-4">
                             {/* DYNAMIC ICON BASED ON SERVICE */}
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce ${
                                 verificationMethod === 'email' 
                                 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                 : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                             }`}>
                                {verificationMethod === 'email' ? <Mail className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
                             </div>

                             <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {verificationMethod === 'email' ? 'Check Your Email' : 'OTP Sent via WhatsApp'}
                             </h3>
                             
                             <p className="text-zinc-500 text-sm mt-2">
                                Code sent to <span className="font-bold text-black dark:text-white">
                                    {verificationMethod === 'email' ? formData.email : formData.phone}
                                </span>
                                {/* EDIT BUTTON */}
                                <button onClick={() => setStep(1)} className="ml-2 text-indigo-500 hover:underline inline-flex items-center gap-1">
                                    <Edit2 size={12} /> Edit
                                </button>
                             </p>
                             
                             {verificationMethod === 'email' && (
                                <p className="text-[10px] text-zinc-400 mt-2 font-medium tracking-wide">
                                    (Check Spam/Junk folder if not in Inbox)
                                </p>
                             )}
                        </div>
                        
                        <InputGroup icon={KeyRound} name="otp" value={formData.otp} onChange={handleChange} type="text" label="Enter 6-Digit Code" autoFocus maxLength={6} />
                        
                        {/* TIMER UI */}
                        <div className="text-center text-xs text-zinc-400 font-medium">
                            {timer > 0 ? (
                                <span>Resend code in 00:{timer < 10 ? `0${timer}` : timer}</span>
                            ) : (
                                <span className="text-zinc-500">Didn't get the code? Please try registering again with correct details.</span>
                            )}
                        </div>

                        <div className="pt-4">
                            <ShimmerButton isLoading={loading} className="w-full text-base">
                                Confirm & Login <ArrowRight size={18} />
                            </ShimmerButton>
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
          </form>

          <motion.p variants={fadeInUp} className="mt-4 text-center text-zinc-500 text-sm font-medium pb-10">
            {isLoginView ? "Don't have a seller account? " : "Already have a seller account? "}
            <button onClick={handleSwitchMode} className="text-black dark:text-white font-bold hover:underline">
                {isLoginView ? "Register Now" : "Login Here"}
            </button>
          </motion.p>
        </motion.div>

        {/* RIGHT SIDE: ILLUSTRATION CARD */}
        <motion.div variants={fadeInUp} className="hidden lg:block order-1 lg:order-2 sticky top-24">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 p-12 flex flex-col justify-center shadow-2xl">
            {isLoginView ? (
                <div className="space-y-8 w-full">
                    <div className="p-8 bg-white dark:bg-black rounded-[2.5rem] shadow-xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Total Sales</p>
                      <h2 className="text-5xl font-light text-zinc-900 dark:text-white">₹24,500</h2>
                    </div>
                    <div className="p-8 bg-black dark:bg-white rounded-[2.5rem] shadow-xl">
                      <p className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">New Orders</p>
                      <h2 className="text-5xl font-light text-white dark:text-black">12 <span className="text-lg opacity-60">Pending</span></h2>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                  <div className="size-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="text-white dark:text-black" size={32} />
                  </div>
                  <h3 className="text-4xl font-light italic leading-tight text-zinc-900 dark:text-white">
                    "I scaled my handmade jewelry business to 500+ orders in just two months."
                  </h3>
                  <div className="flex items-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="size-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">SJ</div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">Sarah Jenkins</p>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Founder, StreetStyle</p>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.main>
  );
}