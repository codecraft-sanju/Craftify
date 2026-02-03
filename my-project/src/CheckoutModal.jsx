// src/CheckoutModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Phone, User, Home, ArrowRight, Loader2, 
  QrCode, AlertCircle, CheckCircle2, ShieldCheck, Wallet 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// --- REUSABLE INPUT COMPONENT ---
const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input 
        {...props} 
        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
      />
    </div>
  </div>
);

const CheckoutModal = ({ isOpen, onClose, cartTotal, onConfirmOrder, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [transactionId, setTransactionId] = useState('');
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

  // Lock Body Scroll when Modal is Open & Fetch QR
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFetchingQr(true);
      fetch(`${API_URL}/api/users/qr`)
            .then(res => res.json())
            .then(data => { if (data.qrCode) setFounderQr(data.qrCode); })
            .catch(err => console.error("Error loading QR:", err))
            .finally(() => setFetchingQr(false));
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'Online' && !transactionId.trim()) {
        alert("Please enter the Payment Transaction ID.");
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

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end md:items-center">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="bg-white w-full md:max-w-5xl md:rounded-3xl rounded-t-3xl shadow-2xl relative flex flex-col md:flex-row overflow-hidden h-[95vh] md:h-[650px] animate-in slide-in-from-bottom duration-300 z-10">
        
        {/* --- LEFT SIDE (DESKTOP: Dark Theme Payment Section) --- */}
        <div className="hidden md:flex w-5/12 bg-slate-900 text-white relative flex-col justify-between p-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">C</div>
                    <span className="font-bold text-lg tracking-tight">Craftify.</span>
                </div>
                <h3 className="text-3xl font-black mb-2">Complete your<br/>Purchase</h3>
                <p className="text-slate-400 text-sm">Scan the QR code to pay securely via any UPI app.</p>
            </div>

            {/* Desktop QR Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                 <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-4">
                    {fetchingQr ? (
                        <div className="w-40 h-40 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
                    ) : founderQr ? (
                        <img src={founderQr} alt="QR" className="w-40 h-40 object-contain" />
                    ) : (
                        <div className="w-40 h-40 flex flex-col items-center justify-center text-slate-400 text-xs"><AlertCircle className="w-6 h-6 mb-2 text-red-400"/><p>QR Not Found</p></div>
                    )}
                 </div>
                 <div className="text-sm font-medium text-slate-300">Total Amount to Pay</div>
                 <div className="text-3xl font-black text-white mt-1">₹{cartTotal}</div>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-green-400" /> 100% Secure Payment
            </div>
        </div>

        {/* --- RIGHT SIDE (Form Section) --- */}
        <div className="w-full md:w-7/12 flex flex-col h-full bg-white">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">Checkout</h2>
                    <p className="text-xs text-slate-500 hidden md:block">Enter your delivery details below</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {/* Mobile QR Section (Only visible on small screens) */}
                <div className="md:hidden mb-8 bg-slate-900 rounded-2xl p-6 text-white text-center shadow-lg shadow-indigo-900/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 flex flex-col items-center">
                         <div className="text-slate-300 text-xs uppercase font-bold tracking-widest mb-2">Total to Pay</div>
                         <div className="text-3xl font-black text-white mb-4">₹{cartTotal}</div>
                         <div className="bg-white p-2 rounded-xl shadow-lg">
                            {fetchingQr ? (
                                <div className="w-32 h-32 flex items-center justify-center"><Loader2 className="w-6 h-6 text-indigo-600 animate-spin" /></div>
                            ) : founderQr ? (
                                <img src={founderQr} alt="QR" className="w-32 h-32 object-contain" />
                            ) : (
                                <div className="w-32 h-32 flex flex-col items-center justify-center text-slate-500 text-[10px]"><AlertCircle className="w-5 h-5 mb-1 text-red-400"/><p>Unavailable</p></div>
                            )}
                         </div>
                    </div>
                </div>

                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputField label="Full Name" icon={User} type="text" name="fullName" placeholder="Sanjay Choudhary" required value={formData.fullName} onChange={handleChange} />
                        <InputField label="Phone Number" icon={Phone} type="tel" name="phone" placeholder="9876543210" maxLength="10" required value={formData.phone} onChange={handleChange} />
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Delivery Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                <Home className="w-5 h-5" />
                            </div>
                            <textarea 
                                name="address" 
                                required 
                                rows="2" 
                                placeholder="Flat No, Building, Street Area" 
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium rounded-xl pl-12 pr-4 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                                value={formData.address} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <InputField label="City" icon={MapPin} type="text" name="city" placeholder="Mumbai" required value={formData.city} onChange={handleChange} />
                        <InputField label="Pincode" icon={MapPin} type="text" name="postalCode" placeholder="400001" maxLength="6" required value={formData.postalCode} onChange={handleChange} />
                    </div>

                    {/* Payment Section */}
                    <div className="pt-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-3 block">Payment Method</label>
                        <div 
                            onClick={() => setPaymentMethod('Online')}
                            className={`relative overflow-hidden cursor-pointer rounded-2xl border-2 transition-all duration-300 p-5 flex items-center gap-4 ${paymentMethod === 'Online' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 bg-white hover:border-indigo-200'}`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === 'Online' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                {paymentMethod === 'Online' && <div className="w-3 h-3 bg-indigo-600 rounded-full animate-scale-in" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-slate-900">UPI / QR Code</h4>
                                    <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md">FASTEST</span>
                                </div>
                                <p className="text-xs text-slate-500">Scan the QR and enter the transaction ID below.</p>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm border border-indigo-50 text-indigo-600">
                                <QrCode className="w-6 h-6" />
                            </div>
                        </div>

                        {/* Transaction ID Input - Animated Reveal */}
                        {paymentMethod === 'Online' && (
                            <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="bg-slate-900 p-4 rounded-xl text-white">
                                    <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-2">Transaction ID / UTR Number</label>
                                    <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                                        <Wallet className="w-4 h-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            value={transactionId} 
                                            onChange={(e) => setTransactionId(e.target.value)} 
                                            placeholder="Enter 12-digit UTR ID here" 
                                            className="w-full bg-transparent outline-none text-sm font-mono text-white placeholder:text-slate-600"
                                            required
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Required for payment verification
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Footer - Sticky Bottom */}
            <div className="p-4 md:p-6 border-t border-slate-100 bg-white shrink-0 z-20 pb-safe">
                <button 
                    form="checkout-form" 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            <span>Pay Securely ₹{cartTotal}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;