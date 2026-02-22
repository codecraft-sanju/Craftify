// src/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-500">
      {/* Big visual indicator */}
      <div className="text-9xl font-black text-slate-100 mb-2 drop-shadow-sm select-none">
        404
      </div>
      
      <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
        Oops! Page not found.
      </h1>
      
      <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
        It looks like you have wandered off the path. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      {/* Action buttons to guide the user back */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </button>
        
        <button
          onClick={() => navigate('/products')}
          className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
        >
          <Search className="w-5 h-5" />
          Browse Products
        </button>
      </div>
    </div>
  );
};

export default NotFound;