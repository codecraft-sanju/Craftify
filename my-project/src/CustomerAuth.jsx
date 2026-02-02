import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ShoppingBag, Loader2, AlertCircle, Sparkles } from 'lucide-react';

const CustomerAuth = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL check karke decide karenge ki Login dikhana hai ya Register
  const isRegisterRoute = location.pathname === '/register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Jab bhi URL change ho (login/register), state reset karo
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
    setFormData({ name: '', email: '', password: '' });
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? 'http://localhost:5000/api/users/login' : 'http://localhost:5000/api/users';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password } 
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Cookie set karne ke liye zaroori hai
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");
      
      // Agar galti se Seller/Admin login kare, toh bhi allow kar denge (role App.jsx handle karega)
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex min-h-[650px] border border-slate-100">
        
        {/* LEFT SIDE - BRANDING / VISUALS (Desktop only) */}
        <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative flex-col justify-between p-12 text-white overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-8">
                    C
                </div>
                <h1 className="text-5xl font-black leading-tight mb-6">
                    {isLogin ? "Welcome Back!" : "Join the Club."}
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                    Discover unique, handcrafted products tailored just for you. 
                    {isLogin ? " Pick up right where you left off." : " Start your personalized shopping journey today."}
                </p>
            </div>

            {/* Feature Card/Review */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <div className="flex gap-1 text-amber-400 mb-3">
                    {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-4 h-4 fill-current"/>)}
                </div>
                <p className="text-slate-200 italic mb-4">"The customization options are insane. I got a hoodie exactly how I imagined it!"</p>
                <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-indigo-400 flex items-center justify-center text-xs font-bold">JD</div>
                     <div>
                        <p className="text-sm font-bold">John Doe</p>
                        <p className="text-xs text-slate-400">Verified Buyer</p>
                     </div>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
            <div className="max-w-md mx-auto w-full">
                <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                        {isLogin ? "Sign In" : "Create Account"}
                    </h2>
                    <p className="text-slate-500">
                        {isLogin ? "Enter your details to access your account." : "Enter your details to get started for free."}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100 animate-pulse">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                    placeholder="e.g. Sanjay Choudhary"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input 
                                type="email" 
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input 
                                type="password" 
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <Link 
                            to={isLogin ? "/register" : "/login"} 
                            className="ml-2 font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                        >
                            {isLogin ? "Sign up for free" : "Log in here"}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;