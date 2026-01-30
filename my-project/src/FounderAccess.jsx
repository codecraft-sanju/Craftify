import React, { useState } from 'react';
import { 
  Activity, Users, Store, Wallet, DollarSign, Package, 
  Search, TrendingUp, AlertCircle, CheckCircle, BarChart3,
  ArrowUpRight, MoreVertical, Filter, Download
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "slate" }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

export default function FounderAccess({ users, shops, orders, products }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // --- Analytics Logic ---
    const totalPlatformRevenue = shops.reduce((acc, s) => acc + s.revenue, 0) + orders.reduce((acc, o) => acc + o.total, 0);
    const totalPlatformOrders = shops.reduce((acc, s) => acc + s.totalOrders, 0) + orders.length;
    const averageOrderValue = totalPlatformOrders > 0 ? Math.round(totalPlatformRevenue / totalPlatformOrders) : 0;

    // Filter Logic
    const filteredShops = shops.filter(shop => shop.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.includes(searchQuery));

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
             {/* --- Sidebar --- */}
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
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                        >
                            <item.icon className="w-5 h-5"/> {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl border border-slate-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-slate-900">SC</div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-bold text-white truncate">Sanjay C.</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                    </div>
                </div>
             </aside>

             {/* --- Main Content --- */}
             <main className="flex-1 overflow-auto">
                 {/* Header */}
                 <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
                     <div>
                         <h1 className="text-xl font-black text-slate-900 capitalize">{activeTab} Dashboard</h1>
                         <p className="text-xs text-slate-500">Real-time platform insights</p>
                     </div>
                     <div className="flex items-center gap-4">
                         <div className="relative">
                             <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                             <input 
                                type="text" 
                                placeholder="Search data..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                             />
                         </div>
                         <button className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg border border-slate-200">
                             <Filter className="w-4 h-4" />
                         </button>
                         <button className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg border border-slate-200">
                             <Download className="w-4 h-4" />
                         </button>
                     </div>
                 </header>

                 <div className="p-8 max-w-7xl mx-auto space-y-8">
                     
                     {/* --- OVERVIEW TAB --- */}
                     {activeTab === 'overview' && (
                         <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Total Revenue', val: `₹${totalPlatformRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%' },
                                    { label: 'Active Shops', val: shops.length, icon: Store, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+2' },
                                    { label: 'Total Users', val: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+14%' },
                                    { label: 'Avg. Order Value', val: `₹${averageOrderValue}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+5%' },
                                ].map((stat, i) => (
                                    <Card key={i} className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                                                <ArrowUpRight className="w-3 h-3"/> {stat.trend}
                                            </span>
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
                                        <h3 className="font-bold text-slate-900">Top Performing Shops</h3>
                                        <button className="text-sm text-indigo-600 font-bold hover:underline">View All</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4">Shop Name</th>
                                                    <th className="px-6 py-4">Owner</th>
                                                    <th className="px-6 py-4">Revenue</th>
                                                    <th className="px-6 py-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredShops.map(shop => {
                                                    const owner = users.find(u => u.id === shop.ownerId);
                                                    return (
                                                        <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                                                            <td className="px-6 py-4 font-bold text-slate-900">{shop.name}</td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">{owner?.avatar}</div>
                                                                    {owner?.name || 'Unknown'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 font-bold text-emerald-600">₹{shop.revenue.toLocaleString()}</td>
                                                            <td className="px-6 py-4"><Badge color="green">Active</Badge></td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                                
                                <Card className="p-6">
                                    <h3 className="font-bold text-slate-900 mb-6">Recent Activity</h3>
                                    <div className="space-y-6">
                                        {[1,2,3,4,5].map((_, i) => (
                                            <div key={i} className="flex gap-4 relative">
                                                {i !== 4 && <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-slate-100"></div>}
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white ring-1 ring-slate-100 flex items-center justify-center shrink-0 z-10">
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">New Shop Registration</p>
                                                    <p className="text-xs text-slate-500 mt-1">"TechStore" was approved just now.</p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">2 mins ago</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                         </>
                     )}

                     {/* --- USERS TAB --- */}
                     {activeTab === 'users' && (
                         <Card className="p-0 overflow-hidden">
                             <div className="p-6 border-b border-slate-100">
                                 <h3 className="font-bold text-slate-900 text-lg">User Management</h3>
                                 <p className="text-slate-500 text-sm">View and manage all registered accounts.</p>
                             </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Joined</th>
                                            <th className="px-6 py-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600">{u.avatar}</div>
                                                        <span className="font-bold text-slate-900">{u.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge color={u.role === 'founder' ? 'purple' : u.role === 'seller' ? 'blue' : 'slate'}>
                                                        {u.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">{u.email}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">Jan 30, 2026</td>
                                                <td className="px-6 py-4">
                                                    <button className="text-slate-400 hover:text-indigo-600"><MoreVertical className="w-5 h-5"/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                         </Card>
                     )}
                     
                     {/* Placeholder for other tabs */}
                     {(activeTab === 'shops' || activeTab === 'finances') && (
                         <div className="flex flex-col items-center justify-center h-96 text-center">
                             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                 <AlertCircle className="w-10 h-10 text-slate-400" />
                             </div>
                             <h3 className="font-bold text-slate-900 text-lg">Coming Soon</h3>
                             <p className="text-slate-500 max-w-sm mt-2">The {activeTab} module is currently under development. Check back later.</p>
                         </div>
                     )}
                 </div>
             </main>
        </div>
    );
}