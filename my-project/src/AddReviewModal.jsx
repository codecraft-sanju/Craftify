import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Loader2 } from 'lucide-react';

const AddReviewModal = ({ isOpen, onClose, user, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!quote.trim()) {
      setError('Write something, You can’t submit an empty review.');
      return;
    }

    if (!user) {
      setError('Please log in first, then you will be able to submit a review.');
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Cookies bhejne ke liye zaroori line
        credentials: 'include', 
        body: JSON.stringify({
          quote: quote,
          rating: rating
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lafda ho gaya! Review submit nahi hua.');
      }

      // Success logic
      setQuote('');
      setRating(5);
      onReviewAdded(data.review); // List ko turant update karne ke liye
      onClose(); // Modal band
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-800">Share Your Experience</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium text-center">
                {error}
              </div>
            )}

            {/* Stars Selection */}
            <div className="space-y-2 text-center">
              <label className="text-sm font-bold text-slate-700 block">How did you like Giftomize?</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none hover:scale-125 transition-transform"
                  >
                    <Star 
                      className={`w-8 h-8 ${rating >= star ? 'fill-[#A79277] text-[#A79277]' : 'fill-slate-100 text-slate-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Rate your experience</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Write something cool..."
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#A79277] focus:ring-2 focus:ring-[#A79277]/20 transition-all resize-none outline-none min-h-[120px] text-slate-700 font-medium"
                maxLength={200}
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Max 200 Characters</span>
                <span>{quote.length}/200</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#A79277] hover:bg-[#8B7963] text-white font-bold py-4 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-[#A79277]/30 disabled:opacity-70 active:scale-95"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
              ) : (
                'Submit My Review'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddReviewModal;