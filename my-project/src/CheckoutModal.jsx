import React, { useState } from 'react';
import { X, MapPin, Phone, User, Home,  ArrowRight, Loader2, CreditCard } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, cartTotal, onConfirmOrder, loading }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Data parent component (App.jsx) ko bhej denge API call ke liye
    onConfirmOrder(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div>
             <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
               <MapPin className="w-5 h-5 text-indigo-600" /> Shipping Details
             </h2>
             <p className="text-xs text-slate-500 mt-1">Where should we deliver your order?</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
             <X className="w-5 h-5 text-slate-500" />
           </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="p-6 overflow-y-auto">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase ml-1">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  name="fullName"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone Number (Critical) */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase ml-1">Phone Number</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase ml-1">Flat / House / Street</label>
              <div className="relative mt-1">
                <Home className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea 
                  name="address"
                  required
                  rows="2"
                  placeholder="e.g. B-404, Galaxy Apartments, MG Road"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* City & Pincode Row */}
            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1">City</label>
                  <input 
                    type="text" 
                    name="city"
                    required
                    placeholder="Mumbai"
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.city}
                    onChange={handleChange}
                  />
               </div>
               <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 uppercase ml-1">Pincode</label>
                  <input 
                    type="text" 
                    name="postalCode"
                    required
                    placeholder="400001"
                    maxLength="6"
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
               </div>
            </div>

            {/* Payment Method Preview */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-indigo-900">Payment Method</p>
                        <p className="text-xs text-indigo-700">Card / Online Payment</p>
                    </div>
                </div>
                <span className="text-xs font-bold bg-white px-2 py-1 rounded text-indigo-600">Selected</span>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white">
           <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium">Total to Pay</span>
              <span className="text-2xl font-black text-slate-900">₹{cartTotal}</span>
           </div>
           
           <button 
             form="checkout-form"
             type="submit" 
             disabled={loading}
             className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Place Order <ArrowRight className="w-5 h-5" /></>}
           </button>
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;