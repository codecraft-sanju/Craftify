// App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, X, Star, ArrowRight, Heart, 
  Send, Image as ImageIcon, Check, Trash2, 
  Sparkles, MessageSquare, Paperclip, User, ShieldCheck,
  LayoutDashboard, Users, Settings, Bell, Package, 
  ChevronRight, MoreVertical, FileText, Menu, LogOut,
  Truck, CheckCircle, Clock, Filter, Plus, DollarSign,
  BarChart3, Zap, RefreshCcw, Lock, Eye, EyeOff,
  CreditCard, MapPin, Calendar, Smartphone, Globe,
  Bot, ThumbsUp, Activity, PieChart, TrendingUp, AlertCircle,
  Inbox, Store, Wallet, ChevronLeft, Type, Palette, Camera,
  Home, Grid, Layers
} from 'lucide-react';

// --- IMPORTS FOR DASHBOARDS & VIEWS ---
import LandingPage from './LandingPage'; 
import FounderAccess from './FounderAccess';
import StoreAdmin from './StoreAdmin';
import ShopView from './ShopView'; 
import SellerRegister from './SellerRegister'; 

// ==========================================
// 1. MOCK DATA (REPLACING BACKEND)
// ==========================================

const MOCK_USER = {
  _id: "user_123",
  name: "Sanjay Choudhary",
  email: "sanjay@craftify.com",
  role: "founder", 
  avatar: "S",
  token: "mock_token_xyz"
};

const MOCK_PRODUCTS = [
  {
    _id: "p1",
    name: "Neon Vibes Custom Sign",
    description: "Handcrafted LED neon sign. Perfect for bedroom decor or gaming setups. Energy efficient and long-lasting.",
    price: 2499,
    category: "Decor",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800",
    coverImage: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    numReviews: 120,
    shop: { name: "Neon World" },
    customizationAvailable: true,
    customizationType: "neon",
    colors: ["#FF00FF", "#00FFFF", "#FFFF00"],
    sizes: ["S", "M", "L"],
    specs: { Material: "Acrylic", Power: "12V Adapter" }
  },
  {
    _id: "p2",
    name: "Minimalist Cotton Tee",
    description: "100% Organic Cotton. Breathable fabric with a modern fit. Customizable with your own text or logo.",
    price: 799,
    category: "Clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    coverImage: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    numReviews: 85,
    shop: { name: "Urban Threads" },
    customizationAvailable: true,
    customizationType: "print",
    colors: ["#ffffff", "#000000", "#334455"],
    sizes: ["M", "L", "XL", "XXL"],
    specs: { Fabric: "Cotton", GSM: "180" }
  },
  {
    _id: "p3",
    name: "Engraved Wooden Wallet",
    description: "Premium walnut wood wallet with RFID protection. Laser engrave your name for a personal touch.",
    price: 1299,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1605646397368-8e658661621a?auto=format&fit=crop&q=80&w=800",
    coverImage: "https://images.unsplash.com/photo-1605646397368-8e658661621a?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    numReviews: 42,
    shop: { name: "WoodWorks" },
    customizationAvailable: true,
    customizationType: "engraving",
    colors: ["#5D4037"],
    sizes: ["Standard"],
    specs: { Wood: "Walnut", Cards: "Holds 6" }
  }
];

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

// ==========================================
// 2. CORE UI COMPONENT LIBRARY
// ==========================================

