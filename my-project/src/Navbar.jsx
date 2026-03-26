// src/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Changed: Added Menu and X (close) icons for the hamburger menu
import { ShoppingBag, User, Heart, Search, Menu, X, Home } from 'lucide-react';

const Navbar = ({ cart, wishlist, currentUser, setIsCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Changed: Added state to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Logic to determine if Navbar should be shown
  const showNavbar = ![
    '/search', 
    '/admin-login', 
    '/seller-register',
    '/seller-login',
    '/login',
    '/register',
  ].includes(location.pathname);

  const exactHidePaths = [
    '/search', 
    '/',
    '/my-shop',
    '/founder',
    '/seller-register',
    '/seller-login',
    '/admin-login',
    '/login',
    '/register',
  ];
  
  if (exactHidePaths.includes(location.pathname)) return null;

  const THEME_BG = '#65280E';

  // Changed: Helper function to close menu and navigate
  const handleMobileNav = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
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
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .stagger-item {
          opacity: 0;
        }
        .menu-is-open .stagger-item {
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .menu-is-open .delay-1 { animation-delay: 0.1s; }
        .menu-is-open .delay-2 { animation-delay: 0.15s; }
        .menu-is-open .delay-3 { animation-delay: 0.2s; }
        .menu-is-open .delay-4 { animation-delay: 0.25s; }
      `}</style>

      {/* --- DESKTOP NAVBAR (Unchanged) --- */}
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
              to={currentUser ? '/profile' : '/register'}
              className="hover:text-yellow-400 transition-colors hover:bg-white/5 px-3 py-2 rounded-lg"
            >
              My Orders
            </Link>
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="p-2.5 rounded-full relative transition-colors hover:bg-white/10 text-white hover:text-yellow-400"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full relative transition-colors hover:bg-white/10 text-white hover:text-yellow-400 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:animate-bounce-short" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#65280E] px-1">
                  {cart.length > 9 ? '9+' : cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => currentUser ? navigate('/profile') : navigate('/register')}
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

      {/* --- CHANGED: MOBILE HEADER WITH HAMBURGER --- */}
      <div 
        className="md:hidden fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-4 shadow-md transition-colors duration-300"
        style={{ backgroundColor: THEME_BG, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* HAMBURGER ICON */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -ml-2 text-white hover:text-yellow-400 transition-transform duration-300 active:scale-90"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* LOGO */}
        <Link to="/shop" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="p-0.5 bg-white/10 rounded-md border border-white/10">
             <img
                src="/gifticon.jpg"
                alt="Giftomize Logo"
                className="w-7 h-7 rounded-sm object-cover"
             />
          </div>
          <span className="text-xl font-black tracking-tighter shimmer-text uppercase">
            Giftomize
          </span>
        </Link>
        
        {/* QUICK ACTIONS (Search & Cart) */}
        <div className="flex items-center gap-1">
            <button
              onClick={() => { setIsMobileMenuOpen(false); navigate('/search'); }}
              className="p-2 text-white hover:text-yellow-400 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}
              className="p-2 relative text-white hover:text-yellow-400 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-red-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full border border-[#65280E] px-0.5">
                  {cart.length > 9 ? '9+' : cart.length}
                </span>
              )}
            </button>
        </div>
      </div>

      {/* --- CHANGED: MOBILE SLIDE-OUT MENU --- */}
      {/* Overlay to dim background when menu is open */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* The Menu Panel */}
      <div 
        className={`md:hidden fixed top-20 left-4 right-4 z-50 flex flex-col p-2 shadow-2xl rounded-3xl border border-white/20 overflow-hidden backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileMenuOpen ? 'menu-is-open opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'}`}
        style={{ 
          backgroundColor: 'rgba(101, 40, 14, 0.85)' 
        }}
      >
        <div className="flex flex-col p-2 space-y-1">
          {/* User Profile Summary at Top of Menu */}
          <div 
            className="stagger-item delay-1 flex items-center gap-3 p-4 mb-2 rounded-2xl bg-white/10 border border-white/10 cursor-pointer hover:bg-white/20 transition-colors shadow-inner"
            onClick={() => handleMobileNav(currentUser ? '/profile' : '/login')}
          >
             {currentUser ? (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black text-[#65280E] bg-yellow-400 border-2 border-white/20 overflow-hidden shrink-0 shadow-md">
                  {currentUser.avatar && currentUser.avatar.includes('http') ? (
                    <img src={currentUser.avatar} className="w-full h-full object-cover" alt={currentUser.name} />
                  ) : (
                    <span>{currentUser.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 text-white shrink-0 shadow-md">
                  <User className="w-6 h-6" />
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-black text-base tracking-wide truncate">
                  {currentUser ? currentUser.name : 'Sign In / Register'}
                </span>
                {currentUser && (
                  <span className="text-yellow-400 text-sm font-semibold truncate">View Profile</span>
                )}
              </div>
          </div>

          <button
            onClick={() => handleMobileNav('/shop')}
            className="stagger-item delay-2 w-full flex items-center gap-4 px-5 py-4 text-white hover:text-yellow-400 hover:bg-white/10 rounded-2xl transition-all font-bold text-lg"
          >
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <Home className="w-5 h-5" />
            </div>
            Marketplace
          </button>

          <button
            onClick={() => handleMobileNav('/wishlist')}
            className="stagger-item delay-3 w-full flex items-center justify-between px-5 py-4 text-white hover:text-yellow-400 hover:bg-white/10 rounded-2xl transition-all font-bold text-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/5">
                <Heart className="w-5 h-5" />
              </div>
              Wishlist
            </div>
            {wishlist.length > 0 && (
              <span className="bg-yellow-400 text-[#65280E] text-sm px-2.5 py-0.5 rounded-full font-black shadow-sm">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleMobileNav(currentUser ? '/profile' : '/register')}
            className="stagger-item delay-4 w-full flex items-center gap-4 px-5 py-4 text-white hover:text-yellow-400 hover:bg-white/10 rounded-2xl transition-all font-bold text-lg"
          >
            <div className="p-2 bg-white/5 rounded-xl border border-white/5">
              <ShoppingBag className="w-5 h-5" />
            </div>
            My Orders
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;