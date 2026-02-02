// src/FounderAccess.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Store, Wallet, DollarSign, Search, TrendingUp, 
  AlertCircle, CheckCircle, ArrowUpRight, UploadCloud, QrCode, X, Loader2, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000";
const CLOUD_NAME = "dvoenforj"; // Your Cloudinary Name
const UPLOAD_PRESET = "salon_preset"; // Your Cloudinary Preset

// ==========================================
// 1. HELPER COMPONENTS
// ==========================================

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>{children}</div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-100",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors[color] || colors.slate}`}>{children}</span>;
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

export default function FounderAccess({ currentUser }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    
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
                fetch(`${API_URL}/api/users/qr`) // Public route for QR
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
                // Optimistic Update
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

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
             
             {/* Sidebar */}
             <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 transition-all duration-300">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold shadow-lg">C</div>
                    <span className="font-bold text-lg tracking-tight">Founder Mode</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'payments', label: 'Payments & QR', icon: DollarSign }, // NEW TAB
                        { id: 'shops', label: 'Manage Shops', icon: Store },
                        { id: 'users', label: 'User Base', icon: Users },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <item.icon className="w-5 h-5"/> {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl mb-4 transition-colors">
                        <Home className="w-5 h-5" /> Back to Site
                    </button>
                </div>
             </aside>

             {/* Main Content */}
             <main className="flex-1 overflow-auto relative">
                 <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
                     <h1 className="text-xl font-black text-slate-900 capitalize">{activeTab} Dashboard</h1>
                     <div className="flex items-center gap-4">
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                             <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64"/>
                         </div>
                     </div>
                 </header>

                 <div className="p-8 max-w-7xl mx-auto space-y-8">
                     
                     {/* TAB: OVERVIEW */}
                     {activeTab === 'overview' && (
                         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                             {[
                                 { label: 'Total Revenue', val: `₹${totalPlatformRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                 { label: 'Platform Profit (10%)', val: `₹${platformProfit.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
                                 { label: 'Pending Payouts', val: `₹${(totalPlatformRevenue - platformProfit).toLocaleString()}`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
                                 { label: 'Active Users', val: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                             ].map((stat, i) => (
                                 <Card key={i} className="p-6">
                                     <div className="flex justify-between items-start mb-4">
                                         <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                                     </div>
                                     <h3 className="text-2xl font-black text-slate-900">{stat.val}</h3>
                                     <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                                 </Card>
                             ))}
                         </div>
                     )}

                     {/* TAB: PAYMENTS & QR (NEW) */}
                     {activeTab === 'payments' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Left: Founder QR Management */}
                            <Card className="p-6 h-fit">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><QrCode className="w-5 h-5 text-indigo-600"/> Payment Collection QR</h3>
                                <p className="text-sm text-slate-500 mb-6">This is the QR code customers scan to pay YOU directly.</p>
                                
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl mb-6">
                                    {qrPreview ? (
                                        <img src={qrPreview} className="w-48 h-48 object-contain mb-4 rounded-lg shadow-sm" alt="New QR" />
                                    ) : myQr ? (
                                        <div className="relative">
                                            <img src={myQr} className="w-48 h-48 object-contain mb-4 rounded-lg bg-white p-2 shadow-sm" alt="Current QR" />
                                            <Badge color="green" className="absolute top-0 right-0">Active</Badge>
                                        </div>
                                    ) : (
                                        <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-bold bg-white rounded-lg mb-4">No QR Set</div>
                                    )}
                                    
                                    <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2 transition-colors">
                                        <UploadCloud className="w-4 h-4" /> 
                                        {qrFile ? "Change File" : "Select QR Image"}
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
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {uploadingQr ? <Loader2 className="w-4 h-4 animate-spin"/> : "Save & Update Global QR"}
                                    </button>
                                )}
                            </Card>

                            {/* Right: Order Verification & Payouts */}
                            <Card className="lg:col-span-2 p-0 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 text-lg">Verify Transactions</h3>
                                    <Badge color="blue">{orders.filter(o => !o.isPaid).length} Pending</Badge>
                                </div>
                                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {orders.map(order => (
                                                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-900">{order.shippingAddress?.fullName}</div>
                                                        <div className="text-xs text-slate-500">Ord #{order._id.slice(-6)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600">₹{order.totalAmount}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 select-all">
                                                            {order.paymentInfo?.transactionId || "N/A"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge color={order.isPaid ? 'green' : 'amber'}>{order.isPaid ? 'Verified' : 'Pending Verification'}</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!order.isPaid ? (
                                                            <button 
                                                                onClick={() => handleVerifyPayment(order._id)}
                                                                className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                                                            >
                                                                Verify & Mark Paid
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setSelectedOrderForPayout(order)}
                                                                className="text-xs font-bold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 ml-auto"
                                                            >
                                                                Pay Seller <ArrowUpRight className="w-3 h-3"/>
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
                         <Card className="p-0 overflow-hidden">
                            <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-lg">Manage Shops</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                        <tr><th className="px-6 py-4">Shop</th><th className="px-6 py-4">Owner</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredShops.map(shop => (
                                            <tr key={shop._id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-bold">{shop.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{shop.owner?.name}</td>
                                                <td className="px-6 py-4"><Badge color={shop.isActive ? 'green' : 'amber'}>{shop.isActive ? 'Verified' : 'Pending'}</Badge></td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    {!shop.isActive && <button onClick={() => handleShopStatus(shop._id, 'verified')} className="text-green-600 font-bold text-xs">Approve</button>}
                                                    {shop.isActive && <button onClick={() => handleShopStatus(shop._id, 'rejected')} className="text-red-600 font-bold text-xs">Suspend</button>}
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
                         <Card className="p-0 overflow-hidden">
                             <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-lg">User Base</h3></div>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-left">
                                     <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                         <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Email</th></tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {filteredUsers.map(u => (
                                             <tr key={u._id} className="hover:bg-slate-50">
                                                 <td className="px-6 py-4 font-bold">{u.name}</td>
                                                 <td className="px-6 py-4"><Badge color={u.role === 'founder' ? 'purple' : 'slate'}>{u.role}</Badge></td>
                                                 <td className="px-6 py-4 text-sm font-mono">{u.email}</td>
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
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                         <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                             <button onClick={() => setSelectedOrderForPayout(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                             <h3 className="text-xl font-black text-slate-900 mb-2">Seller Payout Details</h3>
                             <p className="text-sm text-slate-500 mb-6">Scan the QR below to pay the seller for this order.</p>
                             
                             <div className="space-y-4">
                                 {selectedOrderForPayout.items.map((item, idx) => (
                                     <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                         <div className="flex justify-between items-start mb-3">
                                             <div>
                                                 <p className="font-bold text-slate-900">{item.shop?.name || "Seller"}</p>
                                                 <p className="text-xs text-slate-500">For Item: {item.name}</p>
                                             </div>
                                             <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                                 Pay: ₹{Math.round(item.price * item.qty * 0.90)} 
                                             </span>
                                         </div>
                                         <div className="flex justify-center bg-white p-4 rounded-lg border border-slate-200">
                                             {item.shop?.paymentQrCode ? (
                                                 <img src={item.shop.paymentQrCode} className="w-40 h-40 object-contain" alt="Seller QR" />
                                             ) : (
                                                 <div className="text-center text-slate-400 text-xs py-8">
                                                     <AlertCircle className="w-6 h-6 mx-auto mb-2"/>
                                                     Seller has not uploaded a QR code.
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                 ))}
                             </div>

                             <button onClick={() => setSelectedOrderForPayout(null)} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl mt-6">
                                 Done / Close
                             </button>
                         </div>
                     </div>
                 )}

             </main>
        </div>
    );
}