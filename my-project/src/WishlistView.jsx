// src/WishlistView.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Heart } from 'lucide-react';

const WishlistView = ({ wishlist, addToCart, removeFromWishlist }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-28 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-50 rounded-full">
                <Heart className="w-6 h-6 text-red-500 fill-current" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900">My Wishlist</h1>
                <p className="text-slate-500 font-medium">Saved items for later</p>
            </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Your wishlist is empty</h2>
            <p className="text-slate-500 mt-2 mb-6">Explore our marketplace and save your favorites.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex gap-4 group hover:border-indigo-100 transition-all">
                <div className="w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                  <img 
                    src={product.image || product.coverImage} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                    <button 
                      onClick={() => removeFromWishlist(product._id)}
                      className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">{product.category}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-2"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistView;