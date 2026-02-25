// src/ProductDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  Store,
  Palette,
  AlertCircle,
  Heart
} from 'lucide-react';

import { PremiumImage, Button, Badge } from './App';
// --- IMPORT THE REUSABLE PRODUCT CARD ---
import ProductCard from './ProductCard';

const API_URL = import.meta.env.VITE_API_URL;

const LiveCustomizer = ({ product, customText, activeImage, isMobileView }) => (
  <div className={`relative w-full aspect-square bg-slate-100 ${isMobileView ? '' : 'rounded-2xl md:rounded-3xl'} overflow-hidden shadow-inner group border border-slate-200`}>
    <PremiumImage
      src={activeImage || product.coverImage || product.image}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      alt="Preview"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {customText && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-4xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] pointer-events-none text-center px-4 w-full break-words tracking-tight">
        {customText}
      </div>
    )}
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
        Live Preview
      </span>
    </div>
  </div>
);

const ProductDetail = ({ addToCart, openChat, currentUser, products, wishlist, toggleWishlist }) => {
  const { id } = useParams();
  const product = products.find((p) => p._id === id);
  const [customText, setCustomText] = useState('');
  
  const [activeImage, setActiveImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // --- RELATED PRODUCTS STATE ---
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  const scrollRef = useRef(null);

  // --- SCROLL TO TOP & FETCH RELATED PRODUCTS ---
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchRelatedProducts = async () => {
      try {
        setIsLoadingRelated(true);
        const res = await fetch(`${API_URL}/api/products/${id}/related`);
        if (res.ok) {
          const data = await res.json();
          setRelatedProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch related products", error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    if (id) {
        fetchRelatedProducts();
    }
  }, [id]);

  useEffect(() => {
    if (product) {
        const initialImage = product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : product.image);
        setActiveImage(initialImage);
        setSelectedSize(null);
        setSizeError(false);
        setCustomText('');
        setActiveIndex(0);
        if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }
  }, [product]);

  const isInWishlist = wishlist && wishlist.some(item => item._id === product?._id);
  const hasSizes = product?.sizes && product.sizes.length > 0;
  
  const allImages = product?.images?.length > 0 
    ? product.images 
    : [{ url: product?.image || product?.coverImage }];

  const handleScroll = (e) => {
    const width = e.target.offsetWidth;
    const index = Math.round(e.target.scrollLeft / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
      setActiveImage(allImages[index].url);
    }
  };

  const handleAddToCart = () => {
      if (hasSizes && !selectedSize) {
          setSizeError(true);
          return;
      }
      addToCart({
        ...product,
        selectedSize: selectedSize,
        customization: customText ? { text: customText } : null,
      });
  };

  if (!product)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-slate-500 mt-4 font-medium">Loading details...</p>
      </div>
    );

  return (
    <div className="pt-16 md:pt-32 pb-20 max-w-7xl mx-auto px-0 md:px-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 lg:gap-16 items-start">
        {/* --- LEFT COLUMN: GALLERY --- */}
        <div className="space-y-4 md:space-y-6">
          <div className="relative">
            {/* Mobile Swipe Container */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:hidden"
            >
              {allImages.map((img, idx) => (
                <div key={idx} className="min-w-full snap-center">
                  <LiveCustomizer
                    product={product}
                    customText={customText}
                    activeImage={img.url}
                    isMobileView={true}
                  />
                </div>
              ))}
            </div>

            {/* Desktop Static Display */}
            <div className="hidden md:block">
              <LiveCustomizer
                product={product}
                customText={customText}
                activeImage={activeImage}
                isMobileView={false}
              />
            </div>

            {/* Mobile Dots */}
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
                {allImages.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails (Both Desktop & Mobile Scroll) */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide md:grid md:grid-cols-5 md:gap-4">
                {allImages.map((img, index) => (
                    <button 
                        key={index}
                        onClick={() => {
                          setActiveImage(img.url);
                          setActiveIndex(index);
                          // Sync mobile scroll if user clicks thumbnail on desktop/tablet
                          if (scrollRef.current) {
                            scrollRef.current.scrollTo({
                              left: scrollRef.current.offsetWidth * index,
                              behavior: 'smooth'
                            });
                          }
                        }}
                        className={`flex-shrink-0 w-16 h-16 md:w-full md:aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img.url ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-transparent hover:border-slate-200'}`}
                    >
                        <PremiumImage 
                            src={img.url} 
                            className="w-full h-full object-cover" 
                            alt={`view-${index}`} 
                        />
                    </button>
                ))}
            </div>
          )}

          {product.customizationAvailable && (
            <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden mx-4 md:mx-0">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-[3rem] -mr-4 -mt-4 z-0 opacity-50"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm md:text-base">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Palette className="w-4 h-4" />
                  </div>
                  Personalize It
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={20}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl px-4 py-3 md:py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 text-sm md:text-base"
                    placeholder="Type name or text here..."
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 tracking-widest">
                    {customText.length}/20
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: DETAILS --- */}
        <div className="flex flex-col h-full pt-6 md:pt-0 px-4 md:px-0">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge color="indigo" className="text-[10px] md:text-xs uppercase tracking-wider font-bold">{product.category}</Badge>
              
              {product.stock <= 0 ? (
                <Badge color="red" className="font-bold">Sold Out</Badge>
              ) : product.stock <= (product.lowStockThreshold || 5) ? (
                <Badge color="amber" className="animate-pulse border-amber-200 bg-amber-100 text-amber-700 font-bold">
                  🔥 Only {product.stock} Left
                </Badge>
              ) : (
                <Badge color="green" className="font-bold">In Stock</Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center justify-between border-y border-slate-100 py-5 md:py-6 mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sold by</p>
                  <p className="font-bold text-slate-900 text-sm md:text-base">
                    {product.shop?.name || 'Verified Seller'}
                  </p>
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-black text-slate-900">
                ₹{product.price}
              </div>
            </div>

            {hasSizes && (
                <div className="mb-8">
                    <h3 className={`font-bold text-sm uppercase tracking-wide mb-4 ${sizeError ? 'text-red-600' : 'text-slate-500'}`}>
                        Select Size {sizeError && <span className="text-red-500 font-normal ml-2">(Required)</span>}
                    </h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                onClick={() => {
                                    setSelectedSize(size);
                                    setSizeError(false);
                                }}
                                className={`min-w-[3rem] md:min-w-[3.5rem] h-11 md:h-12 px-3 md:px-4 rounded-xl font-bold border-2 transition-all active:scale-95 text-sm md:text-base ${
                                    selectedSize === size
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="prose prose-slate mb-8 md:mb-10">
              <p className="text-slate-600 leading-relaxed text-base md:text-lg font-medium">
                {product.description}
              </p>
            </div>
            
            <div className="flex gap-3 md:gap-4 mb-6 md:mb-0">
              <button
                onClick={() => openChat(product)}
                className="flex-[2] md:flex-1 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-4 rounded-xl md:rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95"
              >
                <MessageSquare className="w-5 h-5" /> <span className="hidden sm:inline">Chat with Seller</span><span className="sm:hidden">Chat</span>
              </button>
              
              <button 
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-xl md:rounded-2xl border transition-all active:scale-95 ${isInWishlist ? 'border-red-100 bg-red-50 text-red-500' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100'}`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mt-auto sticky bottom-4 md:static z-30 px-4 md:px-0">
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full shadow-xl shadow-indigo-600/20 text-base md:text-lg py-4 md:py-5 rounded-xl md:rounded-2xl font-bold"
              disabled={product.stock <= 0}
              variant="primary"
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>

      {/* --- RELATED PRODUCTS SECTION --- */}
      <div className="mt-16 md:mt-24 pt-10 md:pt-12 border-t border-slate-100 px-4 md:px-0">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">You Might Also Like</h2>
          <div className="h-1 flex-1 bg-slate-50 ml-6 rounded-full hidden md:block" />
        </div>
        
        {isLoadingRelated ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((item) => (
                <ProductCard 
                    key={item._id} 
                    product={item} 
                    wishlist={wishlist} 
                    toggleWishlist={toggleWishlist} 
                />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic font-medium">No recommendations found right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;