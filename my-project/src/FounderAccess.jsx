// src/FounderAccess.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Store, Wallet, DollarSign, Search, TrendingUp, 
  AlertCircle, CheckCircle, ArrowUpRight, UploadCloud, QrCode, X, Loader2, Home, Menu, MoreHorizontal, LogOut, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- CONFIGURATION FROM .ENV ---
const API_URL = import.meta.env.VITE_API_URL;
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 ${className}`}>{children}</div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    red: "bg-red-50 text-red-600 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${colors[color] || colors.slate}`}>{children}</span>;
};

export default function FounderAccess({ currentUser }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    
    // Data States
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // QR & Payment States
    const [myQr, setMyQr] = useState(null);
    const [qrFile, setQrFile] = useState(null);
    const [qrPreview, setQrPreview] = useState("");
    const [uploadingQr, setUploadingQr] = useState(false);
    
    // Payout Modal State
    const [selectedOrderForPayout, setSelectedOrderForPayout] = useState(null);

    const navigate = useNavigate();

    // --- Fetch Live Data ---
    const fetchData = async () => {
        if(!currentUser) return;
        setLoading(true);
        const options = { credentials: 'include' };

        try {
            const [usersRes, shopsRes, ordersRes, qrRes] = await Promise.all([
                fetch(`${API_URL}/api/users`, options),
                fetch(`${API_URL}/api/shops`, options),
                fetch(`${API_URL}/api/orders`, options),
                fetch(`${API_URL}/api/users/qr`) 
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (shopsRes.ok) setShops(await shopsRes.json());
            if (ordersRes.ok) setOrders(await ordersRes.json());
            if (qrRes.ok) {
                const data = await qrRes.json();
                setMyQr(data.qrCode);
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

    // --- Action: Update Shop Status ---
    const handleShopStatus = async (shopId, status) => {
        const isActive = status === 'verified';
        try {
             const res = await fetch(`${API_URL}/api/shops/${shopId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isActive })
             });

             if(res.ok) {
                 setShops(prev => prev.map(s => s._id === shopId ? { ...s, isActive } : s));
             }
        } catch (err) { console.error("Failed to update shop status", err); }
    };

    // --- Action: Upload Founder QR ---
    const handleQrUpload = async () => {
        if (!qrFile) return alert("Please select a file first");
        setUploadingQr(true);
        try {
            // 1. Upload to Cloudinary
            const data = new FormData();
            data.append("file", qrFile);
            data.append("upload_preset", UPLOAD_PRESET);
            data.append("cloud_name", CLOUD_NAME);

            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST", body: data
            });
            const cloudData = await cloudRes.json();
            const qrUrl = cloudData.secure_url;

            // 2. Save to Backend
            const res = await fetch(`${API_URL}/api/users/qr`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ qrUrl })
            });

            if (res.ok) {
                setMyQr(qrUrl);
                setQrFile(null);
                setQrPreview("");
                alert("Payment QR Updated Successfully!");
            }
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        } finally {
            setUploadingQr(false);
        }
    };

    // --- Action: Verify Customer Payment ---
    const handleVerifyPayment = async (orderId) => {
        if(!window.confirm("Confirm payment received? This will mark order as Paid.")) return;
        
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (res.ok) {
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, isPaid: true, paymentInfo: { ...o.paymentInfo, status: 'Verified' } } : o));
            }
        } catch (error) {
            console.error("Verification failed", error);
        }
    };

    // --- Filtering ---
    const filteredShops = shops.filter(shop => shop.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // --- Analytics ---
    const totalPlatformRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const platformProfit = Math.round(totalPlatformRevenue * 0.10); 

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin"/></div>;

    // --- Nav Item Component ---
    const NavItem = ({ id, label, icon: Icon }) => (
        <button 
            onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-300 group ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        >
            <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}/> 
            <span className="flex-1 text-left">{label}</span>
            {activeTab === id && <ChevronRight className="w-4 h-4 opacity-50"/>}
        </button>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative">
             
             {/* MOBILE SIDEBAR BACKDROP */}
             {isMobileMenuOpen && (
                 <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
             )}

             {/* SIDEBAR (Responsive) */}
             <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-[#0F172A] text-white flex flex-col shrink-0 transition-transform duration-300 z-50 shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-24 flex items-center px-8 gap-3 bg-slate-950/50">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xl shadow-indigo-500/30">C</div>
                    <div>
                        <span className="font-black text-xl tracking-tight block">Founder.</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Super Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Analytics</p>
                    <NavItem id="overview" label="Overview" icon={Activity} />
                    <NavItem id="payments" label="Transactions & QR" icon={DollarSign} />
                    
                    <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 mt-8">Management</p>
                    <NavItem id="shops" label="Manage Shops" icon={Store} />
                    <NavItem id="users" label="User Base" icon={Users} />
                </nav>

                <div className="p-6 bg-slate-950/30 border-t border-white/5">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-slate-900">{currentUser?.name?.charAt(0)}</div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-white">{currentUser?.name}</p>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified Admin</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-bold text-xs uppercase tracking-wide">
                        <Home className="w-4 h-4" /> Return Home
                    </button>
                </div>
             </aside>

             {/* MAIN CONTENT */}
             <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                 
                 {/* Header */}
                 <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-8 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-4">
                         <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            <Menu className="w-6 h-6" />
                         </button>
                         <h1 className="text-xl font-black text-slate-900 capitalize hidden md:block tracking-tight">{activeTab}</h1>
                     </div>

                     <div className="flex items-center gap-4">
                         <div className="relative group">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                             <input 
                                type="text" 
                                placeholder="Search database..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="pl-10 pr-4 py-2.5 bg-slate-100 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm font-bold outline-none w-40 md:w-64 transition-all text-slate-900"
                             />
                         </div>
                     </div>
                 </header>

                 <div className="flex-1 overflow-auto p-4 lg:p-8 space-y-8 custom-scrollbar">
                     <div className="max-w-7xl mx-auto w-full pb-20">
                         
                         {/* TAB: OVERVIEW */}
                         {activeTab === 'overview' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                                 {[
                                     { label: 'Total Revenue', val: `₹${totalPlatformRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                     { label: 'Platform Profit', val: `₹${platformProfit.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
                                     { label: 'Pending Payouts', val: `₹${(totalPlatformRevenue - platformProfit).toLocaleString()}`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                                     { label: 'Total Users', val: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                                 ].map((stat, i) => (
                                     <Card key={i} className="p-6 relative overflow-hidden group cursor-pointer border-0 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
                                         <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                                         <div className="relative z-10">
                                             <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} mb-4 shadow-sm`}>
                                                 <stat.icon className="w-6 h-6" />
                                             </div>
                                             <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.val}</h3>
                                             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                                         </div>
                                     </Card>
                                 ))}
                             </div>
                         )}

                         {/* TAB: PAYMENTS & QR */}
                         {activeTab === 'payments' && (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                                
                                {/* Left: Founder QR Management */}
                                <Card className="p-8 h-fit border-0 shadow-lg shadow-slate-200/50">
                                    <h3 className="font-bold text-xl mb-2 flex items-center gap-2 text-slate-900"><QrCode className="w-6 h-6 text-indigo-600"/> Master Payment QR</h3>
                                    <p className="text-sm text-slate-500 mb-8 leading-relaxed">Upload your personal QR code here. This will be shown to customers during checkout for direct payments.</p>
                                    
                                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-[2rem] mb-6 transition-all group">
                                        {qrPreview ? (
                                            <img src={qrPreview} className="w-48 h-48 object-contain mb-4 rounded-xl shadow-lg bg-white p-2" alt="New QR" />
                                        ) : myQr ? (
                                            <div className="relative group-hover:scale-105 transition-transform duration-300">
                                                <img src={myQr} className="w-48 h-48 object-contain mb-4 rounded-xl bg-white p-2 shadow-lg border border-slate-100" alt="Current QR" />
                                                <div className="absolute -top-2 -right-2"><Badge color="green">Active</Badge></div>
                                            </div>
                                        ) : (
                                            <div className="w-48 h-48 flex flex-col items-center justify-center text-slate-400 font-bold bg-white rounded-xl mb-4 shadow-inner border border-slate-100">
                                                <UploadCloud className="w-10 h-10 mb-2 opacity-50"/>
                                                <span>No QR Set</span>
                                            </div>
                                        )}
                                        
                                        <label className="cursor-pointer bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-700 font-bold py-3 px-6 rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm">
                                            <UploadCloud className="w-4 h-4" /> 
                                            {qrFile ? "Change Selected File" : "Select QR Image"}
                                            <input type="file" className="hidden" onChange={(e) => {
                                                if(e.target.files[0]) {
                                                    setQrFile(e.target.files[0]);
                                                    setQrPreview(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }} accept="image/*" />
                                        </label>
                                    </div>

                                    {qrFile && (
                                        <button 
                                            onClick={handleQrUpload} 
                                            disabled={uploadingQr}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl shadow-slate-900/20 transition-all"
                                        >
                                            {uploadingQr ? <Loader2 className="w-5 h-5 animate-spin"/> : "Save & Update Global QR"}
                                        </button>
                                    )}
                                </Card>

                                {/* Right: Transactions Table */}
                                <Card className="xl:col-span-2 p-0 overflow-hidden flex flex-col h-[600px] border-0 shadow-lg shadow-slate-200/50">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Transaction Feed</h3>
                                            <p className="text-xs text-slate-500 font-medium">Verify customer payments manually</p>
                                        </div>
                                        <Badge color="blue">{orders.filter(o => !o.isPaid).length} Pending</Badge>
                                    </div>
                                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/80 text-xs font-bold text-slate-500 uppercase sticky top-0 backdrop-blur-sm z-10">
                                                <tr>
                                                    <th className="px-6 py-4">Customer</th>
                                                    <th className="px-6 py-4">Amount</th>
                                                    <th className="px-6 py-4">UTR / Ref ID</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {orders.map(order => (
                                                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{order.shippingAddress?.fullName}</div>
                                                            <div className="text-xs text-slate-400 font-mono">#{order._id.slice(-6)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 font-black text-slate-700">₹{order.totalAmount}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 select-all font-medium">
                                                                {order.paymentInfo?.transactionId || "---"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge color={order.isPaid ? 'green' : 'amber'}>{order.isPaid ? 'Verified' : 'Review Needed'}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {!order.isPaid ? (
                                                                <button 
                                                                    onClick={() => handleVerifyPayment(order._id)}
                                                                    className="text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                                                                >
                                                                    Approve
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => setSelectedOrderForPayout(order)}
                                                                    className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-1 ml-auto shadow-sm"
                                                                >
                                                                    Payout <ArrowUpRight className="w-3 h-3"/>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                         )}

                         {/* TAB: SHOPS */}
                         {activeTab === 'shops' && (
                             <Card className="p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 border-0 shadow-lg shadow-slate-200/50">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 text-lg">Shop Verification Queue</h3>
                                    <div className="flex gap-2 text-xs font-bold text-slate-500">
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Active</span>
                                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> Pending</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                            <tr><th className="px-6 py-4">Shop Name</th><th className="px-6 py-4">Owner</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredShops.map(shop => (
                                                <tr key={shop._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{shop.name}</div>
                                                        <div className="text-xs text-slate-400 font-medium">{shop.description?.substring(0,30)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{shop.owner?.name}</td>
                                                    <td className="px-6 py-4"><Badge color={shop.isActive ? 'green' : 'amber'}>{shop.isActive ? 'Live' : 'Pending'}</Badge></td>
                                                    <td className="px-6 py-4 flex gap-3">
                                                        {!shop.isActive && <button onClick={() => handleShopStatus(shop._id, 'verified')} className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">Approve</button>}
                                                        {shop.isActive && <button onClick={() => handleShopStatus(shop._id, 'rejected')} className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors">Suspend</button>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </Card>
                         )}

                         {/* TAB: USERS */}
                         {activeTab === 'users' && (
                             <Card className="p-0 overflow-hidden animate-in slide-in-from-bottom-4 duration-500 border-0 shadow-lg shadow-slate-200/50">
                                 <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-lg">Registered Users</h3></div>
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left">
                                         <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                             <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Joined</th></tr>
                                         </thead>
                                         <tbody className="divide-y divide-slate-100">
                                             {filteredUsers.map(u => (
                                                 <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                     <td className="px-6 py-4">
                                                         <div className="flex items-center gap-3">
                                                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">{u.name.charAt(0)}</div>
                                                             <div>
                                                                 <div className="font-bold text-slate-900">{u.name}</div>
                                                                 <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                                                             </div>
                                                         </div>
                                                     </td>
                                                     <td className="px-6 py-4"><Badge color={u.role === 'founder' ? 'purple' : u.role === 'seller' ? 'blue' : 'slate'}>{u.role}</Badge></td>
                                                     <td className="px-6 py-4 text-xs text-slate-500 font-mono">{new Date().toLocaleDateString()}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </Card>
                         )}
                     </div>

                     {/* SELLER PAYOUT MODAL */}
                     {selectedOrderForPayout && (
                         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrderForPayout(null)}></div>
                             <div className="bg-white rounded-[2rem] w-full max-w-lg p-0 shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[85vh]">
                                 
                                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                     <div>
                                         <h3 className="text-xl font-black text-slate-900">Release Payout</h3>
                                         <p className="text-xs text-slate-500 font-medium">Distribute funds to sellers involved in this order.</p>
                                     </div>
                                     <button onClick={() => setSelectedOrderForPayout(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500"/></button>
                                 </div>
                                 
                                 <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                                     {selectedOrderForPayout.items.map((item, idx) => (
                                         <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-colors">
                                             <div className="flex justify-between items-start mb-4">
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center"><Store className="w-5 h-5 text-slate-400"/></div>
                                                     <div>
                                                         <p className="font-bold text-slate-900 text-sm">{item.shop?.name || "Unknown Seller"}</p>
                                                         <p className="text-xs text-slate-500 font-medium">{item.name} (x{item.qty})</p>
                                                     </div>
                                                 </div>
                                                 <div className="text-right">
                                                     <span className="block text-xs text-slate-400 uppercase font-bold">Payout Amount</span>
                                                     <span className="block font-black text-emerald-600 text-lg">₹{Math.round(item.price * item.qty * 0.90)}</span>
                                                 </div>
                                             </div>

                                             <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-center justify-center border border-dashed border-slate-300">
                                                 {item.shop?.paymentQrCode ? (
                                                     <>
                                                         <img src={item.shop.paymentQrCode} className="w-40 h-40 object-contain mb-3 mix-blend-multiply" alt="Seller QR" />
                                                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan to Pay Seller</p>
                                                     </>
                                                 ) : (
                                                     <div className="text-center text-slate-400 py-4">
                                                         <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                                                         <p className="text-xs font-medium">QR Unavailable</p>
                                                         <p className="text-[10px]">Seller hasn't uploaded a payment QR yet.</p>
                                                     </div>
                                                 )}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 
                                 <div className="p-4 border-t border-slate-100 bg-white">
                                     <button onClick={() => setSelectedOrderForPayout(null)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all">
                                         Done / Close Window
                                     </button>
                                 </div>
                             </div>
                         </div>
                     )}

                 </div>
             </main>
        </div>
    );
}