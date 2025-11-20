"use client";

import React, { useEffect, useState } from "react";

const images = [
  "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg",
  "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg",
  "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg",
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <div className="hero-slider">
          {images.map((image, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
              style={{
                backgroundImage: `url('${image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          ))}
        </div>
        {/* Slider Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {images.map((_, index) => (
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
      </div>

    </>
  );
}