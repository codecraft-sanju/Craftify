// src/ShopView.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// --- CHANGES MADE HERE: Added AnimatePresence for the loader exit animation AND product filtering animations ---
import { motion, AnimatePresence } from 'framer-motion';
// --- CHANGES MADE HERE: Removed Quote and BadgeCheck from lucide-react imports ---
import { 
  Search, Filter, PackageOpen, Store, XCircle, ArrowRight, Tag, 
  ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Gift 
} from 'lucide-react'; 

// --- IMPORT THE REUSABLE PRODUCT CARD ---
import ProductCard from './ProductCard'; 
import Footer from './Footer'; // Reusable Footer component

// --- CHANGES MADE HERE: Removed framer-motion import and added ReviewsSection import ---
import ReviewsSection from './ReviewsSection';

// API URL definition (Fallback to localhost if env not set)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// --- CHANGES MADE HERE: Added a new full-screen PageLoader component ---
const PageLoader = () => (
    <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FFFBF0]"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
        >
            <div className="relative">
                <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Gift className="w-16 h-16 text-pink-500" />
                </motion.div>
                <motion.div 
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-pink-500/20 rounded-full blur-[2px]"
                    animate={{ scale: [1, 0.8, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-widest font-serif mt-2">
                GIFTOMIZE
            </h1>
            
            <div className="flex gap-1.5 mt-2">
                <motion.div className="w-2 h-2 rounded-full bg-pink-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 rounded-full bg-indigo-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                <motion.div className="w-2 h-2 rounded-full bg-pink-400" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
            </div>
        </motion.div>
    </motion.div>
);

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

// --- CHANGES MADE HERE: Added a dedicated component to handle image loading state for the carousel ---
const CarouselImage = ({ offer }) => {
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    return (
        <div className="w-full h-full relative bg-slate-900">
            {!isImgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-pink-500 rounded-full animate-spin"></div>
                </div>
            )}
            <picture>
                {offer.mobileImage && (
                    <source media="(max-width: 768px)" srcSet={offer.mobileImage} />
                )}
                <img 
                    src={offer.image} 
                    alt={offer.title} 
                    onLoad={() => setIsImgLoaded(true)}
                    className={`w-full h-full object-cover object-center transition-opacity duration-700 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
            </picture>
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
        /* --- HEIGHT YAHAN BADHAI HAI: h-[300px], h-[400px], h-[500px] --- */
        className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden mb-8 shadow-lg group bg-slate-900 -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] md:mx-0 md:w-full rounded-none md:rounded-3xl"
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      >
        {displayOffers.map((offer, index) => (
          <div key={offer._id || offer.id || index} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
            
            {/* --- CHANGES MADE HERE: Replaced direct image with CarouselImage component for loader --- */}
            <CarouselImage offer={offer} />

            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
               <div className="transform transition-all duration-700 translate-y-0 opacity-100">
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

// --- CHANGES MADE HERE: Added a dedicated component to handle image loading state for Categories ---
const CategoryImage = ({ src, alt, isActive }) => {
    const [isImgLoaded, setIsImgLoaded] = useState(false);
    return (
        <div className="w-full h-full relative bg-slate-100 flex items-center justify-center">
            {!isImgLoaded && (
                <div className="w-6 h-6 border-2 border-slate-300 border-t-pink-400 rounded-full animate-spin absolute"></div>
            )}
            <img 
                src={src} 
                alt={alt} 
                onLoad={() => setIsImgLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-500 ${isImgLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-110`}
            />
            <div className={`absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors ${isActive ? 'bg-black/0' : ''}`} />
        </div>
    );
};

// --- COMPONENT: VISUAL CATEGORIES ---
// --- CHANGES MADE HERE: Added showPageLoader as a prop to delay animations ---
const CategoryHighlight = ({ activeCategory, setActiveCategory, products = [], showPageLoader }) => {
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
        
        <div className="flex gap-6 overflow-x-auto py-4 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] justify-start md:justify-center -mx-4 px-4 sm:-mx-6 sm:px-6 overflow-y-visible">
            {displayCategories.map((cat, idx) => {
                const isActive = activeCategory === cat;
                const image = visualMap[cat] || fallbackImage;
                return (
                  // --- CHANGES MADE HERE: Modified animation logic to wait for the loader to finish ---
                  <motion.button 
                      key={idx} 
                      onClick={() => setActiveCategory(cat)} 
                      initial={{ opacity: 0, y: 40 }}
                      animate={showPageLoader ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                      whileHover={{ y: -5 }}
                      className="group flex flex-col items-center gap-3 min-w-[100px] sm:min-w-[110px] md:min-w-[130px] snap-center"
                  >
                      {/* --- CHANGES MADE HERE: Removed borders and padding from the circular image container --- */}
                      <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md transition-all duration-300 ${isActive ? 'scale-105' : ''}`}>
                          {/* --- CHANGES MADE HERE: Replaced direct image with CategoryImage component --- */}
                          <CategoryImage src={image} alt={cat} isActive={isActive} />
                      </div>
                      <span className={`text-sm font-bold tracking-wide capitalize ${isActive ? 'text-pink-500' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                  </motion.button>
                );
            })}
        </div>
    </div>
  );
};

// --- CHANGES MADE HERE: Removed the review components (FallingText, testimonials, StarIcon, TestimonialCard, ReviewsSection) from this file ---

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
  
  // --- CHANGES MADE HERE: Added state to manage the initial page loader ---
  const [showPageLoader, setShowPageLoader] = useState(true);
  const [bannerData, setBannerData] = useState(null);
  const [isBannersLoading, setIsBannersLoading] = useState(true);

  // --- CHANGES MADE HERE: Added useEffect to dismiss the loader after 2 seconds ---
  useEffect(() => {
      const timer = setTimeout(() => {
          setShowPageLoader(false);
      }, 2000);
      return () => clearTimeout(timer);
  }, []);

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
      
      // --- CHANGES MADE HERE: Made the category filter case-insensitive and robust ---
      const categoryPass = activeCategory === "All" || (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
      
      return searchPass && categoryPass;
  });

  return (
      <div className="min-h-screen bg-[#FFFBF0] md:pt-20 flex flex-col overflow-hidden relative">
            
            {/* --- CHANGES MADE HERE: Added AnimatePresence and the PageLoader component --- */}
            <AnimatePresence>
                {showPageLoader && <PageLoader />}
            </AnimatePresence>

            {/* MARQUEE STRIP */}
            <MarqueeStrip />

            {/* 2. MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-0 mt-0 flex-1 w-full">
                {!isBannersLoading && ( <div className="mt-0"> <OfferCarousel bannerData={bannerData} /> </div> )}
                
                {/* --- CHANGES MADE HERE: Passed showPageLoader state to CategoryHighlight --- */}
                <CategoryHighlight 
                    activeCategory={activeCategory} 
                    setActiveCategory={setActiveCategory} 
                    products={products} 
                    showPageLoader={showPageLoader} 
                />

                {/* --- CHANGES MADE HERE: Added motion.div and AnimatePresence for the grid filter layout animations --- */}
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
                    <AnimatePresence>
                        {isLoading && [...Array(8)].map((_, i) => (
                            <motion.div key={`skeleton-${i}`} layout exit={{ opacity: 0, scale: 0.9 }}>
                                <ProductSkeleton />
                            </motion.div>
                        ))}
                        
                        {!isLoading && products.length === 0 && (
                            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full flex flex-col items-center justify-center py-20 text-center duration-500">
                                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border border-indigo-100"><PackageOpen className="w-10 h-10 text-indigo-500"/></div>
                                <h3 className="text-2xl font-black text-slate-900">Marketplace is Empty</h3>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto">Be the first to list a product and start selling to millions.</p>
                                <Link to="/seller-register" className="mt-8 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 group"><Store className="w-5 h-5" /> Become a Seller <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/></Link>
                            </motion.div>
                        )}
                        
                        {!isLoading && products.length > 0 && filteredProducts.length === 0 && (
                            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full flex flex-col items-center justify-center py-20 text-center duration-500">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Filter className="w-8 h-8 text-slate-400"/></div>
                                <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                                <p className="text-slate-500 mt-1">We couldn't find any "{activeCategory !== 'All' ? activeCategory : ''}" products matching "{searchQuery}"</p>
                                <button onClick={() => { setSearchQuery(""); if(setActiveCategory) setActiveCategory("All"); }} className="mt-6 flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-5 py-2.5 rounded-xl transition-colors"><XCircle className="w-4 h-4"/> Clear All Filters</button>
                            </motion.div>
                        )}
                        
                        {/* PRODUCT CARDS - WRAPPED IN MOTION.DIV FOR LAYOUT ANIMATION */}
                        {!isLoading && filteredProducts.map((product, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                // --- CHANGES MADE HERE: Bound the entrance animation to the showPageLoader state ---
                                animate={showPageLoader ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(5px)" }}
                                transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }} // Added index delay for a cool cascade effect
                                key={product._id || product.id}
                            >
                                <ProductCard 
                                    product={product} 
                                    index={index}
                                    wishlist={wishlist} 
                                    toggleWishlist={toggleWishlist} 
                                    addToCart={addToCart} 
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* --- NEW PREMIUM REVIEWS SECTION --- */}
            <ReviewsSection />

            {/* REUSABLE FOOTER */}
            <Footer />
      </div>
  );
};

export default ShopView;