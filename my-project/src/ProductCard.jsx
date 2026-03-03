import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingBag, 
  Palette, 
  Check 
} from 'lucide-react'; 

// API URL definition
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a Motion Link component for animation + navigation
const MotionLink = motion(Link);

const ProductCard = ({ product, index = 0, wishlist = [], toggleWishlist, addToCart }) => {
    // 1. Safe Data Extraction
    const productId = product._id || product.id;
    // Check if wishlist array exists and verify item
    const isWishlisted = Array.isArray(wishlist) && wishlist.some((item) => item._id === productId);
    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    
    // 2. REAL IMAGE LOGIC (Priority: coverImage -> images[0] -> image)
    const displayImage = product.coverImage || 
                          (product.images && product.images.length > 0 ? product.images[0].url : null) || 
                          product.image;

    // 3. Helper to ensure URL is valid (Smart Image Fix)
    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/400x500?text=No+Image";
        
        // If external link (Cloudinary/S3/Firebase)
        if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) {
            return path;
        }
        
        // If local path, append API URL
        const cleanPath = path.replace(/^\//, '');
        return `${API_URL}/${cleanPath}`;
    };

    const finalImageSrc = getImageUrl(displayImage);

    // 4. Price Logic
    const currentPrice = product.price || 0;
    // CHANGES MADE: Pull compareAtPrice from DB. Fallback to 20% higher if not set or 0.
    const oldPrice = product.compareAtPrice || Math.round(currentPrice * 1.2); 

    return (
      <MotionLink 
        to={`/product/${productId}`} 
        // --- MAKHAN ANIMATION LOGIC (Staggered Entry) ---
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        // CHANGES MADE: Updated duration, delay, and ease for a smoother staggered effect
        transition={{ 
            duration: 0.6, 
            delay: index * 0.15, // Stagger effect based on index
            ease: [0.25, 0.8, 0.25, 1] 
        }}
        className="group bg-white rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all duration-300 flex flex-col h-full relative transform hover:-translate-y-1 block"
      >
         
         {/* --- IMAGE CONTAINER --- */}
         <div className="relative aspect-square bg-slate-50 overflow-hidden">
             <img 
                src={finalImageSrc} 
                alt={product.name}
                loading="lazy"
                onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = "https://placehold.co/400x500?text=Image+Error"; 
                }} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
             />
             
             {/* Hover Overlay */}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

             {/* --- BADGES (Top Left) --- */}
             <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
                 {/* Custom Badge */}
                 {product.customizationAvailable && (
                     <div className="bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                         <Palette className="w-3 h-3" /> Custom
                     </div>
                 )}
                 
                 {/* Low Stock Alert */}
                 {!isOutOfStock && product.stock <= 10 && (
                     <div className="bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-sm animate-pulse">
                         🔥 Only {product.stock} Left
                     </div>
                 )}
             </div>

             {/* Sold Out Badge (Top Right) */}
             {isOutOfStock && (
                 <div className="absolute top-3 right-12 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10">
                     Sold Out
                 </div>
             )}

             {/* Wishlist Button (Stop Propagation prevents navigation) */}
             <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                }} 
                className={`absolute top-3 right-3 p-2.5 rounded-full shadow-sm backdrop-blur-md transition-all duration-300 z-20 active:scale-90 ${isWishlisted ? 'bg-white text-red-500' : 'bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white'}`}
             >
                 <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
             </button>
         </div>
  
         {/* --- CONTENT CONTAINER (Balanced Layout) --- */}
         <div className="p-3 flex flex-col flex-1">
             
             {/* 1. Category (Small Top Label) */}
             <div className="mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    {product.category || "General"}
                </span>
             </div>
             
             {/* 2. Product Title (Clear & Readable) */}
             <div className="mb-2 min-h-[2.5rem]"> {/* min-h ensures alignment if titles vary in length */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </h3>
             </div>

             {/* 3. Price Row (All in one line to save height) */}
             <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-black text-slate-900">
                    ₹{currentPrice}
                </span>
                
                {oldPrice > currentPrice && (
                    <>
                        <span className="text-xs text-slate-400 font-medium line-through decoration-slate-300">
                            ₹{oldPrice}
                        </span>
                        <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                            {Math.round(((oldPrice - currentPrice) / oldPrice) * 100)}% OFF
                        </div>
                    </>
                )}
             </div>
  
             {/* 4. Add to Cart Button (Bottom pinned) */}
             <button 
                onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   if(!isOutOfStock) addToCart(product);
                }}
                disabled={isOutOfStock}
                className={`mt-auto w-full py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn z-20 relative ${
                    isOutOfStock 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#65280E] text-white shadow-[#65280E]/20 hover:bg-[#4a1d0a] hover:shadow-[#65280E]/40 active:scale-95'
                }`}
             >
                <ShoppingBag className={`w-4 h-4 ${isOutOfStock ? 'text-slate-400' : 'text-white/70 group-hover/btn:text-white'} transition-colors`} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
             </button>
         </div>
      </MotionLink>
    );
};

export default ProductCard;