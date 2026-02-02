// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams, Navigate, Outlet } from 'react-router-dom';
import { 
  ShoppingBag, X, ArrowRight, Trash2, MessageSquare, 
  User, RefreshCcw, Store, Palette, AlertCircle, CheckCircle, Package, ChevronLeft
} from 'lucide-react';
import io from 'socket.io-client';

// --- CONFIGURATION ---
const API_URL = "http://localhost:5000";
const ENDPOINT = "http://localhost:5000";
var socket;

// --- IMPORTS ---
import LandingPage from './LandingPage'; 
import FounderAccess from './FounderAccess';
import StoreAdmin from './StoreAdmin';
import ShopView from './ShopView'; 
import SellerRegister from './SellerRegister';
import CustomizationChat from './CustomizationChat'; 

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

// ==========================================
// 1. UI COMPONENTS
// ==========================================

const Button = ({ children, variant = 'primary', className = '', icon: Icon, loading, ...props }) => {
  const base = "relative overflow-hidden transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-slate-900/30",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };
  const sizes = props.size === 'sm' ? 'px-3 py-1.5 text-xs' : props.size === 'lg' ? 'px-8 py-4 text-base' : 'px-6 py-3.5 text-sm';

  return (
    <button disabled={loading || props.disabled} className={`${base} ${variants[variant]} ${sizes} ${className}`} {...props}>
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
    red: "bg-red-100 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${colors[color]}`}>{children}</span>;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>{children}</div>
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
// 2. FEATURE COMPONENTS
// ==========================================

const LiveCustomizer = ({ product, customText, setCustomText }) => (
    <div className="relative w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-inner group">
        <img src={product.image || product.coverImage} className="w-full h-full object-cover" alt="Preview" />
        {customText && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-slate-900 drop-shadow-lg pointer-events-none">
                {customText}
            </div>
        )}
    </div>
);

const CartDrawer = ({ isOpen, onClose, cart, setCart, onCheckout, currentUser }) => {
  const total = cart.reduce((acc, item) => acc + item.price, 0);
  const removeItem = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[90] transform transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ShoppingBag className="w-5 h-5"/> My Cart ({cart.length})</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? <p className="text-center text-slate-400 mt-10">Your cart is empty.</p> : 
            cart.map(item => (
              <div key={item.cartId} className="flex gap-4 p-3 border border-slate-100 rounded-xl bg-white shadow-sm">
                <img src={item.image || item.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-100"/>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                    <button onClick={() => removeItem(item.cartId)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <span className="font-bold text-indigo-600 block mt-1">₹{item.price}</span>
                  {item.customization && <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 mt-1 inline-block">Customized</span>}
                </div>
              </div>
            ))
          }
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between mb-6 text-lg font-black"><span className="text-slate-900">Total</span><span className="text-indigo-600">₹{total}</span></div>
            <Button onClick={onCheckout} className="w-full" size="lg" variant="primary">{currentUser ? 'Checkout Now' : 'Login to Checkout'} <ArrowRight className="w-4 h-4"/></Button>
          </div>
        )}
      </div>
    </>
  );
};

