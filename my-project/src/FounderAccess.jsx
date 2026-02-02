import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Store, Wallet, DollarSign, Search, TrendingUp, 
  AlertCircle, CheckCircle, ArrowUpRight, MoreVertical, Filter, Download, XCircle, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000";

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
    const [users, setUsers] = useState([]);
    const [shops, setShops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- Fetch Live Data ---
    useEffect(() => {
        const fetchData = async () => {
            // Note: Token check removed. We rely on the cookie existing in the browser.
            // But we check currentUser to ensure React context is ready.
            if(!currentUser) return;
            
            setLoading(true);
            
            // COOKIE UPDATE: credentials: 'include' is mandatory
            const options = { credentials: 'include' };

            try {
                // Fetch all data in parallel
                const [usersRes, shopsRes, ordersRes] = await Promise.all([
                    fetch(`${API_URL}/api/users`, options),
                    fetch(`${API_URL}/api/shops`, options), // Founders see ALL shops
                    fetch(`${API_URL}/api/orders`, options) // Founders see ALL orders
                ]);

                if (usersRes.ok) setUsers(await usersRes.json());
                if (shopsRes.ok) setShops(await shopsRes.json());
                if (ordersRes.ok) setOrders(await ordersRes.json());

            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    // --- Actions ---
    const handleShopStatus = async (shopId, status) => {
        const isActive = status === 'verified';
        try {
             const res = await fetch(`${API_URL}/api/shops/${shopId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Authorization header REMOVED
                },
                credentials: 'include', // COOKIE UPDATE
                body: JSON.stringify({ isActive })
             });

             if(res.ok) {
                 // Optimistic Update
                 setShops(prev => prev.map(s => s._id === shopId ? { ...s, isActive } : s));
             }
        } catch (err) { console.error("Failed to update shop status", err); }
    };

    // --- Analytics Logic ---
    const totalPlatformRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    // Assuming platform takes 10% commission
    const platformProfit = Math.round(totalPlatformRevenue * 0.10); 
    const averageOrderValue = orders.length > 0 ? Math.round(totalPlatformRevenue / orders.length) : 0;
    const activeShopsCount = shops.filter(s => s.isActive).length;

    // Filter Logic
    const filteredShops = shops.filter(shop => shop.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.includes(searchQuery));

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#F8FAFC]"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
             {/* Sidebar */}
             <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 transition-all duration-300">
                <div className="h-20 flex items-center px-6 gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">C</div>
                    <span className="font-bold text-lg tracking-tight">Founder Mode</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'shops', label: 'Manage Shops', icon: Store },
                        { id: 'users', label: 'User Base', icon: Users },
                        { id: 'finances', label: 'Platform Finance', icon: Wallet },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <item.icon className="w-5 h-5"/> {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl mb-4 transition-colors">
                        <Home className="w-5 h-5" /> Back to Site
                    </button>
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-slate-900">{currentUser?.name?.charAt(0)}</div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-bold text-white truncate">{currentUser?.name}</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                    </div>
                </div>
             </aside>

             {/* Main Content */}
             <main className="flex-1 overflow-auto">
                 <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
                     <div>
                         <h1 className="text-xl font-black text-slate-900 capitalize">{activeTab} Dashboard</h1>
                         <p className="text-xs text-slate-500">Real-time platform insights</p>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                             <input type="text" placeholder="Search data..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64"/>
                         </div>
                     </div>
                 </header>

                 <div className="p-8 max-w-7xl mx-auto space-y-8">
                     
                     {/* OVERVIEW TAB */}
                     {activeTab === 'overview' && (
                         <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', val: `₹${totalPlatformRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Live' },
                                    { label: 'Platform Profit', val: `₹${platformProfit.toLocaleString()}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50', trend: '10% Cut' },
                                    { label: 'Total Users', val: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Growing' },
                                    { label: 'Avg. Order Value', val: `₹${averageOrderValue}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Stable' },
                                ].map((stat, i) => (
                                    <Card key={i} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> {stat.trend}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900">{stat.val}</h3>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 p-0 overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-900">Recent Shops</h3>
                                        <button onClick={() => setActiveTab('shops')} className="text-sm text-indigo-600 font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Shop Name</th>
                                                    <th className="px-6 py-4">Owner</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredShops.slice(0, 5).map(shop => (
                                                    <tr key={shop._id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-900">{shop.name}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-600">{shop.owner?.name || 'Unknown'}</td>
                                                        <td className="px-6 py-4"><Badge color={shop.isActive ? 'green' : 'amber'}>{shop.isActive ? 'Verified' : 'Pending'}</Badge></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                                <Card className="p-6">
                                    <h3 className="font-bold text-slate-900 mb-6">Live Activity</h3>
                                    <div className="space-y-6">
                                        {orders.slice(0, 5).map((order, i) => (
                                            <div key={i} className="flex gap-4 relative">
                                                {i !== 4 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-slate-100"></div>}
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center shrink-0 z-10"><div className="w-2 h-2 bg-indigo-600 rounded-full"></div></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">New Order: ₹{order.totalAmount}</p>
                                                    <p className="text-xs text-slate-500 mt-1">by {order.customer?.name || 'Guest'}</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                         </>
                     )}

                     {/* SHOPS TAB */}
                     {activeTab === 'shops' && (
                         <Card className="p-0 overflow-hidden">
                            <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-lg">Manage Shops</h3></div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Shop Details</th>
                                                <th className="px-6 py-4">Owner Contact</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4">Actions</th>
                                            </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredShops.map(shop => (
                                            <tr key={shop._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900">{shop.name}</div>
                                                    <div className="text-xs text-slate-500">ID: {shop._id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <div>{shop.owner?.name}</div>
                                                    <div className="text-xs text-slate-400">{shop.owner?.email}</div>
                                                </td>
                                                <td className="px-6 py-4"><Badge color={shop.isActive ? 'green' : 'amber'}>{shop.isActive ? 'Verified' : 'Pending'}</Badge></td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {!shop.isActive && <button onClick={() => handleShopStatus(shop._id, 'verified')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve"><CheckCircle className="w-5 h-5"/></button>}
                                                        {shop.isActive && <button onClick={() => handleShopStatus(shop._id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Suspend"><XCircle className="w-5 h-5"/></button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         </Card>
                     )}
                     
                     {/* USERS TAB */}
                     {activeTab === 'users' && (
                         <Card className="p-0 overflow-hidden">
                             <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-lg">User Management</h3></div>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-left">
                                     <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                         <tr>
                                             <th className="px-6 py-4">User</th>
                                             <th className="px-6 py-4">Role</th>
                                             <th className="px-6 py-4">Email</th>
                                             <th className="px-6 py-4">Joined</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-slate-100">
                                         {filteredUsers.map(u => (
                                             <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                                                 <td className="px-6 py-4 flex items-center gap-3">
                                                     <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600">{u.avatar || u.name.charAt(0)}</div>
                                                     <span className="font-bold text-slate-900">{u.name}</span>
                                                 </td>
                                                 <td className="px-6 py-4"><Badge color={u.role === 'founder' ? 'purple' : u.role === 'seller' ? 'blue' : 'slate'}>{u.role}</Badge></td>
                                                 <td className="px-6 py-4 text-sm text-slate-600 font-mono">{u.email}</td>
                                                 <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         </Card>
                     )}

                     {/* FINANCES TAB */}
                     {activeTab === 'finances' && (
                        <div className="grid grid-cols-1 gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="p-6 bg-slate-900 text-white border-slate-800">
                                    <p className="text-slate-400 text-sm mb-1">Total Platform Revenue</p>
                                    <h3 className="text-3xl font-black">₹{totalPlatformRevenue.toLocaleString()}</h3>
                                    <p className="text-xs text-slate-500 mt-2">Gross Volume</p>
                                </Card>
                                <Card className="p-6 bg-indigo-600 text-white border-indigo-500">
                                    <p className="text-indigo-200 text-sm mb-1">Your Net Profit (10%)</p>
                                    <h3 className="text-3xl font-black">₹{platformProfit.toLocaleString()}</h3>
                                    <p className="text-xs text-indigo-200 mt-2">Pure Income</p>
                                </Card>
                                <Card className="p-6 bg-white border-slate-200">
                                    <p className="text-slate-500 text-sm mb-1">Seller Payouts Pending</p>
                                    <h3 className="text-3xl font-black text-slate-900">₹{(totalPlatformRevenue - platformProfit).toLocaleString()}</h3>
                                    <p className="text-xs text-slate-400 mt-2">To be disbursed</p>
                                </Card>
                            </div>

                            <Card className="p-0 overflow-hidden">
                                <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-900 text-lg">Recent Financial Transactions</h3></div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                            <tr>
                                                <th className="px-6 py-4">Transaction ID</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Platform Fee</th>
                                                <th className="px-6 py-4">Seller Payout</th>
                                                <th className="px-6 py-4">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {orders.map(o => (
                                                <tr key={o._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">TXN-{o._id.slice(-8).toUpperCase()}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-900">₹{o.totalAmount}</td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">+ ₹{Math.round(o.totalAmount * 0.10)}</td>
                                                    <td className="px-6 py-4 text-slate-600">₹{Math.round(o.totalAmount * 0.90)}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                     )}
                 </div>
             </main>
        </div>
    );
}