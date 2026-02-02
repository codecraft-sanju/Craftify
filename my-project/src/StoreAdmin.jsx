// src/StoreAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Plus, X, 
  DollarSign, Star, Settings, Menu, RefreshCcw, Store,
  MessageSquare, Send, User, Edit, Trash2, LogOut,
  ChevronRight, Search, Bell, TrendingUp, UploadCloud, 
  Image as ImageIcon, MapPin, Phone, Truck, CheckCircle
} from 'lucide-react';
import io from 'socket.io-client';

const API_URL = "http://localhost:5000";
const ENDPOINT = "http://localhost:5000";

// --- CLOUDINARY CONFIG ---
const CLOUD_NAME = "dvoenforj"; 
const UPLOAD_PRESET = "salon_preset"; 

var socket;

// --- UI COMPONENTS ---
const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
        ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    };
    return (
        <button disabled={loading || props.disabled} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
            {loading && <RefreshCcw className="w-4 h-4 animate-spin"/>}
            {children}
        </button>
    );
};

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>{children}</div>;

const Badge = ({ children, color = 'slate' }) => {
    const colors = { 
        green: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        blue: 'bg-blue-100 text-blue-700 border-blue-200', 
        slate: 'bg-slate-100 text-slate-600 border-slate-200', 
        red: 'bg-red-100 text-red-700 border-red-200',
        amber: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${colors[color]}`}>{children}</span>;
};

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
    const [selectedOrder, setSelectedOrder] = useState(null); // For Order Details Modal
    
    // Loading States
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 
    
    // Product Editing & Image Upload States
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null); 
    const [imagePreview, setImagePreview] = useState(""); 
    
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
        
        // Listen for new orders in real-time
        socket.on("new_order_placed", () => {
             fetchStoreData(); // Refresh data to show new order
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
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`${API_URL}/api/shops/my-shop`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
                body: JSON.stringify({ name: formData.get('storeName'), description: formData.get('description'), phone: formData.get('phone'), tagline: formData.get('tagline') })
            });
            if(res.ok) { setShop(await res.json()); alert("Store Updated Successfully!"); }
        } catch (error) { console.error(error); }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const handleOpenModal = (product = null) => { 
        setEditingProduct(product); 
        setImageFile(null); 
        setImagePreview(product ? product.image : ""); 
        setIsAddModalOpen(true); 
    };

    // --- DIRECT CLOUDINARY UPLOAD ---
    const handleSaveProduct = async (e) => {
        e.preventDefault(); 
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        
        let imageUrl = editingProduct?.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800";

        // 1. Upload to Cloudinary (If new file selected)
        if (imageFile) {
            const data = new FormData();
            data.append("file", imageFile);
            data.append("upload_preset", UPLOAD_PRESET);
            data.append("cloud_name", CLOUD_NAME);

            try {
                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: data
                });
                
                const fileData = await uploadRes.json();
                
                if (uploadRes.ok) {
                    imageUrl = fileData.secure_url; 
                } else {
                    console.error("Cloudinary Error:", fileData);
                    alert("Image Upload Failed! Check your preset name.");
                    setIsSubmitting(false);
                    return;
                }
            } catch (err) {
                console.error("Upload error", err);
                alert("Network error during upload.");
                setIsSubmitting(false);
                return;
            }
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
                alert(editingProduct ? "Product Updated!" : "Product Added!"); 
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

    // --- UPDATE ORDER STATUS ---
    const handleUpdateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/deliver`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
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
        <button onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200 ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} /> 
            <span className="font-medium">{label}</span> 
            {badge && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{badge}</span>}
            {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50"/>}
        </button>
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><RefreshCcw className="w-10 h-10 text-indigo-600 animate-spin" /></div>;

    if (!shop) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-indigo-100 w-full max-w-lg text-center border border-indigo-50">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Store className="w-10 h-10 text-indigo-600"/>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Setup Your Store</h2>
                <form onSubmit={handleCreateShop} className="space-y-4 text-left">
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Store Name</label><input name="name" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. My Awesome Shop" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label><input name="phone" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="+91 98765 43210" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label><textarea name="description" required rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Tell us about your products..."></textarea></div>
                    <Button type="submit" className="w-full py-4 text-base" loading={isSubmitting}>Create Store</Button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">S</div>
                            <div><h1 className="font-bold text-lg leading-tight">Store Admin</h1><p className="text-xs text-slate-500">Manage your empire</p></div>
                        </div>
                    </div>
                    <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
                        <p className="text-xs font-bold text-slate-600 uppercase px-4 mb-2 mt-2">Menu</p>
                        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem id="products" icon={ShoppingBag} label="Products" />
                        <SidebarItem id="orders" icon={Package} label="Orders" />
                        <SidebarItem id="messages" icon={MessageSquare} label="Messages" badge={chats.length || null} />
                        <p className="text-xs font-bold text-slate-600 uppercase px-4 mb-2 mt-6">System</p>
                        <SidebarItem id="settings" icon={Settings} label="Settings" />
                    </nav>
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center"><User className="w-5 h-5 text-slate-300"/></div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{currentUser?.name || 'Seller'}</p><p className="text-xs text-slate-400 truncate">{shop?.name}</p></div>
                            <button onClick={handleLogout} className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-red-400"><LogOut className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 md:ml-72 min-h-screen flex flex-col bg-slate-50">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg"><Menu className="w-5 h-5"/></button>
                            <h2 className="text-xl font-bold capitalize text-slate-800">{activeTab}</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${shop?.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                <span className={`w-2 h-2 rounded-full ${shop?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {shop?.isActive ? 'Online' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto w-full flex-1">
                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div className="flex items-end justify-between"><div><h1 className="text-2xl font-black text-slate-900">Overview</h1><p className="text-slate-500 mt-1">Here is what's happening with your store today.</p></div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { l: 'Total Revenue', v: `₹${orders.reduce((a,o)=>a+(o.totalAmount||0),0).toLocaleString()}`, i: DollarSign, c: 'text-emerald-600', b: 'bg-emerald-100', t: '+12.5%' }, 
                                    { l: 'Total Orders', v: orders.length, i: Package, c: 'text-blue-600', b: 'bg-blue-100', t: '+4.2%' }, 
                                    { l: 'Products', v: products.length, i: ShoppingBag, c: 'text-purple-600', b: 'bg-purple-100', t: 'In Stock' },
                                    { l: 'Store Rating', v: '4.8', i: Star, c: 'text-amber-600', b: 'bg-amber-100', t: 'Top Rated' }
                                ].map((s,i)=>(
                                    <Card key={i} className="p-6 relative overflow-hidden group">
                                            <div className="flex justify-between items-start mb-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.b} ${s.c} group-hover:scale-110 transition-transform duration-300`}><s.i className="w-6 h-6"/></div><span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/>{s.t}</span></div>
                                            <div><p className="text-sm font-medium text-slate-500">{s.l}</p><h3 className="text-3xl font-black text-slate-900 mt-1">{s.v}</h3></div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div><h2 className="text-2xl font-black text-slate-900">Inventory</h2><p className="text-slate-500 text-sm">Manage your products and stock levels.</p></div>
                                <Button onClick={() => handleOpenModal(null)} className="shadow-xl shadow-indigo-200"><Plus className="w-4 h-4"/> Add Product</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map(p => (
                                    <div key={p._id} className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden flex flex-col">
                                            <div className="relative h-48 overflow-hidden">
                                                {/* --- FIXED IMAGE DISPLAY --- */}
                                                <img 
                                                    src={p.image || p.coverImage || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800"} 
                                                    alt={p.name} 
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold">Stock: {p.stock}</div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-slate-900 line-clamp-1">{p.name}</h3><span className="text-indigo-600 font-black">₹{p.price}</span></div>
                                                <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">{p.description}</p>
                                                <div className="flex gap-2 pt-4 border-t border-slate-50 mt-auto">
                                                    <button onClick={() => handleOpenModal(p)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors"><Edit className="w-3 h-3"/> Edit</button>
                                                    <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold transition-colors"><Trash2 className="w-3 h-3"/> Delete</button>
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
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Recent Orders</h2>
                            <Card className="overflow-hidden border-0 shadow-lg shadow-slate-200/50">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                                            <tr>
                                                <th className="p-5">Order ID</th><th className="p-5">Customer</th><th className="p-5">Date</th><th className="p-5">Amount</th><th className="p-5">Status</th><th className="p-5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {orders.map(o => (
                                                <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="p-5 font-mono font-medium text-slate-600">#{o._id.slice(-6).toUpperCase()}</td>
                                                    <td className="p-5 font-bold text-slate-900">{o.customer?.name}</td>
                                                    <td className="p-5 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-5 font-bold text-slate-900">₹{o.totalAmount}</td>
                                                    <td className="p-5">
                                                        <Badge color={o.orderStatus === 'Delivered' ? 'green' : o.orderStatus === 'Cancelled' ? 'red' : 'blue'}>{o.orderStatus}</Badge>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button 
                                                            onClick={() => setSelectedOrder(o)} 
                                                            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                                                        >
                                                            View Details
                                                        </button>
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
                        <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-300">
                            <Card className="w-full md:w-80 flex flex-col border-0 shadow-xl shadow-slate-200/50 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-slate-800">Inbox</h3></div>
                                <div className="flex-1 overflow-y-auto">
                                    {chats.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No conversations yet.</div> : chats.map(c => (
                                        <div key={c._id} onClick={() => openChat(c)} className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChat?._id===c._id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}>
                                            <div className="flex justify-between items-start mb-1"><h4 className="font-bold text-slate-900 text-sm">{c.customer?.name}</h4><span className="text-[10px] text-slate-400">Now</span></div>
                                            <p className="text-xs text-slate-500 truncate">{c.product?.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                            <Card className="hidden md:flex flex-1 flex-col border-0 shadow-xl shadow-slate-200/50 overflow-hidden bg-slate-50/30">
                                {selectedChat ? (
                                    <>
                                        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm z-10">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">{selectedChat.customer?.name.charAt(0)}</div>
                                            <div><h3 className="font-bold text-slate-900">{selectedChat.customer?.name}</h3><p className="text-xs text-slate-500">Inquiry: {selectedChat.product?.name}</p></div>
                                        </div>
                                        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-100/50">
                                            {messages.map((m,i) => {
                                                const isMe = m.sender._id === currentUser._id || m.sender === currentUser._id;
                                                return (<div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none'}`}>{m.text}</div></div>);
                                            })}
                                            <div ref={scrollRef}/>
                                        </div>
                                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
                                            <input value={newMessage} onChange={e=>setNewMessage(e.target.value)} className="flex-1 p-3 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none" placeholder="Type your message..." />
                                            <Button type="submit" className="rounded-xl aspect-square px-0 w-12"><Send className="w-5 h-5"/></Button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400"><MessageSquare className="w-16 h-16 opacity-10 mb-4"/><p>Select a chat to start messaging</p></div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-2xl font-black text-slate-900 mb-6">Store Settings</h2>
                            <Card className="p-8">
                                <form onSubmit={handleUpdateStore} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Store Name</label><input name="storeName" defaultValue={shop?.name} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" /></div>
                                        <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Contact Phone</label><input name="phone" defaultValue={shop?.phone} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" /></div>
                                    </div>
                                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Tagline</label><input name="tagline" defaultValue={shop?.tagline} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="e.g. Best Electronics in Town" /></div>
                                    <div className="space-y-2"><label className="text-xs font-bold uppercase text-slate-500">Description</label><textarea name="description" defaultValue={shop?.description} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" rows="4"/></div>
                                    <div className="pt-4 border-t border-slate-100 flex justify-end"><Button type="submit" size="lg">Save Changes</Button></div>
                                </form>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            {/* ADD/EDIT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-600"/></button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                        {imagePreview ? ( <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> ) : ( <ImageIcon className="w-8 h-8 text-slate-400" /> )}
                                    </div>
                                    <label className="flex-1">
                                        <div className="flex items-center justify-center w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm"><UploadCloud className="w-4 h-4" /> <span>Upload New Photo</span></div>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label><input name="name" defaultValue={editingProduct?.name} required className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Wireless Headphones"/></div>
                            <div className="flex gap-4">
                                <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Price (₹)</label><input name="price" defaultValue={editingProduct?.price} required type="number" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00"/></div>
                                <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Stock</label><input name="stock" defaultValue={editingProduct?.stock} required type="number" className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0"/></div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                                <select name="category" defaultValue={editingProduct?.category || "General"} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                                    <option value="Electronics">Electronics</option><option value="Fashion">Fashion</option><option value="Home">Home</option><option value="General">General</option>
                                </select>
                            </div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Description</label><textarea name="description" defaultValue={editingProduct?.description} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" rows="3" placeholder="Product details..."/></div>
                            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit" loading={isSubmitting}>Save Product</Button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* ORDER DETAILS MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
                                <p className="text-slate-500 text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            
                            {/* 1. Status & Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><Truck className="w-5 h-5"/></div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-900 uppercase">Current Status</p>
                                        <p className="font-bold text-indigo-700">{selectedOrder.orderStatus}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedOrder.orderStatus !== 'Shipped' && selectedOrder.orderStatus !== 'Delivered' && (
                                        <Button size="sm" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'Shipped')}>Mark Shipped</Button>
                                    )}
                                    {selectedOrder.orderStatus === 'Shipped' && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'Delivered')}>Mark Delivered</Button>
                                    )}
                                </div>
                            </div>

                            {/* 2. Shipping Address */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> Shipping Details</h4>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-1">
                                    <p className="font-bold text-slate-900 text-lg">{selectedOrder.shippingAddress?.fullName}</p>
                                    <p className="text-slate-600">{selectedOrder.shippingAddress?.address}</p>
                                    <p className="text-slate-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</p>
                                    <p className="text-slate-600">{selectedOrder.shippingAddress?.country}</p>
                                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 font-bold text-slate-700">
                                        <Phone className="w-4 h-4"/> {selectedOrder.shippingAddress?.phone}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Items List */}
                            <div>
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Package className="w-4 h-4 text-slate-400"/> Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 border border-slate-100 rounded-xl bg-white">
                                            <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-100"/>
                                            <div>
                                                <p className="font-bold text-slate-900">{item.name}</p>
                                                <p className="text-xs text-slate-500">Qty: {item.qty} x ₹{item.price}</p>
                                                {item.customization?.text && (
                                                    <span className="inline-block mt-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                                                        Custom: "{item.customization.text}"
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}