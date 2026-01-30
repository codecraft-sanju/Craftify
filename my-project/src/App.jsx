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
  Inbox, Store, Wallet, ChevronLeft
} from 'lucide-react';
import LandingPage from './LandingPage'; 

// ==========================================
// 1. ENTERPRISE MOCK DATA & UTILITIES
// ==========================================

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

// Mock Users
const USERS = [
  { id: 'founder1', name: 'Sanjay Choudhary', email: 'sanjay@craftify.com', role: 'founder', avatar: 'SC' },
  { id: 'seller1', name: 'Rahul Dev', email: 'rahul@shop.com', role: 'seller', shopId: 's1', avatar: 'RD' },
  { id: 'seller2', name: 'Priya Art', email: 'priya@art.com', role: 'seller', shopId: 's2', avatar: 'PA' },
  { id: 'u2', name: 'Roshni', email: 'roshni@gmail.com', role: 'customer', avatar: 'R' }
];

// Mock Shops
const SHOPS = [
    { id: 's1', name: 'TechHaven', ownerId: 'seller1', revenue: 145000, totalOrders: 45, rating: 4.8, description: "Premium tech accessories and custom modifications." },
    { id: 's2', name: 'ArtisanLoft', ownerId: 'seller2', revenue: 88000, totalOrders: 32, rating: 4.9, description: "Handcrafted apparel and sustainable goods." }
];

// Mock Products (Enhanced with Specifications)
const PRODUCTS = [
  {
    id: 'p1',
    shopId: 's1',
    name: "Obsidian Matte Pen",
    category: "Office",
    price: 499,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    reviews: 128,
    stock: 150,
    tags: ["Bestseller", "Laser Engravable"],
    description: "Premium weighted metal pen with matte black finish. Perfect for corporate gifting with custom laser engraving options available upon request.",
    specs: { material: "Brass Alloy", ink: "Gel Black (Refillable)", weight: "45g", mechanism: "Twist Action" },
    colors: ["#000000", "#1a1a1a", "#C0C0C0"],
    customizationAvailable: true
  },
  {
    id: 'p2',
    shopId: 's2',
    name: "Urban Oversized Tee",
    category: "Apparel",
    price: 899,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    reviews: 84,
    stock: 80,
    tags: ["Trending", "100% Cotton"],
    description: "240 GSM heavy cotton. Boxy fit. Ideal canvas for DTG printing or embroidery. Contact us for bulk team orders.",
    specs: { material: "100% Cotton", gsm: "240", fit: "Oversized", wash: "Machine Cold" },
    colors: ["#FFFFFF", "#000000", "#808000", "#000080"],
    sizes: ["S", "M", "L", "XL"],
    customizationAvailable: true
  },
  {
    id: 'p3',
    shopId: 's1',
    name: "Cyberpunk Neon Sign",
    category: "Tech",
    price: 2499,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    reviews: 42,
    stock: 15,
    tags: ["Custom Text", "LED"],
    description: "Custom LED neon sign. Send us your text or logo in the chat to get a preview. Low energy consumption, high impact.",
    specs: { voltage: "12V Adapter", lifespan: "50,000 hrs", mount: "Wall Kit Included", material: "Acrylic Backboard" },
    colors: ["#FF00FF", "#00FFFF", "#FFFF00"],
    customizationAvailable: true
  },
  {
    id: 'p4',
    shopId: 's2',
    name: "Smart Temp Flask",
    category: "Gifting",
    price: 799,
    image: "https://images.unsplash.com/photo-1602143407151-011141950038?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    reviews: 210,
    stock: 200,
    tags: ["Corporate", "Smart"],
    description: "LED temperature display. Keeps liquids hot/cold for 12 hours. Engrave your company logo for bulk orders.",
    specs: { capacity: "500ml", material: "SS 304 Food Grade", battery: "500 days (Non-chargeable)" },
    colors: ["#000000", "#FFFFFF", "#FF0000"],
    customizationAvailable: false
  }
];

// Mock Chats for Customization
const MOCK_CHATS = [
  {
    id: 'c1',
    productId: 'p1',
    customerId: 'u2',
    sellerId: 'seller1',
    messages: [
      { id: 1, sender: 'u2', text: "Hi, can I get 'Roshni' engraved on this pen?", time: "10:30 AM" },
      { id: 2, sender: 'seller1', text: "Absolutely! We support laser engraving. Do you want it in cursive or block font?", time: "10:35 AM" }
    ]
  }
];

// --- Custom Hooks ---

