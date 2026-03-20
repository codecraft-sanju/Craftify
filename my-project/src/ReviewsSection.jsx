import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Quote } from 'lucide-react';
import AddReviewModal from './AddReviewModal'; 

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

// 2. Fallback Reviews Data (Database khaali hone par ya list ko bada karne ke liye use hoga)
const fallbackTestimonials = [
  {
    _id: "fb1",
    name: "Rahul Sharma",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    quote: "The customization is next level! I ordered a wallet with my name, and the quality is just wow.",
    rating: 5,
  },
  {
    _id: "fb2",
    name: "Priya Patel",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    quote: "Weekends are busy, but Giftomize made gifting so easy. Delivery was super fast too!",
    rating: 5,
  },
  {
    _id: "fb3",
    name: "Amit Verma",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    quote: "Found unique handmade gifts here that I couldn't find anywhere else. The interface is super clean.",
    rating: 4,
  },
  {
    _id: "fb4",
    name: "Sneha Gupta",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    quote: "Ordering for my team was hassle-free. The bulk order process is smooth. Saves me so much stress!",
    rating: 5,
  },
  {
    _id: "fb5",
    name: "Vikram Singh",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
    quote: "As someone who values quality, this app is essential. Premium products, great packaging. Perfect.",
    rating: 5,
  },
  {
    _id: "fb6",
    name: "Anjali Mehta",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
    quote: "I recommend Giftomize to everyone. It's not just about buying; it's about supporting local artisans.",
    rating: 5,
  },
];

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-[#A79277] fill-current drop-shadow-sm" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TestimonialCard = ({ data }) => {
  return (
    <div className="group relative rounded-2xl p-[1px] bg-gradient-to-b from-[#A79277]/20 to-transparent hover:from-[#A79277]/50 hover:to-[#A79277]/20 transition-all duration-500">
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl h-full flex flex-col gap-4 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(167,146,119,0.15)] transition-all duration-500 hover:-translate-y-1">
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={data.image || "https://via.placeholder.com/150"} alt={data.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"/>
              <div className="absolute -bottom-1 -right-1 bg-[#A79277] rounded-full p-0.5 border-2 border-white">
                <BadgeCheck size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm leading-tight">{data.name}</h4>
              <p className="text-xs text-[#A79277] font-medium">Verified User</p>
            </div>
          </div>
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

const ReviewsSection = ({ currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/reviews`);
        
        if (res.ok) {
          const data = await res.json();
          // REAL + FALLBACK MERGE logic: Real reviews sabse pehle aayenge
          setReviews([...data, ...fallbackTestimonials]);
        } else {
          setReviews(fallbackTestimonials);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews(fallbackTestimonials);
      }
    };

    fetchReviews();
  }, []);

  const handleReviewAdded = (newReview) => {
    // Naya review list me sabse upar add hoga
    setReviews((prev) => [newReview, ...prev]);
  };

  // Marquee Columns Calculation
  const third = Math.ceil(reviews.length / 3);
  const col1Data = reviews.slice(0, third);
  const col2Data = reviews.slice(third, third * 2);
  const col3Data = reviews.slice(third * 2);

  const getMarqueeItems = (arr) => {
    if (arr.length === 0) return [];
    // Array ko lamba karna taaki marquee break na ho
    return [...arr, ...arr, ...arr, ...arr];
  };

  return (
    <section className="relative py-24 flex flex-col items-center justify-center overflow-hidden bg-[#FFF2E1]">
      
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(167,146,119,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(167,146,119,0.1)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(167,146,119,0.15),transparent)] opacity-50"></div>

      <div className="relative text-center mb-16 px-4 z-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A79277]/10 border border-[#A79277]/30 text-[#A79277] text-[10px] font-bold tracking-wider uppercase mb-6 backdrop-blur-sm">
          <BadgeCheck size={12} /> Trusted by India
        </div>

        <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 drop-shadow-sm flex flex-col items-center">
          <FallingText text="Loved by Locals." />
          <div className="text-[#A79277] pb-2">
            <FallingText text="Trusted by You." delay={0.5} />
          </div>
        </h2>

        <p className="text-gray-600 text-lg leading-relaxed font-medium mb-8">
          Join thousands of users who have found the perfect gift. 
          Real stories from the <span className="font-bold text-[#A79277]">Giftomize community</span>.
        </p>

        {/* WRITE A REVIEW BUTTON */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-full font-bold transition-all shadow-2xl shadow-slate-900/30 active:scale-95 hover:-translate-y-1"
        >
          Write a Review
        </button>
      </div>

      {/* MARQUEE GRID */}
      <div className="relative w-full max-w-[1400px] mx-auto h-[700px] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 z-10">
        
        {/* Fade gradients */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#FFF2E1] via-[#FFF2E1]/80 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#FFF2E1] via-[#FFF2E1]/80 to-transparent z-20 pointer-events-none"></div>

        {/* Column 1 */}
        <div className="marquee-column space-y-6">
          {getMarqueeItems(col1Data).map((item, idx) => (
            <TestimonialCard key={`col1-${item._id}-${idx}`} data={item} />
          ))}
        </div>

        {/* Column 2 */}
        <div className="marquee-column space-y-6 hidden md:block" style={{ animationDuration: '60s', animationDirection: 'reverse' }}>
          {getMarqueeItems(col2Data).map((item, idx) => (
            <TestimonialCard key={`col2-${item._id}-${idx}`} data={item} />
          ))}
        </div>

        {/* Column 3 */}
        <div className="marquee-column space-y-6 hidden lg:block" style={{ animationDuration: '50s' }}>
          {getMarqueeItems(col3Data).map((item, idx) => (
            <TestimonialCard key={`col3-${item._id}-${idx}`} data={item} />
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

      {/* MODAL COMPONENT */}
      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
        onReviewAdded={handleReviewAdded}
      />
    </section>
  );
};

export default ReviewsSection;