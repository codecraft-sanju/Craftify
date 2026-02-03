// src/StoreAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Plus, X, 
  DollarSign, Star, Settings, Menu, RefreshCcw, Store,
  MessageSquare, Send, User, Edit, Trash2, LogOut,
  ChevronRight, Search, Bell, TrendingUp, UploadCloud, 
  Image as ImageIcon, MapPin, Phone, Truck, CheckCircle, QrCode, ArrowLeft
} from 'lucide-react';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL;
const ENDPOINT =import.meta.env.VITE_API_URL;

// --- CLOUDINARY CONFIG ---
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

var socket;

// --- UI COMPONENTS ---
const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 border border-transparent",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        danger: "bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 shadow-sm",
        ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
    };
    return (
        <button disabled={loading || props.disabled} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
            {loading && <RefreshCcw className="w-4 h-4 animate-spin"/>}
            {children}
        </button>
    );
};

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>{children}</div>;

const Badge = ({ children, color = 'slate' }) => {
    const colors = { 
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100', 
        blue: 'bg-blue-50 text-blue-700 border-blue-100', 
        slate: 'bg-slate-100 text-slate-600 border-slate-200', 
        red: 'bg-rose-50 text-rose-700 border-rose-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100'
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors[color]}`}>{children}</span>;
};

// --- CSS CHART COMPONENT ---
const CssBarChart = ({ data }) => (
    <div className="flex items-end justify-between h-32 gap-2 mt-4">
        {data.map((h, i) => (
            <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group overflow-hidden">
                <div 
                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-lg transition-all duration-1000 ease-out group-hover:bg-indigo-600"
                    style={{ height: `${h}%` }}
                ></div>
            </div>
        ))}
    </div>
);

// ==========================================
// STORE ADMIN COMPONENT
// ==========================================
export default function StoreAdmin({ currentUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Data States
    const [shop, setShop] = useState(null); 
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null); 
    
    // Loading States
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    // Product Editing & Image Upload States
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null); 
    const [imagePreview, setImagePreview] = useState(""); 

    // Seller QR Upload State
    const [sellerQrFile, setSellerQrFile] = useState(null);
    const [sellerQrPreview, setSellerQrPreview] = useState("");
    
    // Chat States
    const [chats, setChats] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        socket = io(ENDPOINT, { withCredentials: true });
        if(currentUser) socket.emit("setup", currentUser);
        fetchStoreData();
        
        socket.on("new_order_placed", () => {
             fetchStoreData(); 
        });

        return () => { socket.disconnect(); }
    }, [currentUser]); 

    // Chat Listeners
    useEffect(() => {
        if(!socket) return;
        const messageHandler = (newMessageReceived) => {
            if (selectedChat && selectedChat._id === newMessageReceived.chatId) {
                setMessages(prev => [...prev, newMessageReceived.message]);
                setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
            if(activeTab === 'messages') fetchChats(); 
        };
        socket.on("new_message_received", messageHandler);
        return () => { socket.off("new_message_received", messageHandler); };
    }, [selectedChat, activeTab]); 

    useEffect(() => { if(activeTab === 'messages') fetchChats(); }, [activeTab]);

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

    const fetchChats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chats/shop-chats`, { credentials: 'include' });
            if (res.ok) setChats(await res.json());
        } catch (error) { console.error("Fetch Chats Error", error); }
    };

    const openChat = async (chat) => {
        setSelectedChat(chat); setMessages([]); socket.emit("join_chat", chat._id);
        try {
            const res = await fetch(`${API_URL}/api/chats/${chat._id}`, { credentials: 'include' });
            const data = await res.json();
            setMessages(data.messages || []);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (error) { console.error(error); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if(!newMessage.trim() || !selectedChat) return;
        try {
            const tempMsg = { text: newMessage, sender: { _id: currentUser._id }, createdAt: new Date().toISOString() };
            setMessages([...messages, tempMsg]);
            const msgToSend = newMessage; setNewMessage("");
            await fetch(`${API_URL}/api/chats/message`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ chatId: selectedChat._id, content: msgToSend, type: 'text' })
            });
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (error) { console.error("Send Error", error); }
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
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
        setImageFile(null); 
        setImagePreview(product ? product.image : ""); 
        setIsAddModalOpen(true); 
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        
        let imageUrl = editingProduct?.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800";

        if (imageFile) {
            const data = new FormData();
            data.append("file", imageFile);
            data.append("upload_preset", UPLOAD_PRESET);
            data.append("cloud_name", CLOUD_NAME);
            try {
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: data });
                const fileData = await uploadRes.json();
                if (uploadRes.ok) { imageUrl = fileData.secure_url; } 
                else { alert("Image Upload Failed!"); setIsSubmitting(false); return; }
            } catch (err) { alert("Network error."); setIsSubmitting(false); return; }
        }

        const productData = {
            shop: shop?._id, 
            name: formData.get('name'), 
            category: formData.get('category'),
            price: Number(formData.get('price')), 
            stock: Number(formData.get('stock')),
            description: formData.get('description'), 
            image: imageUrl,
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

    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ status })
            });
            if(res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
                if(selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, orderStatus: status }));
                }
            }
        } catch (error) { console.error("Update Status Error", error); }
    };

    const handleLogout = () => {
        if(window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem("userInfo");
            window.location.href = '/seller-login';
        }
    };

    const SidebarItem = ({ id, icon: Icon, label, badge }) => (
        <button onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`group relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 transition-all duration-200 ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} /> 
            <span className="font-bold text-sm tracking-wide">{label}</span> 
            {badge && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{badge}</span>}
            {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50"/>}
        </button>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCcw className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

    if (!shop) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-indigo-100 w-full max-w-lg text-center border border-indigo-50 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                    <Store className="w-10 h-10 text-indigo-600"/>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Setup Your Store</h2>
                <p className="text-slate-500 mb-8">Tell us about your business to get started.</p>
                <form onSubmit={handleCreateShop} className="space-y-5 text-left">
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Store Name</label><input name="name" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" placeholder="e.g. Urban Trends" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Phone Number</label><input name="phone" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" placeholder="+91 98765 43210" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Description</label><textarea name="description" required rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all" placeholder="We sell premium quality..."></textarea></div>
                    <Button type="submit" className="w-full py-4 text-base shadow-xl shadow-indigo-200" loading={isSubmitting}>Launch Store</Button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
            {/* MOBILE SIDEBAR BACKDROP */}
            {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}></div>}

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl flex flex-col`}>
                <div className="h-24 flex items-center px-8 gap-3 border-b border-white/5 bg-slate-900">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">S</div>
                    <div><h1 className="font-black text-xl tracking-tight text-white">Store Admin</h1><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Dashboard</p></div>
                </div>
                
                <nav className="flex-1 space-y-2 p-4 overflow-y-auto custom-scrollbar">
                    <p className="text-xs font-bold text-slate-500 uppercase px-4 mb-2 mt-2 tracking-widest">Main Menu</p>
                    <SidebarItem id="dashboard" icon={LayoutDashboard} label="Overview" />
                    <SidebarItem id="products" icon={ShoppingBag} label="Products" />
                    <SidebarItem id="orders" icon={Package} label="Orders" />
                    <SidebarItem id="messages" icon={MessageSquare} label="Messages" badge={chats.length > 0 ? chats.length : null} />
                    
                    <p className="text-xs font-bold text-slate-500 uppercase px-4 mb-2 mt-8 tracking-widest">Configuration</p>
                    <SidebarItem id="settings" icon={Settings} label="Settings" />
                </nav>
                
                <div className="p-6 border-t border-white/5 bg-slate-900">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 mb-3 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-transparent group-hover:ring-indigo-500 transition-all">{currentUser?.name?.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{shop?.name}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-xl transition-all font-bold text-xs uppercase tracking-wide">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 md:ml-72 flex flex-col h-screen overflow-hidden relative">
                
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex-shrink-0 transition-all">
                    <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"><Menu className="w-6 h-6"/></button>
                            <h2 className="text-xl font-black capitalize text-slate-900 hidden sm:block tracking-tight">{activeTab}</h2>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${shop?.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                <span className={`w-2 h-2 rounded-full ${shop?.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                {shop?.isActive ? 'Store Online' : 'Store Offline'}
                            </div>
                            <button className="p-2 relative hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                                <Bell className="w-5 h-5" />
                                {orders.some(o => o.orderStatus === 'Processing') && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full pb-24">
                        
                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { l: 'Total Revenue', v: `₹${orders.reduce((a,o)=>a+(o.totalAmount||0),0).toLocaleString()}`, i: DollarSign, c: 'text-emerald-600', b: 'bg-emerald-50', t: '+12.5%' }, 
                                        { l: 'Total Orders', v: orders.length, i: Package, c: 'text-blue-600', b: 'bg-blue-50', t: '+4.2%' }, 
                                        { l: 'Products', v: products.length, i: ShoppingBag, c: 'text-purple-600', b: 'bg-purple-50', t: 'In Stock' },
                                        { l: 'Avg Rating', v: '4.8', i: Star, c: 'text-amber-600', b: 'bg-amber-50', t: 'Top Rated' }
                                    ].map((s,i)=>(
                                        <Card key={i} className="p-6 relative overflow-hidden group border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.b} ${s.c} group-hover:scale-110 transition-transform duration-300 shadow-sm`}><s.i className="w-6 h-6"/></div>
                                                <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/>{s.t}</span>
                                            </div>
                                            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{s.l}</p><h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{s.v}</h3></div>
                                        </Card>
                                    ))}
                                </div>
                                
                                {/* Activity Chart */}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Activity Overview</h3>
                                    <Card className="p-8">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="font-bold text-slate-700">Sales Velocity</h4>
                                            <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-500 outline-none"><option>Last 7 Days</option><option>Last 30 Days</option></select>
                                        </div>
                                        {/* CSS-Only Bar Chart Placeholder */}
                                        <CssBarChart data={[40, 70, 45, 90, 60, 80, 50, 40, 70, 45, 90, 60]} />
                                        <div className="flex justify-between text-xs text-slate-400 font-bold mt-4 uppercase">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* PRODUCTS TAB */}
                        {activeTab === 'products' && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory</h2><p className="text-slate-500 text-sm">Manage your products and stock levels.</p></div>
                                    <Button onClick={() => handleOpenModal(null)} className="shadow-xl shadow-indigo-200 py-3"><Plus className="w-4 h-4"/> Add Product</Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.length === 0 ? (
                                        <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center border-2 border-dashed border-slate-200 rounded-3xl">
                                            <ShoppingBag className="w-12 h-12 mb-2 opacity-20"/>
                                            <p className="font-bold">No products found.</p>
                                        </div>
                                    ) : products.map(p => (
                                        <div key={p._id} className="group bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden flex flex-col">
                                            <div className="relative h-56 overflow-hidden bg-slate-100">
                                                <img src={p.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800"} alt={p.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm border border-slate-100">Stock: {p.stock}</div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-900 line-clamp-1 text-lg">{p.name}</h3><span className="text-indigo-600 font-black text-lg">₹{p.price}</span></div>
                                                <p className="text-slate-500 text-xs line-clamp-2 mb-6 flex-1 leading-relaxed">{p.description}</p>
                                                <div className="flex gap-2 pt-4 border-t border-slate-50 mt-auto">
                                                    <button onClick={() => handleOpenModal(p)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"><Edit className="w-3 h-3"/> Edit</button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold transition-colors"><Trash2 className="w-3 h-3"/> Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ORDERS TAB */}
                        {activeTab === 'orders' && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Recent Orders</h2>
                                <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50 rounded-3xl">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50/80 text-slate-500 uppercase text-xs font-bold tracking-wider backdrop-blur-sm border-b border-slate-100">
                                                <tr><th className="p-6">Order ID</th><th className="p-6">Customer</th><th className="p-6">Date</th><th className="p-6">Amount</th><th className="p-6">Status</th><th className="p-6 text-right">Action</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {orders.length === 0 ? (
                                                    <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No orders yet.</td></tr>
                                                ) : orders.map(o => (
                                                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="p-6 font-mono font-bold text-slate-500 text-xs group-hover:text-indigo-600 transition-colors">#{o._id.slice(-6).toUpperCase()}</td>
                                                        <td className="p-6 font-bold text-slate-900 flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-400 text-white flex items-center justify-center text-[10px]">{o.customer?.name?.charAt(0)}</div>
                                                            {o.customer?.name}
                                                        </td>
                                                        <td className="p-6 text-slate-500 text-xs font-medium">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                        <td className="p-6 font-black text-slate-900">₹{o.totalAmount}</td>
                                                        <td className="p-6"><Badge color={o.orderStatus === 'Delivered' ? 'green' : o.orderStatus === 'Cancelled' ? 'red' : 'blue'}>{o.orderStatus}</Badge></td>
                                                        <td className="p-6 text-right">
                                                            <button onClick={() => setSelectedOrder(o)} className="text-indigo-600 hover:text-white hover:bg-indigo-600 font-bold text-xs bg-indigo-50 px-4 py-2 rounded-lg transition-all shadow-sm">View Details</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* MESSAGES TAB */}
                        {activeTab === 'messages' && (
                            <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] gap-6 animate-in fade-in duration-300">
                                {/* Chat List */}
                                <Card className={`w-full md:w-80 flex flex-col border-0 shadow-xl shadow-slate-200/50 overflow-hidden ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                                    <div className="p-4 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-slate-800">Inbox</h3></div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        {chats.length === 0 ? <div className="p-10 text-center text-slate-400 text-sm flex flex-col items-center"><MessageSquare className="w-8 h-8 mb-2 opacity-20"/><p>No messages yet.</p></div> : chats.map(c => (
                                            <div key={c._id} onClick={() => openChat(c)} className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors relative ${selectedChat?._id===c._id ? 'bg-indigo-50/50' : ''}`}>
                                                {selectedChat?._id===c._id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>}
                                                <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-slate-900 text-sm">{c.customer?.name}</h4><span className="text-[10px] text-slate-400 font-medium">Now</span></div>
                                                <p className="text-xs text-slate-500 truncate pr-4">{c.product?.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                
                                {/* Chat Window */}
                                <Card className={`flex-1 flex-col border-0 shadow-xl shadow-slate-200/50 overflow-hidden bg-slate-50/30 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
                                    {selectedChat ? (
                                        <>
                                            <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-4 shadow-sm z-10">
                                                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5 text-slate-500"/></button>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">{selectedChat.customer?.name.charAt(0)}</div>
                                                <div><h3 className="font-bold text-slate-900">{selectedChat.customer?.name}</h3><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Inquiry: {selectedChat.product?.name}</p></div>
                                            </div>
                                            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-100/50 custom-scrollbar">
                                                {messages.map((m,i) => {
                                                    const isMe = m.sender._id === currentUser._id || m.sender === currentUser._id;
                                                    return (<div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>{m.text}</div></div>);
                                                })}
                                                <div ref={scrollRef}/>
                                            </div>
                                            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                                                <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} className="flex-1 p-3 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-medium text-sm" placeholder="Type your message..." />
                                                <Button type="submit" className="rounded-xl aspect-square px-0 w-12 shadow-none"><Send className="w-5 h-5"/></Button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><MessageSquare className="w-16 h-16 opacity-10 mb-4"/><p className="font-medium">Select a chat to start messaging</p></div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {/* SETTINGS TAB */}
                        {activeTab === 'settings' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Store Configuration</h2>
                                    <Card className="p-8">
                                        <form onSubmit={handleUpdateStore} className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Store Name</label><input name="storeName" defaultValue={shop?.name} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" /></div>
                                                <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Contact Phone</label><input name="phone" defaultValue={shop?.phone} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" /></div>
                                            </div>
                                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tagline</label><input name="tagline" defaultValue={shop?.tagline} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" placeholder="e.g. Best Electronics in Town" /></div>
                                            <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Description</label><textarea name="description" defaultValue={shop?.description} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-900" rows="4"/></div>
                                            
                                            <div className="pt-6 border-t border-slate-100">
                                                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><QrCode className="w-4 h-4 text-indigo-600"/> Payment QR Code</h4>
                                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Upload your UPI QR code to receive direct payouts from the platform admin.</p>
                                                <div className="flex items-center gap-4">
                                                    {sellerQrPreview ? (
                                                        <img src={sellerQrPreview} className="w-24 h-24 object-contain border rounded-xl p-2 bg-white shadow-sm" alt="QR Preview" />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-200 font-bold">No QR</div>
                                                    )}
                                                    <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold py-3 px-5 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow">
                                                        <UploadCloud className="w-4 h-4 text-indigo-600"/> 
                                                        {sellerQrFile ? "Change File" : "Upload QR"}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleSellerQrChange} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="pt-6 flex justify-end"><Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto shadow-xl shadow-indigo-200">Save Changes</Button></div>
                                        </form>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ADD/EDIT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-600"/></button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                        {imagePreview ? ( <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> ) : ( <ImageIcon className="w-8 h-8 text-slate-400" /> )}
                                    </div>
                                    <label className="flex-1">
                                        <div className="flex flex-col items-center justify-center w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                                            <span className="text-slate-600 font-bold text-sm">Upload Photo</span>
                                            <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Product Name</label><input name="name" defaultValue={editingProduct?.name} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900" placeholder="e.g. Wireless Headphones"/></div>
                            <div className="flex gap-4">
                                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price (₹)</label><input name="price" defaultValue={editingProduct?.price} required type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900" placeholder="0.00"/></div>
                                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Stock</label><input name="stock" defaultValue={editingProduct?.stock} required type="number" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900" placeholder="0"/></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                                <select name="category" defaultValue={editingProduct?.category || "General"} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900">
                                    <option value="Electronics">Electronics</option><option value="Fashion">Fashion</option><option value="Home">Home</option><option value="Art & Decor">Art & Decor</option><option value="Handmade Goods">Handmade</option><option value="General">General</option>
                                </select>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label><textarea name="description" defaultValue={editingProduct?.description} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900" rows="3" placeholder="Product details..."/></div>
                            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit" loading={isSubmitting} className="shadow-xl shadow-indigo-200">Save Product</Button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh] scale-100 animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 rounded-t-[2.5rem]">
                            <div><h3 className="text-xl font-black text-slate-900">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h3><p className="text-slate-500 text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50"><Truck className="w-7 h-7"/></div>
                                    <div><p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Current Status</p><p className="font-black text-indigo-900 text-xl">{selectedOrder.orderStatus}</p></div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedOrder.orderStatus !== 'Shipped' && selectedOrder.orderStatus !== 'Delivered' && (<Button size="sm" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'Shipped')} className="shadow-none bg-indigo-600 hover:bg-indigo-700 border-transparent">Mark Shipped</Button>)}
                                    {selectedOrder.orderStatus === 'Shipped' && (<Button size="sm" variant="success" className="shadow-none border-transparent" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'Delivered')}>Mark Delivered</Button>)}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"><MapPin className="w-4 h-4 text-indigo-500"/> Shipping Details</h4>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm space-y-1.5 leading-relaxed">
                                        <p className="font-black text-slate-900 text-lg mb-2">{selectedOrder.shippingAddress?.fullName}</p>
                                        <p className="text-slate-600 font-medium">{selectedOrder.shippingAddress?.address}</p>
                                        <p className="text-slate-600 font-medium">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                                        <p className="text-slate-600 font-medium">{selectedOrder.shippingAddress?.country}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2 font-bold text-slate-800"><Phone className="w-4 h-4"/> {selectedOrder.shippingAddress?.phone}</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide"><Package className="w-4 h-4 text-indigo-500"/> Order Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 border border-slate-100 rounded-2xl bg-white shadow-sm">
                                                <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover bg-slate-100"/>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-slate-500 font-bold mt-1">Qty: {item.qty} × ₹{item.price}</p>
                                                    {item.customization?.text && (<span className="inline-block mt-1.5 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 font-bold">Custom: "{item.customization.text}"</span>)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}