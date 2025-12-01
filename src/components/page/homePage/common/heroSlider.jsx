"use client";

import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/common/SafeImage";
import React, { useEffect, useState } from "react";

const defaultHeroData = [
  {
    image: "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg",
    title: "One Platform, Endless Business Opportunities",
    description: "India's most prestigious cleaning industry exhibition showcasing 600+ exhibitors, 10,000+ visitors, and cutting-edge innovations across 8 specialized sectors."
  },
  {
    image: "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg",
    title: "One Platform, Endless Business Opportunities",
    description: "India's most prestigious cleaning industry exhibition showcasing 600+ exhibitors, 10,000+ visitors, and cutting-edge innovations across 8 specialized sectors."
  }
];

export default function HeroSlider({ heroData = defaultHeroData }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Safe data handling
  const safeHeroData = Array.isArray(heroData) && heroData.length > 0 ? heroData : defaultHeroData;

  useEffect(() => {
    if (safeHeroData.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % safeHeroData.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [safeHeroData.length]);

  const currentHero = safeHeroData[currentSlide] || defaultHeroData;

  return (
    <section className="relative min-h-[calc(100svh_-_60px)] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {safeHeroData.map((hero, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 hero-slider",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <SafeImage
              src={hero.imageUrl || hero.image}
              alt={hero.title || "Hero image"}
              className="w-full h-full object-cover absolute inset-0"
              placeholderSrc="assets/images/login-img.webp"
            />
          </div>
        ))}

        {/* Indicators */}
        {safeHeroData.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {safeHeroData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`slider-indicator w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white scale-110"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-white space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">{currentHero.title}</h1>
            <p className="text-xl md:text-2xl text-white/95 leading-relaxed text-pretty max-w-3xl mx-auto">{currentHero.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}