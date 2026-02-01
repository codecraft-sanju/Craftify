// src/SellerRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, ArrowRight, CheckCircle, Mail, Lock, User, 
  ShoppingBag, Sparkles, Loader2, ChevronRight, LogIn, Phone, AlertCircle
} from 'lucide-react';

const API_URL = "http://localhost:5000";

// ==========================================
// 1. UI COMPONENTS (Local)
// ==========================================

const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
  const base = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600"
  };
  return (
    <button disabled={loading} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

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
    phone: '', // Added: Required by Shop Model
    description: 'Welcome to my new shop on Craftify!' // Default description
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on typing
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
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Login failed");

            // Check if user is actually a seller
            if(data.role !== 'seller' && data.role !== 'founder' && data.role !== 'admin') {
                 // Optional: Ask them to create a shop if they are just a customer
                 throw new Error("This account is not registered as a Seller.");
            }

            onLoginSuccess(data);

        } else {
            // === REGISTER LOGIC (2 Steps) ===
            
            // 1. Create User
            const userRes = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    // Note: Role defaults to 'customer' in backend, we promote them in Step 2
                })
            });

            const userData = await userRes.json();
            if (!userRes.ok) throw new Error(userData.message || "User registration failed");

            // 2. Create Shop (This promotes user to 'seller')
            const shopRes = await fetch(`${API_URL}/api/shops`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({
                    name: formData.shopName,
                    description: formData.description,
                    phone: formData.phone,
                    categories: [formData.category] // Backend expects array
                })
            });

            const shopData = await shopRes.json();
            if (!shopRes.ok) throw new Error(shopData.message || "Shop creation failed");

            // 3. Update Local User Data with new Role
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
      if(isLoginView) {
          navigate('/seller-register');
      } else {
          navigate('/seller-login');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* --- LEFT SIDE: VALUE PROP --- */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-16 text-white">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">C</div>
               <span className="font-bold text-xl">Craftify.</span>
            </div>
            
            <h1 className="text-5xl font-black leading-tight mb-6 animate-fade-in">
               {isLoginView ? (
                   <>
                       Welcome back, <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Partner.</span>
                   </>
               ) : (
                   <>
                       Turn your passion <br/>
                       into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Global Brand.</span>
                   </>
               )}
            </h1>
            
            <p className="text-slate-400 text-lg max-w-md animate-fade-in">
               {isLoginView 
                ? "Manage your inventory, track orders, and grow your business from your dashboard."
                : "Join 10,000+ creators who are building the next generation of commerce on Craftify."
               }
            </p>
         </div>

         <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 max-w-md mt-10">
            <div className="flex gap-1 text-amber-400 mb-3">
               {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 fill-current"/>)}
            </div>
            <p className="text-slate-200 italic mb-4">"I went from selling 5 t-shirts a month to 500 in just three weeks. The tools here are insane."</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-500 rounded-full"></div>
               <div>
                  <p className="font-bold text-sm">Sarah Jenkins</p>
                  <p className="text-xs text-slate-400">Founder, StreetStyle</p>
               </div>
            </div>
         </div>
      </div>

      {/* --- RIGHT SIDE: FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
         <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100 transition-all duration-300">
            
            {/* Header */}
            <div className="text-center mb-8">
               <h2 className="text-2xl font-black text-slate-900">
                   {isLoginView ? 'Seller Login' : 'Create Seller Account'}
               </h2>
               <p className="text-slate-500 text-sm mt-2">
                   {isLoginView ? 'Enter your credentials to access dashboard' : `Step ${step} of 2`}
               </p>
               
               {!isLoginView && (
                   <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                      <div className={`h-full bg-indigo-600 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
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

            <form onSubmit={handleSubmit} className="space-y-6">
               
               {/* === LOGIN VIEW === */}
               {isLoginView && (
                   <div className="space-y-4 animate-fade-in">
                       <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                           <div className="relative">
                               <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                               <input 
                                   type="email" 
                                   name="email"
                                   value={formData.email}
                                   onChange={handleChange}
                                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                   placeholder="you@business.com"
                                   required
                               />
                           </div>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                           <div className="relative">
                               <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                               <input 
                                   type="password" 
                                   name="password"
                                   value={formData.password}
                                   onChange={handleChange}
                                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                   placeholder="••••••••"
                                   required
                               />
                           </div>
                       </div>
                       <Button type="submit" loading={loading} className="w-full pt-4">Access Dashboard <ArrowRight className="w-4 h-4"/></Button>
                   </div>
               )}

               {/* === REGISTER VIEW === */}
               {!isLoginView && (
                   <>
                       {/* STEP 1: ACCOUNT DETAILS */}
                       {step === 1 && (
                          <div className="space-y-4 animate-fade-in">
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                                <div className="relative">
                                   <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   <input 
                                      type="text" 
                                      name="name"
                                      value={formData.name}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                      placeholder="John Doe"
                                      autoFocus
                                      required
                                   />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                                <div className="relative">
                                   <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   <input 
                                      type="email" 
                                      name="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                      placeholder="you@business.com"
                                      required
                                   />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                                <div className="relative">
                                   <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   <input 
                                      type="password" 
                                      name="password"
                                      value={formData.password}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                      placeholder="••••••••"
                                      required
                                   />
                                </div>
                             </div>

                             <div className="pt-4">
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
                          <div className="space-y-4 animate-fade-in">
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand / Shop Name</label>
                                <div className="relative">
                                   <Store className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   <input 
                                      type="text" 
                                      name="shopName"
                                      value={formData.shopName}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                      placeholder="e.g. Urban Threads"
                                      autoFocus
                                      required
                                   />
                                </div>
                             </div>

                             {/* Added Phone Field for Backend Compliance */}
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                                <div className="relative">
                                   <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   <input 
                                      type="tel" 
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                      placeholder="9876543210"
                                      required
                                   />
                                </div>
                             </div>
                             
                             <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Category</label>
                                <div className="relative">
                                   <ShoppingBag className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                   <select 
                                      name="category"
                                      value={formData.category}
                                      onChange={handleChange}
                                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium appearance-none"
                                   >
                                      <option>Clothing & Apparel</option>
                                      <option>Art & Decor</option>
                                      <option>Tech Accessories</option>
                                      <option>Handmade Goods</option>
                                   </select>
                                   <div className="absolute right-4 top-4 text-slate-400 pointer-events-none">
                                      <ChevronRight className="w-4 h-4 rotate-90" />
                                   </div>
                                </div>
                             </div>

                             <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start border border-indigo-100">
                                <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-800 leading-relaxed">
                                   By clicking "Launch Store", you agree to our Seller Terms. You'll get instant access to your dashboard to start adding products.
                                </p>
                             </div>

                             <div className="flex gap-3 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
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