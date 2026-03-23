// src/ProductDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Heart,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Share2,
  ImagePlus,
  PackageCheck
} from 'lucide-react';

import { PremiumImage, Button, Badge } from './App';
import ProductCard from './ProductCard';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL;

const optimizeCloudinaryUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
    if (url.includes('/upload/f_auto,q_auto')) return url;
    const parts = url.split('/upload/');
    if (parts.length === 2) return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
    return url;
};

const ProductImagePreview = ({ activeImage, isMobileView }) => (
  <div className={`relative w-full bg-slate-50 flex justify-center items-center ${isMobileView ? '' : 'rounded-3xl'} overflow-hidden border border-slate-100 shadow-sm`}>
    <PremiumImage
      src={optimizeCloudinaryUrl(activeImage)} 
      className="w-full h-auto max-h-[600px] object-contain"
      alt="Product Preview"
    />
  </div>
);

const ProductDetail = ({ addToCart, currentUser, products, wishlist, toggleWishlist }) => {
  const { id } = useParams();
  
  // --- CHANGES MADE HERE: Added local state to handle products missing from the main array ---
  const productFromProps = products.find((p) => p._id === id);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(!productFromProps);
  
  const product = productFromProps || fetchedProduct;
  // ---------------------------------------------------------------------------------------

  const [activeImage, setActiveImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // --- CHANGES MADE HERE: Added fetch logic if product is not in the paginated props ---
    const fetchSingleProduct = async () => {
      if (!productFromProps) {
        try {
          const res = await fetch(`${API_URL}/api/products/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFetchedProduct(data);
          }
        } catch (error) {
          console.error("Failed to fetch product directly", error);
        } finally {
          setIsFetchingProduct(false);
        }
      }
    };

    fetchSingleProduct();
    // ---------------------------------------------------------------------------------------

    const trackProductView = async () => {
        try {
            await fetch(`${API_URL}/api/products/${id}/view`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error("Failed to track view", error);
        }
    };

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
        trackProductView();
    }
  }, [id, productFromProps]); // --- CHANGES MADE HERE: Added productFromProps to dependency array ---

  useEffect(() => {
    if (product) {
        const initialImage = product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : product.image);
        setActiveImage(initialImage);
        setActiveIndex(0);
        if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }
  }, [product]);

  const isInWishlist = wishlist && wishlist.some(item => item._id === product?._id);
  
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
      addToCart(product);
  };

  const handleShare = async () => {
      const shareData = {
          title: `Buy ${product?.name} on Giftomize`,
          text: `Check out this amazing customized gift: ${product?.name} 🔥`,
          url: window.location.href
      };

      try {
          if (navigator.share) {
              await navigator.share(shareData);
          } else {
              await navigator.clipboard.writeText(window.location.href);
              alert("Link copied to clipboard! Share it with your friends.");
          }
      } catch (err) {
          console.error("Error sharing:", err);
      }
  };

  // --- CHANGES MADE HERE: Updated loading state to wait for our new direct API fetch ---
  if (!product && isFetchingProduct)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-slate-500 mt-4 font-medium">Loading details...</p>
      </div>
    );

  if (!product && !isFetchingProduct)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <p className="text-slate-500 mt-4 font-medium">Product not found.</p>
      </div>
    );
  // ---------------------------------------------------------------------------------------

  return (
    <>
      <div className="pt-2 md:pt-24 pb-20 max-w-7xl mx-auto px-0 md:px-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 lg:gap-16 items-start">
          
          <div className="w-full max-w-xl mx-auto space-y-4">
            <div className="relative">
              <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:hidden"
              >
                {allImages.map((img, idx) => (
                  <div key={idx} className="min-w-full snap-center">
                    <ProductImagePreview
                      activeImage={img.url}
                      isMobileView={true}
                    />
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <ProductImagePreview
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
              <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide md:grid md:grid-cols-5 md:gap-3">
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
                          className={`flex-shrink-0 w-16 h-16 md:w-full md:aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                          <PremiumImage 
                              src={optimizeCloudinaryUrl(img.url)} 
                              className="w-full h-full object-contain" 
                              alt={`Thumbnail ${index}`} 
                          />
                      </button>
                  ))}
              </div>
            )}
          </div>

          <div className="flex flex-col h-full pt-6 md:pt-0 px-5 md:px-0">
            <div className="mb-4">
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge color="indigo" className="text-[10px] uppercase font-bold tracking-widest px-2">
                  {product.category}
                </Badge>
                
                {product.stock <= 0 ? (
                  <Badge color="red" className="font-bold text-[10px]">Out of Stock</Badge>
                ) : product.stock <= (product.lowStockThreshold || 5) ? (
                  <Badge color="amber" className="animate-pulse font-bold text-[10px]">
                    Limited: Only {product.stock} Left
                  </Badge>
                ) : (
                  <Badge color="green" className="font-bold text-[10px]">Ready to Ship</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2 leading-tight tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center justify-between border-y border-slate-100 py-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 border border-indigo-100">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Store</p>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {product.shop?.name || 'Giftomize Select'}
                    </p>
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
                  ₹{product.price}
                </div>
              </div>

              <div className="prose prose-slate mb-4">
                <p className="text-slate-600 text-sm font-medium leading-snug line-clamp-3">
                  {product.description}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                     <span className="w-1.5 h-4 bg-[#65280E] rounded-full"></span> 
                     How it works
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/50">
                          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 mb-2">
                              <ShoppingBag className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-bold text-slate-800 text-[10px] leading-tight mb-0.5">1. Order</p>
                          <p className="text-slate-500 text-[9px] leading-tight">Secure it first</p>
                      </div>
                      
                      <div className="flex flex-col items-center p-2 rounded-xl bg-green-50/50 border border-green-100/50">
                          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500 mb-2 relative">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 border border-white rounded-full"></span>
                          </div>
                          <p className="font-bold text-slate-800 text-[10px] leading-tight mb-0.5">2. WhatsApp</p>
                          <p className="text-slate-500 text-[9px] leading-tight">Share details</p>
                      </div>

                      <div className="flex flex-col items-center p-2 rounded-xl bg-orange-50/50 border border-orange-100/50">
                          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500 mb-2">
                              <PackageCheck className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-bold text-slate-800 text-[10px] leading-tight mb-0.5">3. Delivery</p>
                          <p className="text-slate-500 text-[9px] leading-tight">Fast & secure</p>
                      </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[9px] font-medium text-slate-500 px-1">
                      <div className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500"/> 100% Safe Payments</div>
                      <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> Free Cancellation</div>
                  </div>
              </div>
              
              <div className="flex gap-3 mb-4">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${isInWishlist ? 'border-red-100 bg-red-50 text-red-500 shadow-sm' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>

                <button 
                  onClick={handleShare}
                  className="flex-1 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-slate-200"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-bold text-slate-700 truncate">
                    Share with Friends
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-auto sticky bottom-4 md:static z-30">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="w-full shadow-lg shadow-indigo-200/50 text-base py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5"
                disabled={product.stock <= 0}
                variant="brand" 
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {product.stock > 0 ? 'Place Order & Customize Later' : 'Sold Out'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 px-5 md:px-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight">Handpicked for You</h2>
            <div className="h-[2px] flex-1 bg-slate-100 ml-6 rounded-full hidden md:block" />
          </div>
          
          {isLoadingRelated ? (
            <div className="flex justify-center items-center py-12">
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
              <p className="text-slate-400 font-medium text-sm">No similar treasures found right now.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;