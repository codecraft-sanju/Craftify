// src/SearchPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, X, TrendingUp, 
  ChevronRight 
} from 'lucide-react';

// ProductCard and Footer import
import ProductCard from './ProductCard'; 
import Footer from './Footer';

const SearchPage = ({ products = [], addToCart, wishlist = [], toggleWishlist }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);

    // Page load hote hi input par focus karein
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Search Logic
    const filteredProducts = query 
        ? products.filter(p => 
            p.name?.toLowerCase().includes(query.toLowerCase()) || 
            p.description?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase())
          )
        : [];

    // Suggestions
    const suggestions = [
        "Custom Wallet", "Handmade Gift", "Perfume", "Couple T-shirt"
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            
            {/* --- HEADER (Search Input) with Theme Background --- */}
            <div 
                className="sticky top-0 z-50 px-4 py-3 flex items-center gap-3 shadow-lg"
                style={{ backgroundColor: '#65280E' }}
            >
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 -ml-2 text-white/90 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                
                <div className="flex-1 relative">
                    {/* Input Field adjusted for Dark Theme */}
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for gifts, brands..." 
                        className="w-full bg-white/10 text-white placeholder:text-white/50 rounded-xl py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-white/20 font-medium border border-white/10"
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="p-4 flex-1">
                
                {/* CASE 1: Query is Empty (Show Suggestions) */}
                {!query && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto">
                        {/* Trending Section */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Trending Now
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((item, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setQuery(item)}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 text-sm font-medium hover:border-[#65280E] hover:text-[#65280E] transition-all active:scale-95"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popular Categories */}
                        <div>
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                                Popular Categories
                            </h3>
                            <div className="space-y-2">
                                {['Fashion', 'Electronics', 'Home Decor', 'Customized'].map((cat, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setQuery(cat)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-colors"
                                    >
                                        <span className="text-slate-700 font-medium group-hover:text-[#65280E]">{cat}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#65280E]" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CASE 2: No Results Found */}
                {query && filteredProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center pt-20 text-center animate-in fade-in duration-300">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No results found</h3>
                        <p className="text-slate-500 mt-1">Try searching for "Wallet" or "Gift"</p>
                    </div>
                )}

                {/* CASE 3: Show Products Grid */}
                {query && filteredProducts.length > 0 && (
                    <div className="max-w-7xl mx-auto">
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Found {filteredProducts.length} results for "<span className="text-slate-900 font-bold">{query}</span>"
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                            {filteredProducts.map(product => (
                                <ProductCard 
                                    key={product._id || product.id} 
                                    product={product} 
                                    wishlist={wishlist} 
                                    toggleWishlist={toggleWishlist} 
                                    addToCart={addToCart} 
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- REUSABLE FOOTER --- */}
            <Footer />
        </div>
    );
};

export default SearchPage;