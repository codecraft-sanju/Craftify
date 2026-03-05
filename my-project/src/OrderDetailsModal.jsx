// src/OrderDetailsModal.jsx
import React, { useState } from 'react';
import { X, Truck, DollarSign, ExternalLink } from 'lucide-react';
import { Button, Badge } from './StoreAdmin'; // Importing your shared UI components

export default function OrderDetailsModal({ selectedOrder, onClose, onUpdateStatus }) {
    // Local state moved from StoreAdmin.jsx for better encapsulation
    const [showCancelInput, setShowCancelInput] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    if (!selectedOrder) return null;

    const handleCancelConfirm = async () => {
        if (!cancelReason.trim()) return;
        const success = await onUpdateStatus(selectedOrder._id, 'Cancelled', cancelReason);
        if (success) {
            setShowCancelInput(false);
            setCancelReason("");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[60] animate-in fade-in duration-200">
            <div className="bg-slate-950 w-full h-[90vh] md:h-auto md:max-h-[90vh] md:max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl shadow-rose-900/10 relative flex flex-col scale-100 animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-300 border border-white/10">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-slate-900 rounded-t-[2.5rem]">
                    <div><h3 className="text-xl font-black text-white">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h3><p className="text-slate-500 text-xs font-bold mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div>
                    <button onClick={onClose} className="p-2.5 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"><X className="w-5 h-5 text-slate-400"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                    {/* Status Section */}
                    <div className={`flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-3xl border shadow-lg ${selectedOrder.orderStatus === 'Cancelled' ? 'bg-slate-900 border-red-900/30' : 'bg-slate-900 border-indigo-500/10'}`}>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/5 ${selectedOrder.orderStatus === 'Cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                {selectedOrder.orderStatus === 'Cancelled' ? <X className="w-7 h-7"/> : <Truck className="w-7 h-7"/>}
                            </div>
                            <div><p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Current Status</p><p className={`font-black text-2xl ${selectedOrder.orderStatus === 'Cancelled' ? 'text-red-500' : 'text-indigo-400'}`}>{selectedOrder.orderStatus}</p></div>
                        </div>

                        {selectedOrder.orderStatus !== 'Shipped' && selectedOrder.orderStatus !== 'Delivered' && selectedOrder.orderStatus !== 'Cancelled' && (
                            <div className="w-full md:w-auto">
                                {!showCancelInput ? (
                                    <div className="flex flex-col gap-3 w-full">
                                        <Button size="md" onClick={() => onUpdateStatus(selectedOrder._id, 'Shipped')} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-900/20">Mark Shipped</Button>
                                        <button onClick={() => setShowCancelInput(true)} className="w-full py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20">Cancel Order</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 w-full animate-in fade-in">
                                        <textarea className="w-full p-3 text-sm border border-red-500/30 bg-red-900/10 text-white rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-medium placeholder:text-red-300/50" placeholder="Reason for cancellation..." rows="2" autoFocus value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}/>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setShowCancelInput(false); setCancelReason(""); }} className="flex-1 py-2 text-xs font-bold text-slate-400 bg-slate-800 rounded-lg hover:text-white">Back</button>
                                            <button onClick={handleCancelConfirm} className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-lg shadow-lg shadow-red-900/40 hover:bg-red-500">Confirm</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {selectedOrder.orderStatus === 'Shipped' && (
                            <Button variant="success" className="w-full md:w-auto" onClick={() => onUpdateStatus(selectedOrder._id, 'Delivered')}>Mark Delivered</Button>
                        )}
                    </div>

                    {/* Payout Status Section */}
                    <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-inner mt-6">
                        <h4 className="font-extrabold text-slate-500 mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">
                            <DollarSign className="w-4 h-4 text-emerald-500"/> Payout Status
                        </h4>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-white">
                                    {selectedOrder.payoutInfo?.status === 'Settled' ? 'Payment Received' : 'Pending Settlement'}
                                </p>
                                {selectedOrder.payoutInfo?.settledAt && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(selectedOrder.payoutInfo.settledAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            {selectedOrder.payoutInfo?.status === 'Settled' ? (
                                <div className="flex items-center gap-3">
                                    <Badge color="green">Settled</Badge>
                                    {selectedOrder.payoutInfo.proofImage && (
                                        <a href={selectedOrder.payoutInfo.proofImage} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/30 px-3 py-1.5 rounded-lg bg-indigo-500/10">
                                            View Proof <ExternalLink className="w-3 h-3"/>
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <Badge color="amber">Processing</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}