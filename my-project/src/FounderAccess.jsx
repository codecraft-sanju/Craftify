import React, { useState, useEffect } from 'react';
import { 
    Activity, Users, Store, Wallet, DollarSign, Search, TrendingUp, 
    AlertCircle, CheckCircle, ArrowUpRight, UploadCloud, QrCode, X, 
    Loader2, Home, Menu, MoreHorizontal, LogOut, ChevronRight, ShieldCheck,
    Trash2, AlertTriangle, RefreshCcw, LayoutGrid, Edit, ImageIcon, 
    Megaphone, Plus, Eye, EyeOff, Save, Zap, CreditCard, Box, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION FROM .ENV ---
const API_URL = import.meta.env.VITE_API_URL;
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

// --- AESTHETIC REUSABLE COMPONENTS ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-white/90 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "slate", icon: Icon }) => {
  const styles = {
    green: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
    blue: "bg-blue-500/10 text-blue-600 border-blue-200/50",
    slate: "bg-slate-500/10 text-slate-600 border-slate-200/50",
    purple: "bg-violet-500/10 text-violet-600 border-violet-200/50",
    red: "bg-rose-500/10 text-rose-600 border-rose-200/50",
    amber: "bg-amber-500/10 text-amber-600 border-amber-200/50",
  };
  return (
    <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[color] || styles.slate} flex items-center gap-1.5 w-fit`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

const ActionButton = ({ onClick, disabled, variant = "primary", icon: Icon, children, className="" }) => {
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
        ghost: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    };

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${variants[variant]} ${className} px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
            {disabled ? <Loader2 className="w-4 h-4 animate-spin"/> : Icon && <Icon className="w-4 h-4"/>}
            {children}
        </button>
    );
};

// Default images mapping
const DEFAULT_CATEGORY_IMAGES = {
    "All": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop",
    "Electronics": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop",
    "Fashion": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    "Home": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1974&auto=format&fit=crop",
    "Beauty": "https://images.unsplash.com/photo-1522335789203-abd1c1cd9d90?q=80&w=2070&auto=format&fit=crop",
    "Toys": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=2070&auto=format&fit=crop",
    "Books": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop"
};

export default function FounderAccess({ currentUser }) {
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    
    // Data States
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // QR & Payment
    const [myQr, setMyQr] = useState(null);
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState("");
    const [uploadingQr, setUploadingQr] = useState(false);
    
    // Categories
    const [categoryImages, setCategoryImages] = useState(DEFAULT_CATEGORY_IMAGES);
    const [editingCategory, setEditingCategory] = useState(null); 
    const [newCategoryFile, setNewCategoryFile] = useState(null);
    const [uploadingCatImg, setUploadingCatImg] = useState(false);

    // Banners
    const [banners, setBanners] = useState([]); 
    const [isBannerVisible, setIsBannerVisible] = useState(true); 
    const [newBannerFile, setNewBannerFile] = useState(null);
    const [newBannerTitle, setNewBannerTitle] = useState("");
    const [newBannerSubtitle, setNewBannerSubtitle] = useState("");
    const [isBannerUploading, setIsBannerUploading] = useState(false);

    // Batch Delete
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState(0);
    const [deleteStatus, setDeleteStatus] = useState("");

    // Payout Modal
    const [selectedOrderForPayout, setSelectedOrderForPayout] = useState(null);

    const navigate = useNavigate();

    // --- FETCH DATA ---
    const fetchData = async () => {
        if(!currentUser) return;
        setLoading(true);
        const options = { credentials: 'include' };

        try {
            const [usersRes, shopsRes, ordersRes, qrRes, productsRes, categoriesRes, bannersRes] = await Promise.all([
                fetch(`${API_URL}/api/users`, options),
                fetch(`${API_URL}/api/shops`, options),
                fetch(`${API_URL}/api/orders`, options),
                fetch(`${API_URL}/api/users/qr`),
                fetch(`${API_URL}/api/products`),
                fetch(`${API_URL}/api/users/categories`),
                fetch(`${API_URL}/api/users/banners`) 
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (shopsRes.ok) setShops(await shopsRes.json());
            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (productsRes.ok) setProducts(await productsRes.json());
            
            if (qrRes.ok) {
                const data = await qrRes.json();
                setMyQr(data.qrCode);
            }

            if (categoriesRes.ok) {
                const savedCategories = await categoriesRes.json();
                setCategoryImages(prev => ({ ...prev, ...savedCategories }));
            }

            if (bannersRes.ok) {
                const bannerData = await bannersRes.json();
                if(Array.isArray(bannerData)) {
                     setBanners(bannerData);
                } else {
                     setBanners(bannerData.slides || []);
                     setIsBannerVisible(bannerData.isVisible ?? true);
                }
            }

        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    // --- COMPUTED DATA ---
    const rawCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const allCategories = ["All", ...rawCategories].sort((a, b) => {
        if (a === "All") return -1;
        if (b === "All") return 1;
        return a.localeCompare(b);
    });

    const filteredShops = shops.filter(shop => shop.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const totalPlatformRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const platformProfit = Math.round(totalPlatformRevenue * 0.10); 

    // --- HANDLERS (Same Logic as Original) ---
    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: data });
        const cloudData = await res.json();
        return cloudData.secure_url;
    };

    const handleCategoryUpload = async () => {
        if (!newCategoryFile || !editingCategory) return;
        setUploadingCatImg(true);
        try {
            const imageUrl = await uploadToCloudinary(newCategoryFile);
            const backendRes = await fetch(`${API_URL}/api/users/categories`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ category: editingCategory, imageUrl: imageUrl })
            });
            if(backendRes.ok) {
                setCategoryImages(prev => ({ ...prev, [editingCategory]: imageUrl }));
                setEditingCategory(null);
                setNewCategoryFile(null);
            }
        } catch (error) { console.error(error); alert("Upload failed."); } finally { setUploadingCatImg(false); }
    };

    const saveBannerSettings = async (updatedSlides, updatedVisibility) => {
        try {
            await fetch(`${API_URL}/api/users/banners`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isVisible: updatedVisibility, slides: updatedSlides })
            });
        } catch (err) { console.error(err); }
    };

    const handleAddBanner = async () => {
        if (!newBannerFile || !newBannerTitle) return alert("Image and Title are required");
        setIsBannerUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(newBannerFile);
            const newSlide = { image: imageUrl, title: newBannerTitle, subtitle: newBannerSubtitle, isActive: true };
            const updatedBanners = [...banners, newSlide];
            setBanners(updatedBanners);
            await saveBannerSettings(updatedBanners, isBannerVisible);
            setNewBannerFile(null); setNewBannerTitle(""); setNewBannerSubtitle("");
        } catch (error) { console.error(error); } finally { setIsBannerUploading(false); }
    };

    const handleRemoveBanner = async (indexToRemove) => {
        if(!window.confirm("Delete this banner?")) return;
        const updatedBanners = banners.filter((_, idx) => idx !== indexToRemove);
        setBanners(updatedBanners);
        await saveBannerSettings(updatedBanners, isBannerVisible);
    };

    const handleToggleVisibility = async () => {
        const newState = !isBannerVisible;
        setIsBannerVisible(newState);
        await saveBannerSettings(banners, newState);
    };

    const handleShopStatus = async (shopId, status) => {
        const isActive = status === 'verified';
        try {
             const res = await fetch(`${API_URL}/api/shops/${shopId}/status`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ isActive })
             });
             if(res.ok) setShops(prev => prev.map(s => s._id === shopId ? { ...s, isActive } : s));
        } catch (err) { console.error("Failed to update shop status", err); }
    };

    const handleQrUpload = async () => {
        if (!qrFile) return alert("Please select a file first");
        setUploadingQr(true);
        try {
            const qrUrl = await uploadToCloudinary(qrFile);
            const res = await fetch(`${API_URL}/api/users/qr`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                credentials: 'include', body: JSON.stringify({ qrUrl })
            });
            if (res.ok) {
                setMyQr(qrUrl); setQrFile(null); setQrPreview("");
            }
        } catch (error) { console.error(error); } finally { setUploadingQr(false); }
    };

    const handleVerifyPayment = async (orderId) => {
        if(!window.confirm("Confirm payment received? This will mark order as Paid.")) return;
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
            });
            if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true, paymentInfo: { ...o.paymentInfo, status: 'Verified' } } : o));
        } catch (error) { console.error("Verification failed", error); }
    };

    const handleBatchDelete = async () => {
        if (!products || products.length === 0) return alert("No products found to delete.");
        if (!window.confirm("⚠️ DANGER: Delete ALL products? This is IRREVERSIBLE.")) return;
        setIsDeleting(true); setDeleteProgress(0); setDeleteStatus("Initializing cleanup...");
        const allIds = products.map(p => p._id);
        const BATCH_SIZE = 20; 
        try {
            for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
                const batchIds = allIds.slice(i, i + BATCH_SIZE);
                const res = await fetch(`${API_URL}/api/products/batch`, {
                    method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productIds: batchIds }), credentials: 'include'
                });
                if (!res.ok) throw new Error("Batch failed");
                setDeleteProgress(Math.round(((i + batchIds.length) / allIds.length) * 100));
                await new Promise(r => setTimeout(r, 500));
            }
            alert("All products deleted."); fetchData(); 
        } catch (error) { alert("Error during batch deletion."); } finally { setIsDeleting(false); }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.15),transparent_50%)]"></div>
            <div className="flex flex-col items-center gap-4 relative z-10">
                <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
                <p className="text-slate-500 font-medium tracking-wide text-sm animate-pulse">Synchronizing Founder Data...</p>
            </div>
        </div>
    );

    const NavItem = ({ id, label, icon: Icon, isDanger }) => (
        <button 
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl font-bold transition-all duration-300 group relative overflow-hidden ${
                activeTab === id 
                ? isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-white/10 text-white shadow-inner' 
                : isDanger ? 'text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
            {activeTab === id && !isDanger && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
            )}
            <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${activeTab === id ? (isDanger ? 'text-rose-500' : 'text-indigo-300') : ''}`}/> 
            <span className="flex-1 text-left text-sm tracking-wide">{label}</span>
            {activeTab === id && <ChevronRight className="w-4 h-4 opacity-50"/>}
        </button>
    );

    return (
        <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden relative selection:bg-indigo-500/20">
             {/* BACKGROUND DECORATIONS */}
             <div className="fixed inset-0 pointer-events-none">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
             </div>

             {/* MOBILE BACKDROP */}
             {isMobileMenuOpen && (
                 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
             )}

             {/* SIDEBAR */}
             <aside className={`fixed lg:static inset-y-0 left-0 w-[280px] bg-[#0B0F19] text-white flex flex-col shrink-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-50 shadow-2xl lg:shadow-none border-r border-white/5 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* LOGO AREA */}
                <div className="h-28 flex items-center px-8 gap-4 relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white">F</div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block text-white">FounderOS</span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Analytics</p>
                        <BarChart3 className="w-3 h-3 text-slate-600"/>
                    </div>
                    <NavItem id="overview" label="Dashboard" icon={Activity} />
                    <NavItem id="payments" label="Finance & QR" icon={Wallet} />
                    
                    <div className="px-4 py-2 mb-2 mt-8 flex items-center justify-between">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Operations</p>
                         <Box className="w-3 h-3 text-slate-600"/>
                    </div>
                    <NavItem id="shops" label="Vendors" icon={Store} />
                    <NavItem id="users" label="User Base" icon={Users} />
                    
                    <div className="px-4 py-2 mb-2 mt-8 flex items-center justify-between">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Appearance</p>
                         <ImageIcon className="w-3 h-3 text-slate-600"/>
                    </div>
                    <NavItem id="categories" label="Categories" icon={LayoutGrid} />
                    <NavItem id="banners" label="Promotions" icon={Megaphone} />

                    <div className="mt-8 pt-6 border-t border-white/5 mx-2">
                        <NavItem id="danger" label="System Cleanse" icon={AlertTriangle} isDanger={true} />
                    </div>
                </nav>

                {/* USER PROFILE SNIPPET */}
                <div className="p-4 mx-4 mb-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold ring-2 ring-slate-900 shadow-lg">{currentUser?.name?.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-white">{currentUser?.name}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1">Super Admin <ShieldCheck className="w-3 h-3 text-emerald-400"/></p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold text-xs border border-white/5">
                        <LogOut className="w-3 h-3" /> Exit Dashboard
                    </button>
                </div>
             </aside>

             {/* MAIN CONTENT AREA */}
             <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                 
                 {/* FLOATING HEADER */}
                 <header className="h-20 px-6 lg:px-10 flex items-center justify-between shrink-0 transition-all duration-300">
                      <div className="flex items-center gap-4">
                          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                             <Menu className="w-6 h-6" />
                          </button>
                          <div>
                              <h1 className="text-2xl font-black text-slate-900 capitalize tracking-tight flex items-center gap-2">
                                {activeTab} 
                              </h1>
                              <p className="text-xs text-slate-500 font-medium hidden md:block">
                                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                          </div>
                      </div>

                      <div className="flex items-center gap-4">
                          <div className="relative group hidden sm:block">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                             </div>
                             <input 
                                 type="text" 
                                 placeholder="Search..." 
                                 value={searchQuery} 
                                 onChange={(e) => setSearchQuery(e.target.value)} 
                                 className="pl-10 pr-4 py-2.5 bg-white border border-slate-200/60 rounded-full text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 shadow-sm transition-all"
                             />
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm relative">
                              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                              <Activity className="w-5 h-5"/>
                          </div>
                      </div>
                 </header>

                 <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 custom-scrollbar">
                     <div className="max-w-[1600px] mx-auto w-full pb-20 space-y-10">
                         
                         {/* === TAB: OVERVIEW === */}
                         {activeTab === 'overview' && (
                             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                 {/* Stats Grid */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                     {[
                                         { label: 'Total Revenue', val: `₹${totalPlatformRevenue.toLocaleString()}`, icon: DollarSign, from: 'from-emerald-400', to: 'to-emerald-600', shadow: 'shadow-emerald-500/20' },
                                         { label: 'Net Profit', val: `₹${platformProfit.toLocaleString()}`, icon: TrendingUp, from: 'from-blue-400', to: 'to-indigo-600', shadow: 'shadow-blue-500/20' },
                                         { label: 'Pending Payouts', val: `₹${(totalPlatformRevenue - platformProfit).toLocaleString()}`, icon: CreditCard, from: 'from-amber-400', to: 'to-orange-500', shadow: 'shadow-amber-500/20' },
                                         { label: 'Active Users', val: users.length, icon: Users, from: 'from-violet-400', to: 'to-purple-600', shadow: 'shadow-violet-500/20' },
                                     ].map((stat, i) => (
                                         <GlassCard key={i} className="p-6 relative overflow-hidden group border-0">
                                             <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.from} ${stat.to} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-125 duration-700`}></div>
                                             <div className="relative z-10">
                                                 <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.from} ${stat.to} flex items-center justify-center text-white mb-6 shadow-lg ${stat.shadow}`}>
                                                     <stat.icon className="w-6 h-6" />
                                                 </div>
                                                 <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-1">{stat.val}</h3>
                                                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                             </div>
                                         </GlassCard>
                                     ))}
                                 </div>

                                 {/* Recent Orders Table Snippet */}
                                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                     <GlassCard className="xl:col-span-2 flex flex-col min-h-[500px]">
                                         <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                             <div>
                                                 <h3 className="font-bold text-slate-900 text-lg">Recent Transactions</h3>
                                                 <p className="text-slate-500 text-sm">Live feed of incoming orders</p>
                                             </div>
                                             <Badge color="blue" icon={Activity}>Live Feed</Badge>
                                         </div>
                                         <div className="flex-1 overflow-x-auto">
                                            <table className="w-full text-left border-separate border-spacing-y-3 px-4">
                                                <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-4 pb-2">Order ID</th>
                                                        <th className="px-4 pb-2">Customer</th>
                                                        <th className="px-4 pb-2">Amount</th>
                                                        <th className="px-4 pb-2">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders.slice(0, 5).map(order => (
                                                        <tr key={order._id} className="group bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 rounded-xl">
                                                            <td className="px-4 py-4 rounded-l-xl font-mono text-xs text-slate-500">#{order._id.slice(-6)}</td>
                                                            <td className="px-4 py-4 font-bold text-slate-700">{order.shippingAddress?.fullName}</td>
                                                            <td className="px-4 py-4 font-black text-slate-900">₹{order.totalAmount}</td>
                                                            <td className="px-4 py-4 rounded-r-xl">
                                                                <Badge color={order.isPaid ? 'green' : 'amber'}>{order.isPaid ? 'Paid' : 'Pending'}</Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {orders.length === 0 && <div className="p-8 text-center text-slate-400">No recent orders found.</div>}
                                         </div>
                                     </GlassCard>

                                     {/* Quick Action / Mini QR */}
                                     <div className="space-y-6">
                                         <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                             <div className="relative z-10">
                                                 <QrCode className="w-10 h-10 mb-6 text-indigo-400" />
                                                 <h3 className="text-2xl font-bold mb-2">Master QR Code</h3>
                                                 <p className="text-slate-400 text-sm mb-6 leading-relaxed">Ensure your global payment QR is up to date. This is displayed during customer checkout.</p>
                                                 <button onClick={() => setActiveTab('payments')} className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">Manage QR</button>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* === TAB: PAYMENTS === */}
                         {activeTab === 'payments' && (
                             <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-500">
                                 {/* Upload Card */}
                                 <GlassCard className="p-8 h-fit">
                                     <div className="flex items-center gap-3 mb-6">
                                         <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><QrCode className="w-6 h-6"/></div>
                                         <div>
                                             <h3 className="font-bold text-slate-900 text-lg">Update Payment QR</h3>
                                             <p className="text-xs text-slate-500">Accepted formats: PNG, JPG</p>
                                         </div>
                                     </div>
                                     
                                     <div className="group relative aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 hover:border-indigo-400 transition-all flex flex-col items-center justify-center overflow-hidden mb-6 cursor-pointer">
                                         {qrPreview ? (
                                             <img src={qrPreview} className="w-full h-full object-cover p-4 rounded-[2rem]" alt="Preview" />
                                         ) : myQr ? (
                                             <img src={myQr} className="w-full h-full object-cover p-4 rounded-[2rem] opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="Current" />
                                         ) : (
                                             <div className="text-center p-6">
                                                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4 text-indigo-500 group-hover:scale-110 transition-transform"><UploadCloud className="w-8 h-8"/></div>
                                                 <p className="font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">Click to Upload</p>
                                             </div>
                                         )}
                                         <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
                                             if(e.target.files[0]) {
                                                 setQrFile(e.target.files[0]);
                                                 setQrPreview(URL.createObjectURL(e.target.files[0]));
                                             }
                                         }} />
                                     </div>

                                     <ActionButton 
                                        onClick={handleQrUpload} 
                                        disabled={!qrFile || uploadingQr} 
                                        className="w-full py-4 text-sm"
                                        icon={Save}
                                     >
                                        {uploadingQr ? "Uploading..." : "Save New QR Code"}
                                     </ActionButton>
                                 </GlassCard>

                                 {/* Transaction Feed */}
                                 <GlassCard className="xl:col-span-2 flex flex-col h-[700px] p-0 overflow-hidden">
                                     <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                                         <div>
                                             <h3 className="font-bold text-slate-900 text-lg">Payment Verification</h3>
                                             <p className="text-xs text-slate-500 font-medium">Verify UTIs and approve orders manually</p>
                                         </div>
                                         <div className="flex gap-2">
                                             <Badge color="amber">{orders.filter(o => !o.isPaid).length} Pending</Badge>
                                         </div>
                                     </div>
                                     <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-50/50">
                                         <div className="space-y-3">
                                             {orders.map(order => (
                                                 <div key={order._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all flex flex-col md:flex-row items-center justify-between gap-4 group">
                                                     <div className="flex items-center gap-4 w-full md:w-auto">
                                                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${order.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                             {order.isPaid ? <CheckCircle className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
                                                         </div>
                                                         <div>
                                                             <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
                                                             <p className="text-xs text-slate-500 font-mono">ID: {order._id}</p>
                                                         </div>
                                                     </div>

                                                     <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                                         <div className="text-right">
                                                             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount</p>
                                                             <p className="text-lg font-black text-slate-900">₹{order.totalAmount}</p>
                                                         </div>
                                                         
                                                         <div className="bg-slate-100 px-4 py-2 rounded-lg text-xs font-mono text-slate-600 border border-slate-200 select-all">
                                                             {order.paymentInfo?.transactionId || "NO REF ID"}
                                                         </div>

                                                         {order.isPaid ? (
                                                             <ActionButton onClick={() => setSelectedOrderForPayout(order)} variant="secondary" icon={ArrowUpRight}>Payout</ActionButton>
                                                         ) : (
                                                             <ActionButton onClick={() => handleVerifyPayment(order._id)} variant="primary" icon={CheckCircle}>Approve</ActionButton>
                                                         )}
                                                     </div>
                                                 </div>
                                             ))}
                                             {orders.length === 0 && <div className="text-center py-20 text-slate-400">No transactions found.</div>}
                                         </div>
                                     </div>
                                 </GlassCard>
                             </div>
                         )}

                         {/* === TAB: SHOPS === */}
                         {activeTab === 'shops' && (
                             <GlassCard className="p-0 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                                 <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                     <h3 className="font-bold text-slate-900 text-xl">Vendor Management</h3>
                                     <div className="flex gap-2">
                                         <Badge color="green">Verified</Badge>
                                         <Badge color="amber">Pending</Badge>
                                     </div>
                                 </div>
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left">
                                         <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                             <tr>
                                                 <th className="px-8 py-5">Shop Info</th>
                                                 <th className="px-8 py-5">Owner</th>
                                                 <th className="px-8 py-5">Status</th>
                                                 <th className="px-8 py-5 text-right">Actions</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-100">
                                             {filteredShops.map(shop => (
                                                 <tr key={shop._id} className="hover:bg-slate-50/80 transition-colors">
                                                     <td className="px-8 py-5">
                                                         <div className="flex items-center gap-4">
                                                             <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">{shop.name.charAt(0)}</div>
                                                             <div>
                                                                 <div className="font-bold text-slate-900">{shop.name}</div>
                                                                 <div className="text-xs text-slate-400 truncate max-w-[200px]">{shop.description}</div>
                                                             </div>
                                                         </div>
                                                     </td>
                                                     <td className="px-8 py-5 text-sm font-medium text-slate-600">{shop.owner?.name}</td>
                                                     <td className="px-8 py-5">
                                                         <Badge color={shop.isActive ? 'green' : 'amber'} icon={shop.isActive ? ShieldCheck : AlertCircle}>
                                                             {shop.isActive ? 'Active' : 'Pending'}
                                                         </Badge>
                                                     </td>
                                                     <td className="px-8 py-5 text-right">
                                                         <div className="flex justify-end gap-2">
                                                            {!shop.isActive && <ActionButton onClick={() => handleShopStatus(shop._id, 'verified')} variant="primary" className="py-1.5 h-8">Approve</ActionButton>}
                                                            {shop.isActive && <ActionButton onClick={() => handleShopStatus(shop._id, 'rejected')} variant="danger" className="py-1.5 h-8">Suspend</ActionButton>}
                                                         </div>
                                                     </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </GlassCard>
                         )}

                         {/* === TAB: USERS === */}
                         {activeTab === 'users' && (
                             <GlassCard className="p-0 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                                 <div className="p-8 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-xl">User Database</h3></div>
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left">
                                         <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                             <tr><th className="px-8 py-5">Profile</th><th className="px-8 py-5">Role</th><th className="px-8 py-5">Joined</th></tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-100">
                                             {filteredUsers.map(u => (
                                                 <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                                                     <td className="px-8 py-5">
                                                         <div className="flex items-center gap-4">
                                                             <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">{u.name.charAt(0)}</div>
                                                             <div>
                                                                 <div className="font-bold text-slate-900">{u.name}</div>
                                                                 <div className="text-xs text-slate-400">{u.email}</div>
                                                             </div>
                                                         </div>
                                                     </td>
                                                     <td className="px-8 py-5">
                                                         <Badge color={u.role === 'founder' ? 'purple' : u.role === 'seller' ? 'blue' : 'slate'}>{u.role}</Badge>
                                                     </td>
                                                     <td className="px-8 py-5 text-xs text-slate-500 font-mono">{new Date().toLocaleDateString()}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </GlassCard>
                         )}

                         {/* === TAB: CATEGORIES === */}
                         {activeTab === 'categories' && (
                             <div className="animate-in slide-in-from-bottom-8 duration-500">
                                 <div className="mb-8">
                                     <h2 className="text-3xl font-black text-slate-900 mb-2">Category Visuals</h2>
                                     <p className="text-slate-500">Manage the aesthetic representation of product categories.</p>
                                 </div>

                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                     {allCategories.map((cat, idx) => (
                                         <div key={idx} className="group relative bg-white rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer" onClick={() => setEditingCategory(cat)}>
                                             <div className="aspect-[4/5] relative overflow-hidden bg-slate-200">
                                                 <img src={categoryImages[cat] || DEFAULT_CATEGORY_IMAGES[cat] || DEFAULT_CATEGORY_IMAGES["All"]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat} />
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                                 <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                     <Edit className="w-4 h-4 text-white"/>
                                                 </div>
                                             </div>
                                             <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
                                                 <h3 className="font-bold text-white text-lg drop-shadow-md capitalize">{cat}</h3>
                                                 <p className="text-[10px] text-white/80 uppercase font-bold tracking-widest mt-1">{cat === "All" ? products.length : products.filter(p => p.category === cat).length} Items</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {/* === TAB: BANNERS === */}
                         {activeTab === 'banners' && (
                             <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-8">
                                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                     <div>
                                         <h2 className="text-3xl font-black text-slate-900 mb-2">Promotional Banners</h2>
                                         <p className="text-slate-500">Control the main carousel visible to customers.</p>
                                     </div>
                                     <button onClick={handleToggleVisibility} className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isBannerVisible ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-white text-slate-500 shadow-slate-200'}`}>
                                         {isBannerVisible ? <><Eye className="w-4 h-4"/> Live on Site</> : <><EyeOff className="w-4 h-4"/> Hidden</>}
                                     </button>
                                 </div>

                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                     {/* Add Form */}
                                     <GlassCard className="p-6 h-fit border-indigo-100 shadow-xl shadow-indigo-500/5">
                                         <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2 text-lg"><Plus className="w-5 h-5 text-indigo-500"/> Create Promotion</h3>
                                         <div className="space-y-4">
                                             <label className="block aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition-all relative overflow-hidden group">
                                                 {newBannerFile ? <img src={URL.createObjectURL(newBannerFile)} className="w-full h-full object-cover" alt="Preview" /> : (
                                                     <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                                         <ImageIcon className="w-10 h-10 mb-2"/>
                                                         <span className="text-xs font-bold uppercase tracking-wider">Upload Cover</span>
                                                     </div>
                                                 )}
                                                 <input type="file" className="hidden" accept="image/*" onChange={(e) => setNewBannerFile(e.target.files[0])} />
                                             </label>
                                             <input type="text" placeholder="Headline (e.g. Summer Sale)" value={newBannerTitle} onChange={(e) => setNewBannerTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                             <input type="text" placeholder="Subtext (e.g. 50% Off)" value={newBannerSubtitle} onChange={(e) => setNewBannerSubtitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                                             <ActionButton onClick={handleAddBanner} disabled={isBannerUploading} className="w-full py-4 text-sm" icon={Plus}>{isBannerUploading ? "Publishing..." : "Publish Campaign"}</ActionButton>
                                         </div>
                                     </GlassCard>

                                     {/* List */}
                                     <div className="lg:col-span-2 grid gap-4">
                                         {banners.map((banner, idx) => (
                                             <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-5 items-center group">
                                                 <div className="w-48 h-24 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                                                     <img src={banner.image} className="w-full h-full object-cover" alt={banner.title} />
                                                 </div>
                                                 <div className="flex-1">
                                                     <h4 className="font-bold text-slate-900 text-lg">{banner.title}</h4>
                                                     <p className="text-sm text-slate-500">{banner.subtitle}</p>
                                                 </div>
                                                 <button onClick={() => handleRemoveBanner(idx)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
                                             </div>
                                         ))}
                                         {banners.length === 0 && <div className="p-12 text-center text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">No active banners. Add one to get started.</div>}
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* === TAB: DANGER ZONE === */}
                         {activeTab === 'danger' && (
                             <div className="max-w-xl mx-auto animate-in zoom-in-95 duration-500">
                                 <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-10 text-center shadow-2xl shadow-rose-500/10 relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
                                     <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle className="w-10 h-10" /></div>
                                     <h2 className="text-3xl font-black text-slate-900 mb-4">System Cleanse</h2>
                                     <p className="text-slate-600 mb-8 leading-relaxed">This action will permanently delete <strong>{products.length} products</strong> from the database. This is strictly for development resets.</p>
                                     
                                     {!isDeleting ? (
                                         <button onClick={handleBatchDelete} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                                             <Trash2 className="w-5 h-5" /> Confirm Deletion
                                         </button>
                                     ) : (
                                         <div className="w-full bg-white p-4 rounded-xl border border-rose-100">
                                             <div className="h-2 bg-rose-100 rounded-full overflow-hidden mb-2">
                                                 <div className="h-full bg-rose-500 transition-all duration-300" style={{ width: `${deleteProgress}%` }}></div>
                                             </div>
                                             <p className="text-xs font-bold text-rose-600 animate-pulse">{deleteStatus} ({deleteProgress}%)</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )}

                     </div>
                 </div>

                 {/* === MODALS === */}
                 
                 {/* 1. Category Edit Modal */}
                 {editingCategory && activeTab === 'categories' && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setEditingCategory(null)}></div>
                        <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-300 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900">Edit Visual</h3>
                                <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
                            </div>
                            <div className="text-center space-y-6">
                                <div className="w-full aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                                    {newCategoryFile ? <img src={URL.createObjectURL(newCategoryFile)} className="w-full h-full object-cover" /> : <ImageIcon className="w-12 h-12 text-slate-300"/>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setNewCategoryFile(e.target.files[0])} accept="image/*" />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-xs font-bold py-2 translate-y-full group-hover:translate-y-0 transition-transform">Change Image</div>
                                </div>
                                <ActionButton onClick={handleCategoryUpload} disabled={!newCategoryFile || uploadingCatImg} className="w-full py-4 text-sm" icon={Save}>{uploadingCatImg ? "Saving..." : "Update Category"}</ActionButton>
                            </div>
                        </div>
                    </div>
                 )}

                 {/* 2. Payout Modal */}
                 {selectedOrderForPayout && (
                     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                         <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedOrderForPayout(null)}></div>
                         <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
                             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                 <div>
                                     <h3 className="text-lg font-black text-slate-900">Seller Payouts</h3>
                                     <p className="text-xs text-slate-500">Order #{selectedOrderForPayout._id.slice(-6)}</p>
                                 </div>
                                 <button onClick={() => setSelectedOrderForPayout(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400"/></button>
                             </div>
                             <div className="p-6 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/30">
                                 {selectedOrderForPayout.items.map((item, idx) => (
                                     <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)]">
                                         <div className="flex justify-between items-start mb-4">
                                             <div className="flex gap-3">
                                                 <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><Store className="w-5 h-5"/></div>
                                                 <div>
                                                     <p className="font-bold text-slate-900">{item.shop?.name || "Unknown Shop"}</p>
                                                     <p className="text-xs text-slate-500">{item.name} (x{item.qty})</p>
                                                 </div>
                                             </div>
                                             <div className="text-right">
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase">Payout</p>
                                                 <p className="text-lg font-black text-emerald-600">₹{Math.round(item.price * item.qty * 0.90)}</p>
                                             </div>
                                         </div>
                                         {item.shop?.paymentQrCode ? (
                                             <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center border border-dashed border-slate-200">
                                                 <img src={item.shop.paymentQrCode} className="w-32 h-32 object-contain mix-blend-multiply mb-2" alt="QR" />
                                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan to Pay</p>
                                             </div>
                                         ) : (
                                             <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs font-bold">QR Unavailable</div>
                                         )}
                                     </div>
                                 ))}
                             </div>
                             <div className="p-4 bg-white border-t border-slate-100">
                                <ActionButton onClick={() => setSelectedOrderForPayout(null)} className="w-full py-4 text-sm" variant="primary">Close Window</ActionButton>
                             </div>
                         </div>
                     </div>
                 )}

             </main>
        </div>
    );
}