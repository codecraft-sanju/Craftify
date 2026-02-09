// src/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  Store,
  Palette,
  AlertCircle,
  ChevronLeft,
  Heart
} from 'lucide-react';

// Import UI components from App.jsx (See step 2 below)
import { PremiumImage, Button, Badge } from './App';

// --- HELPER COMPONENT (Moved from App.jsx) ---
const LiveCustomizer = ({ product, customText, setCustomText, activeImage }) => (
  <div className="relative w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-inner group border border-slate-200">
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

// --- MAIN COMPONENT ---
const ProductDetail = ({ addToCart, openChat, currentUser, products, wishlist, toggleWishlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p._id === id);
  const [customText, setCustomText] = useState('');
  
  // --- Image Gallery State ---
  const [activeImage, setActiveImage] = useState(null);

  // --- Size State ---
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    if (product) {
        // Prefer coverImage, fallback to first image in array, fallback to legacy image
        const initialImage = product.coverImage || (product.images && product.images.length > 0 ? product.images[0].url : product.image);
        setActiveImage(initialImage);
        
        // Reset selections on product change
        setSelectedSize(null);
        setSizeError(false);
    }
  }, [product]);

  // Check if product is in wishlist
  const isInWishlist = wishlist && wishlist.some(item => item._id === product?._id);

  // Check if product has sizes
  const hasSizes = product?.sizes && product.sizes.length > 0;

  const handleAddToCart = () => {
      // Logic: Agar product me sizes hain aur user ne select nahi kiya
      if (hasSizes && !selectedSize) {
          setSizeError(true);
          // Shake effect or simple alert can be added here
          return;
      }

      addToCart({
        ...product,
        selectedSize: selectedSize, // Add size to cart item
        customization: customText ? { text: customText } : null,
      });
  };

  if (!product)
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        {/* Note: RefreshCcw is not imported here to keep imports clean, using simple text or you can import it if needed */}
        <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-slate-500 mt-4 font-medium">Loading details...</p>
      </div>
    );

  return (
    <div className="pt-28 pb-32 max-w-7xl mx-auto px-6 animate-in">
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold text-sm transition-colors w-fit"
      >
        <div className="p-2 rounded-full bg-white border border-slate-200 group-hover:border-slate-300 transition-colors shadow-sm">
          <ChevronLeft className="w-4 h-4" />
        </div>
        Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        
        {/* --- LEFT COLUMN: GALLERY --- */}
        <div className="space-y-6">
          <LiveCustomizer
            product={product}
            customText={customText}
            setCustomText={setCustomText}
            activeImage={activeImage} // Pass active image
          />

          {/* --- THUMBNAILS GRID (With Premium Loader) --- */}
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                    <button 
                        key={index}
                        onClick={() => setActiveImage(img.url)}
                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${activeImage === img.url ? 'border-indigo-600 ring-4 ring-indigo-50 scale-95' : 'border-transparent hover:border-slate-200'}`}
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
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-4 -mt-4 z-0"></div>
              <div className="relative z-10">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="Type name or text here..."
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 tracking-widest">
                    {customText.length}/20
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-3 ml-1">
                  The text will be printed exactly as shown in the preview.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: DETAILS --- */}
        <div className="flex flex-col h-full lg:pt-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Badge color="indigo">{product.category}</Badge>
              
              {/* --- STOCK LOGIC START --- */}
              {product.stock <= 0 ? (
                <Badge color="red">Sold Out</Badge>
              ) : product.stock <= (product.lowStockThreshold || 5) ? (
                // Agar Stock 5 se kam hai toh ye dikhega
                <Badge color="amber" className="animate-pulse border-amber-200 bg-amber-100 text-amber-700">
                  🔥 Hurry! Only {product.stock} Left
                </Badge>
              ) : (
                <Badge color="green">In Stock</Badge>
              )}
              {/* --- STOCK LOGIC END --- */}

            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center justify-between border-y border-slate-100 py-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Sold by
                  </p>
                  <p className="font-bold text-slate-900">
                    {product.shop?.name || 'Verified Seller'}
                  </p>
                </div>
              </div>
              <div className="text-4xl font-black text-slate-900">
                ₹{product.price}
              </div>
            </div>

            {/* --- SIZE SELECTION UI --- */}
            {hasSizes && (
                <div className="mb-8 animate-in slide-in-right">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className={`font-bold text-sm ${sizeError ? 'text-red-600' : 'text-slate-900'}`}>
                            Select Size {sizeError && <span className="text-red-500 font-normal">- Required</span>}
                        </h3>
                        <span className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline">Size Guide</span>
                    </div>
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
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    {sizeError && (
                        <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Please select a size to continue
                        </p>
                    )}
                </div>
            )}

            <p className="text-slate-600 leading-relaxed text-lg mb-10">
              {product.description}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => openChat(product)}
                className="flex-1 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-6 py-4 rounded-2xl hover:bg-indigo-100 transition-all border border-indigo-100 active:scale-95"
              >
                <MessageSquare className="w-5 h-5" /> Chat with Seller
              </button>
              
              <button 
                onClick={() => toggleWishlist(product)}
                className={`p-4 rounded-2xl border transition-all active:scale-95 ${isInWishlist ? 'border-red-100 bg-red-50 text-red-500' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100'}`}
              >
                <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          <div className="mt-auto sticky bottom-6 md:static z-20">
            {/* Call handleAddToCart instead of direct addToCart */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full shadow-2xl shadow-indigo-600/30 text-lg py-5"
              disabled={product.stock <= 0}
              variant="primary"
            >
              <ShoppingBag className="w-6 h-6 mr-2" />{' '}
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;