import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Heart, Search } from 'lucide-react';

const Navbar = ({ cart, wishlist, currentUser, setIsCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Logic to determine if Navbar should be shown
  const showNavbar = ![
    '/search', 
    '/',
    '/my-shop',
    '/founder',
    '/seller-register',
    '/seller-login',
    '/admin-login',
    '/login',
    '/register',
  ].includes(location.pathname);

  if (!showNavbar) return null;

  // Theme Color Constant
  const THEME_BG = '#65280E';

  return (
    <>
      {/* --- INLINE STYLES FOR SHIMMER EFFECT --- */}
      <style>{`
        @keyframes textShimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .shimmer-text {
          background: linear-gradient(
            to right,
            #FCD34D 20%, 
            #FFF7ED 40%, 
            #FCD34D 60%, 
            #F59E0B 80%
          );
          background-size: 200% auto;
          color: #FCD34D;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textShimmer 3s linear infinite;
        }
      `}</style>

      {/* --- DESKTOP NAVBAR --- */}
      <nav 
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300 shadow-md hidden md:block"
        style={{ backgroundColor: THEME_BG, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <Link to="/shop" className="flex items-center gap-3 cursor-pointer group">
            <div className="p-0.5 bg-white/10 rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 group-hover:border-yellow-400/50 transition-colors">
                <img
                src="/gifticon.jpg"
                alt="Giftomize Logo"
                className="w-10 h-10 rounded-lg object-cover shadow-lg transition-transform group-hover:scale-105"
                />
            </div>
            {/* Stylish Shimmer Text */}
            <span className="text-2xl font-black tracking-tighter shimmer-text uppercase" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              GIFTOMIZE
            </span>
          </Link>

          {/* CENTER LINKS */}
          <div className="flex items-center gap-8 font-bold text-sm text-white/80">
            <Link 
                to="/shop" 
                className="hover:text-yellow-400 transition-colors hover:bg-white/5 px-3 py-2 rounded-lg"
            >
              Marketplace
            </Link>
            
            <Link
              to="/wishlist"
              className="hover:text-yellow-400 transition-colors hover:bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              Wishlist
              {wishlist.length > 0 && (
                <span className="bg-yellow-400 text-[#65280E] text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            <Link
              to={currentUser ? '/profile' : '/login'}
              className="hover:text-yellow-400 transition-colors hover:bg-white/5 px-3 py-2 rounded-lg"
            >
              My Orders
            </Link>
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2">
            
            {/* SEARCH ICON */}
            <button
              onClick={() => navigate('/search')}
              className="p-2.5 rounded-full relative transition-colors hover:bg-white/10 text-white hover:text-yellow-400"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full relative transition-colors hover:bg-white/10 text-white hover:text-yellow-400"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#65280E]"></span>
              )}
            </button>

            {/* Profile Icon */}
            <button
              onClick={() =>
                currentUser ? navigate('/profile') : navigate('/login')
              }
              className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full transition-colors hover:bg-white/10"
            >
              {currentUser ? (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[#65280E] bg-yellow-400 border-2 border-white/20 shadow-md overflow-hidden">
                  {currentUser.avatar && currentUser.avatar.includes('http') ? (
                    <img
                      src={currentUser.avatar}
                      className="w-full h-full object-cover"
                      alt={currentUser.name}
                    />
                  ) : (
                    <span className="text-sm font-black">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all border border-white/10 hover:border-yellow-400 hover:text-yellow-400">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE HEADER --- */}
      <div 
        className="md:hidden fixed top-0 inset-x-0 z-40 h-16 flex items-center justify-between px-4 shadow-md"
        style={{ backgroundColor: THEME_BG, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Link to="/shop" className="flex items-center gap-3">
          <div className="p-0.5 bg-white/10 rounded-lg border border-white/10">
             <img
                src="/gifticon.jpg"
                alt="Giftomize Logo"
                className="w-8 h-8 rounded-md object-cover"
             />
          </div>
          {/* Mobile Shimmer Text */}
          <span className="text-xl font-black tracking-tighter shimmer-text uppercase">
            Giftomize
          </span>
        </Link>
        
        <div className="flex items-center gap-1">
             {/* SEARCH ICON MOBILE */}
             <button
              onClick={() => navigate('/search')}
              className="p-2 relative text-white hover:bg-white/10 hover:text-yellow-400 rounded-full transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>

             <button
              onClick={() => navigate('/wishlist')}
              className="p-2 relative text-white hover:bg-white/10 hover:text-yellow-400 rounded-full transition-colors"
            >
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#65280E]"></span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 relative text-white hover:bg-white/10 hover:text-yellow-400 rounded-full transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#65280E]"></span>
              )}
            </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;