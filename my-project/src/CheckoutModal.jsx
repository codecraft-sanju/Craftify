// src/CheckoutModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, MapPin, Phone, User, Home, ArrowRight, Loader2, ShieldCheck, CreditCard
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

const CheckoutModal = ({ isOpen, onClose, cartTotal, onConfirmOrder, loading, onPincodeChange, hasDiscount, currentUser }) => {
    const [paymentMethod] = useState('Online'); // Always Online for Razorpay

    // Hum formData mein initial state daalenge. Agar User logged in hai, uska naam/phone daal do.
    const [formData, setFormData] = useState({
        fullName: currentUser?.name || '',
        address: '',
        city: '',
        postalCode: '',
        country: 'India',
        phone: currentUser?.phone || ''
    });

    // --- FIX IS HERE: Modal open hote hi DOM elements ka autofill check karenge aur user address ---
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Check 1: Agar state mein pehle se 6-digit postalCode hai.
            if (formData.postalCode && formData.postalCode.toString().length === 6) {
                if (onPincodeChange) onPincodeChange(formData.postalCode);
            } else {
                // Check 2: Browser autofill. Ek chhota delay denge taaki browser autofill kar sake.
                const timer = setTimeout(() => {
                    const pincodeInput = document.querySelector('input[name="postalCode"]');
                    if (pincodeInput && pincodeInput.value && pincodeInput.value.length === 6) {
                        setFormData(prev => ({ ...prev, postalCode: pincodeInput.value }));
                        if (onPincodeChange) onPincodeChange(pincodeInput.value);
                    }
                }, 300); // 300ms delay to let browser fill it
                
                return () => clearTimeout(timer);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, formData.postalCode, onPincodeChange]); 
    // -----------------------------------------------------------------------

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'postalCode' && onPincodeChange) {
            if (value.length === 6) {
                onPincodeChange(value);
            } else if (value.length < 6) {
                onPincodeChange(null); 
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const finalData = {
            shippingAddress: formData,
            paymentInfo: { 
                method: paymentMethod
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
            <div className="bg-white w-full md:max-w-2xl md:rounded-3xl rounded-t-3xl shadow-2xl relative flex flex-col overflow-hidden h-[85vh] md:h-[650px] animate-in slide-in-from-bottom duration-300 z-10">
                
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
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField label="Full Name" icon={User} type="text" name="fullName" placeholder="name" required value={formData.fullName} onChange={handleChange} />
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
                            {/* Is input field me name="postalCode" zaroori hai autofill detect karne ke liye */}
                            <InputField label="Pincode" icon={MapPin} type="text" name="postalCode" id="postalCode" placeholder="400001" maxLength="6" required value={formData.postalCode} onChange={handleChange} />
                        </div>

                        {/* Payment Section */}
                        <div className="pt-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-3 block">Payment Method</label>
                            <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Online Payment</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">Pay securely via Razorpay (UPI, Cards, Netbanking)</p>
                                    </div>
                                </div>
                                <ShieldCheck className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer - Sticky Bottom */}
                <div className="p-4 md:p-6 border-t border-slate-100 bg-white shrink-0 z-20 pb-safe">
                    
                    {/* --- BANNER --- */}
                    {hasDiscount && (
                        <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95 duration-300">
                            <span className="text-base"></span>
                            <span>Local Delivery! 50% OFF on Shipping applied.</span>
                        </div>
                    )}
                    {/* -------------- */}

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
                                <span>Proceed to Pay ₹{cartTotal}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">By proceeding, you agree to our Terms and conditions. Total includes shipping.</p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;