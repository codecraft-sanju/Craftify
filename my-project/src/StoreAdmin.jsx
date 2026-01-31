// StoreAdmin.jsx
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, ShoppingBag, MessageSquare, Plus, X, 
  Image as ImageIcon, DollarSign, Package, Star, Settings, 
  ChevronRight, Search, UploadCloud, Check, Bell, 
  CreditCard, TrendingUp, Users, Truck, LogOut, Menu, ArrowUpRight, AlertCircle, Store
} from 'lucide-react';

// ==========================================
// 1. MOCK DATA & UTILITIES
// ==========================================

const MOCK_SHOP = {
    _id: "shop_001",
    name: "Urban Vibes Studio",
    tagline: "Custom Streetwear & Neon Art",
    description: "We create personalized hoodies and neon signs for creators and gamers. Based in Mumbai, shipping worldwide.",
    phone: "+91 98765 43210",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop",
    address: "Bandra West, Mumbai",
    rating: 4.8,
    numReviews: 156,
    isActive: true
};

const MOCK_PRODUCTS_INITIAL = [
    { _id: "p1", name: "Custom Neon Sign", category: "Decor", price: 2999, stock: 15, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=800" },
    { _id: "p2", name: "Oversized Tee", category: "Apparel", price: 799, stock: 42, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800" },
    { _id: "p3", name: "Gaming Desk Mat", category: "Tech", price: 1299, stock: 0, image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800" },
    { _id: "p4", name: "Printed Hoodie", category: "Apparel", price: 1499, stock: 20, image: "https://images.unsplash.com/photo-1556906781-9a412961d28c?auto=format&fit=crop&q=80&w=800" }
];

const MOCK_ORDERS = [
    { _id: "ord_9821", customer: { name: "Rahul S.", email: "rahul@gmail.com" }, totalAmount: 2999, orderStatus: "Processing", createdAt: Date.now() - 86400000 },
    { _id: "ord_9822", customer: { name: "Priya K.", email: "priya@yahoo.com" }, totalAmount: 799, orderStatus: "Shipped", createdAt: Date.now() - 172800000 },
    { _id: "ord_9823", customer: { name: "Amit B.", email: "amit.b@outlook.com" }, totalAmount: 4500, orderStatus: "Delivered", createdAt: Date.now() - 432000000 },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

// ==========================================
// 2. UI COMPONENTS
// ==========================================

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:border-slate-50",
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
        indigo: 'bg-indigo-100 text-indigo-700',
        red: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${colors[color]}`}>{children}</span>;
};

// ==========================================
// 3. MAIN STORE ADMIN COMPONENT
// ==========================================

export default function StoreAdmin({ currentUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // --- State for Data ---
    const [shop, setShop] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Simulate Fetching Data ---
    useEffect(() => {
        const fetchStoreData = () => {
            setTimeout(() => {
                // If the user came from the "Launch Your Brand" flow, they might not have a shop yet in reality.
                // But for this frontend demo, we will check if they have a 'shopName' saved in local storage (from registration) 
                // OR we just load the mock shop to show the dashboard capabilities immediately.
                
                // Let's assume for this demo, we load the Mock Shop directly.
                setShop(MOCK_SHOP);
                setProducts(MOCK_PRODUCTS_INITIAL);
                setOrders(MOCK_ORDERS);
                setLoading(false);
            }, 1000); // 1 second delay to feel real
        };
        fetchStoreData();
    }, [currentUser]);

    // --- HANDLERS ---
    
    // Fallback: Create New Shop (Simulated)
    const handleRegisterShop = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        setLoading(true);

        setTimeout(() => {
            const newShop = {
                _id: generateId(),
                name: formData.get('shopName'),
                tagline: "New Store",
                description: formData.get('description'),
                phone: formData.get('phone'),
                image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop",
                isActive: true,
                rating: 0,
                numReviews: 0
            };
            setShop(newShop);
            setProducts([]); // New shop has no products
            setOrders([]);   // New shop has no orders
            setLoading(false);
            alert("Shop Created Successfully!");
        }, 800);
    };

    // Update Existing Shop (Simulated)
    const handleUpdateStore = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        setShop(prev => ({
            ...prev,
            name: formData.get('storeName'),
            tagline: formData.get('tagline'),
            description: formData.get('description'),
            phone: formData.get('phone')
        }));
        
        alert("Store Settings Updated Successfully!");
    };

    // Add New Product (Simulated)
    const handleAddProduct = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const newProduct = {
            _id: generateId(),
            name: formData.get('name'),
            category: formData.get('category'),
            price: Number(formData.get('price')),
            stock: Number(formData.get('stock')),
            description: formData.get('description'),
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", // Default Placeholder
            customizationAvailable: false
        };

        setProducts([newProduct, ...products]);
        setIsAddModalOpen(false);
        alert("Product Added Successfully!");
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

    // --- LOADING STATE ---
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold">Accessing Seller Console...</p>
            </div>
        </div>
    );

    // --- FALLBACK: NO SHOP STATE ---
    if (!shop) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Store className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Final Step: Store Setup</h2>
                        <p className="text-slate-500 mt-2">You are logged in as a seller. Create your store profile to access the dashboard.</p>
                    </div>
                    
                    <form onSubmit={handleRegisterShop} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Name</label>
                            <input name="shopName" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="My Awesome Brand" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Business Phone</label>
                            <input name="phone" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="+91 0000000000" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                            <textarea name="description" required rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="What do you sell?"></textarea>
                        </div>
                        <Button type="submit" className="w-full py-3 mt-4">Create Store & Enter Dashboard</Button>
                    </form>
                </Card>
            </div>
        );
    }

    // --- MAIN DASHBOARD (USER HAS SHOP) ---
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            
            {/* 1. SIDEBAR NAVIGATION */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="h-full flex flex-col p-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/50">C</div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Craftify Admin</h1>
                            <p className="text-xs text-slate-400">Seller Console</p>
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
                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white">
                                {currentUser.name.charAt(0)}
                            </div>
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
                        <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-sm text-slate-600">
                            <span className={`w-2 h-2 rounded-full ${shop.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {shop.isActive ? 'Shop Online' : 'Shop Offline'}
                        </div>
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
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h1 className="text-3xl font-black mb-2 relative z-10">Welcome back, {currentUser.name}!</h1>
                                <p className="opacity-90 max-w-xl relative z-10">Your store <strong>{shop.name}</strong> is performing well. You have {orders.filter(o => o.orderStatus === 'Processing').length} pending orders to fulfill today.</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
                                    { label: 'Total Orders', val: orders.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
                                    { label: 'Products', val: products.length, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
                                    { label: 'Rating', val: shop.rating > 0 ? shop.rating : 'N/A', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
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
                                    {products.length === 0 ? <p className="col-span-full text-center text-slate-400 py-10">No products added yet.</p> : products.map(product => (
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

                    {/* --- TAB: ORDERS --- */}
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
                                                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No orders found.</td></tr>
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

                    {/* --- TAB: STORE SETTINGS --- */}
                    {activeTab === 'settings' && (
                        <div className="max-w-3xl space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-black text-slate-900">Store Settings</h2>
                            
                            <form onSubmit={handleUpdateStore} className="space-y-6">
                                <Card className="p-8">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase text-slate-500">Store Name</label>
                                                <input name="storeName" type="text" defaultValue={shop.name} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold uppercase text-slate-500">Tagline</label>
                                                <input name="tagline" type="text" defaultValue={shop.tagline} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">About Store</label>
                                            <textarea name="description" rows="3" defaultValue={shop.description} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500"></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold uppercase text-slate-500">Contact Phone</label>
                                            <input name="phone" type="text" defaultValue={shop.phone} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-indigo-500" />
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