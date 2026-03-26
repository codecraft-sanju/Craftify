// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import NotFound from './NotFound';
import PrivacyPolicy from './PrivacyPolicy';
import DeleteAccount from './DeleteAccount';
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

// NAYA IMPORT: React Query
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ENDPOINT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
var socket;

// NAYA CODE: Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      refetchOnWindowFocus: false, 
    },
  },
});

import Navbar from './Navbar'; 
import LandingPage from './LandingPage';
import FounderAccess from './FounderAccess';
import StoreAdmin from './StoreAdmin';
import ShopView from './ShopView';
import SearchPage from './SearchPage';
import SellerRegister from './SellerRegister';
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
    brand: 'text-white shadow-xl shadow-[#65280E]/20', 
  };
  
  const buttonClass = variant === 'brand' 
    ? `relative overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl px-6 py-3 text-sm ${variants.brand} ${className}`
    : `relative overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-2 font-bold rounded-xl px-6 py-3 text-sm ${variants[variant]} ${className}`;

  return (
    <button 
      disabled={loading || props.disabled} 
      className={buttonClass} 
      style={variant === 'brand' ? { backgroundColor: '#65280E' } : {}}
      {...props}
    >
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
    brand: 'bg-[#65280E]/10 text-[#65280E] ring-1 ring-[#65280E]/20',
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[color]} ${className}`}>{children}</span>;
};

const CartDrawer = ({ isOpen, onClose, cart, onRemove, onUpdateQty, onCheckout, currentUser }) => {
  const itemsTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shippingTotal = cart.reduce((acc, item) => acc + ((item.shippingCost || 0) * item.qty), 0);
  const grandTotal = itemsTotal + shippingTotal;
  
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[140] transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      <div 
        className={`fixed z-[150] bg-white flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          bottom-0 left-0 right-0 h-[85vh] rounded-t-[32px]
          md:top-0 md:bottom-auto md:left-auto md:right-0 md:h-full md:w-[420px] md:rounded-none
          ${isOpen 
            ? 'translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }`}
      >
        <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
        
        <div className="px-6 py-4 md:py-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            My Cart <Badge color="brand" className="text-sm px-3 py-1">{itemCount}</Badge>
          </h2>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors group"
          >
            <X className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(101, 40, 14, 0.05)' }}>
                <ShoppingBag className="w-10 h-10" style={{ color: '#65280E' }} />
              </div>
              <p className="text-lg font-medium text-slate-500">Your cart is feeling empty</p>
              <Button variant="secondary" onClick={onClose} className="mt-2">Continue Shopping</Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                  <PremiumImage src={item.image} alt={item.name} />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight group-hover:text-[#65280E] transition-colors">{item.name}</h4>
                    <button onClick={() => onRemove(item._id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 bg-slate-50 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                  <div className="flex justify-between items-end mt-3">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                       <button onClick={() => onUpdateQty(item._id, 'dec')} className="p-1.5 bg-white shadow-sm rounded-lg hover:text-[#65280E] disabled:opacity-40 transition-all" disabled={item.qty <= 1}>
                         <Minus size={14} strokeWidth={3}/>
                       </button>
                       <span className="text-sm font-black w-4 text-center text-slate-700">{item.qty}</span>
                       <button onClick={() => onUpdateQty(item._id, 'inc')} className="p-1.5 bg-white shadow-sm rounded-lg hover:text-[#65280E] transition-all">
                         <Plus size={14} strokeWidth={3}/>
                       </button>
                    </div>
                    <div className="text-right">
                       <span className="font-black text-lg" style={{ color: '#65280E' }}>₹{item.price * item.qty}</span>
                       {item.shippingCost > 0 && <p className="text-[10px] text-slate-400 font-bold tracking-wide">+ ₹{item.shippingCost * item.qty} Ship</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 pb-10 md:p-6 md:pb-6 border-t border-slate-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 font-medium text-sm">Subtotal</span>
              <span className="font-bold text-slate-800">₹{itemsTotal}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium text-sm">Shipping Cost</span>
              <span className="font-bold text-slate-800">{shippingTotal === 0 ? <span className="text-emerald-500">Free</span> : `+ ₹${shippingTotal}`}</span>
            </div>
            <div className="flex justify-between items-center mb-6 pt-4 border-t border-slate-100">
              <span className="text-slate-800 font-bold">Estimated Total</span>
              <span className="text-2xl font-black text-slate-900">₹{grandTotal}</span>
            </div>
            <Button onClick={onCheckout} className="w-full py-4 text-base" variant="brand">
              {currentUser ? 'Proceed to Checkout' : 'Login to Checkout'} 
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

const AuthRedirect = ({ user, children }) => {
  if (user) {
    if (user.role === 'founder') return <Navigate to="/founder" replace />;
    if (user.role === 'seller') return <Navigate to="/my-shop" replace />;
    return <Navigate to="/shop" replace />;
  }
  return children;
};

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CraftifyContent = () => {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('userInfo')) || null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // NAYA CODE: Debounce state for search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const [toasts, setToasts] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPincode, setCheckoutPincode] = useState(null); 
  const [orderLoading, setOrderLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // NAYA CODE: Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // NAYA CODE: React Query Hook for fetching products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', activeCategory, debouncedSearch],
    queryFn: async () => {
      let url = new URL(`${API_URL}/api/products`);
      if (activeCategory !== 'All') url.searchParams.append('category', activeCategory);
      if (debouncedSearch) url.searchParams.append('keyword', debouncedSearch);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products || [];
    }
  });

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
    if (!currentUser) { navigate('/register'); return; }
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
    return () => socket.disconnect();
  }, [currentUser]);

  const fetchWishlist = async () => {
    const res = await fetch(`${API_URL}/api/users/wishlist`, { credentials: 'include' });
    if (res.ok) setWishlist(await res.json());
  };

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/api/orders/myorders`, { credentials: 'include' });
    if (res.ok) setOrders(await res.json());
  };

  const toggleWishlist = async (product) => {
    if (!currentUser) { navigate('/register'); return; }
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

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    navigate(userData.role === 'founder' ? '/founder' : userData.role === 'seller' ? '/my-shop' : '/shop');
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/users/logout`, { method: 'POST', credentials: 'include' });
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
    setCart([]);
    navigate('/');
  };

  // --- DISCOUNT CALCULATION LOGIC ---
  const currentGrandTotal = cart.reduce((acc, i) => {
      let itemShipping = i.shippingCost || 0;
      const sellerPincode = i.shop?.address?.zipCode || i.shop?.address?.postalCode || i.shop?.address?.pincode;
      
      if (checkoutPincode && sellerPincode && sellerPincode.toString() === checkoutPincode.toString()) {
          itemShipping = itemShipping / 2;
      }
      return acc + (i.price * i.qty) + (itemShipping * i.qty);
  }, 0);

  const isDiscountApplied = cart.some(i => {
      let itemShipping = i.shippingCost || 0;
      const sellerPincode = i.shop?.address?.zipCode || i.shop?.address?.postalCode || i.shop?.address?.pincode;
      return checkoutPincode && sellerPincode && sellerPincode.toString() === checkoutPincode.toString() && itemShipping > 0;
  });

  const confirmOrder = async (orderData) => {
    setOrderLoading(true);

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      addToast('Error', 'Razorpay SDK failed to load. Are you online?', 'error');
      setOrderLoading(false);
      return;
    }

    const itemsTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const shippingTotal = cart.reduce((acc, i) => {
        let itemShipping = i.shippingCost || 0;
        const sellerPincode = i.shop?.address?.zipCode || i.shop?.address?.postalCode || i.shop?.address?.pincode;
        
        if (checkoutPincode && sellerPincode && sellerPincode.toString() === checkoutPincode.toString()) {
            itemShipping = itemShipping / 2;
        }
        return acc + (itemShipping * i.qty);
    }, 0);
    const totalAmount = itemsTotal + shippingTotal;
    
    try {
      const orderResponse = await fetch(`${API_URL}/api/razorpay/create-order`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount }) 
      });
      
      const orderDataResponse = await orderResponse.json();

      if (!orderDataResponse.success) {
         addToast('Error', 'Could not initiate payment', 'error');
         setOrderLoading(false);
         return;
      }

      const order = orderDataResponse.order;

      const options = {
      "key": import.meta.env.VITE_RAZORPAY_KEY_ID,
        "amount": order.amount,
        "currency": order.currency,
        "name": "Giftomize",
        "description": "Purchase from Giftomize",
        "order_id": order.id,
        "handler": async function (paymentResponse){
           try {
             const verifyRes = await fetch(`${API_URL}/api/razorpay/verify-payment`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 razorpay_order_id: paymentResponse.razorpay_order_id,
                 razorpay_payment_id: paymentResponse.razorpay_payment_id,
                 razorpay_signature: paymentResponse.razorpay_signature
               })
             });
             
             const verifyData = await verifyRes.json();
             
             if(verifyData.success) {
                 const orderPayload = {
                    orderItems: cart.map(i => {
                        let itemShipping = i.shippingCost || 0;
                        const sellerPincode = i.shop?.address?.zipCode || i.shop?.address?.postalCode || i.shop?.address?.pincode;
                        
                        if (checkoutPincode && sellerPincode && sellerPincode.toString() === checkoutPincode.toString()) {
                            itemShipping = itemShipping / 2;
                        }

                        return {
                            product: i.product, 
                            shop: i.shop, 
                            name: i.name, 
                            image: i.image, 
                            price: i.price, 
                            qty: i.qty, 
                            shippingCost: itemShipping, 
                            selectedSize: i.selectedSize,
                            selectedColor: i.selectedColor 
                        }
                    }),
                    shippingAddress: orderData.shippingAddress,
                    paymentInfo: {
                      method: 'Online',
                      id: paymentResponse.razorpay_payment_id,
                      status: 'paid'
                    },
                    itemsPrice: itemsTotal,
                    taxPrice: 0,
                    shippingPrice: shippingTotal,
                    totalPrice: totalAmount,
                    // --- NAYA FLAG PASS KAR RAHE HAIN BACKEND KO ---
                    hasLocalDeliveryDiscount: isDiscountApplied
                 };

                 const res = await fetch(`${API_URL}/api/orders`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify(orderPayload), 
                    credentials: 'include' 
                 });

                 if (res.ok) {
                    setCart([]);
                    setIsCheckoutOpen(false);
                    setCheckoutPincode(null); 
                    addToast('Success', 'Payment Successful & Order Placed!');
                    await fetchOrders(); 
                    navigate('/profile');
                 } else {
                     addToast('Error', 'Order saving failed after payment', 'error');
                 }
             } else {
                 addToast('Error', 'Payment verification failed', 'error');
             }

           } catch (e) {
             console.error(e);
             addToast('Error', 'Something went wrong while verifying order', 'error');
           } finally {
             setOrderLoading(false);
           }
        },
        "prefill": {
          "name": currentUser?.name || orderData.shippingAddress?.fullName || "",
          "email": currentUser?.email || "",
          "contact": orderData.shippingAddress?.phone || ""
        },
        "theme": {
          "color": "#65280E" 
        }
      };

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response){
        addToast('Error', 'Payment Failed. ' + response.error.description, 'error');
        setOrderLoading(false);
      });

      rzp1.open();

    } catch (error) { 
      console.error(error);
      addToast('Error', 'Failed to connect to payment gateway', 'error'); 
      setOrderLoading(false);
    }
  };

  const showNavbar = !['/', '/login', '/register', '/seller-register', '/seller-login', '/admin-login', '/my-shop', '/founder'].includes(location.pathname);

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
    <div className="min-h-screen bg-[#FEFAEF]">
      <GlobalStyles />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {showNavbar && (
        <Navbar cart={cart} wishlist={wishlist} currentUser={currentUser} setIsCartOpen={setIsCartOpen} />
      )}
      
      <main className={showNavbar ? 'pt-16 md:pt-0' : ''}>
        <Routes>
        <Route path="/" element={<AuthRedirect user={currentUser}><Navigate to="/shop" replace /></AuthRedirect>} />
          <Route path="/login" element={<AuthRedirect user={currentUser}><CustomerAuth onLoginSuccess={handleLogin} /></AuthRedirect>} />
          <Route path="/register" element={<AuthRedirect user={currentUser}><CustomerAuth onLoginSuccess={handleLogin} /></AuthRedirect>} />
          <Route path="/seller-register" element={<AuthRedirect user={currentUser}><SellerRegister onLoginSuccess={handleLogin} initialMode="register" /></AuthRedirect>} />
          <Route path="/seller-login" element={<AuthRedirect user={currentUser}><SellerRegister onLoginSuccess={handleLogin} initialMode="login" /></AuthRedirect>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/delete-account" element={<DeleteAccount />} />

          <Route path="/shop" element={
            <BuyerOnlyRoute>
              <ShopView addToCart={addToCart} products={products} isLoading={productsLoading} wishlist={wishlist} toggleWishlist={toggleWishlist} searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            </BuyerOnlyRoute>
          } />
          
          <Route path="/search" element={<SearchPage products={products} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} currentUser={currentUser} products={products} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/wishlist" element={<ProtectedRoute user={currentUser}><WishlistView wishlist={wishlist} addToCart={addToCart} removeFromWishlist={(id) => toggleWishlist({_id: id})} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={currentUser}><ProfileView currentUser={currentUser} orders={orders} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/founder" element={<ProtectedRoute user={currentUser} allowedRoles={['founder']}><FounderAccess currentUser={currentUser} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="/my-shop" element={<ProtectedRoute user={currentUser} allowedRoles={['seller']}><StoreAdmin currentUser={currentUser} /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} onRemove={removeFromCart} onUpdateQty={updateQuantity} onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} currentUser={currentUser} />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => { setIsCheckoutOpen(false); setCheckoutPincode(null); }} 
        cartTotal={currentGrandTotal} 
        onConfirmOrder={confirmOrder} 
        loading={orderLoading} 
        onPincodeChange={setCheckoutPincode}
        hasDiscount={isDiscountApplied} 
        currentUser={currentUser}
      />
    </div>
  );
};


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CraftifyContent />
      </Router>
    </QueryClientProvider>
  );
}