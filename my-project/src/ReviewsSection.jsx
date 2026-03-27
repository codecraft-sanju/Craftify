import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/autoplay';

const reviewImages = [
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW11_1.png?v=1766552683&width=360",
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW3_1.png?v=1766552683&width=360",
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW12.jpg?v=1725990862&width=360",
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW5.jpg?v=1725990862&width=360",
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW10.jpg?v=1725990862&width=360",
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW6.jpg?v=1725990862&width=360",
  "https://99customizedjewellery.in/cdn/shop/files/REVIEW5.jpg?v=1725990862&width=360"
];

// Combine to ensure continuous scrolling
const combinedReviewImages = [...reviewImages, ...reviewImages];

export default function HappyCustomersSection() {
  return (
    <section className="py-12 bg-[#FDF1E6]">
      <h2 className="text-center text-[#5C3A21] text-3xl font-serif mb-12">
        Our Happy Customers
      </h2>
      
      <div className="w-full">
        <Swiper
          modules={[FreeMode, Autoplay]}
          grabCursor={true}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 1, // continuous flow
            disableOnInteraction: false,
          }}
          speed={4000} // slow and smooth scrolling speed
          centeredSlides={false} // Don't centralize one screen
          breakpoints={{
            // mobile: 3 small phone-width images
            0: {
              slidesPerView: 3,
              spaceBetween: 4, // super tiny gap
            },
            // tablet/large phone: 4-5 small images
            480: {
              slidesPerView: 4,
              spaceBetween: 6,
            },
            // larger tablet/smaller desktop
            768: {
              slidesPerView: 5,
              spaceBetween: 8,
            },
            // standard desktop
            1024: {
              slidesPerView: 6,
              spaceBetween: 10,
            },
            // larger desktop screens
            1400: {
              slidesPerView: 7,
              spaceBetween: 12,
            },
          }}
          className="reviewsSwiperContainer"
        >
          {combinedReviewImages.map((imgSrc, index) => (
            <SwiperSlide key={index} className="flex justify-center items-center h-auto">
              {/* Phone Mockup Wrapper with very minimal padding */}
              <div className="w-full flex justify-center py-2 px-1"> 
                <img
                  src={imgSrc}
                  alt={`Customer Review ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-sm object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}