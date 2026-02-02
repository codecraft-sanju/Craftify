// src/CheckoutModal.jsx
import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Home, ArrowRight, Loader2, QrCode, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_URL = "http://localhost:5000";

const CheckoutModal = ({ isOpen, onClose, cartTotal, onConfirmOrder, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [transactionId, setTransactionId] = useState('');
  
  // State for Dynamic Founder QR
  const [founderQr, setFounderQr] = useState(null);
  const [fetchingQr, setFetchingQr] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
        setFetchingQr(true);
        fetch(`${API_URL}/api/users/qr`)
            .then(res => res.json())
            .then(data => {
                if (data.qrCode) setFounderQr(data.qrCode);
            })
            .catch(err => console.error("Error loading QR:", err))
            .finally(() => setFetchingQr(false));
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'Online' && !transactionId.trim()) {
        alert("Please enter the Transaction ID / UTR Number to confirm payment.");
        return;
    }
    const finalData = {
        shippingAddress: formData,
        paymentInfo: { 
            method: paymentMethod, 
            transactionId: paymentMethod === 'Online' ? transactionId : null 
        }
    };
    onConfirmOrder(finalData);
  };

  if (!isOpen) return null;

  // --- REUSABLE QR COMPONENT (For both Mobile & Desktop Views) ---
  const QrSection = ({ isMobile }) => (
    <div className={`${isMobile ? 'bg-slate-900 p-6 rounded-2xl mb-6 text-white text-center' : 'h-full flex flex-col items-center justify-center p-8 text-center'}`}>
        {!isMobile && <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>}
        
        <div className="relative z-10 w-full">
            <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Secure Payment</h3>
                <p className="text-slate-400 text-xs">Total: <span className="text-white font-bold text-base">₹{cartTotal}</span></p>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-xl inline-block mb-6 relative">
                {fetchingQr ? (
                    <div className="w-40 h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
                ) : founderQr ? (
                    <img src={founderQr} alt="Payment QR" className="w-40 h-40 object-contain" />
                ) : (
                    <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-500 text-[10px]"><AlertCircle className="w-6 h-6 mb-2 text-red-400"/><p>QR Unavailable</p></div>
                )}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">SCAN TO PAY</div>
            </div>

            <div className="w-full bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 backdrop-blur-sm text-left">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Required: Transaction ID / UTR</label>
                <div className="flex items-center gap-2 bg-slate-900 rounded-lg border border-slate-600 focus-within:border-indigo-500 transition-colors px-3 py-2.5">
                    <span className="text-slate-500 font-mono">#</span>
                    <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter 12-digit UTR ID" className="w-full bg-transparent text-white outline-none font-mono text-sm placeholder:text-slate-600" />
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* MODAL CONTAINER */}
      {/* Mobile: Full height bottom sheet style | Desktop: Centered Box */}
      <div className="bg-white w-full md:w-full md:max-w-5xl md:rounded-3xl rounded-t-3xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden h-[90vh] md:h-[600px]">
        
        {/* --- DESKTOP LEFT SIDE (Hidden on Mobile) --- */}
        <div className="hidden md:flex w-5/12 bg-slate-900 text-white relative">
            <QrSection isMobile={false} />
        </div>

        {/* --- RIGHT SIDE / MOBILE CONTAINER --- */}
        <div className="w-full md:w-7/12 flex flex-col h-full bg-white relative">
            
            {/* 1. Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-20 shrink-0">
                <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-600" /> Checkout</h2>
                    <p className="text-xs text-slate-500">Complete your order details</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                
                {/* --- MOBILE ONLY: QR SECTION (Visible inside scroll on mobile) --- */}
                <div className="md:hidden">
                    <QrSection isMobile={true} />
                </div>

                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase ml-1 mb-1 block">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="text" name="fullName" required placeholder="John Doe" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm" value={formData.fullName} onChange={handleChange} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 uppercase ml-1 mb-1 block">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="tel" name="phone" required placeholder="9876543210" maxLength="10" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase ml-1 mb-1 block">Delivery Address</label>
                        <div className="relative">
                            <Home className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <textarea name="address" required rows="2" placeholder="Flat No, Building, Street Area" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm resize-none" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    {/* City & Pincode */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-700 uppercase ml-1 mb-1 block">City</label>
                            <input type="text" name="city" required placeholder="Mumbai" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm" value={formData.city} onChange={handleChange} />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-700 uppercase ml-1 mb-1 block">Pincode</label>
                            <input type="text" name="postalCode" required placeholder="400001" maxLength="6" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm" value={formData.postalCode} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Payment Mode Selection */}
                    <div className="pt-2">
                        <label className="text-xs font-bold text-slate-700 uppercase ml-1 mb-2 block">Payment Method</label>
                        <div 
                            onClick={() => setPaymentMethod('Online')}
                            className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Online' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}
                        >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'Online' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                {paymentMethod === 'Online' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                            </div>
                            <div className="ml-3 flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-100"><QrCode className="w-5 h-5"/></div>
                                <div><p className="font-bold text-slate-900 text-sm">Pay Online (QR/UPI)</p><p className="text-xs text-slate-500">Scan QR & Enter Transaction ID</p></div>
                            </div>
                            <div className="ml-auto">{paymentMethod === 'Online' && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}</div>
                        </div>
                    </div>
                </form>
            </div>

            {/* 3. Footer (Fixed at Bottom) */}
            <div className="p-5 border-t border-slate-100 bg-white shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                    <div><span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Amount</span><div className="text-2xl font-black text-slate-900">₹{cartTotal}</div></div>
                </div>
                <button form="checkout-form" type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm & Pay <ArrowRight className="w-5 h-5" /></>}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;