// ShopView.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ShoppingBag, Filter } from 'lucide-react';

// Reusing Badge here locally to ensure styling matches
const Badge = ({ children, color = "slate" }) => {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    green: "bg-green-100 text-green-700 border-green-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${colors[color]}`}>
      {children}
    </span>
  );
};

const ShopView = ({ activeCategory, setActiveCategory, searchQuery, setSearchQuery, addToCart, products, shops }) => {
  
  // Filter Logic: Category Match + Search Text
  const filteredProducts = products.filter(p => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
      <div className="pt-24 pb-32 max-w-7xl mx-auto px-6 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 mb-2">Marketplace</h2>
                  <p className="text-slate-500">Discover unique goods from independent sellers.</p>
               </div>
               
               {/* Search & Filter */}
               <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                     <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"/>
                     <input 
                       type="text" 
                       placeholder="Search products..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full sm:w-64 pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-shadow focus:shadow-md"
                     />
                  </div>
                  
                  {/* Category Pills */}
                  <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
                     {["All", "Decor", "Clothing", "Accessories", "Gifting"].map(cat => (
                         <button 
                           key={cat}
                           onClick={() => setActiveCategory(cat)}
                           className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                         >
                           {cat}
                         </button>
                      ))}
                  </div>
               </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-slate-300"/>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No products found</h3>
                        <p className="text-slate-500">Try changing your filters or search query.</p>
                    </div>
                ) : (
                    filteredProducts.map(product => {
                        // Backend Compatibility: 
                        // product._id is from MongoDB, product.id is from Mock
                        const productId = product._id || product.id;
                        
                        // Handle Image: Backend might send 'coverImage' or 'image'
                        const displayImage = product.image || product.coverImage || "https://via.placeholder.com/300";

                        // Handle Shop Name: Backend populates 'shop' object, Mock uses 'shopId'
                        const shopName = product.shop?.name 
                            || shops?.find(s => s.id === product.shopId)?.name 
                            || 'Verified Seller';

                        // Stock Logic (Default to true if undefined in mock)
                        const isOutOfStock = product.stock !== undefined && product.stock === 0;

                        return (
                           <Link to={`/product/${productId}`} key={productId} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500 relative flex flex-col">
                               {/* Image Container */}
                               <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                                 <img src={displayImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                                 
                                 {/* Stock Status */}
                                 {isOutOfStock && (
                                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold uppercase tracking-widest z-10 backdrop-blur-sm">Sold Out</div>
                                 )}
                                 
                                 {/* Quick Add Button */}
                                 <button 
                                   onClick={(e) => { e.preventDefault(); addToCart(product); }} 
                                   disabled={isOutOfStock}
                                   className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                   <ShoppingBag className="w-5 h-5" />
                                 </button>
                               </div>

                               {/* Info Container */}
                               <div className="p-6 flex-1 flex flex-col">
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.name}</h3>
                                     <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md">
                                        <Star className="w-3 h-3 fill-current" /> {product.rating || 0}
                                     </div>
                                 </div>
                                 
                                 <p className="text-xs text-slate-500 mb-2">Sold by <span className="text-indigo-600 font-bold">{shopName}</span></p>
                                 
                                 <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                     <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                                     {product.customizationAvailable && <Badge color="purple">Customizable</Badge>}
                                 </div>
                               </div>
                           </Link>
                        );
                    })
                )}
            </div>
      </div>
  );
};

export default ShopView;