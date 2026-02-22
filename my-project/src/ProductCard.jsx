// src/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Store, ArrowRight, ShoppingBag } from 'lucide-react';
import { PremiumImage, Badge } from './App'; // App.jsx se reusable components import kar rahe hain

const ProductCard = ({ product, wishlist = [], toggleWishlist, addToCart }) => {
    // 1. Safe data extraction
    const productId = product._id || product.id;
    const displayImage = product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : product.image) || "https://via.placeholder.com/300";
    const shopName = product.shop?.name || 'Verified Seller';
    
    // 2. Logic checks
    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    const isInWishlist = wishlist && wishlist.some(item => item._id === productId);

    return (
        <Link 
            to={`/product/${productId}`} 
            className="group bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all duration-300 relative flex flex-col h-full transform hover:-translate-y-1"
        >
            {/* --- IMAGE CONTAINER --- */}
            <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                <PremiumImage 
                    src={displayImage} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
                    alt={product.name} 
                    loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                
                {/* Badges (Custom & Stock) */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2 items-start max-w-[70%]">
                    {product.customizationAvailable && (
                        <Badge color="purple" className="shadow-sm bg-white/90 backdrop-blur-md text-[9px] md:text-[10px]">
                            Custom
                        </Badge>
                    )}
                    
                    {/* Low Stock / Out of Stock Alert */}
                    {isOutOfStock ? (
                        <Badge color="red" className="shadow-sm">Sold Out</Badge>
                    ) : product.stock <= (product.lowStockThreshold || 10) ? (
                        <Badge color="amber" className="shadow-sm bg-white/90 backdrop-blur-md text-[9px] md:text-[10px] text-amber-700 animate-pulse">
                            🔥 Only {product.stock} Left
                        </Badge>
                    ) : null}
                </div>

                {/* Wishlist Button */}
                <button 
                    onClick={(e) => {
                        e.preventDefault(); 
                        e.stopPropagation(); // Link click hone se rokega
                        if (toggleWishlist) toggleWishlist(product);
                    }}
                    className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 ${isInWishlist ? 'bg-white text-red-500' : 'bg-white/70 text-slate-400 hover:bg-white hover:text-red-500'}`}
                >
                    <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>

                {/* Quick Add To Cart Button (Sirf tab dikhega agar addToCart function pass kiya ho) */}
                {addToCart && (
                    <button 
                        onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            if(!isOutOfStock) addToCart(product); 
                        }} 
                        disabled={isOutOfStock}
                        className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 py-3.5 rounded-xl font-bold shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden md:flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white disabled:hidden"
                    >
                        <ShoppingBag className="w-4 h-4" /> Quick Add
                    </button>
                )}
            </div>

            {/* --- DETAILS CONTAINER --- */}
            <div className="p-3 md:p-5 flex-1 flex flex-col">
                <div className="mb-2">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-2">
                        <h3 className="font-bold text-slate-900 line-clamp-2 text-sm md:text-lg group-hover:text-indigo-600 transition-colors leading-tight">
                            {product.name}
                        </h3>
                        {product.rating > 0 && (
                            <div className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 shrink-0 self-start">
                                <Star className="w-3 h-3 fill-current" /> {product.rating.toFixed(1)}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 md:mt-1 text-slate-500">
                        <Store className="w-3 h-3" />
                        <span className="text-[10px] md:text-xs font-medium truncate">{shopName}</span>
                    </div>
                </div>
                
                <div className="mt-auto pt-3 md:pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-medium line-through">
                            ₹{Math.round(product.price * 1.2)}
                        </p>
                        <p className="text-base md:text-xl font-black text-slate-900">
                            ₹{product.price}
                        </p>
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;