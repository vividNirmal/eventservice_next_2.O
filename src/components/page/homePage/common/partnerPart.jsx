// components/common/partnersSection.jsx
"use client";

import React, { useEffect, useRef } from "react";
import { Handshake } from "lucide-react";
import { SafeImage } from "@/components/common/SafeImage";

const defaultPartnerData = {
  title: "Our Partners",
  partners: [
    {
      name: "Partner 1",
      imageUrl: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg"
    },
    {
      name: "Partner 2", 
      imageUrl: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg"
    },
    {
      name: "Partner 3",
      imageUrl: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg"
    },
    {
      name: "Partner 4",
      imageUrl: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg"
    },
    {
      name: "Partner 5",
      imageUrl: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg"
    }
  ]
};

export default function PartnerPart({ partnerData = defaultPartnerData }) {
  const scrollRef = useRef(null);
  const data = partnerData || defaultPartnerData;
  const partners = data.partners || [];

  // Only apply auto-scroll if we have more than 5 partners
  const shouldAutoScroll = partners.length > 5;

  useEffect(() => {
    if (!shouldAutoScroll || !scrollRef.current) return;

    const scrollContainer = scrollRef.current;
    const scrollContent = scrollContainer.querySelector('.scroll-content');
    
    // Clone items for infinite scroll effect
    if (scrollContent) {
      const items = Array.from(scrollContent.children);
      items.forEach(item => {
        const clone = item.cloneNode(true);
        scrollContent.appendChild(clone);
      });
    }

    let scrollPos = 0;
    let intervalId;

    const scroll = () => {
      scrollPos += 0.5; // Slower scroll speed
      if (scrollPos >= scrollContent.scrollWidth / 2) {
        scrollPos = 0;
      }
      scrollContainer.scrollLeft = scrollPos;
    };

    intervalId = setInterval(scroll, 30);

    // Pause on hover
    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => {
      intervalId = setInterval(scroll, 30);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [shouldAutoScroll, partners]);

  if (!partners || partners.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 xl:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">{data?.title || "Our Partners"}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#1f75ff] to-[#61daff] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Partners Display */}
        {shouldAutoScroll ? (
          // Auto-scrolling container for many partners
          <div className="relative partners-carousel">
            <div ref={scrollRef} className="overflow-hidden whitespace-nowrap">
              <div className="scroll-content inline-flex gap-8 items-center py-4">
                {partners?.map((partner, index) => (
                  <div key={`${partner?._id || index}-${index}`} className="inline-block flex-shrink-0">
                    <div className="group cursor-pointer">
                      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 w-52 h-36 flex items-center justify-center border border-gray-100 group-hover:border-blue-200">
                        <SafeImage
                          src={partner?.imageUrl || partner?.image}
                          alt={partner?.name}
                          placeholderSrc="/event-icon.png"
                          className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                          loading="lazy"
                          width={64}
                          height={64}
                        />
                      </div>
                      <p className="text-center mt-3 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{partner?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Static grid for fewer partners - CENTERED
          <div className="flex justify-center">
            <div className={`grid gap-4 xl:gap-6 ${
              partners.length === 1 ? 'grid-cols-1 max-w-sm' :
              partners.length === 2 ? 'grid-cols-2 max-w-2xl' :
              partners.length === 3 ? 'grid-cols-3 max-w-4xl' :
              partners.length === 4 ? 'grid-cols-2 md:grid-cols-4 max-w-5xl' :
              'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-6xl'
            }`}>
              {partners?.map((partner, index) => (
                <div key={`${partner?._id || index}`} className="group cursor-pointer">
                  <div className="h-36 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-linear">
                    <SafeImage
                      src={partner?.imageUrl || partner?.image}
                      alt={partner?.name}
                      placeholderSrc="/event-icon.png"
                      className="max-w-full max-h-full size-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                      loading="lazy"
                      width={64}
                      height={64}
                    />
                  </div>
                  <p className="text-lg text-center mt-3 font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">{partner?.name || ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}