// src/StoreAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
    LayoutDashboard, ShoppingBag, Package, Plus, X, 
    DollarSign, Star, Settings, RefreshCcw, Store,
    LogOut, ChevronRight, Search, Bell, TrendingUp, UploadCloud, 
    MapPin, Phone, Truck, CheckCircle, QrCode, ArrowLeft, Loader2,
    ChevronDown, Filter, Calendar, Sparkles, ExternalLink, ShieldAlert
} from 'lucide-react';
import io from 'socket.io-client';

import OrderDetailsModal from './OrderDetailsModal';
import ProductModal from './ProductModal';

const API_URL = import.meta.env.VITE_API_URL;
const ENDPOINT = import.meta.env.VITE_API_URL;
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

var socket;

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', loading, ...props }) => {
    const baseStyle = "relative flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed rounded-xl tracking-wide";
    
    const variants = {
        primary: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20 border border-white/10 hover:shadow-rose-500/40 hover:border-white/20",
        secondary: "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white shadow-sm",
        danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-sm",
        ghost: "text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent",
        success: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-3 text-sm",
        lg: "px-6 py-4 text-base"
    };

    return (
        <button disabled={loading || props.disabled} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
            {children}
        </button>
    );
};

export const Card = ({ children, className = "" }) => (
    <div className={`bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-xl ${className}`}>
        {children}
    </div>
);

