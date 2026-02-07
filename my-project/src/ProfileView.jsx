import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, RefreshCcw, Camera, Loader2, Copy, CheckCircle, CreditCard, User as UserIcon, AlertTriangle } from 'lucide-react';

// --- CONFIGURATION ---
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const API_URL = import.meta.env.VITE_API_URL; // Backend URL

// --- HELPER FUNCTIONS ---
const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

// --- UI COMPONENTS ---
const Button = ({
  children,
  variant = 'primary',
  className = '',
  icon: Icon,
  loading,
  ...props
}) => {
  const base =
    'relative overflow-hidden transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed select-none';
  const variants = {
    primary:
      'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 border border-transparent',
    secondary:
      'bg-white text-slate-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm',
    danger:
      'bg-white text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    indigo:
      'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 border border-transparent',
  };
  const sizes =
    props.size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : props.size === 'lg'
        ? 'px-8 py-4 text-base'
        : 'px-6 py-3 text-sm';

  return (
    <button
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes} ${className}`}
      {...props}
    >
      {loading && <RefreshCcw className="w-4 h-4 animate-spin" />}
      {!loading && Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'slate' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
    green:
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    red: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10',
    slate: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/10',
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
};

// --- MAIN COMPONENT ---
const ProfileView = ({ currentUser, orders, onLogout }) => {
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('cloud_name', CLOUD_NAME);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const cloudinaryData = await cloudinaryRes.json();
      const imageUrl = cloudinaryData.secure_url;

      if (!imageUrl) throw new Error("Cloudinary upload failed");

      // 2. Update Backend
      const backendRes = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: imageUrl }),
        credentials: 'include', 
      });

      if (!backendRes.ok) throw new Error("Backend update failed");

      const updatedUser = await backendRes.json();
      
      // 3. Update Local Storage & Refresh
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      window.location.reload(); 

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to update profile picture.");
      setUploading(false);
    }
  };

  // --- COPY TRANSACTION ID LOGIC ---
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper: Check if avatar is a valid URL (contains http/https)
  const hasValidAvatar = currentUser?.avatar && currentUser.avatar.includes('http');

  return (
    <div className="pt-28 pb-32 max-w-5xl mx-auto px-6">
      {/* Profile Header */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden mb-12 text-center md:text-left group">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-10 group-hover:opacity-15 transition-opacity"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 mt-6">
          
          {/* Avatar Section */}
          <div className="relative group/avatar">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-2xl relative">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden relative">
                
                {/* 1. Loading State */}
                {uploading ? (
                   <Loader2 className="w-10 h-10 animate-spin text-white" />
                ) 
                /* 2. Valid Image URL State */
                : hasValidAvatar ? (
                  <img
                    src={currentUser.avatar}
                    className="w-full h-full object-cover"
                    alt="User"
                  />
                ) 
                /* 3. Fallback: Initials (First Letter) */
                : (
                  <span className="text-5xl font-black text-white select-none">
                     {currentUser?.name?.charAt(0).toUpperCase() || <UserIcon className="w-12 h-12" />}
                  </span>
                )}
                
                {/* Camera Overlay for Upload */}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity duration-300">
                  <Camera className="w-8 h-8 text-white drop-shadow-md" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
            {/* Status Dot */}
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full pointer-events-none"></div>
            {/* Mobile Camera Icon */}
            <div className="md:hidden absolute bottom-0 right-0 pointer-events-none">
                 <div className="bg-slate-900 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                    <Camera className="w-3 h-3" />
                 </div>
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {currentUser?.name}
            </h1>
            <p className="text-slate-500 font-medium text-lg mt-1">
              {currentUser?.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge color="indigo">{currentUser?.role}</Badge>
              <Badge color="slate">Member since {new Date(currentUser?.createdAt || Date.now()).getFullYear()}</Badge>
            </div>
          </div>

          <Button
            onClick={onLogout}
            variant="secondary"
            className="mt-6 md:mt-0 px-8"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Order Section Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Package className="w-5 h-5" />
        </div>
        <h3 className="font-black text-2xl text-slate-900">Order History</h3>
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium text-lg">No orders yet.</p>
            <Link
              to="/shop"
              className="text-indigo-600 font-bold hover:underline mt-2 inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o._id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              {/* Order Info Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-50 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <p className="font-bold text-slate-900 text-lg">
                      Order #{o._id.toString().slice(-6).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(o.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" /> {o.items?.length} Items
                    </span>
                  </div>
                </div>
                
                {/* Status & Paid Badge */}
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    color={
                      o.orderStatus === 'Delivered'
                        ? 'green'
                        : o.orderStatus === 'Shipped'
                          ? 'indigo'
                          : o.orderStatus === 'Cancelled'
                            ? 'red'
                            : 'slate'
                    }
                  >
                    {o.orderStatus || 'Processing'}
                  </Badge>
                  
                  {/* Paid Badge for Online Orders */}
                  {o.paymentInfo?.method === 'Online' && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                      <CheckCircle className="w-3 h-3" /> Paid Online
                    </div>
                  )}
                </div>
              </div>

              {/* Items Section */}
              <div className="flex flex-col gap-6">
                
                {/* Product Images Stack */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-4">
                    {o.items?.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-2xl border-[3px] border-white shadow-md overflow-hidden bg-slate-100 relative z-10 transition-transform group-hover:scale-105"
                      >
                        <img
                          src={item.image || item.coverImage}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      </div>
                    ))}
                    {o.items?.length > 4 && (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border-[3px] border-white flex items-center justify-center text-xs font-bold text-slate-500 shadow-md relative z-0">
                        +{o.items.length - 4}
                      </div>
                    )}
                  </div>
                  {o.items?.length === 1 && (
                    <span className="text-sm font-medium text-slate-700 ml-2">
                      {o.items[0].name}
                    </span>
                  )}
                </div>

                {/* --- PAYMENT DETAILS & TOTAL SECTION --- */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  
                  {/* Transaction ID Display */}
                  <div className="w-full sm:w-auto flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Payment Transaction ID
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-700 font-mono text-sm font-bold">
                        {o.paymentInfo?.transactionId || 'COD / Not Available'}
                      </code>
                      {o.paymentInfo?.transactionId && (
                        <button 
                          onClick={() => copyToClipboard(o.paymentInfo.transactionId)}
                          className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-indigo-600 active:scale-95"
                          title="Copy ID"
                        >
                          {copiedId === o.paymentInfo.transactionId ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                      Total Paid
                    </p>
                    <span className="font-black text-2xl text-slate-900">
                      ₹{o.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- CANCELLATION NOTICE FOR CUSTOMER (INSERTED HERE) --- */}
              {o.orderStatus === 'Cancelled' && (
                  <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 animate-in fade-in">
                      <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-100 rounded-full text-red-600 shrink-0">
                              <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                              <h4 className="text-red-900 font-bold text-sm">Order Cancelled</h4>
                              <p className="text-slate-600 text-xs mt-1 font-medium">
                                  Reason: <span className="text-slate-800">{o.cancellationReason || "Seller cancelled this order."}</span>
                              </p>
                              
                              <div className="mt-3 bg-white p-3 rounded-xl border border-red-100">
                                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Refund Status</p>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                      Your payment will be refunded to the source account within 5-7 business days.
                                  </p>
                                  <p className="text-xs text-slate-600 leading-relaxed mt-2 pt-2 border-t border-slate-100">
                                      If not received, please email your Order ID and Phone Number to:<br/>
                                      <span className="font-bold text-indigo-600 select-all">sanjaychoudhury693@gmail.com</span>
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" className="text-xs h-9">
                  Track Order
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-9">
                  View Invoice
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfileView;