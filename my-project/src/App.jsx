// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  useParams,
  Navigate,
  Outlet,
} from 'react-router-dom';
import {
  ShoppingBag,
  X,
  ArrowRight,
  Trash2,
  MessageSquare,
  User,
  RefreshCcw,
  Store,
  Palette,
  AlertCircle,
  CheckCircle,
  Package,
  ChevronLeft,
  ChevronRight,
  Home,
  Grid,
  Heart,
  Menu,
  Plus,
  Clock,
  MapPin,
  Box,
} from 'lucide-react';
import io from 'socket.io-client';

// --- CONFIGURATION ---
// Updated to use .env variable
const API_URL = import.meta.env.VITE_API_URL;
const ENDPOINT = import.meta.env.VITE_API_URL;
var socket;

// --- IMPORTS ---
import LandingPage from './LandingPage';
import FounderAccess from './FounderAccess';
import StoreAdmin from './StoreAdmin';
import ShopView from './ShopView';
import SellerRegister from './SellerRegister';
import CustomizationChat from './CustomizationChat';
import CustomerAuth from './CustomerAuth';
import CheckoutModal from './CheckoutModal';
import ProfileView from './ProfileView'; 
import WishlistView from './WishlistView'; 

const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));


const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-font-smoothing: antialiased;
      background-color: #F8FAFC;
    }

    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; border: 2px solid #F8FAFC; }
    ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

    .animate-in { animation: fadeIn 0.3s ease-out forwards; }
    .slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    
    .pb-safe-area { padding-bottom: env(safe-area-inset-bottom, 20px); }
  `}</style>
);

// --- PREMIUM UI COMPONENTS ---

const Button = ({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  loading,
  ...props
}) => {
  const base =
    'relative overflow-hidden transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const variants = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 border border-transparent',
    secondary:
      'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
    danger:
      'bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    indigo:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 border border-transparent',
  };
  const sizes =
    props.size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : props.size === 'lg'
        ? 'px-8 py-4 text-base'
        : 'px-6 py-3 text-sm';

  return (
    <button
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes} ${className}`}
      {...props}
    >
      {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
      {!loading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
    green:
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10',
    slate: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/10',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 left-4 right-4 md:top-24 md:right-6 md:left-auto z-[130] flex flex-col gap-3 pointer-events-none">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl p-4 flex items-start gap-3 w-full md:w-80 animate-in slide-in-from-top-2"
      >
        {toast.type === 'success' ? (
          <div className="p-1 bg-green-100 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          </div>
        ) : (
          <div className="p-1 bg-red-100 rounded-full">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-bold text-sm text-slate-900">{toast.title}</h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button onClick={() => removeToast(toast.id)}>
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        </button>
      </div>
    ))}
  </div>
);

// ==========================================
// 2. FEATURE COMPONENTS
// ==========================================

const LiveCustomizer = ({ product, customText, setCustomText }) => (
  <div className="relative w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-inner group border border-slate-200">
    <img
      src={product.image || product.coverImage}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      alt="Preview"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {customText && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-4xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] pointer-events-none text-center px-4 w-full break-words tracking-tight">
        {customText}
      </div>
    )}
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
        Live Preview
      </span>
    </div>
  </div>
);

