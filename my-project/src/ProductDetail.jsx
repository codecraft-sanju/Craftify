// src/ProductDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  Store,
  Palette,
  Heart
} from 'lucide-react';

import { PremiumImage, Button, Badge } from './App';
import ProductCard from './ProductCard';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL;

const LiveCustomizer = ({ product, customText, activeImage, isMobileView }) => (
  <div className={`relative w-full aspect-square bg-slate-50 ${isMobileView ? '' : 'rounded-3xl'} overflow-hidden border border-slate-100 shadow-sm`}>
    <PremiumImage
      src={activeImage || product.coverImage || product.image}
      className="w-full h-full object-cover"
      alt="Product Preview"
    />
    {customText && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl font-bold text-white drop-shadow-lg pointer-events-none text-center px-4 w-full break-words tracking-tight">
        {customText}
      </div>
    )}
  </div>
);

const ProductDetail = ({ addToCart, openChat, currentUser, products, wishlist, toggleWishlist }) => {
  const { id } = useParams();
  const product = products.find((p) => p._id === id);
  const [customText, setCustomText] = useState('');
  
  const [activeImage, setActiveImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  
  // --- NAYA CODE: Colors ke liye state ---
  const [selectedColor, setSelectedColor] = useState(null);
  const [colorError, setColorError] = useState(false);
  // ---------------------------------------

  const [activeIndex, setActiveIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  const scrollRef = useRef(null);

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
        // DEBUGGING LOG: Browser console me dikhega ki product me kya data aaya hai
        console.log("🔥 DEBUG - Product Data in Detail Page:", product);
        console.log("🎨 DEBUG - Product Colors:", product.colors);

        const initialImage = product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : product.image);
        setActiveImage(initialImage);
        setSelectedSize(null);
        setSizeError(false);
        setSelectedColor(null); // Reset color on load
        setColorError(false);
        setCustomText('');
        setActiveIndex(0);
        if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }
  }, [product]);

  const isInWishlist = wishlist && wishlist.some(item => item._id === product?._id);
  const hasSizes = product?.sizes && product.sizes.length > 0;
  
  // --- NAYA CODE: Check karna ki colors hain ya nahi ---
  const hasColors = product?.colors && product.colors.length > 0;
  
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
      // --- NAYA CODE: Color validation ---
      if (hasColors && !selectedColor) {
          setColorError(true);
          return;
      }
      
      // --- FIX: Separated product and options arguments ---
      addToCart(product, {
        selectedSize: selectedSize,
        selectedColor: selectedColor ? (typeof selectedColor === 'object' ? selectedColor.name : selectedColor) : null,
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
    <>
      <div className="pt-2 md:pt-32 pb-20 max-w-7xl mx-auto px-0 md:px-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 lg:gap-20 items-start">
          
          {/* --- LEFT COLUMN: GALLERY --- */}
          <div className="w-full max-w-xl mx-auto space-y-6">
            <div className="relative">
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

              <div className="hidden md:block">
                <LiveCustomizer
                  product={product}
                  customText={customText}
                  activeImage={activeImage}
                  isMobileView={false}
                />
              </div>

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

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide md:grid md:grid-cols-5 md:gap-4">
                  {allImages.map((img, index) => (
                      <button 
                          key={index}
                          onClick={() => {
                            setActiveImage(img.url);
                            setActiveIndex(index);
                            if (scrollRef.current) {
                              scrollRef.current.scrollTo({
                                left: scrollRef.current.offsetWidth * index,
                                behavior: 'smooth'
                              });
                            }
                          }}
                          className={`flex-shrink-0 w-16 h-16 md:w-full md:aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                          <PremiumImage 
                              src={img.url} 
                              className="w-full h-full object-cover" 
                              alt={`Thumbnail ${index}`} 
                          />
                      </button>
                  ))}
              </div>
            )}

            {product.customizationAvailable && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mx-4 md:mx-0">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  Personalize Your Item
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={20}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter name or short text..."
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 tracking-tighter">
                    {customText.length}/20
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: DETAILS --- */}
          <div className="flex flex-col h-full pt-8 md:pt-2 px-5 md:px-0">
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <Badge color="indigo" className="text-[10px] uppercase font-bold tracking-widest px-3">{product.category}</Badge>
                
                {product.stock <= 0 ? (
                  <Badge color="red" className="font-bold">Out of Stock</Badge>
                ) : product.stock <= (product.lowStockThreshold || 5) ? (
                  <Badge color="amber" className="animate-pulse font-bold">
                    Limited: Only {product.stock} Left
                  </Badge>
                ) : (
                  <Badge color="green" className="font-bold">Ready to Ship</Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 leading-[1.1] tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center justify-between border-y border-slate-50 py-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 border border-indigo-100">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Store</p>
                    <p className="font-bold text-slate-800">
                      {product.shop?.name || 'Giftomize Select'}
                    </p>
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                  ₹{product.price}
                </div>
              </div>

              {/* --- NAYA CODE: CHOOSE COLOR UI --- */}
              {hasColors && (
                  <div className="mb-8">
                      <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 ${colorError ? 'text-red-600' : 'text-slate-400'}`}>
                          Choose Color {colorError && <span className="text-red-500 font-medium ml-1">— Required</span>}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                          {product.colors.map((color, idx) => {
                              const colorName = typeof color === 'string' ? color : color.name;
                              const colorHex = typeof color === 'string' ? color.toLowerCase() : color.hexCode;
                              const colorImage = typeof color === 'object' ? color.imageUrl : null;

                              return (
                                  <button
                                      key={idx}
                                      onClick={() => {
                                          setSelectedColor(color);
                                          setColorError(false);
                                          // Image swap logic
                                          if (colorImage) setActiveImage(colorImage);
                                      }}
                                      className={`h-12 px-4 rounded-xl font-bold border-2 transition-all active:scale-95 flex items-center gap-2 ${
                                          selectedColor === color
                                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                          : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                      }`}
                                  >
                                      {colorHex && (
                                          <span 
                                              className="w-4 h-4 rounded-full shadow-inner border border-black/10" 
                                              style={{ backgroundColor: colorHex }}
                                          ></span>
                                      )}
                                      {colorName}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              )}
              {/* --------------------------------- */}

              {hasSizes && (
                  <div className="mb-10">
                      <h3 className={`font-bold text-xs uppercase tracking-widest mb-4 ${sizeError ? 'text-red-600' : 'text-slate-400'}`}>
                          Choose Size {sizeError && <span className="text-red-500 font-medium ml-1">— Required</span>}
                      </h3>
                      <div className="flex flex-wrap gap-3">
                          {product.sizes.map((size) => (
                              <button
                                  key={size}
                                  onClick={() => {
                                      setSelectedSize(size);
                                      setSizeError(false);
                                  }}
                                  className={`min-w-[3.5rem] h-12 px-4 rounded-xl font-bold border-2 transition-all active:scale-95 ${
                                      selectedSize === size
                                      ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                  }`}
                              >
                                  {size}
                              </button>
                          ))}
                      </div>
                  </div>
              )}

              <div className="prose prose-slate mb-10">
                <p className="text-slate-600 leading-relaxed text-lg font-medium">
                  {product.description}
                </p>
              </div>
              
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => openChat(product)}
                  className="flex-[3] flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50/50 px-6 py-4 rounded-2xl hover:bg-indigo-50 transition-all border border-indigo-100 active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" /> <span>Inquire Now</span>
                </button>
                
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`p-4 rounded-2xl border transition-all active:scale-95 ${isInWishlist ? 'border-red-100 bg-red-50 text-red-500 shadow-sm' : 'border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <div className="mt-auto sticky bottom-4 md:static z-30">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full shadow-2xl shadow-indigo-200 text-lg py-5 rounded-2xl font-bold transition-all hover:-translate-y-1"
                disabled={product.stock <= 0}
                variant="primary"
              >
                <ShoppingBag className="w-6 h-6 mr-2" />
                {product.stock > 0 ? 'Add to Shopping Bag' : 'Sold Out'}
              </Button>
            </div>
          </div>
        </div>

        {/* --- RELATED PRODUCTS SECTION --- */}
        <div className="mt-24 pt-16 border-t border-slate-50 px-5 md:px-0">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">Handpicked for You</h2>
            <div className="h-[2px] flex-1 bg-slate-50 ml-8 rounded-full hidden md:block" />
          </div>
          
          {isLoadingRelated ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
            <div className="py-16 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">No similar treasures found right now.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;