const Button = ({ children, variant = 'primary', className = '', icon: Icon, loading, ...props }) => {
  const base = "relative overflow-hidden transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    accent: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
    ghost: "bg-transparent text-slate-600 hover:text-indigo-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30"
  };
  const sizes = props.size === 'sm' ? 'px-3 py-1.5 text-xs' : props.size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3.5 text-sm';

  return (
    <button disabled={loading} className={`${base} ${variants[variant]} ${sizes} ${className}`} {...props}>
      {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
      {!loading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    green: "bg-green-100 text-green-700 border-green-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-24 right-6 z-[120] flex flex-col gap-3 pointer-events-none">
    {toasts.map(toast => (
      <div key={toast.id} className="pointer-events-auto bg-white border border-slate-100 shadow-xl rounded-xl p-4 flex items-start gap-3 w-80 animate-slide-in-right">
        {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0"/> : <AlertCircle className="w-5 h-5 text-red-500 shrink-0"/>}
        <div className="flex-1">
          <h4 className="font-bold text-sm text-slate-900">{toast.title}</h4>
          <p className="text-xs text-slate-500 mt-1">{toast.message}</p>
        </div>
        <button onClick={() => removeToast(toast.id)}><X className="w-4 h-4 text-slate-400 hover:text-slate-600"/></button>
      </div>
    ))}
  </div>
);

// ==========================================
// 3. COMPLEX FEATURE COMPONENTS
// ==========================================

// --- Visual Live Customizer ---
const LiveCustomizer = ({ product, customText, setCustomText, customFont, setCustomFont }) => {
    const getOverlayStyle = () => {
        switch(product.customizationType) {
            case 'engraving': 
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)', color: 'rgba(200, 200, 200, 0.8)', textShadow: '1px 1px 0px rgba(255,255,255,0.2)' };
            case 'neon':
                return { top: '40%', left: '50%', transform: 'translate(-50%, -50%)', color: '#fff', textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff' };
            default: // print
                return { top: '35%', left: '50%', transform: 'translate(-50%, -50%)', color: '#333' };
        }
    };

    const fontStyles = {
        'Modern': 'font-sans tracking-widest uppercase',
        'Classic': 'font-serif italic',
        'Handwritten': 'font-mono' 
    };

    return (
        <div className="relative w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-inner group">
            <img src={product.image || product.coverImage} className="w-full h-full object-cover" alt="Preview" />
            
            {customText && (
                <div 
                    className={`absolute z-10 text-xl md:text-3xl font-bold whitespace-nowrap pointer-events-none transition-all duration-300 ${fontStyles[customFont] || 'font-sans'}`}
                    style={getOverlayStyle()}
                >
                    {customText}
                </div>
            )}
            
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 shadow-sm">
                <Button size="sm" variant="ghost" className="!p-0 !bg-transparent">
                  <Eye className="w-3 h-3 inline mr-1" /> Live Preview
                </Button>
            </div>
        </div>
    );
};

// --- Advanced Customization Chat Engine ---
const CustomizationChat = ({ isOpen, onClose, product, currentUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
        setLoading(true);
        setTimeout(() => {
            setMessages([
                { text: `Hi ${currentUser?.name || 'there'}! How can I help you customize this ${product.name}?`, sender: 'seller', createdAt: Date.now() }
            ]);
            setLoading(false);
        }, 800);
    }
  }, [isOpen, product, currentUser]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    // 1. Add User Message
    const userMsg = { text: message, sender: currentUser?._id || 'user', createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setMessage("");

    // 2. Simulate Seller Reply
    setTimeout(() => {
        const sellerMsg = { text: "That sounds great! We can definitely do that for you.", sender: 'seller', createdAt: Date.now() };
        setMessages(prev => [...prev, sellerMsg]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-slate-200">
              <img src={product.image || product.coverImage} className="w-full h-full object-cover rounded" alt="" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Chat: {product.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Seller Online</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {loading ? (
             <div className="flex justify-center p-10"><RefreshCcw className="w-6 h-6 animate-spin text-indigo-500"/></div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === (currentUser?._id || 'user') ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === (currentUser?._id || 'user') ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 opacity-70 ${msg.sender === (currentUser?._id || 'user') ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip className="w-5 h-5" /></button>
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
              placeholder="Type message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Cart Drawer ---
const CartDrawer = ({ isOpen, onClose, cart, setCart, onCheckout, currentUser }) => {
  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const removeItem = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[90] transform transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5"/> My Cart ({cart.length})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-300"/>
              </div>
              <h3 className="font-bold text-slate-900">Your cart is empty</h3>
              <p className="text-slate-500 text-sm mt-2 mb-6">Looks like you haven't added anything yet.</p>
              <Button onClick={onClose} variant="secondary">Start Shopping</Button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="flex gap-4 p-3 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors bg-white shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0 relative">
                  <img src={item.image || item.coverImage} alt={item.name} className="w-full h-full object-cover"/>
                  {item.customization?.text && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="text-[8px] text-white font-bold bg-black/50 px-1 rounded">{item.customization.text}</span>
                      </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                      <button onClick={() => removeItem(item.cartId)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="mt-1 space-y-1">
                        {item.selectedColor && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Color:</span>
                                <div className="w-3 h-3 rounded-full border border-slate-200" style={{backgroundColor: item.selectedColor}}></div>
                            </div>
                        )}
                        {item.customization?.text && (
                            <div className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit">
                                <Sparkles className="w-3 h-3" />
                                <span>"{item.customization.text}"</span>
                            </div>
                        )}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-indigo-600">₹{item.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold text-slate-900">₹{total}</span>
            </div>
            <div className="flex justify-between mb-6 text-lg font-black">
              <span className="text-slate-900">Total</span>
              <span className="text-indigo-600">₹{total}</span>
            </div>
            <Button onClick={onCheckout} className="w-full" size="lg" variant="primary">
                  {currentUser ? 'Checkout Now' : 'Login to Checkout'} <ArrowRight className="w-4 h-4"/>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

// --- Mobile Bottom Navigation ---
const MobileNav = ({ activeTab, navigate, cartCount }) => {
    return (
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 flex justify-around items-center h-16 pb-safe">
            <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-bold">Home</span>
            </button>
            <button onClick={() => navigate('/shop')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'shop' ? 'text-indigo-600' : 'text-slate-400'}`}>
                <Grid className="w-5 h-5" />
                <span className="text-[10px] font-bold">Shop</span>
            </button>
            <div className="relative -top-5">
                <button onClick={() => document.dispatchEvent(new CustomEvent('openCart'))} className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/40">
                    <ShoppingBag className="w-6 h-6" />
                    {cartCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] border-2 border-white">{cartCount}</span>}
                </button>
            </div>
            <button onClick={() => navigate('/profile')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
                <User className="w-5 h-5" />
                <span className="text-[10px] font-bold">Profile</span>
            </button>
            <button onClick={() => navigate('/founder')} className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'more' ? 'text-indigo-600' : 'text-slate-400'}`}>
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-bold">More</span>
            </button>
        </div>
    );
};

// --- Authentication Modal (MOCKED) ---
const AuthModal = ({ isOpen, onClose, onLogin, initialMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFounderLogin = initialMode === 'founder';
  
  useEffect(() => {
    if(isFounderLogin) {
        setEmail('admin18@gmail.com');
        setIsLogin(true); 
    } else {
        setEmail('');
    }
    setError("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // SIMULATED LOGIN
    setTimeout(() => {
        setLoading(false);
        const role = isFounderLogin ? 'founder' : 'user';
        
        // Return Mock User
        const user = {
            ...MOCK_USER,
            name: name || "Demo User",
            email: email,
            role: role
        };
        onLogin(user);
        onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-200">
               {isFounderLogin ? <Lock className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
            </div>
            <h2 className="text-2xl font-black text-slate-900">
               {isFounderLogin ? 'God Mode Access' : (isLogin ? 'Welcome Back' : 'Create Account')}
            </h2>
            <p className="text-slate-500 text-sm mt-2">
                {isFounderLogin ? 'Enter Admin Credentials' : 'Enter your details to access.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isFounderLogin && (
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                        placeholder="John Doe"
                        required={!isLogin}
                    />
                </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium" 
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-4 mt-4" variant="primary">
              {isFounderLogin ? 'Unlock Dashboard' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          {!isFounderLogin && (
              <div className="mt-4 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-600 hover:underline font-bold">
                      {isLogin ? "New here? Create Account" : "Already have an account? Sign In"}
                  </button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. VIEWS (Common)
// ==========================================

// --- Product Detail View ---
const ProductDetail = ({ addToCart, openChat, currentUser, products }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Ensure products are loaded or fetch specific product from state
  const product = products.find(p => p._id === id || p.id === id);
  
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);
  const [customText, setCustomText] = useState("");
  const [customFont, setCustomFont] = useState("Modern");

  if (!product) return <div className="p-20 text-center">Loading Product...</div>;

  const handleAddToCart = () => {
      const customization = product.customizationAvailable && customText ? {
          text: customText,
          font: customFont
      } : null;

      addToCart({ ...product, selectedColor, selectedSize, customization });
  };

  return (
    <div className="pt-28 pb-32 max-w-7xl mx-auto px-6">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium">
         <ChevronLeft className="w-4 h-4" /> Back
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="space-y-6">
             {product.customizationAvailable ? (
                 <LiveCustomizer 
                    product={product} 
                    customText={customText} 
                    setCustomText={setCustomText} 
                    customFont={customFont}
                    setCustomFont={setCustomFont}
                 />
             ) : (
                <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-sm">
                   <img src={product.image || product.coverImage} className="w-full h-full object-cover" alt={product.name} />
                </div>
             )}

             {product.customizationAvailable && (
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-indigo-600" /> Customize Your Design
                     </h3>
                     <div className="space-y-4">
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Your Text (Name/Quote)</label>
                             <input 
                                type="text" 
                                maxLength={20}
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder={`Enter text for ${product.customizationType}...`}
                             />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Font Style</label>
                             <div className="flex gap-2">
                                 {['Modern', 'Classic', 'Handwritten'].map(font => (
                                     <button 
                                        key={font}
                                        onClick={() => setCustomFont(font)}
                                        className={`px-4 py-2 rounded-lg text-sm border transition-all ${customFont === font ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                     >
                                          {font}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     </div>
                 </div>
             )}
         </div>

         <div className="flex flex-col h-full">
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                   <Badge color="indigo">{product.category}</Badge>
                   {product.customizationAvailable && <Badge color="purple">Personalizable</Badge>}
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 
                   <span className="font-bold">{product.rating || 0}</span> 
                   <span className="text-slate-400">({product.reviews?.length || product.numReviews} reviews)</span>
                   <span className="text-slate-300">•</span>
                   <span className="text-slate-500">By {product.shop?.name || 'Verified Seller'}</span>
                </div>

                <button 
                  onClick={() => openChat(product)}
                  className="mt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors w-fit border border-indigo-100"
                >
                   <MessageSquare className="w-4 h-4" />
                   Chat regarding this product
                </button>
             </div>

             <div className="text-3xl font-black text-slate-900 mb-8">₹{product.price}</div>

             <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>

             {product.colors && product.colors.length > 0 && (
               <div className="mb-6">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Select Color</label>
                  <div className="flex gap-3">
                      {product.colors.map(color => (
                         <button 
                           key={color} 
                           onClick={() => setSelectedColor(color)}
                           className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-indigo-600 scale-110' : 'border-slate-200 hover:scale-105'}`}
                           style={{ backgroundColor: color }}
                        />
                      ))}
                  </div>
               </div>
             )}

             {product.sizes && product.sizes.length > 0 && (
               <div className="mb-8">
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Select Size</label>
                  <div className="flex gap-3">
                      {product.sizes.map(size => (
                         <button 
                           key={size} 
                           onClick={() => setSelectedSize(size)}
                           className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold transition-all ${selectedSize === size ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                        >
                           {size}
                        </button>
                      ))}
                  </div>
               </div>
             )}

             <div className="flex flex-col gap-3 mt-auto">
                <Button size="lg" onClick={handleAddToCart} className="w-full">
                   <ShoppingBag className="w-5 h-5" /> Add to Cart
                </Button>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                {product.specs && Object.entries(product.specs).map(([key, val]) => (
                   <div key={key} className={key === '_id' ? 'hidden' : ''}>
                      <span className="block text-xs text-slate-400 uppercase font-bold">{key}</span>
                      <span className="text-sm font-medium text-slate-900">{val}</span>
                   </div>
                ))}
             </div>
         </div>
       </div>
    </div>
  );
};

// --- Profile View ---
const ProfileView = ({ currentUser, orders, onLogout }) => (
    <div className="pt-24 pb-32 max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                 {currentUser?.avatar || currentUser?.name?.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                 <h1 className="text-3xl font-black text-slate-900">{currentUser?.name}</h1>
                 <p className="text-slate-500">{currentUser?.email}</p>
                 <div className="mt-2 flex gap-2 justify-center md:justify-start">
                     <Badge color="indigo">{currentUser?.role}</Badge>
                 </div>
              </div>
          </div>
          
          <Card className="p-6">
                <h3 className="font-bold text-xl text-slate-800 mb-6">Order History</h3>
                <div className="space-y-4">
                      {orders.length === 0 ? <p className="text-slate-400">No orders yet.</p> : 
                         orders.map(o => (
                             <div key={o._id} className="flex flex-col md:flex-row justify-between p-4 bg-slate-50 rounded-xl gap-4">
                                <div>
                                    <p className="font-bold">Order #{o._id.toString().slice(0,5)}</p>
                                    <p className="text-xs text-slate-500">{o.items.length} items • {formatDate(o.createdAt)}</p>
                                    <div className="flex gap-2 mt-2">
                                             {o.items.map((item, idx) => (
                                                 <div key={idx} className="w-10 h-10 rounded overflow-hidden border border-slate-200">
                                                      <img src={item.image || "https://via.placeholder.com/50"} className="w-full h-full object-cover" alt="" />
                                                 </div>
                                             ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-bold text-indigo-600 text-lg block">₹{o.totalPrice}</span>
                                    <Badge color={o.orderStatus === 'Delivered' ? 'green' : 'indigo'}>{o.orderStatus || 'Processing'}</Badge>
                                </div>
                             </div>
                         ))
                      }
                </div>
          </Card>
          <Button onClick={onLogout} variant="danger" className="w-full mt-6">Sign Out</Button>
    </div>
);

// --- Admin Login Page (NEW) ---
const AdminLoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState("admin18@gmail.com");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
  
    const handleLogin = (e) => {
      e.preventDefault();
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
          setLoading(false);
          const user = {
              _id: "user_admin",
              name: "Sanjay Choudhary",
              email: email,
              role: "founder",
              avatar: "SC",
              token: "god_token"
          };
          onLogin(user);
      }, 1500);
    };
  
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 text-indigo-500 border border-slate-700 shadow-lg shadow-indigo-900/20">
                      <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">God Mode Access</h2>
                  <p className="text-slate-400 text-sm mt-2">Restricted Area. Authorized Personnel Only.</p>
              </div>
  
              <form onSubmit={handleLogin} className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Admin ID</label>
                      <div className="relative">
                          <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                          <input 
                              type="email" 
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium placeholder:text-slate-600" 
                              placeholder="admin@craftify.com"
                              required
                          />
                      </div>
                  </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 ml-1 uppercase">Security Key</label>
                      <div className="relative">
                          <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                          <input 
                              type="password" 
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 bg-slate-950/50 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium placeholder:text-slate-600" 
                              placeholder="••••••••"
                              required
                          />
                      </div>
                  </div>
  
                  <Button type="submit" loading={loading} className="w-full py-4 mt-6 bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/25">
                      {loading ? 'Authenticating...' : 'Unlock System'}
                  </Button>
              </form>
               <div className="mt-8 text-center">
                   <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white text-sm transition-colors">Return to Safety</button>
               </div>
          </div>
      </div>
    );
  };

// ==========================================
// 5. MAIN APP COMPONENT & ROUTER
// ==========================================

const CraftifyContent = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  
  const [toasts, setToasts] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('customer');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatProduct, setActiveChatProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Initial Load: Check Auth
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if(userInfo) {
        setCurrentUser(userInfo);
    }
    // Also load mock orders if user exists
    if(userInfo) setOrders([{ _id: "order_old_1", items: [MOCK_PRODUCTS[0]], totalPrice: 2499, createdAt: Date.now(), orderStatus: 'Delivered' }]);
  }, []);

  // --- Helpers ---
  const addToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: generateId() }]);
    addToast("Added to Cart", `${product.name} is now in your cart.`);
    setIsCartOpen(true);
  };

  const openCustomizationChat = (product) => {
      if(!currentUser) {
          openLogin('customer');
          return;
      }
      setActiveChatProduct(product);
      setIsChatOpen(true);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem("userInfo", JSON.stringify(user));
    setIsAuthOpen(false);
    addToast("Welcome Back", `Signed in as ${user.name}`);
    
    // REDIRECT LOGIC
    if(user.role === 'founder') {
        navigate('/founder');
    } 
    else if(user.role === 'seller') {
        navigate('/my-shop');
    }
  };

  const openLogin = (mode = 'customer') => {
      // If user wants to be a seller, send them to the Seller page (which now handles login too)
      if(mode === 'seller') {
          // Default to login mode if explicitly asked for seller login
          navigate('/seller-login'); 
          return;
      }
      setAuthMode(mode);
      setIsAuthOpen(true);
  };

  const handleLogout = () => {
      localStorage.removeItem("userInfo");
      setCurrentUser(null);
      setOrders([]);
      navigate('/');
  };

  const handleCheckout = () => {
    if (!currentUser) return openLogin();
    
    const newOrder = {
        _id: generateId(),
        items: cart,
        totalPrice: cart.reduce((acc, i) => acc + i.price, 0),
        createdAt: Date.now(),
        orderStatus: 'Processing'
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCartOpen(false);
    addToast("Order Placed!", "Thank you for your purchase.");
    navigate('/profile');
  };

  // Hide Navbar for landing page, seller register, seller login, and admin login
  const showNavbar = location.pathname !== '/founder' && location.pathname !== '/' && location.pathname !== '/seller-register' && location.pathname !== '/seller-login' && location.pathname !== '/admin-login';
  const activeTab = location.pathname === '/' ? 'home' : location.pathname === '/shop' ? 'shop' : location.pathname === '/profile' ? 'profile' : 'more';

  useEffect(() => {
    const openCartHandler = () => setIsCartOpen(true);
    document.addEventListener('openCart', openCartHandler);
    return () => document.removeEventListener('openCart', openCartHandler);
  }, []);

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900 selection:bg-indigo-200 pb-20 md:pb-0">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {showNavbar && (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${location.pathname === '/' ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-slate-200'}`}>
           <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/50 group-hover:scale-105 transition-transform">C</div>
                 <span className={`text-xl font-bold tracking-tight ${location.pathname === '/' ? 'text-white' : 'text-slate-900'}`}>Craftify.</span>
              </Link>
              
              <div className={`hidden md:flex items-center gap-8 font-medium text-sm ${location.pathname === '/' ? 'text-white/80' : 'text-slate-600'}`}>
                 <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
                 <Link to="/shop" className="hover:text-indigo-500 transition-colors">Marketplace</Link>
              </div>

              <div className="flex items-center gap-4">
                 {currentUser?.role === 'founder' && <Button size="sm" onClick={() => navigate('/founder')}>Founder Mode</Button>}
                 
                 {currentUser?.role === 'seller' && <Button size="sm" onClick={() => navigate('/my-shop')}>Seller Dashboard</Button>}
                 
                 <div className="relative">
                    <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`p-2 rounded-full hover:bg-black/10 relative ${location.pathname === '/' ? 'text-white' : 'text-slate-600'}`}>
                        <Bell className="w-5 h-5" />
                    </button>
                    {isNotificationsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-fade-in z-[60]">
                            <h4 className="font-bold text-xs p-2 text-slate-500 uppercase">Notifications</h4>
                            <p className="text-xs text-center p-2 text-slate-400">No new notifications</p>
                        </div>
                    )}
                 </div>

                 <button onClick={() => currentUser ? navigate('/profile') : openLogin('customer')} className={`p-2 rounded-full hover:bg-black/10 transition-colors ${location.pathname === '/' ? 'text-white' : 'text-slate-600'}`}>
                    {currentUser ? <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white border border-white">{currentUser.avatar}</div> : <User className="w-5 h-5" />}
                 </button>
                 
                 <button onClick={() => setIsCartOpen(true)} className={`hidden md:block p-2 rounded-full hover:bg-black/10 relative ${location.pathname === '/' ? 'text-white' : 'text-slate-600'}`}>
                    <ShoppingBag className="w-5 h-5" />
                    {cart.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white animate-pulse">{cart.length}</span>}
                 </button>
              </div>
           </div>
        </nav>
      )}

      <main className="min-h-screen">
         <Routes>
             <Route path="/" element={<LandingPage onLoginClick={openLogin} />} />
             
             {/* --- UPDATED: Split Seller Routes --- */}
             <Route path="/seller-register" element={
                 <SellerRegister 
                    onLoginSuccess={handleLogin}
                    initialMode="register" 
                 />
             } />

             <Route path="/seller-login" element={
                 <SellerRegister 
                    onLoginSuccess={handleLogin}
                    initialMode="login" 
                 />
             } />

             {/* --- NEW: Admin Login Route --- */}
             <Route path="/admin-login" element={
                 <AdminLoginPage 
                    onLogin={handleLogin}
                 />
             } />

             <Route path="/shop" element={
                <ShopView 
                  activeCategory={activeCategory} 
                  setActiveCategory={setActiveCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  addToCart={addToCart}
                  products={products}
                  shops={[]} 
                />
             } />
             <Route path="/product/:id" element={
                <ProductDetail 
                   addToCart={addToCart} 
                   openChat={openCustomizationChat}
                   currentUser={currentUser}
                   products={products}
                />
             } />
             <Route path="/profile" element={
                currentUser ? 
                <ProfileView currentUser={currentUser} orders={orders} onLogout={handleLogout} /> 
                : <Navigate to="/" replace />
             } />
             
             <Route path="/founder" element={
                currentUser?.role === 'founder' ? 
                <FounderAccess currentUser={currentUser} />
                : <Navigate to="/" replace />
             } />

             <Route path="/my-shop" element={
                currentUser?.role === 'seller' ? 
                <StoreAdmin 
                   currentUser={currentUser} 
                />
                : <Navigate to="/" replace />
             } />
         </Routes>
      </main>

      {showNavbar && <MobileNav activeTab={activeTab} navigate={navigate} cartCount={cart.length} />}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} initialMode={authMode} />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        setCart={setCart}
        onCheckout={handleCheckout}
        currentUser={currentUser}
      />

      {activeChatProduct && (
        <CustomizationChat 
           isOpen={isChatOpen}
           onClose={() => setIsChatOpen(false)}
           product={activeChatProduct}
           currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <Router>
       <CraftifyContent />
    </Router>
  );
}