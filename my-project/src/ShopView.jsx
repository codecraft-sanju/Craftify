// src/ShopView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ShoppingBag, Filter, PackageOpen, Store, XCircle, ArrowRight, Tag, Heart, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Gift } from 'lucide-react'; 

// --- CONFIGURATION ---
const API_URL = import.meta.env.VITE_API_URL;

// --- HELPER: BADGE (Updated to include 'amber' color) ---
const Badge = ({ children, color = "slate", className="" }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100", // Added for Low Stock
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
        <div className="p-3 md:p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse"></div>
            <div className="pt-4 flex justify-between items-center">
                <div className="h-6 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);

// --- COMPONENT: MARQUEE STRIP (New Addition) ---
const MarqueeStrip = () => {
    const items = [
        { text: "Welcome to Giftomize", icon: <Gift className="w-4 h-4" /> },
        { text: "100% Customized Products", icon: <Sparkles className="w-4 h-4" /> },
        { text: "Premium Quality Guaranteed", icon: <ShieldCheck className="w-4 h-4" /> },
        { text: "Fast & Secure Delivery", icon: <PackageOpen className="w-4 h-4" /> },
        { text: "Best Price Assured", icon: <Tag className="w-4 h-4" /> },
        { text: "Verified Sellers Only", icon: <Store className="w-4 h-4" /> },
    ];

    return (
        <div className="relative bg-slate-900 border-b border-slate-800 text-slate-300 py-3 overflow-hidden select-none z-10">
            {/* Inline style for the animation keyframes to avoid external CSS dependency */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-infinite {
                    display: flex;
                    width: max-content;
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee-infinite:hover {
                    animation-play-state: paused;
                }
            `}</style>
            
            <div className="animate-marquee-infinite">
                {/* We map 4 times to ensure it fills wide screens seamlessly */}
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex shrink-0">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 px-8">
                                <span className="text-indigo-400">{item.icon}</span>
                                <span className="text-xs md:text-sm font-bold uppercase tracking-widest">
                                    {item.text}
                                </span>
                                <div className="ml-8 w-1 h-1 rounded-full bg-slate-700" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENT: OFFER CAROUSEL (Smart Logic: Hide vs Default vs Custom) ---
const OfferCarousel = ({ bannerData }) => {
    
    // 1. CRITICAL CHECK: Hidden by Founder?
    // Agar data exist karta hai AUR isVisible false hai, toh return null (Hide Section)
    if (bannerData && bannerData.isVisible === false) {
        return null; 
    }

    // 2. Default Offers (Fallback)
    const defaultOffers = [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
        title: "Super Sale Live",
        subtitle: "Up to 50% Off on Handmade Goods"
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
        title: "New Arrivals",
        subtitle: "Check out the latest fashion trends"
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1964&auto=format&fit=crop",
        title: "Premium Tech",
        subtitle: "Upgrade your workspace today"
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        title: "Artisan Selection",
        subtitle: "Curated for the creative soul"
      }
    ];

    // 3. Determine Slides to Show
    // Agar bannerData null hai (Fresh App) -> backendSlides = []
    // Agar bannerData hai par slides empty hain -> backendSlides = []
    const backendSlides = bannerData?.slides || [];

    // Agar backend se slides aayi hain toh woh dikhao, nahi toh default dikhao
    const displayOffers = backendSlides.length > 0 ? backendSlides : defaultOffers;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
  
    useEffect(() => {
      // Auto-scroll logic
      if (displayOffers.length > 1) {
          const interval = setInterval(() => {
            nextSlide();
          }, 5000); 
          return () => clearInterval(interval);
      }
    }, [currentIndex, displayOffers.length]);
  
    const nextSlide = () => {
      setCurrentIndex((prev) => (prev === displayOffers.length - 1 ? 0 : prev + 1));
    };
  
    const prevSlide = () => {
      setCurrentIndex((prev) => (prev === 0 ? displayOffers.length - 1 : prev - 1));
    };
  
    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) nextSlide();
        else if (distance < -50) prevSlide();
        setTouchStart(0);
        setTouchEnd(0);
    };
  
    return (
      <div 
        className="relative w-full h-[500px] md:h-auto md:aspect-[3/1] lg:aspect-[21/6] rounded-3xl overflow-hidden mb-8 shadow-lg group bg-slate-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {displayOffers.map((offer, index) => (
          <div
            key={offer._id || offer.id || index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img 
              src={offer.image} 
              alt={offer.title} 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
               <div className="transform transition-all duration-700 translate-y-0 opacity-100">
                   <span className="bg-indigo-600 text-white text-xs md:text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wider shadow-lg shadow-indigo-600/30">
                     Featured
                   </span>
                   <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-md leading-tight">
                     {offer.title}
                   </h2>
                   <p className="text-slate-200 text-lg md:text-lg font-medium max-w-lg drop-shadow-sm leading-snug">
                     {offer.subtitle}
                   </p>
               </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        {displayOffers.length > 1 && (
            <>
                <button 
                   onClick={(e) => { e.preventDefault(); prevSlide(); }}
                   className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                >
                   <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                   onClick={(e) => { e.preventDefault(); nextSlide(); }}
                   className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                >
                   <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                   {displayOffers.map((_, idx) => (
                       <button 
                         key={idx}
                         onClick={() => setCurrentIndex(idx)}
                         className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
                       />
                   ))}
                </div>
            </>
        )}
      </div>
    );
};

// --- COMPONENT: DYNAMIC CIRCULAR CATEGORY HIGHLIGHT ---
const CategoryHighlight = ({ activeCategory, setActiveCategory, products = [] }) => {
  
  // 1. Initial State (Default Images Fallback)
  const [visualMap, setVisualMap] = useState({
    "All": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop",
    "Clothing": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
    "Accessories": "https://images.unsplash.com/photo-1512163143273-bde0e3cc540f?q=80&w=2070&auto=format&fit=crop",
    "Tech": "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop",
    "Home": "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1974&auto=format&fit=crop",
    "Art": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop",
    "Handmade Goods": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    "Beauty": "https://images.unsplash.com/photo-1522335789203-abd1c1cd9d90?q=80&w=2070&auto=format&fit=crop",
    "Electronics": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop",
    "Fashion": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
  });

  // 2. Fetch Updated Images from Backend
  useEffect(() => {
    const fetchCategoryImages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/categories`);
            if (res.ok) {
                const data = await res.json();
                setVisualMap(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Failed to fetch category images", error);
        }
    };
    fetchCategoryImages();
  }, []);

  const fallbackImage = "https://images.unsplash.com/photo-1556742043-272d6b04d444?q=80&w=2070&auto=format&fit=crop";
  const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const displayCategories = ["All", ...productCategories];

  return (
    <div className="mb-12">
        <h3 className="text-2xl font-black text-slate-800 text-center mb-6 font-serif">Product Category</h3>
        
        <div className="flex gap-6 overflow-x-auto px-4 pb-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] justify-start md:justify-center">
            {displayCategories.map((cat, idx) => {
                const isActive = activeCategory === cat;
                const image = visualMap[cat] || fallbackImage;
                
                return (
                  <button 
                    key={idx}
                    onClick={() => setActiveCategory(cat)}
                    className="group flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] snap-center transition-transform hover:-translate-y-1"
                  >
                      <div className={`
                        w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] p-1 transition-all duration-300 shadow-md
                        ${isActive ? 'border-indigo-600 scale-105' : 'border-white group-hover:border-indigo-200'}
                      `}>
                          <div className="w-full h-full rounded-full overflow-hidden relative">
                             <img 
                               src={image} 
                               alt={cat} 
                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                             />
                             <div className={`absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors ${isActive ? 'bg-black/0' : ''}`} />
                          </div>
                      </div>
                      <span className={`text-sm font-bold tracking-wide capitalize ${isActive ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
                          {cat}
                      </span>
                  </button>
                );
            })}
        </div>
    </div>
  );
};

const ShopView = ({ 
    searchQuery, 
    setSearchQuery, 
    activeCategory = "All", 
    setActiveCategory, 
    addToCart, 
    products = [], 
    isLoading,
    wishlist = [],
    toggleWishlist
}) => {
  
  // --- STATE: Banner Data (Starts as null) ---
  const [bannerData, setBannerData] = useState(null);
  const [isBannersLoading, setIsBannersLoading] = useState(true);

  // --- FETCH BANNERS FROM BACKEND ---
  useEffect(() => {
    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/banners`);
            if (res.ok) {
                // Returns: { isVisible: boolean, slides: [...] } OR null
                const data = await res.json();
                setBannerData(data);
            }
        } catch (error) {
            console.error("Failed to fetch banners", error);
        } finally {
            setIsBannersLoading(false);
        }
    };
    fetchBanners();
  }, []); // Runs once on mount

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const searchPass = nameMatch || descMatch;
      const categoryPass = activeCategory === "All" || p.category === activeCategory;
      return searchPass && categoryPass;
  });

  return (
      <div className="min-h-screen bg-[#F8FAFC]">
            
            {/* 1. STICKY HEADER & FILTERS */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 pt-4 pb-4 px-4 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Title */}
                    <div className="hidden md:block">
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          Marketplace
                       </h2>
                       <p className="text-sm text-slate-500 font-medium">Curated handcrafted goods.</p>
                    </div>
                    
                    {/* Right: Search */}
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
            </div>

            {/* --- NEW MARQUEE STRIP (Placed here to be distinct but visible) --- */}
            <MarqueeStrip />

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                
                {/* --- OFFER CAROUSEL --- */}
                {/* We pass the Full 'bannerData' object. Component handles hiding/defaults inside. */}
                {!isBannersLoading && <OfferCarousel bannerData={bannerData} />}

                {/* --- VISUAL CATEGORY STRIP --- */}
                <CategoryHighlight 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory} 
                    products={products} 
                />

                {/* --- PRODUCT GRID --- */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                
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
                        const displayImage = product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : product.image) || "https://via.placeholder.com/300";
                        const shopName = product.shop?.name || 'Verified Seller';
                        const isOutOfStock = product.stock !== undefined && product.stock <= 0;
                        const isInWishlist = wishlist && wishlist.some(item => item._id === product._id);

                        return (
                           <Link to={`/product/${productId}`} key={productId} className="group bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all duration-300 relative flex flex-col h-full transform hover:-translate-y-1">
                               
                               {/* Image Container */}
                               <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                                 <img 
                                   src={displayImage} 
                                   className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`} 
                                   alt={product.name} 
                                   loading="lazy"
                                 />
                                 
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                 
                                 <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2 items-start max-w-[70%]">
                                     {product.customizationAvailable && <Badge color="purple" className="shadow-sm bg-white/90 backdrop-blur-md text-[9px] md:text-[10px]">Custom</Badge>}
                                     
                                     {/* --- LOW STOCK ALERT LOGIC --- */}
                                     {isOutOfStock ? (
                                         <Badge color="red" className="shadow-sm">Sold Out</Badge>
                                     ) : product.stock <= (product.lowStockThreshold || 10) ? (
                                         <Badge color="amber" className="shadow-sm bg-white/90 backdrop-blur-md text-[9px] md:text-[10px] text-amber-700 animate-pulse">
                                              🔥 Only {product.stock} Left
                                         </Badge>
                                     ) : null}
                                     {/* ----------------------------- */}
                                 </div>

                                 <button 
                                     onClick={(e) => {
                                         e.preventDefault(); 
                                         e.stopPropagation();
                                         toggleWishlist(product);
                                     }}
                                     className={`absolute top-3 right-3 md:top-4 md:right-4 p-2 md:p-2.5 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 active:scale-90 ${isInWishlist ? 'bg-white text-red-500' : 'bg-white/70 text-slate-400 hover:bg-white hover:text-red-500'}`}
                                 >
                                     <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                                 </button>

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
                               </div>

                               <div className="p-3 md:p-5 flex-1 flex flex-col">
                                 <div className="mb-2">
                                     <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-2">
                                         <h3 className="font-bold text-slate-900 line-clamp-2 text-sm md:text-lg group-hover:text-indigo-600 transition-colors leading-tight">{product.name}</h3>
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
                                         <p className="text-[10px] md:text-xs text-slate-400 font-medium line-through">₹{Math.round(product.price * 1.2)}</p>
                                         <p className="text-base md:text-xl font-black text-slate-900">₹{product.price}</p>
                                     </div>
                                     <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                         <ArrowRight className="w-3 h-3 md:w-4 md:h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
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