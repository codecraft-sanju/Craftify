// src/ShopView.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ShoppingBag, Filter, PackageOpen, Store, XCircle, ArrowRight, Tag } from 'lucide-react';

// --- HELPER: BADGE ---
const Badge = ({ children, color = "slate", className="" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

// --- HELPER: SKELETON LOADER (Premium Loading State) ---
const ProductSkeleton = () => (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="aspect-[4/5] bg-slate-100 animate-pulse relative">
            <div className="absolute top-4 right-4 w-8 h-8 bg-slate-200 rounded-full"></div>
        </div>
        <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
            <div className="pt-4 flex justify-between items-center">
                <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

const ShopView = ({ 
    searchQuery, 
    setSearchQuery, 
    activeCategory = "All", 
    setActiveCategory, 
    addToCart, 
    products = [], 
    isLoading 
}) => {
  
  // Categories List (You can fetch this dynamically later if needed)
  const categories = ["All", "Clothing", "Home", "Art", "Tech", "Accessories"];

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(p => {
      // 1. Search Filter
      const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const searchPass = nameMatch || descMatch;

      // 2. Category Filter
      const categoryPass = activeCategory === "All" || p.category === activeCategory;

      return searchPass && categoryPass;
  });

  return (
      <div className="min-h-screen bg-[#F8FAFC]">
            
            {/* 1. STICKY HEADER & FILTERS */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 pt-4 pb-2 px-4 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto space-y-4">
                    
                    {/* Top Row: Title & Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="hidden md:block">
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                              Marketplace
                           </h2>
                           <p className="text-sm text-slate-500 font-medium">Curated handcrafted goods.</p>
                        </div>
                        
                        <div className="relative group w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 bg-slate-100/50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-bold"
                            />
                             {searchQuery && (
                                <button 
                                  onClick={() => setSearchQuery('')}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                             )}
                        </div>
                    </div>

                    {/* Bottom Row: Category Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory && setActiveCategory(cat)}
                                className={`
                                    whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border
                                    ${activeCategory === cat 
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                
                    {/* CASE 1: LOADING (Skeletons) */}
                    {isLoading && [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}

                    {/* CASE 2: LOADED & EMPTY (No Products at all) */}
                    {!isLoading && products.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-100">
                                <PackageOpen className="w-10 h-10 text-indigo-500"/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Marketplace is Empty</h3>
                            <p className="text-slate-500 mt-2 max-w-md mx-auto">Be the first to list a product and start selling to millions.</p>
                            <Link to="/seller-register" className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 group">
                                <Store className="w-5 h-5" /> Become a Seller <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                            </Link>
                        </div>
                    )}

                    {/* CASE 3: NO SEARCH/FILTER RESULTS */}
                    {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Filter className="w-8 h-8 text-slate-400"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                            <p className="text-slate-500 mt-1">
                                We couldn't find any "{activeCategory !== 'All' ? activeCategory : ''}" products matching "{searchQuery}"
                            </p>
                            <button 
                                onClick={() => { setSearchQuery(""); if(setActiveCategory) setActiveCategory("All"); }}
                                className="mt-6 flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-5 py-2.5 rounded-xl transition-colors"
                            >
                                <XCircle className="w-4 h-4"/> Clear All Filters
                            </button>
                        </div>
                    )}

                    {/* CASE 4: PRODUCT GRID */}
                    {!isLoading && filteredProducts.map((product) => {
                        const productId = product._id || product.id;
                        const displayImage = product.image || product.coverImage || "https://via.placeholder.com/300";
                        const shopName = product.shop?.name || 'Verified Seller';
                        const isOutOfStock = product.stock !== undefined && product.stock <= 0;

                        return (
                           <Link to={`/product/${productId}`} key={productId} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all duration-300 relative flex flex-col h-full transform hover:-translate-y-1">
                               
                               {/* Image Container */}
                               <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                                 <img 
                                    src={displayImage} 
                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
                                    alt={product.name} 
                                    loading="lazy"
                                 />
                                 
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                 
                                 {/* Overlays */}
                                 <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                                     {product.customizationAvailable && <Badge color="purple" className="shadow-sm bg-white/90 backdrop-blur-md">Customizable</Badge>}
                                     {isOutOfStock && <Badge color="red" className="shadow-sm">Sold Out</Badge>}
                                 </div>

                                 {/* Quick Add Button (Slide Up) */}
                                 <button 
                                   onClick={(e) => { 
                                      e.preventDefault(); 
                                      if(!isOutOfStock) addToCart(product); 
                                   }} 
                                   disabled={isOutOfStock}
                                   className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 py-3.5 rounded-xl font-bold shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white disabled:hidden"
                                 >
                                   <ShoppingBag className="w-4 h-4" /> Quick Add
                                 </button>
                               </div>

                               {/* Details */}
                               <div className="p-5 flex-1 flex flex-col">
                                 <div className="mb-2">
                                     <div className="flex justify-between items-start gap-2">
                                         <h3 className="font-bold text-slate-900 line-clamp-1 text-lg group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                         {product.rating > 0 && (
                                             <div className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 shrink-0">
                                                 <Star className="w-3 h-3 fill-current" /> {product.rating.toFixed(1)}
                                             </div>
                                         )}
                                     </div>
                                     <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                         <Store className="w-3 h-3" />
                                         <span className="text-xs font-medium truncate">{shopName}</span>
                                     </div>
                                 </div>
                                 
                                 <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                     <div>
                                         <p className="text-xs text-slate-400 font-medium line-through">₹{Math.round(product.price * 1.2)}</p>
                                         <p className="text-xl font-black text-slate-900">₹{product.price}</p>
                                     </div>
                                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                         <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                     </div>
                                 </div>
                               </div>
                           </Link>
                        );
                    })}
                </div>
            </div>
      </div>
  );
};

export default ShopView;