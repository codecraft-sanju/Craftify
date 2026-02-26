// src/App.jsx
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
  Outlet,
} from 'react-router-dom';
import NotFound from './NotFound';
import {
  ShoppingBag,
  X,
  ArrowRight,
  Trash2,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Plus,
  Minus
} from 'lucide-react';
import io from 'socket.io-client';

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
var socket;

// --- IMPORTS ---
import Navbar from './Navbar'; 
import LandingPage from './LandingPage';
import FounderAccess from './FounderAccess';
import StoreAdmin from './StoreAdmin';
import ShopView from './ShopView';
import SearchPage from './SearchPage';
import SellerRegister from './SellerRegister'; // Ensure this is imported
import CustomizationChat from './CustomizationChat';
import CustomerAuth from './CustomerAuth';
import CheckoutModal from './CheckoutModal';
import ProfileView from './ProfileView'; 
import WishlistView from './WishlistView'; 
import ProductDetail from './ProductDetail';

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; background-color: #F8FAFC; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
    .animate-in { animation: fadeIn 0.3s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .pb-safe-area { padding-bottom: env(safe-area-inset-bottom, 20px); }
  `}</style>
);

// --- PREMIUM UI COMPONENTS ---

export const PremiumImage = ({ src, alt, className = "", objectFit = "cover" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 animate-pulse">
           <ImageIcon className="w-6 h-6 text-slate-300 opacity-50" />
        </div>
      )}
      <img
        src={src} alt={alt} loading="lazy" onLoad={() => setIsLoaded(true)}
        className={`w-full h-full transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`} 
        style={{ objectFit }}
      />
    </div>
  );
};

export const Button = ({ children, variant = 'primary', className = '', icon: Icon, loading, ...props }) => {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 border border-transparent',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
    danger: 'bg-white text-red-600 border border-red-100 hover:bg-red-50',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20',
  };
  return (
    <button disabled={loading || props.disabled} className={`relative overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl px-6 py-3 text-sm ${variants[variant]} ${className}`} {...props}>
      {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export const Badge = ({ children, color = 'slate', className = '' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-700/10',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    red: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
    slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/10',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20', 
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[color]} ${className}`}>{children}</span>;
};

// --- CART DRAWER ---
const CartDrawer = ({ isOpen, onClose, cart, onRemove, onUpdateQty, onCheckout, currentUser }) => {
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full md:max-w-md bg-white z-[150] shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">My Cart <Badge color="slate">{itemCount}</Badge></h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <ShoppingBag className="w-12 h-12 opacity-10 mb-4" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-4 p-3 border rounded-2xl bg-white shadow-sm">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <PremiumImage src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                    <button onClick={() => onRemove(item._id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border">
                       <button onClick={() => onUpdateQty(item._id, 'dec')} className="p-1 hover:text-indigo-600 disabled:opacity-30" disabled={item.qty <= 1}><Minus size={14}/></button>
                       <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                       <button onClick={() => onUpdateQty(item._id, 'inc')} className="p-1 hover:text-indigo-600"><Plus size={14}/></button>
                    </div>
                    <span className="font-bold">₹{item.price * item.qty}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t bg-slate-50 pb-safe-area">
            <div className="flex justify-between text-lg font-black mb-6"><span>Total</span><span className="text-indigo-600">₹{total}</span></div>
            <Button onClick={onCheckout} className="w-full" size="lg">{currentUser ? 'Checkout Now' : 'Login to Checkout'} <ArrowRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>
    </>
  );
};

// --- SECURITY ROUTES ---
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/shop" replace />;
  return children ? children : <Outlet />;
};

const BuyerOnlyRoute = ({ children }) => {
  const savedUser = localStorage.getItem('userInfo');
  const user = savedUser ? JSON.parse(savedUser) : null;
  if (user?.role === 'seller') return <Navigate to="/my-shop" replace />;
  return children;
};

