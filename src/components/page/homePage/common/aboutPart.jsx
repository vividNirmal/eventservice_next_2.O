"use client";

import React from "react";
import { Badge, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const defaultAboutData = {
  title: "India's Most Prestigious Cleaning Industry Platform",
  description: "Through 20 incredible editions, Clean India Show has remained the single largest platform, showcasing the latest from the Cleaning & Hygiene industry. The show's exceptional experience, offering outstanding opportunities for businesses of all sizes, has consistently attracted industry professionals from across the globe throughout its history.",
  image: "https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg"
};

export default function AboutPart({ aboutData = defaultAboutData }) {
  const data = aboutData || defaultAboutData;

  return (
    <section id="about" className="py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="size-5 text-black border-black/20" />
              <span>About the Show</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black leading-tight text-balance">
              {data.title}
            </h2>
            <div
              className="text-base sm:text-lg text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.description }}
            ></div>
            <Button size="lg" className="btn-donate !flex items-center">
              Register to visit
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={data.imageUrl || data.image} 
                alt="Exhibition" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 rounded-xl p-4 shadow-xl max-w-[200px] sm:max-w-xs bg-white">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="size-10 sm:size-12 rounded-full bg-blue-gradient flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                {/* <div>
                  <div className="text-xl sm:text-2xl font-bold text-zinc-700">21st</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Edition in 2025</div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}