export const Badge = ({ children, color = 'slate' }) => {
    const colors = { 
        green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 
        blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20', 
        slate: 'bg-slate-700/50 text-slate-300 border-slate-600', 
        red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
    return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${colors[color]}`}>{children}</span>;
};

export const CssBarChart = ({ data }) => (
    <div className="flex items-end justify-between h-40 gap-2 mt-6 px-2">
        {data.map((h, i) => (
            <div key={i} className="w-full bg-slate-800/30 rounded-t-lg relative group overflow-hidden h-full flex items-end">
                <div 
                    className="w-full bg-gradient-to-t from-rose-600 to-pink-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out group-hover:shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                    style={{ height: `${h}%`, animation: `growUp 1s ease-out ${i * 0.1}s backwards` }}
                ></div>
            </div>
        ))}
        <style>{`@keyframes growUp { from { height: 0; } }`}</style>
    </div>
);

export default function StoreAdmin({ currentUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Data States
    const [shop, setShop] = useState(null); 
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    
    // Loading States
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    // Search & Filter States
    const [productSearch, setProductSearch] = useState("");
    const [orderFilter, setOrderFilter] = useState("All");

    // Product Editing & Image Upload States
    const [editingProduct, setEditingProduct] = useState(null);
    const [images, setImages] = useState([]); 
    const [uploading, setUploading] = useState(false);

    // Category States
    const [categoryInput, setCategoryInput] = useState("");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    // Seller QR Upload State
    const [sellerQrFile, setSellerQrFile] = useState(null);
    const [sellerQrPreview, setSellerQrPreview] = useState("");
    
    useEffect(() => {
        socket = io(ENDPOINT, { withCredentials: true });
        if(currentUser) {
            socket.emit("setup", currentUser);

            const registerPushNotification = async () => {
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    try {
                        const register = await navigator.serviceWorker.register('/sw.js');
                        
                        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                        if (!publicVapidKey) {
                            console.warn("VITE_VAPID_PUBLIC_KEY is not set in frontend .env");
                            return;
                        }

                        let subscription = await register.pushManager.getSubscription();
                        
                        if (!subscription) {
                            subscription = await register.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                            });
                        }

                        await fetch(`${API_URL}/api/users/subscribe`, {
                            method: 'POST',
                            body: JSON.stringify(subscription),
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });
                    } catch (error) {
                        console.error("Push Notification Subscription Error:", error);
                    }
                }
            };
            registerPushNotification();
        }
        fetchStoreData();
        
        socket.on("new_order_placed", () => fetchStoreData());
        socket.on("order_verified", () => fetchStoreData());

        return () => { socket.disconnect(); }
    }, [currentUser]); 

    const fetchStoreData = async () => {
        if(!currentUser) return;
        try {
            setLoading(true);
            const shopRes = await fetch(`${API_URL}/api/shops/my-shop`, { credentials: 'include' });
            if (shopRes.status === 401 || shopRes.status === 403) { handleLogout(); return; }

            if (shopRes.ok) {
                const shopData = await shopRes.json();
                setShop(shopData); 
                if(shopData && shopData.paymentQrCode) {
                    setSellerQrPreview(shopData.paymentQrCode); 
                }
                if(shopData && shopData._id) {
                    const [prodRes, ordRes] = await Promise.all([
                        fetch(`${API_URL}/api/products/shop/${shopData._id}`),
                        fetch(`${API_URL}/api/orders/shop-orders`, { credentials: 'include' })
                    ]);
                    if(prodRes.ok) setProducts(await prodRes.json());
                    if(ordRes.ok) setOrders(await ordRes.json());
                }
            } else { setShop(null); }
        } catch (error) { console.error("Store Data Error:", error); } 
        finally { setLoading(false); }
    };

    const handleCreateShop = async (e) => {
        e.preventDefault(); setIsSubmitting(true);
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`${API_URL}/api/shops`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ name: formData.get('name'), description: formData.get('description'), phone: formData.get('phone') })
            });
            const data = await res.json();
            if (res.ok) { setShop(data); fetchStoreData(); } else { alert(data.message || "Failed"); }
        } catch (error) { console.error(error); alert("Network Error"); } finally { setIsSubmitting(false); }
    };

    const handleUpdateStore = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        
        let paymentQrCode = shop.paymentQrCode; 

        if (sellerQrFile) {
            const data = new FormData();
            data.append("file", sellerQrFile);
            data.append("upload_preset", UPLOAD_PRESET);
            data.append("cloud_name", CLOUD_NAME);

            try {
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: data });
                const fileData = await uploadRes.json();
                if (uploadRes.ok) { paymentQrCode = fileData.secure_url; } 
                else { 
                    alert("QR Upload Failed!"); setIsSubmitting(false); return; 
                }
            } catch (err) { setIsSubmitting(false); return; }
        }

        try {
            const res = await fetch(`${API_URL}/api/shops/my-shop`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ 
                    name: formData.get('storeName'), 
                    description: formData.get('description'), 
                    phone: formData.get('phone'), 
                    tagline: formData.get('tagline'),
                    paymentQrCode: paymentQrCode 
                })
            });
            if(res.ok) { 
                const updatedShop = await res.json();
                setShop(updatedShop); 
                alert("Store Updated Successfully!"); 
                setSellerQrFile(null);
            }
        } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 4) {
            alert("Maximum 4 images allowed.");
            return;
        }

        setUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', UPLOAD_PRESET);
                formData.append('cloud_name', CLOUD_NAME);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST', body: formData
                });
                const data = await res.json();
                
                if (res.ok) {
                    setImages(prev => [...prev, { url: data.secure_url, public_id: data.public_id }]);
                } else {
                    alert('Upload failed for one or more images');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(images.filter((_, index) => index !== indexToRemove));
    };

    const handleSellerQrChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSellerQrFile(file);
            setSellerQrPreview(URL.createObjectURL(file));
        }
    };

    const handleOpenModal = (product = null) => { 
        setEditingProduct(product); 
        
        if (product && product.images && product.images.length > 0) {
            setImages(product.images);
        } else if (product && (product.image || product.coverImage)) {
            setImages([{ url: product.image || product.coverImage }]);
        } else {
            setImages([]);
        }

        setCategoryInput(product ? product.category : "");
        setShowCategoryDropdown(false);
        setIsAddModalOpen(true); 
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault(); 
        
        if (images.length === 0) {
            alert("Please upload at least 1 image!");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData(e.target);
        
        const sizesString = formData.get('sizes');
        let sizesArray = [];
        if (sizesString && sizesString.trim() !== '') {
            sizesArray = sizesString.split(',').map(s => s.trim()).filter(s => s !== '');
        }

        const productData = {
            shop: shop?._id, 
            name: formData.get('name'), 
            category: categoryInput, 
            price: Number(formData.get('price')), 
            compareAtPrice: Number(formData.get('compareAtPrice')),
            stock: Number(formData.get('stock')),
            description: formData.get('description'), 
            images: images, 
            coverImage: images[0].url, 
            sizes: sizesArray
        };

        try {
            const url = editingProduct ? `${API_URL}/api/products/${editingProduct._id}` : `${API_URL}/api/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(productData) });
            const data = await res.json();
            if(res.ok) {
                if (editingProduct) setProducts(prev => prev.map(p => p._id === data._id ? data : p));
                else setProducts([data, ...products]);
                setIsAddModalOpen(false);
                fetchStoreData();
            } else { alert(data.message || "Failed"); }
        } catch (error) { alert("Network error."); } finally { setIsSubmitting(false); }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            const res = await fetch(`${API_URL}/api/products/${productId}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) setProducts(prev => prev.filter(p => p._id !== productId));
        } catch (error) { console.error(error); }
    };

    const handleUpdateOrderStatus = async (orderId, status, reason = "") => {
        try {
            const bodyData = { status };
            if (status === 'Cancelled') {
                bodyData.cancellationReason = reason;
            }

            const res = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(bodyData)
            });

            if(res.ok) {
                const updatedFields = { orderStatus: status, cancellationReason: reason };
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...updatedFields } : o));
                if(selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, ...updatedFields }));
                }
                return true;
            }
            return false;
        } catch (error) { 
            console.error("Update Status Error", error);
            return false;
        }
    };

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("userInfo");
            window.location.href = '/seller-login';
        }
    };

    const getAvailableCategories = () => {
        const defaults = ["Jewellery","Electronics", "Fashion", "Home", "Art & Decor", "Handmade Goods", "Beauty", "Toys", "Sports"];
        const shopCategories = shop?.categories || [];
        const productCategories = products.map(p => p.category);
        return [...new Set([...defaults, ...shopCategories, ...productCategories])].sort();
    };

    const filteredOrders = useMemo(() => {
        if (orderFilter === 'All') return orders;
        return orders.filter(o => o.orderStatus === orderFilter);
    }, [orders, orderFilter]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }, [products, productSearch]);

    const chartData = useMemo(() => {
        if (!orders || orders.length === 0) {
            return { values: [0, 0, 0, 0, 0, 0, 0], labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
        }

        const days = 7;
        const sales = Array(days).fill(0);
        const labels = Array(days).fill('');
        
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - (days - 1 - i));
            labels[i] = d.toLocaleDateString('en-US', { weekday: 'short' }); 
        }

        orders.forEach(order => {
            if (order.orderStatus === 'Cancelled') return;
            
            const orderDate = new Date(order.createdAt);
            const diffTime = today - orderDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays < days) {
                const index = days - 1 - diffDays;
                sales[index] += order.totalAmount || 0;
            }
        });

        const maxVal = Math.max(...sales);
        const scaledValues = sales.map(val => maxVal > 0 ? Math.round((val / maxVal) * 100) : 0);
        const finalValues = scaledValues.map((v, i) => (sales[i] > 0 && v < 5) ? 5 : v);

        return { values: finalValues, labels };
    }, [orders]);


    const SidebarItem = ({ id, icon: Icon, label, badge }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`group relative w-full flex items-center gap-4 px-6 py-4 rounded-2xl mb-2 transition-all duration-300 overflow-hidden 
            ${activeTab === id 
                ? 'bg-gradient-to-r from-rose-600/90 to-pink-600/90 text-white shadow-[0_8px_30px_rgb(225,29,72,0.3)] ring-1 ring-white/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
        >
             {activeTab === id && (
                <div className="absolute inset-0 bg-gradient-to-r from-rose-400/20 to-pink-400/20 blur-xl opacity-50"></div>
             )}

            <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === id ? 'text-white drop-shadow-md' : 'text-slate-500 group-hover:text-white'}`} /> 
            <span className="font-bold text-sm tracking-wide flex-1 text-left relative z-10">{label}</span> 
            {badge && <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/50 animate-pulse relative z-10">{badge}</span>}
        </button>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="flex flex-col items-center gap-4"><Loader2 className="w-12 h-12 text-rose-500 animate-spin" /><p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Loading Store...</p></div></div>;

    if (!shop) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
            <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-black w-full max-w-lg text-center border border-white/10">
                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-inner">
                    <Store className="w-10 h-10 text-rose-500"/>
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Setup Your Store</h2>
                <p className="text-slate-400 mb-10 leading-relaxed">Your journey to success starts here. Tell us about your business.</p>
                <form onSubmit={handleCreateShop} className="space-y-6 text-left">
                    <div className="space-y-1"><label className="text-xs font-extrabold text-slate-500 uppercase ml-1">Store Name</label><input name="name" required className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold transition-all placeholder:text-slate-600" placeholder="e.g. Urban Trends" /></div>
                    <div className="space-y-1"><label className="text-xs font-extrabold text-slate-500 uppercase ml-1">Phone Number</label><input name="phone" required className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold transition-all placeholder:text-slate-600" placeholder="+91 98765 43210" /></div>
                    <div className="space-y-1"><label className="text-xs font-extrabold text-slate-500 uppercase ml-1">Description</label><textarea name="description" required rows="3" className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-bold transition-all placeholder:text-slate-600" placeholder="We sell premium quality..."></textarea></div>
                    <Button type="submit" size="lg" className="w-full shadow-xl shadow-rose-900/20 mt-4" loading={isSubmitting}>Launch Store</Button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-rose-500/30 selection:text-rose-200 overflow-hidden flex relative">
            
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 hidden md:flex flex-col shadow-2xl`}
            >
                <div className="h-28 flex items-center px-8 gap-4 border-b border-white/5 bg-gradient-to-b from-slate-800/20 to-transparent">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-rose-500/20 text-white ring-1 ring-white/20">S</div>
                    <div><h1 className="font-black text-2xl tracking-tight text-white drop-shadow-sm">Admin</h1><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-80">Midnight OS</p></div>
                </div>
                
                <nav className="flex-1 space-y-2 p-6 overflow-y-auto custom-scrollbar relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-rose-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                    <p className="text-xs font-extrabold text-slate-500 uppercase px-4 mb-3 mt-2 tracking-widest relative z-10">Menu</p>
                    <SidebarItem id="dashboard" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem id="products" icon={ShoppingBag} label="Products" />
                    <SidebarItem id="orders" icon={Package} label="Orders" />
                    
                    <p className="text-xs font-extrabold text-slate-500 uppercase px-4 mb-3 mt-8 tracking-widest relative z-10">System</p>
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </nav>
                
                <div className="p-6 border-t border-white/5 bg-slate-900/50">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 mb-4 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold ring-2 ring-slate-700 group-hover:ring-rose-500 transition-all text-white">{currentUser?.name?.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate font-medium">{shop?.name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-wider">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden relative bg-slate-950 transition-all duration-500 pb-20 md:pb-0">
                
                <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                        <div className="flex items-center gap-4">
                            <div className="md:hidden w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center font-black text-xl text-white">S</div>
                            <h2 className="text-xl md:text-2xl font-black capitalize text-white tracking-tight flex items-center gap-2">{activeTab} {activeTab === 'dashboard' && <Sparkles className="w-4 h-4 text-rose-500"/>}</h2>
                        </div>
                        
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${shop?.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                <span className={`w-2 h-2 rounded-full ${shop?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {shop?.isActive ? 'Online' : 'Offline'}
                            </div>
                            <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-full relative active:scale-95 transition-all shadow-sm text-slate-400 hover:text-rose-400 hover:border-rose-500/30">
                                <Bell className="w-5 h-5" />
                                {orders.some(o => o.orderStatus === 'Processing') && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
                            </button>
                            <button onClick={handleLogout} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full relative active:scale-95 transition-all shadow-sm text-slate-400 hover:text-red-400 hover:border-red-500/30" title="Logout">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full"> 
                        
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                    {[
                                        { l: 'Revenue', v: `₹${orders.reduce((a,o)=>a+(o.totalAmount||0),0).toLocaleString()}`, i: DollarSign, c: 'text-white', b: 'bg-gradient-to-br from-emerald-600 to-emerald-800', t: '+12%' }, 
                                        { l: 'Orders', v: orders.length, i: Package, c: 'text-white', b: 'bg-gradient-to-br from-blue-600 to-blue-800', t: '+5%' }, 
                                        { l: 'Products', v: products.length, i: ShoppingBag, c: 'text-white', b: 'bg-gradient-to-br from-purple-600 to-purple-800', t: 'Stock' },
                                        { l: 'Rating', v: '0', i: Star, c: 'text-white', b: 'bg-gradient-to-br from-amber-500 to-amber-700', t: 'Top' }
                                    ].map((s,i)=>(
                                        <Card key={i} className="p-5 md:p-6 relative overflow-hidden group border border-white/5 hover:border-white/10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center ${s.b} ${s.c} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}><s.i className="w-5 h-5 md:w-6 md:h-6"/></div>
                                                <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/>{s.t}</span>
                                            </div>
                                            <div><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.l}</p><h3 className="text-xl md:text-3xl font-black text-white mt-1 tracking-tight">{s.v}</h3></div>
                                        </Card>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <h3 className="text-lg font-black text-white mb-4 px-2">Sales Activity</h3>
                                        <Card className="p-6 md:p-8">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-bold text-slate-300 text-sm">Revenue Flow</h4>
                                                <select className="text-xs bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 font-bold outline-none focus:border-rose-500"><option>Last 7 Days</option><option>Last 30 Days</option></select>
                                            </div>
                                            <CssBarChart data={chartData.values} />
                                            <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-widest px-2">
                                                {chartData.labels.map((label, index) => (
                                                    <span key={index}>{label}</span>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white mb-4 px-2">Quick Actions</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => handleOpenModal(null)} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5 hover:bg-slate-800 transition-all group text-left hover:border-rose-500/30">
                                                <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors"><Plus className="w-5 h-5"/></div>
                                                <div><p className="font-bold text-slate-200 text-sm">Add New Product</p><p className="text-xs text-slate-500">Update inventory</p></div>
                                            </button>
                                            <button onClick={() => { setActiveTab('orders'); }} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-white/5 hover:bg-slate-800 transition-all group text-left hover:border-blue-500/30">
                                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Package className="w-5 h-5"/></div>
                                                <div><p className="font-bold text-slate-200 text-sm">Process Orders</p><p className="text-xs text-slate-500">Pending shipments</p></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div><h2 className="text-2xl font-black text-white tracking-tight">Inventory</h2><p className="text-slate-500 text-sm font-medium">Manage {filteredProducts.length} products</p></div>
                                    <Button onClick={() => handleOpenModal(null)} className="shadow-lg shadow-rose-500/20"><Plus className="w-5 h-5"/> Add Product</Button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"/>
                                    <input 
                                        type="text" 
                                        placeholder="Search by product name..." 
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-rose-500 outline-none font-medium placeholder:text-slate-600 shadow-sm"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full py-24 text-center text-slate-500 flex flex-col items-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/50">
                                            <ShoppingBag className="w-16 h-16 mb-4 opacity-20"/>
                                            <p className="font-bold text-lg text-slate-400">No products found.</p>
                                        </div>
                                    ) : filteredProducts.map(p => {
                                        const displayImage = p.coverImage || (p.images && p.images[0]?.url) || p.image || "https://via.placeholder.com/300";
                                        return (
                                            <div key={p._id} className="group bg-slate-900/50 backdrop-blur rounded-2xl border border-white/5 hover:border-rose-500/50 shadow-lg transition-all duration-300 overflow-hidden flex flex-col relative">
                                                <div className="absolute top-2 right-2 z-10">
                                                    <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide text-white flex items-center gap-1">
                                                        <Package className="w-3 h-3"/> {p.stock}
                                                    </span>
                                                </div>
                                                <div className="relative aspect-[4/5] overflow-hidden bg-slate-800">
                                                    <img src={displayImage} alt={p.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <button onClick={() => handleOpenModal(p)} className="p-2 bg-white rounded-full text-black shadow-lg hover:scale-110 transition-transform"><Edit className="w-4 h-4"/></button>
                                                        <button onClick={() => handleDeleteProduct(p._id)} className="p-2 bg-rose-500 rounded-full text-white shadow-lg hover:scale-110 transition-transform"><Trash2 className="w-4 h-4"/></button>
                                                    </div>
                                                </div>
                                                <div className="p-3 flex flex-col flex-1">
                                                    <h3 className="font-bold text-white text-sm line-clamp-1">{p.name}</h3>
                                                    <div className="flex justify-between items-center mt-auto pt-2">
                                                        <p className="text-rose-400 font-black text-sm">₹{p.price}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{p.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Orders</h2>
                                    
                                    <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
                                        {['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                            <button 
                                                key={status} 
                                                onClick={() => setOrderFilter(status)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${orderFilter === status ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="hidden md:block">
                                    <Card className="overflow-hidden border border-white/5 shadow-xl shadow-black/20 rounded-[2rem]">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider backdrop-blur-sm border-b border-white/5">
                                                        <tr><th className="p-6">Order ID</th><th className="p-6">Customer</th><th className="p-6">Date</th><th className="p-6">Amount</th><th className="p-6">Status</th><th className="p-6 text-right">Action</th></tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                                        {filteredOrders.map(o => (
                                                            <tr key={o._id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(o)}>
                                                                <td className="p-6 font-mono font-bold text-slate-500 text-xs group-hover:text-rose-400">#{o._id.slice(-6).toUpperCase()}</td>
                                                                <td className="p-6 font-bold text-white flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">{o.customer?.name?.charAt(0)}</div>
                                                                    {o.customer?.name}
                                                                </td>
                                                                <td className="p-6 text-slate-500 text-xs font-bold">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                                <td className="p-6 font-black text-rose-400">₹{o.totalAmount}</td>
                                                                <td className="p-6"><Badge color={o.orderStatus === 'Delivered' ? 'green' : o.orderStatus === 'Cancelled' ? 'red' : 'blue'}>{o.orderStatus}</Badge></td>
                                                                <td className="p-6 text-right"><ChevronRight className="w-5 h-5 text-slate-600 ml-auto group-hover:text-rose-500"/></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                    </Card>
                                </div>

                                <div className="md:hidden space-y-4">
                                    {filteredOrders.map(o => (
                                        <div key={o._id} onClick={() => setSelectedOrder(o)} className="bg-slate-900/50 p-5 rounded-3xl border border-white/5 shadow-lg active:scale-[0.98] transition-all relative overflow-hidden backdrop-blur-md">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${o.orderStatus === 'Delivered' ? 'bg-emerald-500' : o.orderStatus === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                            <div className="flex justify-between items-start mb-3 pl-3">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Order #{o._id.slice(-6).toUpperCase()}</p>
                                                    <h3 className="font-bold text-white text-lg">{o.customer?.name}</h3>
                                                </div>
                                                <Badge color={o.orderStatus === 'Delivered' ? 'green' : o.orderStatus === 'Cancelled' ? 'red' : 'blue'}>{o.orderStatus}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center pl-3 border-t border-white/5 pt-3 mt-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 font-bold">Total Amount</span>
                                                    <span className="text-xl font-black text-rose-400">₹{o.totalAmount}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                     <span className="text-[10px] text-slate-500 font-bold">Date</span>
                                                     <span className="text-xs font-bold text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredOrders.length === 0 && <div className="text-center py-10 text-slate-500 font-bold">No orders found.</div>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300 pb-24">
                                <div>
                                    <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Configuration</h2>
                                    <Card className="p-6 md:p-8">
                                        <form onSubmit={handleUpdateStore} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-5">
                                                <div className="space-y-1"><label className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Store Name</label><input name="storeName" defaultValue={shop?.name} className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold placeholder:text-slate-600" /></div>
                                                <div className="space-y-1"><label className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Contact Phone</label><input name="phone" defaultValue={shop?.phone} className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold placeholder:text-slate-600" /></div>
                                            </div>
                                            <div className="space-y-1"><label className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Tagline</label><input name="tagline" defaultValue={shop?.tagline} className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold placeholder:text-slate-600" placeholder="e.g. Best Electronics in Town" /></div>
                                            <div className="space-y-1"><label className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">Description</label><textarea name="description" defaultValue={shop?.description} className="w-full p-4 bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-bold placeholder:text-slate-600" rows="4"/></div>
                                            
                                            <div className="p-5 bg-slate-800/50 rounded-2xl border border-white/5">
                                                <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-2"><QrCode className="w-5 h-5 text-rose-500"/> Payment QR</h4>
                                                <div className="flex items-center gap-4 mt-4">
                                                    {sellerQrPreview ? (
                                                        <img src={sellerQrPreview} className="w-24 h-24 object-contain border border-white/10 rounded-xl p-2 bg-white shadow-sm" alt="QR Preview" />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 font-bold">No QR</div>
                                                    )}
                                                    <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold py-3 px-5 rounded-xl flex items-center gap-2 transition-all shadow-sm">
                                                        <UploadCloud className="w-4 h-4"/> {sellerQrFile ? "Change File" : "Upload QR"}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleSellerQrChange} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="pt-2 flex justify-end"><Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto shadow-xl shadow-rose-900/20">Save Changes</Button></div>
                                        </form>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 z-50 flex justify-around p-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                 {[
                    { id: 'dashboard', icon: LayoutDashboard },
                    { id: 'orders', icon: Package, badge: orders.some(o => o.orderStatus === 'Processing') },
                    { id: 'products', icon: ShoppingBag },
                    { id: 'settings', icon: Settings }
                ].map((item) => (
                    <button 
                        key={item.id} 
                        onClick={() => setActiveTab(item.id)} 
                        className={`relative p-3 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'text-rose-500 bg-rose-500/10' : 'text-slate-400'}`}
                    >
                        <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'scale-110 drop-shadow-sm' : ''}`} />
                        {item.badge && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
                    </button>
                ))}
            </div>

            <ProductModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                editingProduct={editingProduct} 
                handleSaveProduct={handleSaveProduct} 
                isSubmitting={isSubmitting} 
                images={images} 
                removeImage={removeImage} 
                uploading={uploading} 
                handleImageUpload={handleImageUpload} 
                categoryInput={categoryInput} 
                setCategoryInput={setCategoryInput} 
                showCategoryDropdown={showCategoryDropdown} 
                setShowCategoryDropdown={setShowCategoryDropdown} 
                getAvailableCategories={getAvailableCategories}
            />

            <OrderDetailsModal 
                selectedOrder={selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
                onUpdateStatus={handleUpdateOrderStatus} 
            />
        </div>
    );
}