const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    if (typeof window !== "undefined") {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    }
    return defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

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

// Toast Notification Component
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

// --- Advanced Customization Chat Engine ---
const CustomizationChat = ({ isOpen, onClose, product, currentUser, chats, setChats }) => {
  const [message, setMessage] = useState("");
  const chatEndRef = useRef(null);

  // Find existing chat or create temporary placeholder
  const activeChat = chats.find(c => c.productId === product.id && c.customerId === currentUser.id) || {
    id: 'temp', productId: product.id, customerId: currentUser.id, messages: []
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, activeChat.messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: currentUser.id,
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let updatedChats;
    if (activeChat.id === 'temp') {
      // Create new chat session
      const newChat = {
        ...activeChat,
        id: generateId(),
        sellerId: product.shopId,
        messages: [newMessage]
      };
      updatedChats = [...chats, newChat];
    } else {
      // Update existing
      updatedChats = chats.map(c => c.id === activeChat.id ? { ...c, messages: [...c.messages, newMessage] } : c);
    }
    
    setChats(updatedChats);
    setMessage("");

    // Simulate Bot/Seller Reply
    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        sender: 'system',
        text: "Thanks for your request! The seller will review your customization details and get back to you shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => c.productId === product.id && c.customerId === currentUser.id ? { ...c, messages: [...c.messages, botReply] } : c));
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white p-1 border border-slate-200">
              <img src={product.image} className="w-full h-full object-cover rounded" alt="" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customize: {product.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Seller Online</p>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {activeChat.messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-900">Start Customizing</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Ask about engraving, color changes, or bulk orders. The seller is here to help!
              </p>
            </div>
          ) : (
            activeChat.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 opacity-70 ${msg.sender === currentUser.id ? 'text-indigo-100' : 'text-slate-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip className="w-5 h-5" /></button>
            <input 
              type="text" 
              className="flex-1 bg-transparent outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
              placeholder="Type your requirements..."
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
const CartDrawer = ({ isOpen, onClose, cart, setCart, onCheckout }) => {
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
              <div key={item.cartId} className="flex gap-4 p-3 border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                      <button onClick={() => removeItem(item.cartId)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    {item.selectedColor && (
                      <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 rounded-full border border-slate-200" style={{backgroundColor: item.selectedColor}}></div>
                          {item.selectedSize && <span className="text-xs text-slate-500 border border-slate-200 px-1 rounded">{item.selectedSize}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
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
            <Button onClick={onCheckout} className="w-full" size="lg" variant="primary">Checkout Now <ArrowRight className="w-4 h-4"/></Button>
          </div>
        )}
      </div>
    </>
  );
};

// --- Authentication Modal ---
const AuthModal = ({ isOpen, onClose, onLogin, initialMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(initialMode === 'founder') setEmail('sanjay@craftify.com');
    else if(initialMode === 'seller') setEmail('rahul@shop.com');
    else setEmail('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const user = USERS.find(u => u.email === email) || { 
        id: generateId(), name: 'New User', email, role: 'customer', avatar: 'N' 
      };
      onLogin(user);
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white shadow-lg shadow-indigo-200">
               <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
               {initialMode === 'founder' ? 'Founder Login' : initialMode === 'seller' ? 'Seller Portal' : 'Welcome!'}
            </h2>
            <p className="text-slate-500 text-sm mt-2">Enter your details to access.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
               Demo Logins:<br/>
               Founder: sanjay@craftify.com<br/>
               Seller: rahul@shop.com<br/>
               Customer: roshni@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. VIEWS & DASHBOARDS
// ==========================================

// --- Seller Dashboard ---
const SellerDashboard = ({ currentUser, products, orders, chats }) => {
    const myShop = SHOPS.find(s => s.ownerId === currentUser.id) || { name: 'My Shop', revenue: 0, totalOrders: 0 };
    const myProducts = products.filter(p => p.shopId === myShop.id);
    const myOrders = orders.filter(o => o.items.some(i => i.shopId === myShop.id));
    const myChats = chats.filter(c => c.sellerId === myShop.id);
    
    const calculatedRevenue = myOrders.reduce((acc, order) => {
        const orderTotal = order.items.filter(i => i.shopId === myShop.id).reduce((sum, item) => sum + item.price, 0);
        return acc + orderTotal;
    }, myShop.revenue);

    return (
        <div className="p-8 max-w-7xl mx-auto pt-28">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Seller Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {currentUser.name}. Manage your store.</p>
                </div>
                <Button>
                   <Plus className="w-4 h-4" /> Add New Product
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600"><DollarSign className="w-6 h-6"/></div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Total Revenue</p>
                        <h3 className="text-2xl font-black text-slate-900">₹{calculatedRevenue}</h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><Package className="w-6 h-6"/></div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Total Orders</p>
                        <h3 className="text-2xl font-black text-slate-900">{myOrders.length + myShop.totalOrders}</h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><Star className="w-6 h-6"/></div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Shop Rating</p>
                        <h3 className="text-2xl font-black text-slate-900">{myShop.rating}</h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><MessageSquare className="w-6 h-6"/></div>
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase">Active Chats</p>
                        <h3 className="text-2xl font-black text-slate-900">{myChats.length}</h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customization Requests */}
                <Card className="p-6">
                   <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Customization Requests</h3>
                   <div className="space-y-4">
                      {myChats.length === 0 ? <p className="text-slate-400 text-sm">No active discussions.</p> :
                         myChats.map(c => {
                             const product = PRODUCTS.find(p => p.id === c.productId);
                             return (
                               <div key={c.id} className="p-3 border border-slate-100 rounded-xl flex gap-3 hover:bg-slate-50 cursor-pointer">
                                  <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden"><img src={product?.image} className="w-full h-full object-cover"/></div>
                                  <div>
                                     <h4 className="font-bold text-sm text-slate-900">{product?.name}</h4>
                                     <p className="text-xs text-slate-500 line-clamp-1">{c.messages[c.messages.length -1].text}</p>
                                  </div>
                               </div>
                             )
                         })
                      }
                   </div>
                </Card>

                 {/* Recent Orders */}
                 <Card className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Orders</h3>
                    <div className="space-y-4">
                        {myOrders.length === 0 ? <p className="text-slate-400 text-sm">No recent orders found.</p> : 
                            myOrders.map(o => (
                                <div key={o.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">Order #{o.id.slice(0,5)}</p>
                                        <p className="text-xs text-slate-500">{new Date(o.date).toLocaleDateString()}</p>
                                    </div>
                                    <Badge color="indigo">Processing</Badge>
                                </div>
                            ))
                        }
                    </div>
                </Card>
            </div>
        </div>
    );
};

// --- Founder Dashboard ---
const FounderDashboard = ({ users, shops, orders, products }) => {
    const totalPlatformRevenue = shops.reduce((acc, s) => acc + s.revenue, 0) + orders.reduce((acc, o) => acc + o.total, 0);
    const totalPlatformOrders = shops.reduce((acc, s) => acc + s.totalOrders, 0) + orders.length;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
             <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 transition-all duration-300">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">C</div>
                    <span className="font-bold text-lg tracking-tight">Founder Mode</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/20">
                        <Activity className="w-5 h-5"/> Overview
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
                        <Store className="w-5 h-5"/> Manage Shops
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
                        <Users className="w-5 h-5"/> Users
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-colors">
                        <Wallet className="w-5 h-5"/> Finances
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">SC</div>
                        <div className="text-sm">
                            <p className="font-bold text-white">Sanjay C.</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                    </div>
                </div>
             </aside>

             <main className="flex-1 overflow-auto p-8">
                 <header className="flex justify-between items-center mb-8">
                     <div>
                         <h1 className="text-3xl font-black text-slate-900">Platform Overview</h1>
                         <p className="text-slate-500">Live data across all shops and users.</p>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg text-sm flex items-center gap-2">
                             <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                             </span>
                             System Operational
                         </div>
                     </div>
                 </header>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                     {[
                         { label: 'Total Revenue', val: `₹${totalPlatformRevenue}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                         { label: 'Active Shops', val: shops.length, icon: Store, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                         { label: 'Total Users', val: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                         { label: 'Total Orders', val: totalPlatformOrders, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
                     ].map((stat, i) => (
                         <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
                             <div>
                                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                                 <h3 className="text-3xl font-black text-slate-900">{stat.val}</h3>
                             </div>
                             <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                 <stat.icon className="w-6 h-6" />
                             </div>
                         </div>
                     ))}
                 </div>

                 <Card className="p-6 mb-8">
                     <h3 className="font-bold text-slate-900 mb-6">Active Shops Performance</h3>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                     <th className="py-3 pl-2">Shop Name</th>
                                     <th className="py-3">Owner</th>
                                     <th className="py-3">Revenue</th>
                                     <th className="py-3">Rating</th>
                                     <th className="py-3">Status</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {shops.map(shop => {
                                     const owner = users.find(u => u.id === shop.ownerId);
                                     return (
                                         <tr key={shop.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                             <td className="py-4 pl-2 font-bold text-slate-900">{shop.name}</td>
                                             <td className="py-4 text-sm text-slate-600">{owner?.name || 'Unknown'}</td>
                                             <td className="py-4 font-bold text-green-600">₹{shop.revenue}</td>
                                             <td className="py-4 text-sm flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400"/> {shop.rating}</td>
                                             <td className="py-4"><Badge color="green">Active</Badge></td>
                                         </tr>
                                     )
                                 })}
                             </tbody>
                         </table>
                     </div>
                 </Card>

                 <Card className="p-6">
                     <h3 className="font-bold text-slate-900 mb-4">New Users</h3>
                     <div className="flex gap-4 overflow-x-auto pb-2">
                         {users.map(u => (
                             <div key={u.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[200px]">
                                 <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">{u.avatar}</div>
                                 <div>
                                     <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                     <p className="text-xs text-slate-500 capitalize">{u.role}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </Card>
             </main>
        </div>
    );
};

// --- Product Detail View (High Ticket Item Feature) ---
const ProductDetail = ({ addToCart, openChat, currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);
  const shop = SHOPS.find(s => s.id === product?.shopId);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);

  if (!product) return <div className="p-20 text-center">Product not found. <Link to="/shop" className="text-indigo-600">Go back</Link></div>;

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-6">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium">
         <ChevronLeft className="w-4 h-4" /> Back
       </button>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
             <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
             </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col h-full">
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                   <Badge color="indigo">{product.category}</Badge>
                   {product.customizationAvailable && <Badge color="purple">Customizable</Badge>}
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 
                   <span className="font-bold">{product.rating}</span> 
                   <span className="text-slate-400">({product.reviews} reviews)</span>
                   <span className="text-slate-300">•</span>
                   <span className="text-slate-500">Sold by {shop?.name}</span>
                </div>
             </div>

             <div className="text-3xl font-black text-slate-900 mb-8">₹{product.price}</div>

             <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>

             {/* Selectors */}
             {product.colors && (
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

             {product.sizes && (
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

             {/* Action Buttons */}
             <div className="flex flex-col gap-3 mt-auto">
                <Button size="lg" onClick={() => addToCart({ ...product, selectedColor, selectedSize })} className="w-full">
                   <ShoppingBag className="w-5 h-5" /> Add to Cart
                </Button>
                
                {product.customizationAvailable && (
                   <Button size="lg" variant="secondary" onClick={() => openChat(product)} className="w-full">
                      <MessageSquare className="w-5 h-5" /> Discuss Customization
                   </Button>
                )}
             </div>

             {/* Specs */}
             <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, val]) => (
                   <div key={key}>
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

// --- Shop/Marketplace View ---
const ShopView = ({ activeCategory, setActiveCategory, searchQuery, setSearchQuery, addToCart }) => {
  const filteredProducts = PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-2">Marketplace</h2>
                  <p className="text-slate-500">Discover unique goods from independent sellers.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                     <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"/>
                     <input 
                       type="text" 
                       placeholder="Search products..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full sm:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-shadow focus:shadow-md"
                     />
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
                     {["All", "Tech", "Office", "Apparel", "Gifting"].map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                         >
                           {cat}
                         </button>
                      ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map(product => {
                    const shop = SHOPS.find(s => s.id === product.shopId);
                    return (
                       <Link to={`/product/${product.id}`} key={product.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 relative flex flex-col">
                           <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                              <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                              {product.stock === 0 && (
                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold uppercase tracking-widest z-10 backdrop-blur-sm">Sold Out</div>
                              )}
                              <button 
                                onClick={(e) => { e.preventDefault(); addToCart(product); }} 
                                className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                              >
                                <ShoppingBag className="w-5 h-5" />
                              </button>
                           </div>
                           <div className="p-6 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-2">
                                 <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
                                 <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md">
                                    <Star className="w-3 h-3 fill-current" /> {product.rating}
                                 </div>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">Sold by <span className="text-indigo-600 font-bold">{shop?.name || 'Craftify'}</span></p>
                              <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                 <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                                 {product.customizationAvailable && <Badge color="purple">Customizable</Badge>}
                              </div>
                           </div>
                       </Link>
                    );
                })}
            </div>
      </div>
  );
};

// --- Profile View ---
const ProfileView = ({ currentUser, orders, onLogout }) => (
    <div className="pt-24 pb-20 max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                 {currentUser?.avatar}
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
                    {orders.filter(o => o.customerId === currentUser?.id).length === 0 ? <p className="text-slate-400">No orders yet.</p> : 
                       orders.filter(o => o.customerId === currentUser?.id).map(o => (
                           <div key={o.id} className="flex justify-between p-4 bg-slate-50 rounded-xl">
                               <div><p className="font-bold">Order #{o.id.slice(0,5)}</p><p className="text-xs text-slate-500">{o.items.length} items • {formatDate(o.date)}</p></div>
                               <span className="font-bold text-indigo-600">₹{o.total}</span>
                           </div>
                       ))
                    }
               </div>
          </Card>
          <Button onClick={onLogout} variant="danger" className="w-full mt-6">Sign Out</Button>
    </div>
);

// ==========================================
// 5. MAIN APP COMPONENT & ROUTER
// ==========================================

const CraftifyContent = () => {
  const [currentUser, setCurrentUser] = useStickyState(null, 'craftify_user');
  const [cart, setCart] = useStickyState([], 'craftify_cart');
  const [orders, setOrders] = useStickyState([], 'craftify_orders');
  const [chats, setChats] = useStickyState(MOCK_CHATS, 'craftify_chats');
  const [toasts, setToasts] = useState([]);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('customer');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatProduct, setActiveChatProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const navigate = useNavigate();
  const location = useLocation();
  
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
    setIsAuthOpen(false);
    addToast("Welcome Back", `Signed in as ${user.name}`);
    if(user.role === 'founder') navigate('/founder');
    else if(user.role === 'seller') navigate('/seller');
  };

  const openLogin = (mode = 'customer') => {
      setAuthMode(mode);
      setIsAuthOpen(true);
  };

  const handleLogout = () => {
      setCurrentUser(null);
      navigate('/');
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) return openLogin();
    
    const newOrder = {
      id: generateId(),
      items: cart,
      total: cart.reduce((acc, i) => acc + i.price, 0),
      date: new Date(),
      status: 'Processing',
      customerName: currentUser.name,
      customerId: currentUser.id
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    addToast("Order Placed!", "Thank you for your purchase.");
    navigate('/profile');
  };

  const showNavbar = location.pathname !== '/founder';

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900 selection:bg-indigo-200">
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
                 {currentUser?.role === 'seller' && <Button size="sm" onClick={() => navigate('/seller')}>Seller Dashboard</Button>}
                 
                 <button onClick={() => currentUser ? navigate('/profile') : openLogin('customer')} className={`p-2 rounded-full hover:bg-black/10 transition-colors ${location.pathname === '/' ? 'text-white' : 'text-slate-600'}`}>
                    {currentUser ? <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white border border-white">{currentUser.avatar}</div> : <User className="w-5 h-5" />}
                 </button>
                 
                 <button onClick={() => setIsCartOpen(true)} className={`p-2 rounded-full hover:bg-black/10 relative ${location.pathname === '/' ? 'text-white' : 'text-slate-600'}`}>
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
             <Route path="/shop" element={
                <ShopView 
                  activeCategory={activeCategory} 
                  setActiveCategory={setActiveCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  addToCart={addToCart}
                />
             } />
             <Route path="/product/:id" element={
                <ProductDetail 
                    addToCart={addToCart} 
                    openChat={openCustomizationChat}
                    currentUser={currentUser}
                />
             } />
             <Route path="/profile" element={
                currentUser ? 
                <ProfileView currentUser={currentUser} orders={orders} onLogout={handleLogout} /> 
                : <Navigate to="/" replace />
             } />
             <Route path="/founder" element={
                currentUser?.role === 'founder' ? 
                <FounderDashboard users={USERS} shops={SHOPS} orders={orders} products={PRODUCTS} />
                : <Navigate to="/" replace />
             } />
             <Route path="/seller" element={
                currentUser?.role === 'seller' ? 
                <SellerDashboard currentUser={currentUser} products={PRODUCTS} orders={orders} chats={chats} />
                : <Navigate to="/" replace />
             } />
         </Routes>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} initialMode={authMode} />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        setCart={setCart}
        onCheckout={handleCheckout}
      />

      {activeChatProduct && (
        <CustomizationChat 
           isOpen={isChatOpen}
           onClose={() => setIsChatOpen(false)}
           product={activeChatProduct}
           currentUser={currentUser}
           chats={chats}
           setChats={setChats}
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