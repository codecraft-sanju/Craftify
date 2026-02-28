// src/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer 
      className="border-t pt-16 md:pt-20 pb-28 md:pb-10 px-6 md:px-12 mb-0 text-white/80 w-full" 
      style={{ backgroundColor: '#65280E', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-12 mb-16 md:mb-20">
          <div className="w-full border-b pb-8 border-white/10">
            <h2 className="text-[12vw] font-bold leading-none tracking-tighter select-none text-white opacity-10">
              GIFTOMIZE
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm font-medium leading-relaxed text-white/70">
                The operating system for modern Indian D2C brands. Zero inventory, infinite scale.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase text-white/90">Shop</h4>
              <Link to="/" className="hover:text-white hover:translate-x-1 transition-all duration-300 text-white/60 font-medium">Catalog</Link>
              <Link to="/" className="hover:text-white hover:translate-x-1 transition-all duration-300 text-white/60 font-medium">Pricing</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase text-white/90">Company</h4>
              <a href="/privacy" className="hover:text-white hover:translate-x-1 transition-all duration-300 text-white/60 font-medium">Terms</a>
             <Link to="/privacy" className="hover:text-white hover:translate-x-1 transition-all duration-300 text-white/60 font-medium">Privacy</Link>
            </div>
            
            <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
              <h4 className="font-bold text-xs uppercase text-white/90">Support</h4>
              <a href="mailto:giftomizeofficial@gmail.com" className="hover:text-white transition-colors text-white/60 font-medium whitespace-nowrap text-sm">
                giftomizeofficial@gmail.com
              </a>
              <div className="flex flex-col gap-1 text-sm">
                <a href="tel:+917298317177" className="hover:text-white transition-colors text-white/60 font-medium">+91 72983 17177</a>
                <a href="tel:+917568045830" className="hover:text-white transition-colors text-white/60 font-medium">+91 75680 45830</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between border-t pt-8 gap-4 border-white/10">
          <div className="text-xs font-bold flex items-center gap-2 text-white/50">
            <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
            ALL SYSTEMS GO
          </div>
          <p className="text-xs text-white/50">© 2026 GIFTOMIZE INC.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;