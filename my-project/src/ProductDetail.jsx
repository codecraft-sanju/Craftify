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
  PackageCheck,
  Star,
  X,
  PenLine
} from 'lucide-react';

import { PremiumImage, Button, Badge } from './App';
import ProductCard from './ProductCard';
import Footer from './Footer';

const API_URL = import.meta.env.VITE_API_URL;
// Fetching Cloudinary variables from .env
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

const optimizeCloudinaryUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return url;
    if (url.includes('/upload/f_auto,q_auto')) return url;
    const parts = url.split('/upload/');
    if (parts.length === 2) return `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
    return url;
};

// Helper function to upload image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", UPLOAD_PRESET); 
  data.append("cloud_name", CLOUD_NAME); 

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: data,
    });
    
    if (!res.ok) throw new Error("Failed to upload image");
    const json = await res.json();
    return json.secure_url; 
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
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
  
  const productFromProps = products.find((p) => p._id === id);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(!productFromProps);
  
  // FIX: Priority fetchedProduct ko di hai taki review submit hone pe update turant dikhe
  const product = fetchedProduct || productFromProps; 

  const [activeImage, setActiveImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);

  // --- REVIEWS STATE ---
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0); 
  const [comment, setComment] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); 
  // ---------------------

  const scrollRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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
  }, [id, productFromProps]); 

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

  // --- REVIEW HANDLERS ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReviewImage(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setReviewError("Please login to write a review.");
      return;
    }
    
    if (rating === 0) {
      setReviewError("Please select a rating.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');
    
    try {
      let imageUrl = null;
      
      if (reviewImage) {
        imageUrl = await uploadImageToCloudinary(reviewImage);
        if (!imageUrl) {
          throw new Error("Image upload failed. Please try without image or try again.");
        }
      }

      const res = await fetch(`${API_URL}/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          rating,
          comment,
          image: imageUrl
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Review submitted successfully!");
        setRating(5);
        setComment('');
        setReviewImage(null);
        setReviewImagePreview(null);
        setIsReviewModalOpen(false); 
        
        // Fetch updated product to show the review immediately
        const updatedRes = await fetch(`${API_URL}/api/products/${id}`);
        if(updatedRes.ok) {
            const updatedData = await updatedRes.json();
            setFetchedProduct(updatedData); 
        }
      } else {
        setReviewError(data.message || "Something went wrong while submitting review.");
      }
    } catch (error) {
       setReviewError(error.message);
    } finally {
       setIsSubmittingReview(false);
    }
  };
  // -------------------------

  const totalReviews = product?.reviews?.length || 0;
  const averageRating = totalReviews > 0
      ? (product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1)
      : 0;

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

        {/* --- REVIEWS SECTION START --- */}
        <div className="mt-20 pt-10 border-t border-slate-100 px-5 md:px-0">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-3">
                Customer Reviews
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">{totalReviews}</span>
              </h2>
              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="ml-1.5 font-bold text-slate-800 text-lg">{averageRating}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-medium">Average rating</span>
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => setIsReviewModalOpen(true)}
              variant="brand"
              className="flex items-center gap-2 rounded-xl shadow-sm"
            >
              <PenLine className="w-4 h-4" />
              Write a Review
            </Button>
          </div>

          <div>
            {product.reviews && product.reviews.length === 0 ? (
               <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                   <MessageCircle className="w-8 h-8" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-2">No reviews yet</h3>
                 <p className="text-slate-500 text-sm max-w-sm mx-auto">Be the first to share your thoughts about this product and help others make a decision.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product.reviews && [...product.reviews].reverse().map((review, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold border border-indigo-100">
                           {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{review.name}</p>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'New'}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed flex-grow">{review.comment}</p>
                    
                    {review.image && (
                       <div className="mt-4 pt-4 border-t border-slate-50">
                         <img 
                           src={review.image} 
                           alt="Review attachment" 
                           className="w-20 h-20 object-cover rounded-xl border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                           onClick={() => window.open(review.image, '_blank')}
                         />
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* --- REVIEWS SECTION END --- */}

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

      {/* --- REVIEW MODAL START --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-indigo-500" />
                Write a Review
              </h3>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!currentUser ? (
                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
                  <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm text-indigo-900 font-medium mb-1">Authentication Required</p>
                  <p className="text-xs text-indigo-700">Please login to your account to leave a review.</p>
                </div>
              ) : (
                <form onSubmit={submitReviewHandler} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 text-center">How would you rate this product?</label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-10 h-10 transition-colors duration-200 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'fill-slate-50 text-slate-200 stroke-[1.5]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Share your experience</label>
                    <textarea 
                      required
                      rows="4"
                      className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                      placeholder="What did you like or dislike? How was the customization?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Add a Photo (Optional)</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex flex-col items-center justify-center w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-100 hover:border-slate-300 transition-colors">
                          <ImagePlus className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Upload</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                        
                        {reviewImagePreview && (
                          <div className="relative group">
                            <img src={reviewImagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-2xl border border-slate-200 shadow-sm" />
                            <button 
                              type="button"
                              onClick={() => { setReviewImage(null); setReviewImagePreview(null); }}
                              className="absolute -top-2 -right-2 bg-slate-800 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-md hover:bg-red-500 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                    </div>
                  </div>

                  {reviewError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      {reviewError}
                    </div>
                  )}

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      variant="brand" 
                      className="w-full py-3.5 text-sm rounded-xl font-bold"
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview ? (
                         <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                         </div>
                      ) : 'Post Review'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* --- REVIEW MODAL END --- */}
    </>
  );
};

export default ProductDetail;