// --- FIXED CART DRAWER ---
const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  setCart,
  onCheckout,
  currentUser,
}) => {
  const total = cart.reduce((acc, item) => acc + item.price, 0);
  const removeItem = (cartId) =>
    setCart(cart.filter((item) => item.cartId !== cartId));

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full md:max-w-md bg-white z-[150] shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            My Cart{' '}
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {cart.length}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingBag className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-medium">Your cart is feeling light.</p>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Start Shopping
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartId}
                className="flex gap-4 p-3 border border-slate-100 rounded-2xl bg-white shadow-sm hover:border-indigo-100 transition-colors group"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={item.image || item.coverImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1 pr-2">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.customization && (
                      <div className="mt-1 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                          "{item.customization.text}"
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-400">Qty: 1</span>
                    <span className="font-bold text-slate-900">
                      ₹{item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 pb-safe-area shrink-0 z-20">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900 font-bold">₹{total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="text-green-600 font-bold">Free</span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between text-lg font-black">
                <span className="text-slate-900">Total</span>
                <span className="text-indigo-600">₹{total}</span>
              </div>
            </div>
            <Button
              onClick={onCheckout}
              className="w-full shadow-indigo-500/20"
              size="lg"
              variant="primary"
            >
              {currentUser ? 'Checkout Now' : 'Login to Checkout'}{' '}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

// --- UPDATED PRODUCT DETAIL (Accepts Wishlist props) ---
const ProductDetail = ({ addToCart, openChat, currentUser, products, wishlist, toggleWishlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p._id === id);
  const [customText, setCustomText] = useState('');

  // Check if product is in wishlist
  const isInWishlist = wishlist && wishlist.some(item => item._id === product?._id);

  if (!product)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <RefreshCcw className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-slate-500 mt-4 font-medium">Loading details...</p>
      </div>
    );

  return (
    <div className="pt-28 pb-32 max-w-7xl mx-auto px-6 animate-in">
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold text-sm transition-colors w-fit"
      >
        <div className="p-2 rounded-full bg-white border border-slate-200 group-hover:border-slate-300 transition-colors shadow-sm">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="space-y-6">
          <LiveCustomizer
            product={product}
            customText={customText}
            setCustomText={setCustomText}
          />
          {product.customizationAvailable && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-4 -mt-4 z-0"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Palette className="w-4 h-4" />
                  </div>
                  Personalize It
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={20}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Type name or text here..."
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 tracking-widest">
                    {customText.length}/20
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3 ml-1">
                  The text will be printed exactly as shown in the preview.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col h-full lg:pt-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Badge color="indigo">{product.category}</Badge>
              {product.stock > 0 ? (
                <Badge color="green">In Stock</Badge>
              ) : (
                <Badge color="red">Sold Out</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center justify-between border-y border-slate-100 py-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Sold by
                  </p>
                  <p className="font-bold text-slate-900">
                    {product.shop?.name || 'Verified Seller'}
                  </p>
                </div>
              </div>
              <div className="text-4xl font-black text-slate-900">
                ₹{product.price}
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg mb-10">
              {product.description}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => openChat(product)}
                className="flex-1 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-6 py-4 rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95"
              >
                <MessageSquare className="w-5 h-5" /> Chat with Seller
              </button>
              
              {/* --- WISHLIST BUTTON --- */}
              <button 
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border transition-all active:scale-95 ${isInWishlist ? 'border-red-100 bg-red-50 text-red-500' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100'}`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          <div className="mt-auto sticky bottom-6 md:static z-20">
            <Button
              size="lg"
              onClick={() =>
                addToCart({
                  ...product,
                  customization: customText ? { text: customText } : null,
                })
              }
              className="w-full shadow-2xl shadow-indigo-600/30 text-lg py-5"
              disabled={product.stock <= 0}
              variant="primary"
            >
              <ShoppingBag className="w-6 h-6 mr-2" />{' '}
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED MOBILE NAVIGATION BAR ---
const MobileNav = ({ cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  if (
    [
      '/login',
      '/register',
      '/seller-register',
      '/seller-login',
      '/admin-login',
      '/founder',
      '/my-shop',
      '/',
    ].includes(location.pathname)
  )
    return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/shop' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' }, // Added Wishlist Here
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] md:hidden">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-full p-2 shadow-2xl flex justify-between items-center border border-white/10 px-6">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`relative p-3 rounded-full transition-all duration-300 ${isActive(item.path) ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <item.icon
              className={`w-6 h-6 ${isActive(item.path) ? 'fill-current' : ''}`}
              strokeWidth={2}
            />
            {isActive(item.path) && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- UTILS ---
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

// --- SECURITY ROUTES ---
const ProtectedRoute = ({
  user,
  allowedRoles,
  children,
  redirectPath = '/',
}) => {
  if (!user) return <Navigate to={redirectPath} replace />;
  const cookieRole = getCookie('role') || getCookie('token');
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'founder') return <Navigate to="/founder" replace />;
    if (user.role === 'seller') return <Navigate to="/my-shop" replace />;
    return <Navigate to="/shop" replace />;
  }
  return children ? children : <Outlet />;
};

const BuyerOnlyRoute = ({ children }) => {
  const cookieRole = getCookie('role');
  const savedUser = localStorage.getItem('userInfo');
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
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // --- WISHLIST STATE ---
  const [wishlist, setWishlist] = useState([]);
  
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatProduct, setActiveChatProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    socket = io(ENDPOINT, { withCredentials: true });
    if (currentUser) {
      fetchOrders();
      fetchWishlist(); // Fetch Wishlist
      socket.emit('setup', currentUser);
    } else {
      setWishlist([]); // Clear wishlist if logged out
    }
    fetchProducts();
    socket.on('product_updated', (updatedProduct) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p,
        ),
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/myorders`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  // --- NEW: FETCH WISHLIST ---
  const fetchWishlist = async () => {
    try {
        const res = await fetch(`${API_URL}/api/users/wishlist`, { credentials: 'include' });
        if(res.ok) {
            const data = await res.json();
            setWishlist(data);
        }
    } catch (error) {
        console.error("Wishlist error", error);
    }
  };

  // --- NEW: TOGGLE WISHLIST ---
  const toggleWishlist = async (product) => {
    if(!currentUser) {
        navigate('/login');
        return;
    }

    const isInWishlist = wishlist.some(item => item._id === product._id);
    
    // Optimistic Update
    if (isInWishlist) {
        setWishlist(prev => prev.filter(item => item._id !== product._id));
        addToast("Removed", "Removed from wishlist", "info");
        // API Call (Delete)
        try {
            await fetch(`${API_URL}/api/users/wishlist/${product._id}`, { method: 'DELETE', credentials: 'include' });
        } catch(e) { fetchWishlist(); } // Revert on error
    } else {
        setWishlist(prev => [...prev, product]);
        addToast("Saved", "Added to your wishlist");
        // API Call (Add)
        try {
            await fetch(`${API_URL}/api/users/wishlist`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id }),
                credentials: 'include' 
            });
        } catch(e) { fetchWishlist(); }
    }
  };

  // Helper for WishlistView specifically
  const removeFromWishlist = (id) => {
    const product = products.find(p => p._id === id) || { _id: id };
    toggleWishlist(product);
  }

  const addToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000,
    );
  };

  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: generateId() }]);
    addToast('Added to Cart', `${product.name} is now in your cart.`);
    setIsCartOpen(true);
  };

  const openCustomizationChat = (product) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setActiveChatProduct(product);
    setIsChatOpen(true);
  };

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    addToast('Access Granted', `Welcome back, ${userData.name}`);
    if (userData.role === 'founder') navigate('/founder', { replace: true });
    else if (userData.role === 'seller') navigate('/my-shop');
    else navigate('/shop');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
    setOrders([]);
    setWishlist([]); // Clear Wishlist
    socket.disconnect();
    socket = io(ENDPOINT, { withCredentials: true });
    navigate('/');
  };

  const handleCheckoutClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const confirmOrder = async (orderData) => {
    setOrderLoading(true);
    const { shippingAddress, paymentInfo } = orderData;

    const orderPayload = {
      orderItems: cart.map((item) => ({
        product: item._id,
        shop: item.shop._id || item.shop,
        name: item.name,
        image: item.image || item.coverImage,
        price: item.price,
        qty: 1,
        customization: item.customization,
      })),
      shippingAddress: shippingAddress,
      paymentInfo: paymentInfo,
      itemsPrice: cart.reduce((acc, i) => acc + i.price, 0),
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: cart.reduce((acc, i) => acc + i.price, 0),
    };

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Order failed');
      }

      const newOrder = await res.json();
      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setIsCheckoutOpen(false);
      addToast(
        'Order Placed!',
        'Thank you for your purchase. Please wait for verification.',
      );
      navigate('/profile');
    } catch (error) {
      console.error(error);
      addToast('Error', error.message, 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const showNavbar = ![
    '/',
    '/my-shop',
    '/founder',
    '/seller-register',
    '/seller-login',
    '/admin-login',
    '/login',
    '/register',
  ].includes(location.pathname);

  const handleLandingLoginClick = (type) => {
    if (type === 'seller') navigate('/seller-register');
    else navigate('/login');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans text-slate-900 selection:bg-indigo-200 pb-24 md:pb-0">
      <GlobalStyles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {showNavbar && (
        <nav
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-white/50`}
        >
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link
              to="/shop"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-hover:scale-105">
                <Box className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Craftify<span className="text-indigo-600">.</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-500">
              <Link
                to="/shop"
                className="hover:text-slate-900 transition-colors"
              >
                Marketplace
              </Link>
              <Link 
                to="/wishlist" 
                className="hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                Wishlist {wishlist.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{wishlist.length}</span>}
              </Link>
              <Link
                to={currentUser ? '/profile' : '/login'}
                className="hover:text-slate-900 transition-colors"
              >
                My Orders
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-full hover:bg-slate-100 relative text-slate-600 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <button
                onClick={() =>
                  currentUser ? navigate('/profile') : navigate('/login')
                }
                className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                {currentUser ? (
                  <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-md overflow-hidden">
                    {/* --- UPDATED LOGIC HERE: Checks for valid URL --- */}
                    {currentUser.avatar && currentUser.avatar.includes('http') ? (
                      <img
                        src={currentUser.avatar}
                        className="w-full h-full object-cover"
                        alt={currentUser.name}
                      />
                    ) : (
                      <span className="text-sm font-bold">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-2 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </nav>
      )}

      {showNavbar && (
        <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-6">
          <Link to="/shop" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md">
              <Box className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900">
              Craftify<span className="text-indigo-600">.</span>
            </span>
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 relative text-slate-900"
          >
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      )}

      <main className={`min-h-screen ${showNavbar ? 'pt-16 md:pt-0' : ''}`}>
        <Routes>
          <Route
            path="/"
            element={<LandingPage onLoginClick={handleLandingLoginClick} />}
          />
          <Route
            path="/login"
            element={<CustomerAuth onLoginSuccess={handleLogin} />}
          />
          <Route
            path="/register"
            element={<CustomerAuth onLoginSuccess={handleLogin} />}
          />

          <Route
            path="/seller-register"
            element={
              <SellerRegister
                onLoginSuccess={handleLogin}
                initialMode="register"
              />
            }
          />
          <Route
            path="/seller-login"
            element={
              <SellerRegister
                onLoginSuccess={handleLogin}
                initialMode="login"
              />
            }
          />
          <Route
            path="/admin-login"
            element={<FounderAccess currentUser={currentUser} />}
          />

          <Route
            path="/shop"
            element={
              <BuyerOnlyRoute>
                <ShopView
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  addToCart={addToCart}
                  products={products}
                  shops={[]}
                  isLoading={productsLoading}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              </BuyerOnlyRoute>
            }
          />
          
          {/* --- NEW WISHLIST ROUTE --- */}
          <Route 
            path="/wishlist" 
            element={
              <ProtectedRoute user={currentUser} redirectPath="/login">
                <WishlistView 
                  wishlist={wishlist} 
                  addToCart={addToCart} 
                  removeFromWishlist={removeFromWishlist} 
                />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/product/:id"
            element={
              <BuyerOnlyRoute>
                <ProductDetail
                  addToCart={addToCart}
                  openChat={openCustomizationChat}
                  currentUser={currentUser}
                  products={products}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                />
              </BuyerOnlyRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute user={currentUser} redirectPath="/login">
                <ProfileView
                  currentUser={currentUser}
                  orders={orders}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/founder"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['founder']}>
                <FounderAccess currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shop"
            element={
              <ProtectedRoute user={currentUser} allowedRoles={['seller']}>
                <StoreAdmin currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <MobileNav cartCount={cart.length} />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
        onCheckout={handleCheckoutClick}
        currentUser={currentUser}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartTotal={cart.reduce((acc, i) => acc + i.price, 0)}
        onConfirmOrder={confirmOrder}
        loading={orderLoading}
      />

      {activeChatProduct && (
        <CustomizationChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          product={activeChatProduct}
          currentUser={currentUser}
          socket={socket}
          API_URL={API_URL}
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