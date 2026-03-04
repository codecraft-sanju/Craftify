import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Quote } from 'lucide-react';

// 1. FallingText Animation Component
const FallingText = ({ text, className = "", delay = 0 }) => {
  const letters = text.split("");
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i + delay },
    }),
  };
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: -50,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.span
      style={{ display: "inline-block" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} style={{ display: "inline-block", minWidth: letter === " " ? "0.3em" : "auto" }}>
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

// 2. Reviews Data
const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    quote: "The customization is next level! I ordered a wallet with my name, and the quality is just wow.",
    rating: 5,
  },
  {
    id: 2,
    name: "Priya Patel",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    quote: "Weekends are busy, but Giftomize made gifting so easy. Delivery was super fast too!",
    rating: 5,
  },
  {
    id: 3,
    name: "Amit Verma",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    quote: "Found unique handmade gifts here that I couldn't find anywhere else. The interface is super clean.",
    rating: 4,
  },
  {
    id: 4,
    name: "Sneha Gupta",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    quote: "Ordering for my team was hassle-free. The bulk order process is smooth. Saves me so much stress!",
    rating: 5,
  },
  {
    id: 5,
    name: "Vikram Singh",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    quote: "As someone who values quality, this app is essential. Premium products, great packaging. Perfect.",
    rating: 5,
  },
  {
    id: 6,
    name: "Anjali Mehta",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    quote: "I recommend Giftomize to everyone. It's not just about buying; it's about supporting local artisans.",
    rating: 5,
  },
  {
    id: 7,
    name: "Rohan Das",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop",
    quote: "The prices are surprisingly affordable for custom goods. Highly recommended for students.",
    rating: 5,
  },
];

const StarIcon = () => (
  // Changed text-yellow-500 to text-[#A79277]
  <svg className="w-3.5 h-3.5 text-[#A79277] fill-current drop-shadow-sm" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialCard = ({ data }) => {
  return (
    // Updated gradient colors to match the new palette
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-[#A79277]/20 to-transparent hover:from-[#A79277]/50 hover:to-[#A79277]/20 transition-all duration-500">
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl h-full flex flex-col gap-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(167,146,119,0.15)] transition-all duration-500 hover:-translate-y-1">
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={data.image} alt={data.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"/>
              {/* Changed badge background to #A79277 */}
              <div className="absolute -bottom-1 -right-1 bg-[#A79277] rounded-full p-0.5 border-2 border-white">
                <BadgeCheck size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm leading-tight">{data.name}</h4>
              <p className="text-xs text-[#A79277] font-medium">Verified User</p>
            </div>
          </div>
          {/* Updated quote icon color */}
          <Quote className="text-[#A79277]/20 fill-[#A79277]/10 transform rotate-180" size={32} />
        </div>

        <p className="text-gray-700 text-[13px] leading-relaxed font-medium relative z-10">"{data.quote}"</p>

        <div className="mt-auto pt-3 border-t border-[#A79277]/10 flex items-center justify-between">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (i < data.rating ? <StarIcon key={i} /> : null))}
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-[#A79277] transition-colors">Verified Purchase</span>
        </div>
      </div>
    </div>
  );
};

const ReviewsSection = () => {
  return (
    // Changed main background to #FFF2E1
    <section className="relative py-24 flex flex-col items-center justify-center overflow-hidden bg-[#FFF2E1]">
      
      {/* Updated background grid lines to match #A79277 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,146,119,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,146,119,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      {/* Updated radial glow color */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(167,146,119,0.15),transparent)] opacity-50"></div>

      <div className="relative text-center mb-16 px-4 z-10 max-w-3xl mx-auto">
        {/* Updated trust badge colors */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A79277]/10 border border-[#A79277]/30 text-[#A79277] text-[10px] font-bold tracking-wider uppercase mb-6 backdrop-blur-sm">
          <BadgeCheck size={12} /> Trusted by India
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 drop-shadow-sm flex flex-col items-center">
          <FallingText text="Loved by Locals." />
          {/* Changed from indigo/purple gradient to solid #A79277 */}
          <div className="text-[#A79277] pb-2">
            <FallingText text="Trusted by You." delay={0.5} />
          </div>
        </h2>

        <p className="text-gray-600 text-lg leading-relaxed font-medium">
          Join thousands of users who have found the perfect gift. 
          Real stories from the <span className="font-bold text-[#A79277]">Giftomize community</span>.
        </p>
      </div>

      <div className="relative w-full max-w-[1400px] mx-auto h-[700px] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 z-10">
        
        {/* Updated fade masks to match #FFF2E1 background instead of zinc */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#FFF2E1] via-[#FFF2E1]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FFF2E1] via-[#FFF2E1]/80 to-transparent z-20 pointer-events-none"></div>

        <div className="marquee-column space-y-6">
          {[...testimonials, ...testimonials].slice(0, 6).map((item, idx) => (
            <TestimonialCard key={`col1-${idx}`} data={item} />
          ))}
        </div>

        <div className="marquee-column space-y-6 hidden md:block" style={{ animationDuration: '60s', animationDirection: 'reverse' }}>
          {[...testimonials, ...testimonials].slice(2, 8).map((item, idx) => (
            <TestimonialCard key={`col2-${idx}`} data={item} />
          ))}
        </div>

        <div className="marquee-column space-y-6 hidden lg:block" style={{ animationDuration: '50s' }}>
          {[...testimonials, ...testimonials].slice(4, 10).map((item, idx) => (
            <TestimonialCard key={`col3-${idx}`} data={item} />
          ))}
        </div>
      </div>

      <style>{`
        .marquee-column { animation: scrollUp 45s linear infinite; }
        .marquee-column:hover { animation-play-state: paused; }
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </section>
  );
};

export default ReviewsSection;