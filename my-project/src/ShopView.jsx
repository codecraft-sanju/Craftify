// src/ShopView.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, PackageOpen, Store, XCircle, ArrowRight, Tag, 
  ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Gift, 
  Quote, BadgeCheck, Heart, ShoppingCart, Star, ShoppingBag 
} from 'lucide-react'; 

import Footer from './Footer'; // Reusable Footer component

// API URL definition
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a Motion Link component to animate the router Link
const MotionLink = motion(Link);

// --- COMPONENT: PRODUCT SKELETON ---
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
            <div className="h-10 bg-slate-100 rounded-xl w-full animate-pulse mt-4"></div>
        </div>
    </div>
);

// --- COMPONENT: INTERNAL PRODUCT CARD (Animated + Clickable) ---
const ProductCard = ({ product, index, wishlist = [], toggleWishlist, addToCart }) => {
    // 1. Safe Data Extraction
    const productId = product._id || product.id;
    const isWishlisted = Array.isArray(wishlist) && wishlist.some((item) => item._id === productId);
    const isOutOfStock = product.stock !== undefined && product.stock <= 0;
    const shopName = product.shop?.name || 'Verified Seller';

    // 2. REAL IMAGE LOGIC
    const displayImage = product.coverImage || 
                         (product.images && product.images.length > 0 ? product.images[0].url : null) || 
                         product.image;

    // 3. Helper to ensure URL is valid
    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/400x500?text=No+Image";
        if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) {
            return path;
        }
        const cleanPath = path.replace(/^\//, '');
        return `${API_URL}/${cleanPath}`;
    };

    const finalImageSrc = getImageUrl(displayImage);

    // 4. Price Logic
    const currentPrice = product.price || 0;
    const oldPrice = product.oldPrice || Math.round(currentPrice * 1.2); 
    const ratingValue = product.rating || 4.5;

    return (
      <MotionLink 
        to={`/product/${productId}`} 
        // --- MAKHAN ANIMATION LOGIC ---
        initial={{ opacity: 0, y: 50 }} // Start slightly lower and invisible
        animate={{ opacity: 1, y: 0 }}  // Animate to visible and original position
        transition={{ 
            duration: 0.5, 
            delay: index * 0.05, // Stagger effect based on index (0.05s delay per card)
            ease: "easeOut" 
        }}
        // -----------------------------
        className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-100 transition-all duration-300 flex flex-col h-full group overflow-hidden relative transform hover:-translate-y-1 block"
      >
         
         {/* --- IMAGE CONTAINER --- */}
         <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
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

             {/* Custom Badge */}
             {product.customizationAvailable && (
                 <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10">
                     Custom
                 </div>
             )}

             {/* Stock Badge */}
             {isOutOfStock ? (
                 <div className="absolute top-3 right-12 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm z-10">
                     Sold Out
                 </div>
             ) : (product.stock <= 10 && (
                 <div className="absolute top-3 left-3 mt-8 bg-amber-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-1 rounded-md shadow-sm animate-pulse z-10">
                     Only {product.stock} Left
                 </div>
             ))}

             {/* Wishlist Button (Stop Propagation) */}
             <button 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleWishlist(product);
                }} 
                className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-white transition-all duration-300 z-20 active:scale-90"
             >
                 <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
             </button>
         </div>
  
         {/* --- CONTENT CONTAINER --- */}
         <div className="p-4 flex flex-col flex-1">
             <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">{product.category || "General"}</span>
                <div className="flex items-center gap-1 text-slate-400">
                    <Store className="w-3 h-3" />
                    <span className="text-[10px] font-medium truncate max-w-[80px]">{shopName}</span>
                </div>
             </div>
             
             <div className="mb-2">
                <h3 className="font-bold text-slate-900 line-clamp-1 text-base group-hover:text-indigo-600 transition-colors mb-1 leading-tight">
                    {product.name}
                </h3>
                
                <div className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100 w-fit">
                   <Star className="w-3 h-3 fill-current" /> 
                   <span>{ratingValue.toFixed(1)}</span>
                   <span className="text-amber-400/60 font-medium ml-0.5">({Math.floor(Math.random() * 50) + 5})</span>
                </div>
             </div>

             <p className="text-sm text-slate-500 line-clamp-1 mb-4">
                {product.description}
             </p>
             
             <div className="mt-auto flex items-end justify-between mb-4 border-b border-slate-50 pb-4">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium line-through">
                        ₹{oldPrice}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                        ₹{currentPrice}
                    </span>
                </div>
                
                {oldPrice > currentPrice && (
                     <div className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {Math.round(((oldPrice - currentPrice) / oldPrice) * 100)}% OFF
                     </div>
                )}
             </div>
  
             {/* PERMANENT ADD TO CART BUTTON (Stop Propagation) */}
             <button 
               onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   if(!isOutOfStock) addToCart(product);
               }}
               disabled={isOutOfStock}
               className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn z-20 relative ${
                   isOutOfStock 
                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                   : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-indigo-600 hover:shadow-indigo-600/20 active:scale-95'
               }`}
             >
                <ShoppingBag className={`w-4 h-4 ${isOutOfStock ? 'text-slate-400' : 'text-white/70 group-hover/btn:text-white'} transition-colors`} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
             </button>
         </div>
      </MotionLink>
    );
};

// --- COMPONENT: MARQUEE STRIP ---
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

// --- COMPONENT: OFFER CAROUSEL ---
const OfferCarousel = ({ bannerData }) => {
    if (bannerData && bannerData.isVisible === false) return null; 

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

    const backendSlides = bannerData?.slides || [];
    const displayOffers = backendSlides.length > 0 ? backendSlides : defaultOffers;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
  
    useEffect(() => {
      if (displayOffers.length > 1) {
          const interval = setInterval(() => { nextSlide(); }, 5000); 
          return () => clearInterval(interval);
      }
    }, [currentIndex, displayOffers.length]);
  
    const nextSlide = () => setCurrentIndex((prev) => (prev === displayOffers.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? displayOffers.length - 1 : prev - 1));
    const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > 50) nextSlide();
        else if (distance < -50) prevSlide();
        setTouchStart(0); setTouchEnd(0);
    };
  
    return (
      <div 
        className="relative h-[500px] md:h-auto md:aspect-[3/1] lg:aspect-[21/6] overflow-hidden mb-8 shadow-lg group bg-slate-900 -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] md:mx-0 md:w-full rounded-none md:rounded-3xl"
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      >
        {displayOffers.map((offer, index) => (
          <div key={offer._id || offer.id || index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover opacity-80"/>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8 md:p-12">
               <div className="transform transition-all duration-700 translate-y-0 opacity-100">
                   <span className="bg-indigo-600 text-white text-xs md:text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block uppercase tracking-wider shadow-lg shadow-indigo-600/30">Featured</span>
                   <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-md leading-tight">{offer.title}</h2>
                   <p className="text-slate-200 text-lg md:text-lg font-medium max-w-lg drop-shadow-sm leading-snug">{offer.subtitle}</p>
               </div>
            </div>
          </div>
        ))}
        {displayOffers.length > 1 && (
            <>
                <button onClick={(e) => { e.preventDefault(); prevSlide(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 hidden md:block"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={(e) => { e.preventDefault(); nextSlide(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 hidden md:block"><ChevronRight className="w-6 h-6" /></button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {displayOffers.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}/>
                    ))}
                </div>
            </>
        )}
      </div>
    );
};

// --- COMPONENT: VISUAL CATEGORIES ---
const CategoryHighlight = ({ activeCategory, setActiveCategory, products = [] }) => {
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

  useEffect(() => {
    const fetchCategoryImages = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/categories`);
            if (res.ok) {
                const data = await res.json();
                setVisualMap(prev => ({ ...prev, ...data }));
            }
        } catch (error) { console.error("Failed to fetch category images", error); }
    };
    fetchCategoryImages();
  }, []);

  const fallbackImage = "https://images.unsplash.com/photo-1556742043-272d6b04d444?q=80&w=2070&auto=format&fit=crop";
  const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const displayCategories = ["All", ...productCategories];

  return (
    <div className="mb-12">
        <h3 className="text-2xl font-black text-slate-800 text-center mb-6 font-serif">Product Category</h3>
        
        <div className="flex gap-6 overflow-x-auto py-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] justify-start md:justify-center -mx-4 px-4 sm:-mx-6 sm:px-6">
            {displayCategories.map((cat, idx) => {
                const isActive = activeCategory === cat;
                const image = visualMap[cat] || fallbackImage;
                return (
                  <button key={idx} onClick={() => setActiveCategory(cat)} className="group flex flex-col items-center gap-3 min-w-[80px] md:min-w-[100px] snap-center transition-transform hover:-translate-y-1">
                      <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-[3px] p-1 transition-all duration-300 shadow-md ${isActive ? 'border-indigo-600 scale-105' : 'border-white group-hover:border-indigo-200'}`}>
                          <div className="w-full h-full rounded-full overflow-hidden relative">
                             <img src={image} alt={cat} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                             <div className={`absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors ${isActive ? 'bg-black/0' : ''}`} />
                          </div>
                      </div>
                      <span className={`text-sm font-bold tracking-wide capitalize ${isActive ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                  </button>
                );
            })}
        </div>
    </div>
  );
};

