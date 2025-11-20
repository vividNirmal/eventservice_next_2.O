"use client"

import { useRef } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import HeroSlider from "./heroSlider/hero-slider";
import { Award, Badge, Calendar, ChevronRight, Globe, MapPin, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Homepage() {
  const plugin = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );
  return (
    <>
        <header className="w-full bg-white py-2 shadow-lg relative z-10">
          <div className="container mx-auto px-5">
            <div className="flex flex-wrap justify-between items-center">
              <div className="w-fit">
                <Link href={'/'} className="block w-fit">
                  <img src="/clean-show.png" className="max-w-3xs block w-full" alt="logo" />
                </Link>
              </div>
              <div className="w-2/4 grow">
                <nav className="flex flex-row items-center justify-end">
                  <ul className="flex flex-wrap items-center justify-end gap-4">
                    <li>
                      <Link href={'/'} className="block text-zinc-700 hover:text-black text-base font-semibold">Exhibitors</Link>
                    </li>
                    <li>
                      <Link href={'/'} className="block text-zinc-700 hover:text-black text-base font-semibold">Visitor</Link>
                    </li>
                    <li className="ml-6">
                      <Link href={'/'} className="btn-donate">Login</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </header>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <HeroSlider />

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Content */}
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full text-sm backdrop-blur-md">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">26-28 November 2025</span>
                <span className="text-primary">•</span>
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Mumbai, India</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">One Platform, Endless Business Opportunities</h1>
              <p className="text-xl md:text-2xl text-white/95 leading-relaxed text-pretty max-w-3xl mx-auto">India's most prestigious cleaning industry exhibition showcasing 600+ exhibitors, 10,000+ visitors, and cutting-edge innovations across 8 specialized sectors.</p>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-8 pt-8">
                <div className="flex items-center gap-3 glass px-6 py-3 rounded-full backdrop-blur-md">
                  <Award className="w-6 h-6 text-primary" />
                  <span className="font-semibold">21st Edition</span>
                </div>
                <div className="flex items-center gap-3 glass px-6 py-3 rounded-full backdrop-blur-md">
                  <Users className="w-6 h-6 text-primary" />
                  <span className="font-semibold">10,000+ Visitors</span>
                </div>
                <div className="flex items-center gap-3 glass px-6 py-3 rounded-full backdrop-blur-md">
                  <Globe className="w-6 h-6 text-primary" />
                  <span className="font-semibold">50+ Countries</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="size-5 text-black border-black/20" />
                <span>About the Show</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black leading-tight text-balance">India's Most Prestigious Cleaning Industry Platform</h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">Through 20 incredible editions, Clean India Show has remained the single largest platform, showcasing the latest from the Cleaning & Hygiene industry. The show's exceptional experience, offering outstanding opportunities for businesses of all sizes, has consistently attracted industry professionals from across the globe throughout its history.</p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">The 21st edition is set to showcase a plethora of solutions from 60+ segments in cleaning & hygiene, laundry & dry-cleaning, smart city cleaning & industrial cleaning.</p>
              <Button size="lg" className="btn-donate !flex items-center">
              Register to visit
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://images.pexels.com/photos/5029859/pexels-photo-5029859.jpeg" alt="Clean India Show Exhibition" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 rounded-xl p-4 shadow-xl max-w-[200px] sm:max-w-xs bg-white">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="size-10 sm:size-12 rounded-full bg-blue-gradient flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-zinc-700">21st</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Edition in 2025</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* <section className="min-h-[75svh] relative">
        <Carousel className="w-full" plugins={[plugin.current]} onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="relative after:absolute after:inset-0 after:bg-black/25 after:size-full">
                  <Image src={'https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg'} alt="img" width={1920} height={700} className="w-full max-w-full block h-[85svh] object-cover outline-0" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className={'left-4'} />
          <CarouselNext className={'right-4'} />
        </Carousel>
        <div className="absolute top-2/4 left-2/4 -translate-2/4 text-white">
          <h1 className="text-center text-6xl leading-tight font-bold mb-10">One platform, endless business opportunities</h1>
          <p className="text-xl text-center">At India’s only integrated expo on cleaning & hygiene, linen care & industrial cleaning!</p>
        </div>
      </section> */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-left text-4xl leading-tight font-bold mb-2">About Clean India Show</h2>
            <p>Through 20 incredible editions, Clean India Show has remained the single largest platform, showcasing the latest from the Cleaning & Hygiene industry. The show's exceptional experience, offering outstanding opportunities for businesses of all sizes, has consistently attracted industry professionals from across the globe throughout its history.</p>
            <p>The 21st edition is set to showcase a plethora of solutions from 60+ segments in cleaning & hygiene, laundry & dry-cleaning, smart city cleaning & industrial cleaning.</p>
          </div>
        </div>
      </section>
    </>
  );
}
