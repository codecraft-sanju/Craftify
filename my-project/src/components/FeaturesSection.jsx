import React from 'react';

export default function FeaturesSection() {
  return (
    <section className="py-10 bg-[#FDF1E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side: Images in a dynamic, overlapping Collage */}
          <div className="relative h-[350px] w-full max-w-lg mx-auto md:max-w-none md:h-[400px] group">
            
            {/* Decorative Background Shadow (moves dynamically with group hover) */}
            <div className="absolute inset-x-8 inset-y-8 bg-[#e8d5c4] rounded-3xl transform -z-10 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 shadow-inner"></div>

            {/* Image 1: Rings (Top-Left, tilted back slightly) */}
            <img
              src="https://i.pinimg.com/736x/63/0f/2d/630f2d3d40c4d30e333b4d93d0088747.jpg"
              alt="Beautiful Customized Rings"
              className="absolute top-0 left-0 w-[65%] h-[75%] rounded-3xl shadow-xl object-cover transform rotate-[-4deg] transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 z-10"
            />

            {/* Image 2: Romantic Couple Setup (Bottom-Right, tilted forward slightly, overlapping Image 1) */}
            <img
              src="https://i.pinimg.com/736x/17/01/2e/17012ecb5611bdd1daf9bcae67dcd802.jpg"
              alt="Customized Romantic Couple Gifts"
              className="absolute bottom-0 right-0 w-[68%] h-[72%] rounded-3xl shadow-2xl object-cover border-8 border-[#FDF1E6] transform rotate-[4deg] transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 z-20"
            />
          </div>

          {/* Right Side: Features List (Retained from previous turn) */}
          <div className="space-y-4 pl-0 lg:pl-10">
            
            {/* Section Title for better context */}
            <div className="mb-6">
              <h2 className="text-3xl lg:text-4xl font-serif text-[#5c3a21] mb-2">Why Choose Us?</h2>
              {/* Correct broad text for all customized gifts */}
              <p className="text-gray-600 text-lg font-light">We craft memories through our unique customized gifts. Here is what makes us special.</p>
            </div>
            
            {/* Feature 1: Premium Quality (Updated Icon from previous turn) */}
            <div className="flex items-start group p-3 -ml-3 rounded-2xl hover:bg-white/40 transition-colors duration-300">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#f3e6d8] text-[#5c3a21] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#5c3a21] group-hover:text-white shadow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </div>
              <div className="ml-4 mt-1">
                <h3 className="text-xl font-serif text-[#5c3a21]">Premium Quality</h3>
                <p className="mt-1 text-gray-600 text-base">Crafted with love and high-quality materials</p>
              </div>
            </div>

            {/* Feature 2: Top-notch support */}
            <div className="flex items-start group p-3 -ml-3 rounded-2xl hover:bg-white/40 transition-colors duration-300">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#f3e6d8] text-[#5c3a21] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#5c3a21] group-hover:text-white shadow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <div className="ml-4 mt-1">
                <h3 className="text-xl font-serif text-[#5c3a21]">Top-notch support</h3>
                <p className="mt-1 text-gray-600 text-base">24x7 Customer Support</p>
              </div>
            </div>

            {/* Feature 3: Secure Payment */}
            <div className="flex items-start group p-3 -ml-3 rounded-2xl hover:bg-white/40 transition-colors duration-300">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#f3e6d8] text-[#5c3a21] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#5c3a21] group-hover:text-white shadow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div className="ml-4 mt-1">
                <h3 className="text-xl font-serif text-[#5c3a21]">Secure Payment</h3>
                <p className="mt-1 text-gray-600 text-base">24 hours a day, 7 days a week</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}