// 1. FallingText Animation Component
const FallingText = ({ text, className = "", delay = 0 }) => {
  const letters = text.split("");
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i + delay },
    }),
  };
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: -50,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.span
      style={{ display: "inline-block" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} style={{ display: "inline-block", minWidth: letter === " " ? "0.3em" : "auto" }}>
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

// 2. Reviews Data
const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    quote: "The customization is next level! I ordered a wallet with my name, and the quality is just wow.",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Patel",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    quote: "Weekends are busy, but Giftomize made gifting so easy. Delivery was super fast too!",
    rating: 5,
  },
  {
    id: 3,
    name: "Amit Verma",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    quote: "Found unique handmade gifts here that I couldn't find anywhere else. The interface is super clean.",
    rating: 4,
  },
  {
    id: 4,
    name: "Sneha Gupta",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    quote: "Ordering for my team was hassle-free. The bulk order process is smooth. Saves me so much stress!",
    rating: 5,
  },
  {
    id: 5,
    name: "Vikram Singh",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    quote: "As someone who values quality, this app is essential. Premium products, great packaging. Perfect.",
    rating: 5,
  },
  {
    id: 6,
    name: "Anjali Mehta",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    quote: "I recommend Giftomize to everyone. It's not just about buying; it's about supporting local artisans.",
    rating: 5,
  },
  {
    id: 7,
    name: "Rohan Das",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
    quote: "The prices are surprisingly affordable for custom goods. Highly recommended for students.",
    rating: 5,
  },
];

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-yellow-500 fill-current drop-shadow-sm" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialCard = ({ data }) => {
  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-zinc-200 to-transparent hover:from-indigo-400/50 hover:to-purple-400/50 transition-all duration-500">
      <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl h-full flex flex-col gap-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1">
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={data.image} alt={data.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"/>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                <BadgeCheck size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900 text-sm leading-tight">{data.name}</h4>
              <p className="text-xs text-zinc-500 font-medium">Verified User</p>
            </div>
          </div>
          <Quote className="text-zinc-200 fill-zinc-100 transform rotate-180" size={32} />
        </div>

        <p className="text-zinc-600 text-[13px] leading-relaxed font-medium relative z-10">"{data.quote}"</p>

        <div className="mt-auto pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (i < data.rating ? <StarIcon key={i} /> : null))}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 group-hover:text-indigo-600 transition-colors">Verified Purchase</span>
        </div>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  return (
    <section className="relative py-24 flex flex-col items-center justify-center overflow-hidden bg-zinc-50/50">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#C9EBFF,transparent)] opacity-20"></div>

      <div className="relative text-center mb-16 px-4 z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 border border-indigo-200 text-indigo-700 text-[10px] font-bold tracking-wider uppercase mb-6 backdrop-blur-sm">
          <BadgeCheck size={12} /> Trusted by India
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter mb-6 drop-shadow-sm flex flex-col items-center">
          <FallingText text="Loved by Locals." />
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 pb-2">
            <FallingText text="Trusted by You." delay={0.5} />
          </div>
        </h2>

        <p className="text-zinc-500 text-lg leading-relaxed font-medium">
          Join thousands of users who have found the perfect gift. 
          Real stories from the <span className="font-bold text-zinc-800">Giftomize community</span>.
        </p>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto h-[700px] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 z-10">
        
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-zinc-50 via-zinc-50/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-zinc-50 via-zinc-50/80 to-transparent z-20 pointer-events-none"></div>

        <div className="marquee-column space-y-6">
          {[...testimonials, ...testimonials].slice(0, 6).map((item, idx) => (
            <TestimonialCard key={`col1-${idx}`} data={item} />
          ))}
        </div>

        <div className="marquee-column space-y-6 hidden md:block" style={{ animationDuration: '60s', animationDirection: 'reverse' }}>
          {[...testimonials, ...testimonials].slice(2, 8).map((item, idx) => (
            <TestimonialCard key={`col2-${idx}`} data={item} />
          ))}
        </div>

        <div className="marquee-column space-y-6 hidden lg:block" style={{ animationDuration: '50s' }}>
          {[...testimonials, ...testimonials].slice(4, 10).map((item, idx) => (
            <TestimonialCard key={`col3-${idx}`} data={item} />
          ))}
        </div>
      </div>

      <style>{`
        .marquee-column { animation: scrollUp 45s linear infinite; }
        .marquee-column:hover { animation-play-state: paused; }
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </section>
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
  
  const [bannerData, setBannerData] = useState(null);
  const [isBannersLoading, setIsBannersLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users/banners`);
            if (res.ok) {
                const data = await res.json();
                setBannerData(data);
            }
        } catch (error) { console.error("Failed to fetch banners", error); } 
        finally { setIsBannersLoading(false); }
    };
    fetchBanners();
  }, []); 

  const filteredProducts = products.filter(p => {
      const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const searchPass = nameMatch || descMatch;
      const categoryPass = activeCategory === "All" || p.category === activeCategory;
      return searchPass && categoryPass;
  });

  return (
      <div className="min-h-screen bg-[#F8FAFC] md:pt-20 flex flex-col">
            
            {/* MARQUEE STRIP */}
            <MarqueeStrip />

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-0 mt-0 flex-1 w-full">
                {!isBannersLoading && ( <div className="mt-0"> <OfferCarousel bannerData={bannerData} /> </div> )}
                <CategoryHighlight activeCategory={activeCategory} setActiveCategory={setActiveCategory} products={products} />

                {/* PRODUCT GRID - ANIMATED CONTAINER */}
                <div 
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8"
                >
                    {isLoading && [...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                    
                    {!isLoading && products.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-100"><PackageOpen className="w-10 h-10 text-indigo-500"/></div>
                            <h3 className="text-2xl font-black text-slate-900">Marketplace is Empty</h3>
                            <p className="text-slate-500 mt-2 max-w-md mx-auto">Be the first to list a product and start selling to millions.</p>
                            <Link to="/seller-register" className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 group"><Store className="w-5 h-5" /> Become a Seller <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></Link>
                        </div>
                    )}
                    
                    {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Filter className="w-8 h-8 text-slate-400"/></div>
                            <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                            <p className="text-slate-500 mt-1">We couldn't find any "{activeCategory !== 'All' ? activeCategory : ''}" products matching "{searchQuery}"</p>
                            <button onClick={() => { setSearchQuery(""); if(setActiveCategory) setActiveCategory("All"); }} className="mt-6 flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-5 py-2.5 rounded-xl transition-colors"><XCircle className="w-4 h-4"/> Clear All Filters</button>
                        </div>
                    )}
                    
                    {/* ANIMATED PRODUCT CARDS */}
                    {!isLoading && filteredProducts.map((product, index) => (
                        <ProductCard 
                            key={product._id || product.id} 
                            product={product} 
                            index={index}
                            wishlist={wishlist} 
                            toggleWishlist={toggleWishlist} 
                            addToCart={addToCart} 
                        />
                    ))}
                </div>
            </div>

            {/* --- NEW PREMIUM REVIEWS SECTION --- */}
            <ReviewsSection />

            {/* REUSABLE FOOTER */}
            <Footer />
      </div>
  );
};

export default ShopView;