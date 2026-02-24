import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Box } from 'lucide-react';

const Navbar = ({ cart, wishlist, currentUser, setIsCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Logic to determine if Navbar should be shown
  const showNavbar = ![
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

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-white/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-2 cursor-pointer group">
            <img
              src="/gifticon.jpg"
              alt="Giftomize Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all group-hover:scale-105"
            />
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              GIFTOMIZE<span className="text-indigo-600"></span>
            </span>
          </Link>

          <div className="flex items-center gap-8 font-bold text-sm text-slate-500">
            <Link to="/shop" className="hover:text-slate-900 transition-colors">
              Marketplace
            </Link>
            <Link
              to="/wishlist"
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              Wishlist{' '}
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              to={currentUser ? '/profile' : '/login'}
              className="hover:text-slate-900 transition-colors"
            >
              My Orders
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 relative text-slate-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <button
              onClick={() =>
                currentUser ? navigate('/profile') : navigate('/login')
              }
              className="flex items-center gap-2 pl-1 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              {currentUser ? (
                <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-md overflow-hidden">
                  {currentUser.avatar && currentUser.avatar.includes('http') ? (
                    <img
                      src={currentUser.avatar}
                      className="w-full h-full object-cover"
                      alt={currentUser.name}
                    />
                  ) : (
                    <span className="text-sm font-bold">
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-2 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-6">
        <Link to="/shop" className="flex items-center gap-2">
          <img
            src="/gifticon.jpg"
            alt="Giftomize Logo"
            className="w-8 h-8 rounded-lg object-cover shadow-md"
          />
          <span className="text-lg font-bold text-slate-900">
            Giftomize<span className="text-indigo-600">.</span>
          </span>
        </Link>
        <button
          onClick={() => setIsCartOpen(true)}
          className="p-2 relative text-slate-900"
        >
          <ShoppingBag className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </>
  );
};

export default Navbar;