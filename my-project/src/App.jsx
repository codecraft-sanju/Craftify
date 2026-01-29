import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Inbox
} from 'lucide-react';

// ==========================================
// 1. ADVANCED MOCK DATA & UTILITIES
// ==========================================

const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Users
const USERS = [
  { id: 'u1', name: 'Sanjay Choudhary', email: 'admin@craftify.com', role: 'admin', avatar: 'SC' },
  { id: 'u2', name: 'Roshni', email: 'roshni@gmail.com', role: 'customer', avatar: 'R' },
  { id: 'u3', name: 'Rahul Dev', email: 'rahul@gmail.com', role: 'customer', avatar: 'RD' }
];

// Mock Products with Variants
const PRODUCTS = [
  {
    id: 'p1',
    name: "Obsidian Matte Pen",
    category: "Office",
    price: 499,
    image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    stock: 150,
    tags: ["Bestseller", "Premium"],
    description: "Premium weighted metal pen with matte black finish. Laser engraving available.",
    specs: { material: "Brass", ink: "Gel Black", weight: "45g" },
    colors: ["#000000", "#1a1a1a", "#C0C0C0"]
  },
  {
    id: 'p2',
    name: "Urban Oversized Tee",
    category: "Apparel",
    price: 899,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    stock: 80,
    tags: ["Trending", "Cotton"],
    description: "240 GSM heavy cotton. Boxy fit. Perfect for DTG printing.",
    specs: { material: "100% Cotton", gsm: "240", fit: "Oversized" },
    colors: ["#FFFFFF", "#000000", "#808000", "#000080"],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 'p3',
    name: "Cyberpunk Neon Sign",
    category: "Tech",
    price: 2499,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800",
    rating: 5.0,
    stock: 0,
    tags: ["Custom", "LED"],
    description: "Custom LED neon sign. Low energy consumption, high impact.",
    specs: { voltage: "12V", lifespan: "50,000 hrs", mount: "Wall" },
    colors: ["#FF00FF", "#00FFFF", "#FFFF00"]
  },
  {
    id: 'p4',
    name: "Smart Temp Flask",
    category: "Gifting",
    price: 799,
    image: "https://images.unsplash.com/photo-1602143407151-011141950038?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    stock: 200,
    tags: ["Smart", "Travel"],
    description: "LED temperature display. Keeps liquids hot/cold for 12 hours.",
    specs: { capacity: "500ml", material: "SS 304", battery: "500 days" },
    colors: ["#000000", "#FFFFFF", "#FF0000"]
  },
  {
    id: 'p5',
    name: "Leather Tech Organizer",
    category: "Tech",
    price: 1499,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    stock: 45,
    tags: ["Leather", "Handmade"],
    description: "Keep your cables and drives organized in style.",
    specs: { material: "Vegan Leather", slots: "12", size: "A5" },
    colors: ["#8B4513", "#000000"]
  },
  {
    id: 'p6',
    name: "Minimalist Desk Mat",
    category: "Office",
    price: 899,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800",
    rating: 4.5,
    stock: 300,
    tags: ["Felt", "Work"],
    description: "Wool felt desk pad for a clean workspace aesthetic.",
    specs: { material: "Wool Felt", size: "90x40cm", antiSlip: "Yes" },
    colors: ["#808080", "#36454F"]
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

// ==========================================
// 2. CORE UI COMPONENT LIBRARY
// ==========================================

const Button = ({ children, variant = 'primary', className = '', icon: Icon, loading, ...props }) => {
  const base = "relative overflow-hidden transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-indigo-600 shadow-lg hover:shadow-indigo-500/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50",
    ghost: "bg-transparent text-slate-500 hover:text-indigo-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/30"
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
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

// Toast Notification Component
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
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
            <Button onClick={onCheckout} className="w-full" size="lg">Checkout Now <ArrowRight className="w-4 h-4"/></Button>
          </div>
        )}
      </div>
    </>
  );
};

