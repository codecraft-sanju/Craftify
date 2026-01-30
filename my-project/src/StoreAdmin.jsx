import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, MessageSquare, Plus, X, 
  Image as ImageIcon, DollarSign, Package, Star, Settings, 
  ChevronRight, Search, UploadCloud, Check, Bell, 
  CreditCard, TrendingUp, Users, Truck, LogOut, Menu, ArrowUpRight,AlertCircle
} from 'lucide-react';

// --- UI Components ---
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
        outline: "bg-transparent border border-slate-300 text-slate-600 hover:border-slate-800 hover:text-slate-900"
    };
    return (
        <button className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${variants[variant]} ${className}`} {...props}>
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
        indigo: 'bg-indigo-100 text-indigo-700'
    };
    return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${colors[color]}`}>{children}</span>;
};

// --- MAIN COMPONENT ---
export default function StoreAdmin({ currentUser, products, setProducts, orders = [], chats = [] }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- STORE SETTINGS STATE (The "Store Name" Feature) ---
    const [storeProfile, setStoreProfile] = useState({
        name: "TechHaven Official",
        tagline: "Premium Tech & Custom Gear",
        description: "We specialize in high-end mechanical keyboards, custom engraving, and developer accessories.",
        email: currentUser.email,
        phone: "+91 98765 43210",
        logo: "https://ui-avatars.com/api/?name=Tech+Haven&background=6366f1&color=fff"
    });

    // --- DERIVED DATA ---
    const myShopId = currentUser.role === 'seller' ? 's1' : 's_gen';
    const myProducts = products.filter(p => p.shopId === myShopId);
    
    // Filter orders that contain items from this shop
    const myOrders = orders.filter(o => o.items && o.items.some(i => i.shopId === myShopId)).map(o => ({
        ...o,
        // Calculate only this shop's portion of the revenue
        shopTotal: o.items.filter(i => i.shopId === myShopId).reduce((sum, item) => sum + item.price, 0)
    }));

    const totalRevenue = myOrders.reduce((acc, o) => acc + o.shopTotal, 0);

    // --- HANDLERS ---
    const handleUpdateStore = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setStoreProfile({
            ...storeProfile,
            name: formData.get('storeName'),
            tagline: formData.get('tagline'),
            description: formData.get('description'),
            phone: formData.get('phone')
        });
        alert("Store Settings Updated Successfully!");
    };

    const handleAddProduct = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProduct = {
            id: `p-${Date.now()}`,
            shopId: myShopId,
            name: formData.get('name'),
            category: formData.get('category'),
            price: Number(formData.get('price')),
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
            rating: 0,
            reviews: 0,
            stock: Number(formData.get('stock')),
            tags: ["New"],
            description: formData.get('description'),
            specs: { material: "Standard" },
            customizationAvailable: false
        };
        setProducts([newProduct, ...products]);
        setIsAddModalOpen(false);
    };

    // --- RENDER HELPERS ---
    const SidebarItem = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            
            {/* 1. SIDEBAR NAVIGATION (Desktop) */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-full flex flex-col p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/50">
                            C
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Craftify Admin</h1>
                            <p className="text-xs text-slate-400">Seller Console v2.0</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">Main Menu</p>
                        <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                        <SidebarItem id="products" icon={ShoppingBag} label="Products" />
                        <SidebarItem id="orders" icon={Package} label="Orders" />
                        <SidebarItem id="messages" icon={MessageSquare} label="Messages" />
                        
                        <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-8">Business</p>
                        <SidebarItem id="wallet" icon={CreditCard} label="Wallet & Payouts" />
                        <SidebarItem id="settings" icon={Settings} label="Store Settings" />
                    </nav>

                    {/* User Profile */}
                    <div className="mt-auto pt-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 px-2">
                            <img src={currentUser.avatar === 'SC' ? storeProfile.logo : storeProfile.logo} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{currentUser.name}</p>
                                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                            </div>
                            <button className="text-slate-400 hover:text-white"><LogOut className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 2. MAIN CONTENT AREA */}
            <main className="flex-1 md:ml-72 min-h-screen flex flex-col">
                
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <a href="/shop" target="_blank" className="hidden sm:flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                            Visit Store <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto w-full">
                    
                    {/* --- TAB: DASHBOARD --- */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Welcome Banner */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
                                <h1 className="text-3xl font-black mb-2">Welcome back, {currentUser.name}!</h1>
                                <p className="opacity-90 max-w-xl">Your store <strong>{storeProfile.name}</strong> is performing well. You have {myOrders.filter(o => o.status === 'Processing').length} pending orders to fulfill today.</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                                    { label: 'Active Orders', val: myOrders.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
                                    { label: 'Total Products', val: myProducts.length, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
                                    { label: 'Store Rating', val: '4.8/5.0', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
                                ].map((stat, i) => (
                                    <Card key={i} className="p-6 flex items-center gap-4">
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

                            {/* Charts & Activity Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-lg text-slate-900">Revenue Analytics</h3>
                                        <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1 outline-none">
                                            <option>This Week</option>
                                            <option>This Month</option>
                                        </select>
                                    </div>
                                    {/* Mock Chart Visual */}
                                    <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-l border-slate-100">
                                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="w-full bg-indigo-100 rounded-t-lg relative group hover:bg-indigo-600 transition-colors cursor-pointer" style={{ height: `${h}%` }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹{h}k</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold uppercase">
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="font-bold text-lg text-slate-900 mb-6">Recent Activity</h3>
                                    <div className="space-y-6">
                                        {[
                                            { text: "New order #8392 received", time: "2 mins ago", icon: Package, color: "bg-blue-100 text-blue-600" },
                                            { text: "Payout of ₹15,000 processed", time: "4 hours ago", icon: Check, color: "bg-green-100 text-green-600" },
                                            { text: "New review (5 stars) on Product A", time: "1 day ago", icon: Star, color: "bg-amber-100 text-amber-600" },
                                            { text: "Stock alert: Obsidian Pen low", time: "2 days ago", icon: AlertCircle, color: "bg-red-100 text-red-600" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{item.text}</p>
                                                    <p className="text-xs text-slate-500">{item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: PRODUCTS --- */}
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
                                    {myProducts.map(product => (
                                        <div key={product.id} className="group bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
                                            <div className="aspect-[4/3] bg-slate-100 rounded-t-2xl relative overflow-hidden">
                                                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
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
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Button variant="secondary" className="w-full text-xs">Edit</Button>
                                                    <button className="flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* --- TAB: ORDERS (New Advanced Feature) --- */}
                    
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
                                                <th className="p-4 font-bold text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {myOrders.length === 0 ? (
                                                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No orders found.</td></tr>
                                            ) : (
                                                myOrders.map(order => (
                                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="p-4 font-bold text-indigo-600">#{order.id.slice(0,6)}</td>
                                                        <td className="p-4">
                                                            <p className="font-bold text-slate-900">{order.customerName}</p>
                                                            <p className="text-xs text-slate-400">Verified Buyer</p>
                                                        </td>
                                                        <td className="p-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                order.status === 'Processing' ? 'bg-amber-100 text-amber-700' :
                                                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right font-bold">₹{order.shopTotal}</td>
                                                        <td className="p-4 text-center">
                                                            <select className="bg-white border border-slate-200 rounded-lg text-xs py-1 px-2 outline-none focus:border-indigo-500">
                                                                <option>Processing</option>
                                                                <option>Shipped</option>
                                                                <option>Delivered</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* --- TAB: STORE SETTINGS (Requested Feature) --- */}
                    {activeTab === 'settings' && (
                        <div className="max-w-3xl space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-black text-slate-900">Store Settings</h2>
                            
                            <form onSubmit={handleUpdateStore} className="space-y-6">
                                {/* Profile Card */}
                                <Card className="p-8">
                                    <div className="flex items-start gap-6 mb-8">
                                        <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border-4 border-white shadow-lg relative group cursor-pointer">
                                            <img src={storeProfile.logo} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold text-center p-1">Change Logo</div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg">Store Identity</h3>
                                            <p className="text-slate-500 text-sm mb-4">Update your store's public profile.</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-slate-500">Store Name</label>
                                                    <input name="storeName" type="text" defaultValue={storeProfile.name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold uppercase text-slate-500">Tagline</label>
                                                    <input name="tagline" type="text" defaultValue={storeProfile.tagline} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">About Store</label>
                                            <textarea name="description" rows="3" defaultValue={storeProfile.description} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500"></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">Contact Phone</label>
                                            <input name="phone" type="text" defaultValue={storeProfile.phone} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                </Card>
                            </form>
                        </div>
                    )}

                    {/* --- TAB: WALLET (New Advanced Feature) --- */}
                    {activeTab === 'wallet' && (
                        <div className="max-w-4xl space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-black text-slate-900">Wallet & Payouts</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                                    <p className="text-slate-400 font-bold uppercase text-xs tracking-wider mb-2">Available Balance</p>
                                    <h3 className="text-4xl font-black mb-6">₹{totalRevenue.toLocaleString()}.00</h3>
                                    
                                    <div className="flex gap-3">
                                        <Button variant="primary" className="bg-white text-slate-900 hover:bg-slate-100 shadow-none border-none">Withdraw Funds</Button>
                                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:border-white">View History</Button>
                                    </div>
                                </div>

                                <Card className="p-6">
                                    <h3 className="font-bold text-slate-900 mb-4">Payout Methods</h3>
                                    <div className="flex items-center gap-4 p-4 border border-indigo-100 bg-indigo-50 rounded-xl mb-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">HDFC Bank **** 8829</p>
                                            <p className="text-xs text-slate-500">Primary Method</p>
                                        </div>
                                        <Badge color="green">Active</Badge>
                                    </div>
                                    <Button variant="outline" className="w-full border-dashed">Add New Method</Button>
                                </Card>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* --- ADD PRODUCT MODAL --- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-black text-slate-900">Add New Product</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
                        </div>
                        
                        <form onSubmit={handleAddProduct} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors cursor-pointer bg-slate-50">
                                        <UploadCloud className="w-10 h-10 mb-2" />
                                        <span className="text-sm font-bold">Click to upload product image</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Product Name</label>
                                        <input name="name" required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" placeholder="e.g. Neon Sign" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-slate-500">Category</label>
                                        <select name="category" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500">
                                            <option>Tech</option>
                                            <option>Apparel</option>
                                            <option>Home</option>
                                            <option>Office</option>
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
                                <Button type="submit">Create Product</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}