// --- MAIN CONTENT ---
const CraftifyContent = () => {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatProduct, setActiveChatProduct] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const fetchCart = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/api/cart`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (e) { console.error(e); }
  };

  const addToCart = async (product, options = {}) => {
    if (!currentUser) { navigate('/login'); return; }
    try {
      const res = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, qty: 1, ...options }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items);
        addToast('Success', 'Added to cart');
        setIsCartOpen(true);
      }
    } catch (e) { addToast('Error', 'Failed to add', 'error'); }
  };

  const updateQuantity = async (itemId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items);
      }
    } catch (e) { console.error(e); }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await fetch(`${API_URL}/api/cart/${itemId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCart(data.items);
        addToast('Removed', 'Item removed', 'info');
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    socket = io(ENDPOINT, { withCredentials: true });
    if (currentUser) {
      fetchCart();
      fetchWishlist();
      fetchOrders();
      socket.emit('setup', currentUser);
    }
    fetchProducts();
    return () => socket.disconnect();
  }, [currentUser]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_URL}/api/products`);
      setProducts(await res.json());
    } finally { setProductsLoading(false); }
  };

  const fetchWishlist = async () => {
    const res = await fetch(`${API_URL}/api/users/wishlist`, { credentials: 'include' });
    if (res.ok) setWishlist(await res.json());
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/api/orders/myorders`, { credentials: 'include' });
    if (res.ok) setOrders(await res.json());
  };

  const toggleWishlist = async (product) => {
    if (!currentUser) { navigate('/login'); return; }
    const isIn = wishlist.some(item => item._id === product._id);
    const method = isIn ? 'DELETE' : 'POST';
    const url = isIn ? `${API_URL}/api/users/wishlist/${product._id}` : `${API_URL}/api/users/wishlist`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: isIn ? null : JSON.stringify({ productId: product._id }),
      credentials: 'include'
    });
    if (res.ok) setWishlist(await res.json());
  };

  const addToast = (title, message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Handle Login (Redirects based on Role)
  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    // Redirect logic: Founder -> Founder, Seller -> My Shop, Buyer -> Shop
    navigate(userData.role === 'founder' ? '/founder' : userData.role === 'seller' ? '/my-shop' : '/shop');
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
    setCart([]);
    navigate('/');
  };

  const confirmOrder = async (orderData) => {
    setOrderLoading(true);
    const orderPayload = {
      orderItems: cart.map(i => ({ product: i.product, shop: i.shop, name: i.name, image: i.image, price: i.price, qty: i.qty, selectedSize: i.selectedSize })),
      shippingAddress: orderData.shippingAddress,
      paymentInfo: orderData.paymentInfo,
      totalPrice: cart.reduce((acc, i) => acc + (i.price * i.qty), 0),
    };
    try {
      const res = await fetch(`${API_URL}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderPayload), credentials: 'include' });
      if (res.ok) {
        setCart([]);
        setIsCheckoutOpen(false);
        addToast('Success', 'Order Placed!');
        navigate('/profile');
      }
    } catch (e) { addToast('Error', 'Failed to place order', 'error'); }
    finally { setOrderLoading(false); }
  };

  // Logic to hide Navbar on specific auth routes
  const showNavbar = !['/', '/login', '/register', '/seller-register', '/seller-login', '/admin-login'].includes(location.pathname);

  // Toast Component Definition
  const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-4 right-4 md:top-24 z-[130] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-4 flex items-start gap-3 w-80 animate-in">
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <div className="flex-1">
            <h4 className="font-bold text-sm text-slate-900">{toast.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      <GlobalStyles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Conditionally Render Navbar */}
      {showNavbar && (
        <Navbar cart={cart} wishlist={wishlist} currentUser={currentUser} setIsCartOpen={setIsCartOpen} />
      )}
      
      <main className={showNavbar ? 'pt-16 md:pt-0' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onLoginClick={(t) => navigate(t === 'seller' ? '/seller-register' : '/login')} />} />
          <Route path="/login" element={<CustomerAuth onLoginSuccess={handleLogin} />} />
          <Route path="/register" element={<CustomerAuth onLoginSuccess={handleLogin} />} />

          {/* --- SELLER REGISTRATION & LOGIN ROUTES (ADDED) --- */}
          <Route 
            path="/seller-register" 
            element={
              currentUser ? <Navigate to="/my-shop" /> : <SellerRegister onLoginSuccess={handleLogin} initialMode="register" />
            } 
          />
          <Route 
            path="/seller-login" 
            element={
              currentUser ? <Navigate to="/my-shop" /> : <SellerRegister onLoginSuccess={handleLogin} initialMode="login" />
            } 
          />

          {/* Buyer Routes */}
          <Route path="/shop" element={<BuyerOnlyRoute><ShopView addToCart={addToCart} products={products} isLoading={productsLoading} wishlist={wishlist} toggleWishlist={toggleWishlist} searchQuery="" setSearchQuery={()=>{}} activeCategory="All" setActiveCategory={()=>{}} /></BuyerOnlyRoute>} />
          <Route path="/search" element={<SearchPage products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} currentUser={currentUser} products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} openChat={(p)=>{setActiveChatProduct(p); setIsChatOpen(true);}} />} />
          
          {/* Protected Routes */}
          <Route path="/wishlist" element={<ProtectedRoute user={currentUser}><WishlistView wishlist={wishlist} addToCart={addToCart} removeFromWishlist={(id) => toggleWishlist({_id: id})} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={currentUser}><ProfileView currentUser={currentUser} orders={orders} onLogout={handleLogout} /></ProtectedRoute>} />
          
          {/* Role Specific Routes */}
          <Route path="/founder" element={<ProtectedRoute user={currentUser} allowedRoles={['founder']}><FounderAccess currentUser={currentUser} /></ProtectedRoute>} />
          <Route path="/my-shop" element={<ProtectedRoute user={currentUser} allowedRoles={['seller']}><StoreAdmin currentUser={currentUser} /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Overlays */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={removeFromCart} onUpdateQty={updateQuantity} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} currentUser={currentUser} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} cartTotal={cart.reduce((acc, i) => acc + (i.price * i.qty), 0)} onConfirmOrder={confirmOrder} loading={orderLoading} />
      {activeChatProduct && <CustomizationChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} product={activeChatProduct} currentUser={currentUser} socket={socket} API_URL={API_URL} />}
    </div>
  );
};

export default function App() {
  return <Router><CraftifyContent /></Router>;
}