// --- Authentication Modal ---
const AuthModal = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
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
            <h2 className="text-2xl font-black text-slate-900">{isLogin ? 'Welcome Back!' : 'Join Craftify'}</h2>
            <p className="text-slate-500 text-sm mt-2">Enter your details to access your custom world.</p>
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
                  placeholder="admin@craftify.com"
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

            <Button type="submit" loading={loading} className="w-full py-4 mt-4">
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-bold hover:underline">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">Demo Login: admin@craftify.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Chat & Customization Modal ---
const CustomizationModal = ({ product, onClose, onAddToCart, globalChats, setGlobalChats, currentUser }) => {
  const chatId = useMemo(() => generateId(), []);
  const [messages, setMessages] = useState([
    { id: 1, text: `Hello! I'm the AI Design Assistant for the ${product.name}. Upload a logo or tell me your vision.`, sender: 'ai', timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors ? product.colors[0] : null);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI Processing & then Handover to Admin
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: "I've logged your request. Our expert designers will review this. You can add this configured item to cart now.", 
        sender: 'ai', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Save to Global Chat for Admin
      const newChatSession = {
        id: chatId,
        userId: currentUser?.id || 'guest',
        userName: currentUser?.name || 'Guest User',
        productId: product.id,
        productName: product.name,
        messages: [...messages, userMsg, aiResponse],
        status: 'pending',
        lastUpdate: new Date(),
        unreadAdmin: true
      };
      
      setGlobalChats(prev => {
        const existing = prev.findIndex(c => c.productId === product.id && c.userId === (currentUser?.id || 'guest'));
        if (existing > -1) {
            const updated = [...prev];
            updated[existing] = { ...updated[existing], messages: [...updated[existing].messages, userMsg, aiResponse], lastUpdate: new Date(), unreadAdmin: true };
            return updated;
        }
        return [newChatSession, ...prev];
      });

    }, 1500);
  };

  const handleAddToCart = () => {
    onAddToCart({
      ...product,
      cartId: generateId(),
      customChatId: chatId,
      selectedColor,
      selectedSize
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-0 md:p-6 animate-fade-in">
      <div className="bg-white w-full h-full md:rounded-3xl md:max-w-6xl md:h-[90vh] flex overflow-hidden shadow-2xl relative flex-col md:flex-row">
        
        {/* Left: Product Viz */}
        <div className="w-full md:w-5/12 bg-slate-50 p-6 md:p-10 flex flex-col border-r border-slate-100 overflow-y-auto">
          <button onClick={onClose} className="md:hidden absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm z-10"><X className="w-5 h-5"/></button>
          
          <div className="flex-1 flex flex-col justify-center">
             <div className="aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white relative group">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Product" />
                <div className="absolute top-4 left-4">
                  {selectedColor && <div className="w-8 h-8 rounded-full border-2 border-white shadow-md" style={{backgroundColor: selectedColor}} />}
                </div>
             </div>
             
             <div className="mt-8 space-y-6">
               <div>
                 <h2 className="text-3xl font-black text-slate-900">{product.name}</h2>
                 <p className="text-slate-500 font-medium">₹{product.price}</p>
               </div>

               {/* Configuration Options */}
               <div className="space-y-4">
                 {product.colors && (
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Color</p>
                     <div className="flex gap-2">
                       {product.colors.map(color => (
                         <button 
                           key={color} 
                           onClick={() => setSelectedColor(color)}
                           className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-indigo-600 scale-110 shadow-md' : 'border-white'}`}
                           style={{backgroundColor: color}}
                         />
                       ))}
                     </div>
                   </div>
                 )}
                 {product.sizes && (
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Size</p>
                     <div className="flex gap-2">
                       {product.sizes.map(size => (
                         <button 
                           key={size} 
                           onClick={() => setSelectedSize(size)}
                           className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${selectedSize === size ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                         >
                           {size}
                         </button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        </div>

        {/* Right: Chat Interface */}
        <div className="w-full md:w-7/12 flex flex-col bg-white h-[50vh] md:h-auto">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur z-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                 <Bot className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="font-bold text-slate-900">Craftify AI + Expert</h3>
                 <p className="text-xs text-green-500 font-bold flex items-center gap-1"><Activity className="w-3 h-3"/> Active Now</p>
               </div>
            </div>
            <button onClick={onClose} className="hidden md:block hover:bg-slate-100 p-2 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400"/></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.sender === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}>
                   {msg.sender === 'ai' && <Sparkles className="w-4 h-4 text-purple-500 mb-2 inline-block mr-2" />}
                   {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"/>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"/>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"/>
                  </div>
               </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
             <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
               {["Add Logo", "Change Color", "Bulk Order?"].map(hint => (
                 <button key={hint} onClick={() => setInput(hint)} className="text-xs font-bold px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 rounded-full transition-colors whitespace-nowrap">
                   {hint}
                 </button>
               ))}
             </div>
             <div className="flex gap-2">
               <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Paperclip className="w-5 h-5"/></button>
               <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Describe your customization..."
                 className="flex-1 bg-slate-50 border-none outline-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-100 transition-all"
               />
               <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all">
                 <Send className="w-5 h-5"/>
               </button>
             </div>
             <Button onClick={handleAddToCart} className="w-full mt-4" variant="success">
               Confirm Design & Add to Cart — ₹{product.price}
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. ADMIN DASHBOARD COMPONENTS
// ==========================================

const KanbanCard = ({ order, onMove }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all mb-3 group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-400">#{order.id.slice(0,6)}</span>
      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{new Date(order.date).toLocaleDateString()}</span>
    </div>
    <h4 className="font-bold text-slate-800 text-sm mb-1">{order.items[0]?.name} {order.items.length > 1 && `+${order.items.length - 1}`}</h4>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold border border-white shadow-sm">
        {order.customerName?.charAt(0)}
      </div>
      <span className="text-xs text-slate-500">{order.customerName}</span>
    </div>
    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
      <span className="font-bold text-slate-900 text-sm">₹{order.total}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={() => onMove(order.id, 'next')} className="p-1 hover:bg-slate-100 rounded"><ChevronRight className="w-4 h-4 text-slate-400"/></button>
      </div>
    </div>
  </div>
);

const AdminPanel = ({ orders, setOrders, globalChats, setGlobalChats }) => {
  const [tab, setTab] = useState('overview');
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Analytics Logic
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  
  const moveOrder = (id, direction) => {
    const statuses = ['Processing', 'Production', 'Shipped', 'Delivered'];
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const currentIdx = statuses.indexOf(o.status);
        const nextIdx = Math.min(statuses.length - 1, currentIdx + 1);
        return { ...o, status: statuses[nextIdx] };
      }
      return o;
    }));
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-[#0F172A] text-white flex flex-col shrink-0 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50"><Sparkles className="w-6 h-6"/></div>
          <span className="font-bold text-xl hidden lg:block tracking-tight">Admin.</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'kanban', icon: RefreshCcw, label: 'Order Pipeline' },
            { id: 'chats', icon: MessageSquare, label: 'Design Inbox' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center p-3 rounded-xl transition-all group ${tab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5 lg:mr-3" />
              <span className="hidden lg:block font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex justify-between items-center px-8">
           <h2 className="text-xl font-bold text-slate-800 capitalize">{tab === 'chats' ? 'Design Inbox' : `${tab} Dashboard`}</h2>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Bell className="w-5 h-5 text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors"/>
                 <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">SC</div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {tab === 'overview' && (
             <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   {[
                     { label: 'Revenue', val: `₹${totalRevenue}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                     { label: 'Active Orders', val: totalOrders, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                     { label: 'Design Requests', val: globalChats.length, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
                     { label: 'Avg Rating', val: '4.8', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
                   ].map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:-translate-y-1 transition-transform">
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
                
                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="p-6">
                      <h3 className="font-bold text-slate-800 mb-6">Revenue Trend</h3>
                      <div className="h-48 flex items-end justify-between gap-2">
                         {[40, 60, 45, 80, 55, 90, 100].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-100 rounded-t-lg relative group hover:bg-indigo-500 transition-colors" style={{height: `${h}%`}}>
                               <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹{h}k</div>
                            </div>
                         ))}
                      </div>
                   </Card>
                   <Card className="p-6">
                      <h3 className="font-bold text-slate-800 mb-4">Traffic Sources</h3>
                      <div className="space-y-4">
                         {[
                            { label: 'Direct', val: 65, color: 'bg-indigo-500' },
                            { label: 'Social', val: 25, color: 'bg-purple-500' },
                            { label: 'Referral', val: 10, color: 'bg-amber-500' }
                         ].map(src => (
                            <div key={src.label}>
                               <div className="flex justify-between text-sm mb-1">
                                  <span className="font-medium text-slate-600">{src.label}</span>
                                  <span className="font-bold text-slate-900">{src.val}%</span>
                               </div>
                               <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${src.color}`} style={{width: `${src.val}%`}}></div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </Card>
                </div>
             </div>
          )}

          {tab === 'kanban' && (
             <div className="grid grid-cols-4 gap-6 h-full overflow-x-auto min-w-[1000px] animate-fade-in">
                {['Processing', 'Production', 'Shipped', 'Delivered'].map(status => (
                   <div key={status} className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-slate-700">{status}</h3>
                         <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                           {orders.filter(o => o.status === status).length}
                         </span>
                      </div>
                      <div className="bg-slate-100/50 p-3 rounded-2xl flex-1 border border-slate-200/50">
                         {orders.filter(o => o.status === status).map(order => (
                            <KanbanCard key={order.id} order={order} onMove={moveOrder} />
                         ))}
                         {orders.filter(o => o.status === status).length === 0 && (
                            <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">Empty</div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          )}

          {tab === 'chats' && (
            <div className="flex h-full bg-white rounded-2xl border border-slate-200 overflow-hidden animate-fade-in">
               {/* Chat List */}
               <div className="w-1/3 border-r border-slate-200 flex flex-col">
                  <div className="p-4 border-b border-slate-200 bg-slate-50">
                     <h3 className="font-bold text-slate-800">Active Requests</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {globalChats.length === 0 ? <p className="text-center p-8 text-slate-400">No active chats</p> : 
                      globalChats.map(chat => (
                        <div key={chat.id} onClick={() => setSelectedChat(chat)} className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}>
                           <div className="flex justify-between mb-1">
                              <h4 className="font-bold text-sm text-slate-900">{chat.userName}</h4>
                              <span className="text-xs text-slate-400">{new Date(chat.lastUpdate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           </div>
                           <p className="text-xs text-slate-500 truncate mb-1">Re: {chat.productName}</p>
                           <p className="text-xs text-slate-400 truncate">"{chat.messages[chat.messages.length-1].text}"</p>
                        </div>
                      ))
                    }
                  </div>
               </div>
               
               {/* Chat View */}
               <div className="w-2/3 flex flex-col bg-slate-50/50">
                  {selectedChat ? (
                    <>
                      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                         <div>
                            <h3 className="font-bold text-slate-900">{selectedChat.productName}</h3>
                            <p className="text-xs text-slate-500">Customer: {selectedChat.userName}</p>
                         </div>
                         <Button size="sm" variant="secondary">Mark Resolved</Button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                         {selectedChat.messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                               <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-white border border-slate-200 text-slate-700' : 'bg-indigo-600 text-white'}`}>
                                  {msg.sender === 'ai' && <span className="text-[10px] uppercase font-bold opacity-70 block mb-1">AI Assitant</span>}
                                  {msg.text}
                               </div>
                            </div>
                         ))}
                      </div>
                      <div className="p-4 bg-white border-t border-slate-200">
                         <div className="flex gap-2">
                            <input className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm" placeholder="Type a reply as admin..." />
                            <Button size="sm">Reply</Button>
                         </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                       <Inbox className="w-12 h-12 mb-4 opacity-20"/>
                       <p>Select a conversation to view details</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ==========================================
// 5. STOREFRONT (MAIN APP)
// ==========================================

export default function App() {
  // --- Global State ---
  const [currentUser, setCurrentUser] = useStickyState(null, 'craftify_user');
  const [cart, setCart] = useStickyState([], 'craftify_cart');
  const [orders, setOrders] = useStickyState([], 'craftify_orders');
  const [globalChats, setGlobalChats] = useStickyState([], 'craftify_chats');
  const [wishlist, setWishlist] = useStickyState([], 'craftify_wishlist');
  const [toasts, setToasts] = useState([]);
  
  // --- UI State ---
  const [view, setView] = useState('home'); // home, shop, product, profile, admin
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const mousePos = useMousePosition();

  // --- Actions ---
  const addToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const addToCart = (product) => {
    setCart([...cart, { ...product }]);
    setSelectedProduct(null);
    addToast("Added to Cart", `${product.name} is now in your cart.`);
    setIsCartOpen(true);
  };

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(i => i !== id));
      addToast("Removed", "Item removed from wishlist", "info");
    } else {
      setWishlist([...wishlist, id]);
      addToast("Saved", "Item added to wishlist");
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    if (!currentUser) return setIsAuthOpen(true);
    
    // Create Order
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
    setView('profile');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    addToast("Welcome Back", `Signed in as ${user.name}`);
  };

  // --- Views ---

  const HomeView = () => (
    <>
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-900">
         {/* Dynamic Background */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] rounded-full bg-indigo-600 blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-purple-600 blur-[100px] animate-pulse delay-1000"></div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8 animate-slide-in order-2 lg:order-1 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Accepting Bulk Orders
               </div>
               <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                  Craft.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Custom.</span><br/>
                  Culture.
               </h1>
               <p className="text-slate-400 text-lg md:text-xl max-w-lg leading-relaxed mx-auto lg:mx-0">
                  The most advanced customization platform. Chat with AI, visualize in real-time, and order premium merchandise.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={() => setView('shop')} size="lg" className="rounded-full px-8 py-4 text-base">Start Creating <ArrowRight className="w-5 h-5"/></Button>
                  <button className="px-8 py-4 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors">View Gallery</button>
               </div>
            </div>
            
            {/* Premium Kit Parallax Card - Fully Visible on Mobile Now */}
            <div className="relative order-1 lg:order-2 flex justify-center perspective-1000">
               <div 
                  className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-3xl shadow-2xl transition-all duration-500 animate-float"
                  style={{ 
                    transform: typeof window !== 'undefined' && window.innerWidth > 1024 
                      ? `rotateY(${mousePos.x * 0.02}deg) rotateX(${mousePos.y * -0.02}deg)` 
                      : 'none' 
                  }}
               >
                  <div className="aspect-[4/3] w-full max-w-[500px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 overflow-hidden relative shadow-inner">
                      <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800" className="object-cover w-full h-full mix-blend-overlay opacity-60" />
                      <div className="absolute bottom-6 left-6 text-white">
                         <p className="font-bold text-2xl">Premium Kit</p>
                         <p className="text-white/80">Starting ₹1,499</p>
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
                      <p className="text-sm font-medium">120+ Ordered today</p>
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
                  { icon: MessageSquare, title: "Chat Customization", desc: "Talk to our AI or experts to refine your design perfectly." },
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
    </>
  );

  const ShopView = () => {
    const filteredProducts = PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    return (
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 min-h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
           <div>
              <h2 className="text-4xl font-black text-slate-900 mb-2">Explore Collection</h2>
              <p className="text-slate-500">Curated premium goods for custom branding.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4">
             {/* Search Bar */}
             <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"/>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
             </div>
             {/* Categories */}
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
           {filteredProducts.map(product => (
              <div key={product.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 relative flex flex-col">
                 <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                    <button 
                       onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                       className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors z-20 shadow-sm"
                    >
                       <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    </button>
                    {product.stock === 0 && (
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold uppercase tracking-widest z-10 backdrop-blur-sm">Sold Out</div>
                    )}
                    {/* Quick Action Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                       <Button onClick={() => setSelectedProduct(product)} className="w-full bg-white/90 backdrop-blur text-slate-900 hover:bg-indigo-600 hover:text-white" disabled={product.stock === 0}>
                          <Sparkles className="w-4 h-4" /> Customize Now
                       </Button>
                    </div>
                 </div>
                 
                 <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
                       <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md">
                          <Star className="w-3 h-3 fill-current" /> {product.rating}
                       </div>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{product.description}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                       <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                       <span className={`text-xs font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                       </span>
                    </div>
                 </div>
              </div>
           ))}
           {filteredProducts.length === 0 && (
             <div className="col-span-full py-20 text-center">
               <div className="inline-block p-4 rounded-full bg-slate-100 mb-4"><Search className="w-8 h-8 text-slate-400"/></div>
               <h3 className="text-lg font-bold text-slate-700">No products found</h3>
               <p className="text-slate-500">Try adjusting your search or category.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    if (!currentUser) return <div className="h-screen flex items-center justify-center bg-white"><div className="text-center"><h3 className="text-2xl font-bold mb-4">Please Login</h3><Button onClick={() => setIsAuthOpen(true)}>Login Now</Button></div></div>;
    
    return (
      <div className="pt-24 pb-20 max-w-5xl mx-auto px-6">
         <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
               {currentUser.avatar}
            </div>
            <div className="text-center md:text-left">
               <h1 className="text-3xl font-black text-slate-900">{currentUser.name}</h1>
               <p className="text-slate-500">{currentUser.email}</p>
               <div className="mt-2 flex gap-2 justify-center md:justify-start">
                 <Badge color="indigo">Premium Member</Badge>
                 <Badge color="green">Verified</Badge>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
               <Card className="p-6">
                  <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2"><Package className="w-5 h-5"/> Order History</h3>
                  <div className="space-y-4">
                     {orders.filter(o => o.customerId === currentUser.id).length === 0 ? (
                        <p className="text-slate-400 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">No orders yet.</p>
                     ) : (
                        orders.filter(o => o.customerId === currentUser.id).map(order => (
                           <div key={order.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div>
                                 <p className="font-bold text-slate-900">Order #{order.id.slice(0,6)}</p>
                                 <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()} • {order.items.length} Items</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-indigo-600">₹{order.total}</p>
                                 <Badge color={order.status === 'Delivered' ? 'green' : 'amber'}>{order.status}</Badge>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </Card>
            </div>
            
            <div className="space-y-6">
               <Card className="p-6">
                  <h3 className="font-bold text-slate-800 mb-4">Saved Addresses</h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 mb-2">
                     <div className="flex items-center gap-2 font-bold text-slate-900 mb-1"><MapPin className="w-4 h-4"/> Home</div>
                     <p>123, Tech Park Road, Bangalore, KA 560001</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full border-dashed border">Add New Address</Button>
               </Card>
               <Button onClick={() => { setCurrentUser(null); setView('home'); }} variant="danger" className="w-full">Sign Out <LogOut className="w-4 h-4"/></Button>
            </div>
         </div>
      </div>
    );
  };

  // --- Main Render ---
  
  // If user is admin and wants to see admin view
  if (view === 'admin' && currentUser?.role === 'admin') {
    return <AdminPanel orders={orders} setOrders={setOrders} globalChats={globalChats} setGlobalChats={setGlobalChats} />;
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900 selection:bg-indigo-200">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${view === 'home' && window.scrollY < 50 ? 'bg-transparent text-white' : 'bg-white/80 backdrop-blur-md text-slate-900 border-b border-slate-200'}`}>
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div onClick={() => setView('home')} className="flex items-center gap-2 cursor-pointer">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/50">C</div>
               <span className={`text-xl font-bold tracking-tight ${view === 'home' ? 'text-white' : 'text-slate-900'}`}>Craftify.</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 font-medium text-sm">
               {['Home', 'Shop'].map(item => (
                  <button key={item} onClick={() => setView(item.toLowerCase())} className="hover:text-indigo-500 transition-colors">{item}</button>
               ))}
               <button onClick={() => window.open('mailto:partner@craftify.com')} className="hover:text-indigo-500 transition-colors">Bulk Orders</button>
            </div>

            <div className="flex items-center gap-4">
               {currentUser?.role === 'admin' && (
                  <Button size="sm" onClick={() => setView('admin')} className="hidden md:flex">Admin</Button>
               )}
               
               <button onClick={() => setView('profile')} className={`p-2 rounded-full hover:bg-black/10 transition-colors ${view === 'home' ? 'text-white' : 'text-slate-600'}`}>
                  {currentUser ? (
                     <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white border border-white">
                        {currentUser.avatar}
                     </div>
                  ) : <User className="w-5 h-5" />}
               </button>
               
               <button onClick={() => setIsCartOpen(true)} className={`p-2 rounded-full hover:bg-black/10 relative ${view === 'home' ? 'text-white' : 'text-slate-600'}`}>
                  <ShoppingBag className="w-5 h-5" />
                  {cart.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white animate-pulse">{cart.length}</span>}
               </button>
               
               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2"><Menu className="w-6 h-6"/></button>
            </div>
         </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
         <div className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden animate-fade-in">
            <div className="flex flex-col gap-4 text-xl font-bold text-slate-900">
               <button onClick={() => {setView('home'); setIsMenuOpen(false)}}>Home</button>
               <button onClick={() => {setView('shop'); setIsMenuOpen(false)}}>Shop</button>
               <button onClick={() => {setView('profile'); setIsMenuOpen(false)}}>Profile</button>
               <hr />
               {currentUser?.role === 'admin' && <button onClick={() => {setView('admin'); setIsMenuOpen(false)}}>Admin Dashboard</button>}
               {!currentUser && <Button onClick={() => setIsAuthOpen(true)}>Login / Signup</Button>}
            </div>
         </div>
      )}

      {/* View Router */}
      <main className="min-h-screen">
         {view === 'home' && <HomeView />}
         {view === 'shop' && <ShopView />}
         {view === 'profile' && <ProfileView />}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-16">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
            <div className="col-span-1 md:col-span-2">
               <h2 className="text-2xl font-bold mb-4">Craftify.</h2>
               <p className="text-slate-400 max-w-sm leading-relaxed">
                  Empowering creators and brands with premium custom merchandise. Built with cutting-edge tech in India.
               </p>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-slate-200">Shop</h3>
               <ul className="space-y-2 text-slate-400">
                  <li>New Arrivals</li>
                  <li>Bestsellers</li>
                  <li>Gift Guide</li>
                  <li>Bulk Pricing</li>
               </ul>
            </div>
            <div>
               <h3 className="font-bold mb-4 text-slate-200">Company</h3>
               <ul className="space-y-2 text-slate-400">
                  <li>About Us</li>
                  <li>Careers</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
               </ul>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
            © 2026 Craftify Inc. All rights reserved.
         </div>
      </footer>

      {/* Modals & Overlays */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} />
      
      {selectedProduct && (
         <CustomizationModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={addToCart}
            globalChats={globalChats}
            setGlobalChats={setGlobalChats}
            currentUser={currentUser}
         />
      )}
      
      <CartDrawer 
         isOpen={isCartOpen} 
         onClose={() => setIsCartOpen(false)} 
         cart={cart}
         setCart={setCart}
         onCheckout={handleCheckout}
      />
    </div>
  );
}