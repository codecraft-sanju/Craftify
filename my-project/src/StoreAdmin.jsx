// src/StoreAdmin.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Package, Plus, X, 
  DollarSign, Star, Settings, Menu, RefreshCcw, Store,
  MessageSquare, Send, User, ChevronRight
} from 'lucide-react';
import io from 'socket.io-client';

const API_URL = "http://localhost:5000";
const ENDPOINT = "http://localhost:5000";
var socket;

// ==========================================
// 1. UI COMPONENTS
// ==========================================

const Button = ({ children, variant = 'primary', className = '', loading, ...props }) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-50",
        danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
        outline: "bg-transparent border border-slate-300 text-slate-600 hover:border-slate-800 hover:text-slate-900",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
    };
    return (
        <button disabled={loading || props.disabled} className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
            {loading && <RefreshCcw className="w-4 h-4 animate-spin"/>}
            {children}
        </button>
    );
};

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, color = 'slate' }) => {
    const colors = {
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-amber-100 text-amber-700',
        slate: 'bg-slate-100 text-slate-600',
        indigo: 'bg-indigo-100 text-indigo-700',
        red: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${colors[color]}`}>{children}</span>;
};

// ==========================================
// 2. MAIN STORE ADMIN COMPONENT
// ==========================================

export default function StoreAdmin({ currentUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Data States
    const [shop, setShop] = useState(null); 
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 

    // --- CHAT STATES (NEW) ---
    const [chats, setChats] = useState([]); 
    const [selectedChat, setSelectedChat] = useState(null); 
    const [messages, setMessages] = useState([]); 
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef();

    // --- SOCKET & INITIAL FETCH ---
    useEffect(() => {
        // 1. Initialize Socket
        socket = io(ENDPOINT);
        if(currentUser) {
            socket.emit("setup", currentUser);
        }
        socket.on("connected", () => console.log("Seller Socket Connected"));

        // 2. Real-time Message Listener
        socket.on("new_message_received", (newMessageReceived) => {
            if (selectedChat && selectedChat._id === newMessageReceived.chatId) {
                setMessages(prev => [...prev, newMessageReceived.message]);
                // Scroll to bottom on new message
                setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }
            // Refresh chat list to show unread/latest
            if(activeTab === 'messages') fetchChats();
        });

        // 3. Fetch Initial Data
        fetchStoreData();

        return () => { socket.disconnect(); }
    }, [currentUser, selectedChat, activeTab]);

    // --- API FUNCTIONS ---

    const fetchStoreData = async () => {
        if(!currentUser?.token) return;
        
        try {
            setLoading(true);
            const shopRes = await fetch(`${API_URL}/api/shops/my-shop`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            
            if (shopRes.ok) {
                const shopData = await shopRes.json();
                setShop(shopData); 

                if(shopData && shopData._id) {
                    const [prodRes, ordRes] = await Promise.all([
                        fetch(`${API_URL}/api/products/shop/${shopData._id}`),
                        fetch(`${API_URL}/api/orders/shop-orders`, {
                            headers: { 'Authorization': `Bearer ${currentUser.token}` }
                        })
                    ]);

                    if(prodRes.ok) setProducts(await prodRes.json());
                    if(ordRes.ok) setOrders(await ordRes.json());
                }
            } else {
                console.warn("Shop not found or API error");
                setShop(null);
            }
        } catch (error) {
            console.error("Store Data Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchChats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/chats/shop-chats`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setChats(data);
        } catch (error) { console.error("Fetch Chats Error", error); }
    };

    // Load Chats when clicking "Messages" tab
    useEffect(() => {
        if(activeTab === 'messages') {
            fetchChats();
        }
    }, [activeTab]);

    const openChat = async (chat) => {
        setSelectedChat(chat);
        setMessages([]); 
        socket.emit("join_chat", chat._id);

        try {
            const res = await fetch(`${API_URL}/api/chats/${chat._id}`, {
                headers: { 'Authorization': `Bearer ${currentUser.token}` }
            });
            const data = await res.json();
            setMessages(data.messages || []);
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (error) { console.error(error); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if(!newMessage.trim() || !selectedChat) return;

        try {
            const tempMsg = { 
                text: newMessage, 
                sender: { _id: currentUser._id }, 
                createdAt: new Date().toISOString() 
            };
            setMessages([...messages, tempMsg]);
            const msgToSend = newMessage;
            setNewMessage("");

            await fetch(`${API_URL}/api/chats/message`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    chatId: selectedChat._id,
                    content: msgToSend,
                    type: 'text'
                })
            });
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        } catch (error) { console.error("Send Error", error); }
    };

    // --- SHOP ACTIONS ---

    const handleCreateShop = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.target);

        try {
            const res = await fetch(`${API_URL}/api/shops`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    description: formData.get('description'),
                    phone: formData.get('phone')
                })
            });

            const data = await res.json();

            if (res.ok) {
                setShop(data);
                alert("Shop Created Successfully!");
                fetchStoreData();
            } else {
                if (res.status === 400 || data.message?.toLowerCase().includes('already')) {
                    alert("System found your existing shop! Loading dashboard...");
                    await fetchStoreData();
                } else {
                    alert(data.message || "Failed to create shop");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStore = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            const res = await fetch(`${API_URL}/api/shops/my-shop`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    name: formData.get('storeName'),
                    description: formData.get('description'),
                    phone: formData.get('phone'),
                    tagline: formData.get('tagline')
                })
            });

            if(res.ok) {
                const updated = await res.json();
                setShop(updated);
                alert("Store Updated Successfully!");
            }
        } catch (error) { console.error(error); }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const shopId = shop?._id;
        if (!shopId) {
            alert("Error: Shop information is missing. Please refresh the page.");
            return;
        }
        setIsSubmitting(true);
        const formData = new FormData(e.target);
        
        try {
            const res = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: JSON.stringify({
                    shop: shopId,
                    name: formData.get('name'),
                    category: formData.get('category'),
                    price: Number(formData.get('price')),
                    stock: Number(formData.get('stock')),
                    description: formData.get('description'),
                    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
                })
            });
            const data = await res.json();
            if(res.ok) {
                setProducts([data, ...products]);
                setIsAddModalOpen(false);
                alert("Product Added Successfully!");
            } else {
                alert(`Error: ${data.message || "Failed to add product"}`);
            }
        } catch (error) {
            alert("Network error. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <RefreshCcw className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Loading your store dashboard...</p>
            </div>
        );
    }

    // --- CREATE SHOP FORM ---
    if (!shop) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-indigo-600"/>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Setup Your Store</h2>
                    <p className="text-slate-500 mt-2 mb-8">Create your store profile to access the dashboard.</p>
                    
                    <form onSubmit={handleCreateShop} className="space-y-4 text-left">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Store Name</label>
                            <input name="name" required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="My Awesome Brand" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                            <input name="phone" required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="+91 0000000000" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                            <textarea name="description" required rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium" placeholder="What do you sell?"></textarea>
                        </div>
                        <Button type="submit" className="w-full py-4 mt-4" loading={isSubmitting}>
                            Create Store & Enter Dashboard
                        </Button>
                    </form>
                    <div className="mt-4">
                        <button onClick={fetchStoreData} className="text-xs text-indigo-600 hover:underline font-bold">I already have a shop? Reload Data</button>
                    </div>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const SidebarItem = ({ id, icon: Icon, label, badge }) => (
        <button 
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium mb-1 ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </div>
            {badge && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/50">C</div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Craftify Admin</h1>
                            <p className="text-xs text-slate-400">Seller Console</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Main Menu</p>
                        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem id="products" icon={ShoppingBag} label="Products" />
                        <SidebarItem id="orders" icon={Package} label="Orders" />
                        <SidebarItem id="messages" icon={MessageSquare} label="Messages" badge={chats.length > 0 ? chats.length : null} />
                        
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">Business</p>
                        <SidebarItem id="settings" icon={Settings} label="Store Settings" />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white">
                                {currentUser?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{currentUser?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate">{currentUser?.email || 'email@example.com'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm text-slate-600">
                            <span className={`w-2 h-2 rounded-full ${shop?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {shop?.isActive ? 'Shop Online' : 'Shop Offline'}
                        </div>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto w-full h-[calc(100vh-80px)]">
                    
                    {/* DASHBOARD TAB */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h1 className="text-3xl font-black mb-2 relative z-10">Welcome back, {currentUser?.name}!</h1>
                                <p className="opacity-90 max-w-xl relative z-10">Your store <strong>{shop?.name}</strong> dashboard is ready.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                                    { label: 'Total Orders', val: orders.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
                                    { label: 'Products', val: products.length, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
                                    { label: 'Rating', val: shop?.rating > 0 ? shop.rating : 'New', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
                                ].map((stat, i) => (
                                    <Card key={i} className="p-6 flex items-center gap-4 border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
                                            <h3 className="text-2xl font-black text-slate-900">{stat.val}</h3>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Product Management</h2>
                                    <p className="text-slate-500 text-sm">Manage your catalog, stock, and pricing.</p>
                                </div>
                                <Button onClick={() => setIsAddModalOpen(true)}><Plus className="w-4 h-4" /> Add New Product</Button>
                            </div>

                            <Card className="overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                                    {products.length === 0 ? <p className="col-span-full text-center text-slate-400 py-10">No products added yet. Start selling!</p> : products.map(product => (
                                        <div key={product._id} className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
                                            <div className="aspect-[4/3] bg-slate-100 rounded-t-2xl relative overflow-hidden">
                                                <img src={product.image || product.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                                <div className="absolute top-2 right-2">
                                                    <Badge color={product.stock > 10 ? 'green' : 'red'}>{product.stock > 0 ? 'In Stock' : 'OOS'}</Badge>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                                                    <span className="font-bold text-indigo-600">₹{product.price}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                                                    <span>{product.category}</span>
                                                    <span>•</span>
                                                    <span>Stock: {product.stock}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-black text-slate-900">Order Management</h2>
                            <Card className="overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-xs">
                                            <tr>
                                                <th className="p-4 font-bold">Order ID</th>
                                                <th className="p-4 font-bold">Customer</th>
                                                <th className="p-4 font-bold">Date</th>
                                                <th className="p-4 font-bold">Status</th>
                                                <th className="p-4 font-bold text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {orders.length === 0 ? (
                                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No orders found yet.</td></tr>
                                            ) : (
                                                orders.map(order => (
                                                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-4 font-bold text-indigo-600">#{order._id.slice(0,6)}</td>
                                                        <td className="p-4">
                                                            <p className="font-bold text-slate-900">{order.customer?.name || 'Guest'}</p>
                                                            <p className="text-xs text-slate-400">{order.customer?.email}</p>
                                                        </td>
                                                        <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                order.orderStatus === 'Processing' ? 'bg-amber-100 text-amber-700' :
                                                                order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right font-bold">₹{order.totalAmount}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* MESSAGES TAB (NEW) */}
                    {activeTab === 'messages' && (
                        <div className="flex h-full gap-6 animate-fade-in">
                            {/* Left: Chat List */}
                            <Card className="w-1/3 flex flex-col overflow-hidden h-full">
                                <div className="p-4 border-b border-slate-100 bg-slate-50">
                                    <h3 className="font-bold text-slate-800">Inbox ({chats.length})</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {chats.length === 0 ? <p className="p-6 text-center text-slate-400 text-sm">No chats yet.</p> : 
                                        chats.map(chat => (
                                            <div 
                                                key={chat._id} 
                                                onClick={() => openChat(chat)}
                                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChat?._id === chat._id ? 'bg-indigo-50 border-indigo-100' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                                        {chat.customer?.avatar || <User className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="font-bold text-slate-900 text-sm truncate">{chat.customer?.name}</h4>
                                                            <span className="text-[10px] text-slate-400">{new Date(chat.updatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                                            <span className="font-medium text-indigo-600 bg-indigo-50 px-1 rounded">Product:</span> 
                                                            {chat.product?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </Card>

                            {/* Right: Chat Window */}
                            <Card className="flex-1 flex flex-col overflow-hidden h-full bg-slate-50/50">
                                {selectedChat ? (
                                    <>
                                        {/* Header */}
                                        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {selectedChat.customer?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{selectedChat.customer?.name}</h3>
                                                    <p className="text-xs text-slate-500">Inquiry about: <span className="font-medium text-indigo-600">{selectedChat.product?.name}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages Area */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                            {messages.map((msg, i) => {
                                                const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
                                                return (
                                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                                            <p>{msg.text}</p>
                                                            <span className={`text-[10px] block mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <div ref={scrollRef} />
                                        </div>

                                        {/* Input Area */}
                                        <div className="p-4 bg-white border-t border-slate-100">
                                            <form onSubmit={sendMessage} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                                                    placeholder="Type your reply..."
                                                />
                                                <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                            <MessageSquare className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <p>Select a chat to view conversation</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div className="max-w-3xl space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-black text-slate-900">Store Settings</h2>
                            <form onSubmit={handleUpdateStore} className="space-y-6">
                                <Card className="p-8">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase text-slate-500">Store Name</label>
                                                <input name="storeName" type="text" defaultValue={shop?.name || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase text-slate-500">Tagline</label>
                                                <input name="tagline" type="text" defaultValue={shop?.tagline || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">About Store</label>
                                            <textarea name="description" rows="3" defaultValue={shop?.description || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500"></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">Contact Phone</label>
                                            <input name="phone" type="text" defaultValue={shop?.phone || ''} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                </Card>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            {/* ADD PRODUCT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-black text-slate-900">Add New Product</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Product Name</label>
                                        <input name="name" required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" placeholder="e.g. Neon Sign" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Category</label>
                                        <select name="category" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500">
                                            <option>Tech Accessories</option>
                                            <option>Clothing & Apparel</option>
                                            <option>Art & Decor</option>
                                            <option>Handmade Goods</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Price (₹)</label>
                                        <input name="price" required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" placeholder="999" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Stock Qty</label>
                                        <input name="stock" required type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" placeholder="50" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                                    <textarea name="description" required rows="4" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" placeholder="Describe your product..."></textarea>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" loading={isSubmitting}>Create Product</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}