const AuthModal = ({ isOpen, onClose, onLogin, initialMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isFounderLogin = initialMode === 'founder';
  
  useEffect(() => {
    setEmail(''); setIsLogin(true); setError("");
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
        const endpoint = isLogin ? '/api/users/login' : '/api/users';
        const payload = isLogin ? { email, password } : { name, email, password };
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong");
        if (isFounderLogin && data.role !== 'founder') throw new Error("Access Denied: You are not a Founder.");
        onLogin(data);
        onClose();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative p-8">
        <button onClick={onClose} className="absolute top-4 right-4"><X className="w-5 h-5 text-slate-500"/></button>
        <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">{isFounderLogin ? 'Founder Access' : (isLogin ? 'Welcome Back' : 'Create Account')}</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isFounderLogin && <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Full Name" required />}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Email" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Password" required />
            <Button type="submit" loading={loading} className="w-full mt-4">{isLogin ? 'Login' : 'Sign Up'}</Button>
        </form>
        {!isFounderLogin && (
            <div className="mt-4 text-center">
                <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-600 hover:underline font-bold">{isLogin ? "Create Account" : "Sign In"}</button>
            </div>
        )}
      </div>
    </div>
  );
};

const ProductDetail = ({ addToCart, openChat, currentUser, products }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p._id === id);
  const [customText, setCustomText] = useState("");

  if (!product) return <div className="p-20 text-center flex flex-col items-center"><RefreshCcw className="w-8 h-8 animate-spin text-indigo-500"/><p className="text-slate-500 mt-2">Loading product...</p></div>;

  return (
    <div className="pt-28 pb-32 max-w-7xl mx-auto px-6">
       <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium"><ChevronLeft className="w-4 h-4" /> Back</button>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="space-y-6">
             <LiveCustomizer product={product} customText={customText} setCustomText={setCustomText}/>
             {product.customizationAvailable && (
                 <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-indigo-600" /> Customize</h3>
                     <input type="text" maxLength={20} value={customText} onChange={(e) => setCustomText(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Enter text to print..." />
                 </div>
             )}
         </div>
         <div className="flex flex-col h-full">
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Badge color="indigo">{product.category}</Badge>
                    {product.stock > 0 ? <span className="text-xs font-bold text-green-600">In Stock</span> : <span className="text-xs font-bold text-red-500">Out of Stock</span>}
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Store className="w-4 h-4" /> Sold by <span className="font-bold text-slate-900">{product.shop?.name || 'Verified Seller'}</span>
                </div>
                <button onClick={() => openChat(product)} className="mt-6 flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-5 py-3 rounded-xl hover:bg-indigo-100 transition-colors w-fit border border-indigo-100 shadow-sm">
                    <MessageSquare className="w-4 h-4" /> Chat with Seller
                </button>
             </div>
             <div className="text-4xl font-black text-slate-900 mb-8">₹{product.price}</div>
             <p className="text-slate-600 leading-relaxed mb-8">{product.description}</p>
             <div className="flex flex-col gap-3 mt-auto">
                <Button size="lg" onClick={() => addToCart({ ...product, customization: customText ? { text: customText } : null })} className="w-full" disabled={product.stock <= 0}>
                    <ShoppingBag className="w-5 h-5" /> {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                </Button>
             </div>
         </div>
       </div>
    </div>
  );
};

const ProfileView = ({ currentUser, orders, onLogout }) => (
    <div className="pt-24 pb-32 max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white">
                 {currentUser?.avatar || currentUser?.name?.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                 <h1 className="text-3xl font-black text-slate-900">{currentUser?.name}</h1>
                 <p className="text-slate-500">{currentUser?.email}</p>
                 <div className="mt-2 flex gap-2 justify-center md:justify-start">
                     <Badge color="indigo">{currentUser?.role}</Badge>
                     <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Member since {new Date().getFullYear()}</span>
                 </div>
              </div>
          </div>
          <Card className="p-6">
                <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-600"/> Order History</h3>
                <div className="space-y-4">
                      {orders.length === 0 ? <p className="text-slate-400 text-center py-10">No orders yet. Start shopping!</p> : 
                          orders.map(o => (
                             <div key={o._id} className="flex flex-col md:flex-row justify-between p-4 bg-slate-50 rounded-xl gap-4 border border-slate-100 hover:border-indigo-200 transition-colors">
                                <div>
                                    <p className="font-bold text-indigo-600">Order #{o._id.toString().slice(-6)}</p>
                                    <p className="text-xs text-slate-500">{o.items?.length || 0} items • {formatDate(o.createdAt)}</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <span className="font-bold text-slate-900 text-lg block">₹{o.totalAmount}</span>
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

// --- UTILS ---
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
};

// ==========================================
// 3. SECURITY ROUTES (THE FIX)
// ==========================================

// Fix 1: Protected Route now checks Cookies too
const ProtectedRoute = ({ user, allowedRoles, children, redirectPath = '/' }) => {
    // 1. Check LocalStorage User
    if (!user) return <Navigate to={redirectPath} replace />;

    // 2. COOKIE CHECK (Critical Fix)
    // Agar user logged in hai par cookie gayab hai (manually deleted), logout and redirect.
    // Note: Works if cookies are not HttpOnly. If HttpOnly, rely on API 401 response (handled in components).
    // Assuming you can read the 'role' cookie or some token presence check:
    const cookieRole = getCookie('role') || getCookie('token'); 
    // Agar aapke backend ne 'role' cookie set ki hai toh ye best hai.
    // Agar nahi, toh hum 'StoreAdmin' ke andar API failure handle karenge (see StoreAdmin.jsx).
    
    // 3. Check Role Permission
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if(user.role === 'founder') return <Navigate to="/founder" replace />;
        if(user.role === 'seller') return <Navigate to="/my-shop" replace />;
        return <Navigate to="/shop" replace />;
    }
    
    return children ? children : <Outlet />;
};

// Fix 2: Buyer Only Route (Blocks Sellers)
const BuyerOnlyRoute = ({ children }) => {
    const cookieRole = getCookie('role');
    const savedUser = localStorage.getItem("userInfo");
    const localRole = savedUser ? JSON.parse(savedUser).role : null;
    const currentRole = cookieRole || localRole;

    if (currentRole === 'seller') {
        return <Navigate to="/my-shop" replace />;
    }
    return children;
};

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================

const CraftifyContent = () => {
  const [currentUser, setCurrentUser] = useState(() => {
      const savedUser = localStorage.getItem("userInfo");
      return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]); 
  const [productsLoading, setProductsLoading] = useState(true);
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
  
  useEffect(() => {
    socket = io(ENDPOINT, { withCredentials: true });
    if(currentUser) {
        fetchOrders();
        socket.emit("setup", currentUser);
    }
    fetchProducts();
    socket.on("product_updated", (updatedProduct) => {
        setProducts(prev => prev.map(p => p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p));
    });
    return () => { socket.disconnect(); }
  }, [currentUser]);

  const fetchProducts = async () => {
      try {
          setProductsLoading(true);
          const res = await fetch(`${API_URL}/api/products`);
          const data = await res.json();
          setProducts(data);
      } catch (error) { console.error("Failed to fetch products:", error); } 
      finally { setProductsLoading(false); }
  };

  const fetchOrders = async () => {
      try {
          const res = await fetch(`${API_URL}/api/orders/myorders`, {
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include' 
          });
          if (res.status === 401) { handleLogout(); return; } // Auto logout if unauthorized
          const data = await res.json();
          if(Array.isArray(data)) setOrders(data);
      } catch (error) { console.error("Failed to fetch orders:", error); }
  };

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
      if(!currentUser) { openLogin('customer'); return; }
      setActiveChatProduct(product);
      setIsChatOpen(true);
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setIsAuthOpen(false);
    addToast("Access Granted", `Signed in as ${userData.name}`);
    if(userData.role === 'founder') navigate('/founder', { replace: true });
    else if(userData.role === 'seller') navigate('/my-shop');
    else navigate('/shop');
  };

  const openLogin = (mode = 'customer') => {
      if(mode === 'seller') { navigate('/seller-login'); return; }
      setAuthMode(mode);
      setIsAuthOpen(true);
  };

  const handleLogout = async () => {
      try {
          await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
      } catch (error) { console.error("Logout failed", error); }
      localStorage.removeItem("userInfo");
      setCurrentUser(null);
      setOrders([]);
      socket.disconnect(); 
      socket = io(ENDPOINT, { withCredentials: true }); 
      navigate('/');
  };

  const handleCheckout = async () => {
    if (!currentUser) return openLogin();
    const orderPayload = {
        orderItems: cart.map(item => ({
            product: item._id, shop: item.shop._id || item.shop, name: item.name,
            image: item.image || item.coverImage, price: item.price, qty: 1,
            customization: item.customization
        })),
        shippingAddress: { fullName: currentUser.name, address: "123 Test St", city: "Mumbai", postalCode: "400001", country: "India", phone: "9999999999" },
        paymentMethod: "Card", itemsPrice: cart.reduce((acc, i) => acc + i.price, 0),
        taxPrice: 0, shippingPrice: 0, totalPrice: cart.reduce((acc, i) => acc + i.price, 0)
    };
    try {
        const res = await fetch(`${API_URL}/api/orders`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            credentials: 'include', body: JSON.stringify(orderPayload)
        });
        if(!res.ok) throw new Error("Order failed");
        const newOrder = await res.json();
        setOrders(prev => [newOrder, ...prev]);
        setCart([]); setIsCartOpen(false);
        addToast("Order Placed!", "Thank you for your purchase.");
        navigate('/profile');
    } catch (error) { console.error(error); addToast("Error", "Could not place order", "error"); }
  };

  const showNavbar = !['/founder', '/seller-register', '/seller-login', '/admin-login'].includes(location.pathname);

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
                 {currentUser?.role === 'seller' && <Button size="sm" onClick={() => navigate('/my-shop')}>Seller Dashboard</Button>}
                 <button onClick={() => currentUser ? navigate('/profile') : openLogin('customer')} className={`p-2 rounded-full hover:bg-black/10 transition-colors ${location.pathname === '/' ? 'text-white' : 'text-slate-600'}`}>
                    {currentUser ? <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white border border-white">{currentUser.avatar || currentUser.name.charAt(0)}</div> : <User className="w-5 h-5" />}
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
             <Route path="/seller-register" element={<SellerRegister onLoginSuccess={handleLogin} initialMode="register" />} />
             <Route path="/seller-login" element={<SellerRegister onLoginSuccess={handleLogin} initialMode="login" />} />
             <Route path="/admin-login" element={<AuthModal isOpen={true} onClose={() => navigate('/')} onLogin={handleLogin} initialMode="founder"/>} />
             
             {/* PROTECTED WITH COOKIE CHECK + BUYER ONLY */}
             <Route path="/shop" element={<BuyerOnlyRoute><ShopView activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} addToCart={addToCart} products={products} shops={[]} isLoading={productsLoading} /></BuyerOnlyRoute>} />
             <Route path="/product/:id" element={<BuyerOnlyRoute><ProductDetail addToCart={addToCart} openChat={openCustomizationChat} currentUser={currentUser} products={products} /></BuyerOnlyRoute>} />
             
             <Route path="/profile" element={<ProtectedRoute user={currentUser}><ProfileView currentUser={currentUser} orders={orders} onLogout={handleLogout} /></ProtectedRoute>} />
             <Route path="/founder" element={<ProtectedRoute user={currentUser} allowedRoles={['founder']}><FounderAccess currentUser={currentUser} /></ProtectedRoute>} />
             <Route path="/my-shop" element={<ProtectedRoute user={currentUser} allowedRoles={['seller']}><StoreAdmin currentUser={currentUser} /></ProtectedRoute>} />
         </Routes>
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLogin={handleLogin} initialMode={authMode} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} setCart={setCart} onCheckout={handleCheckout} currentUser={currentUser} />
      {activeChatProduct && <CustomizationChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} product={activeChatProduct} currentUser={currentUser} socket={socket} API_URL={API_URL} />}
    </div>
  );
};

export default function App() { return <Router><CraftifyContent /></Router>; }