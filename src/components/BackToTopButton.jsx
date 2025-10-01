"use client"
import { cn } from '@/lib/utils';
import { ArrowUpFromDot } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn("cursor-pointer fixed bottom-16 lg:bottom-5 right-5 z-50 p-3 rounded-full text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg font-medium text-xs transition-all duration-200 ease-linear hover:scale-103 active:scale-95 active:shadow-none",visible ? 'opacity-100' : 'opacity-0 pointer-events-none')}
      aria-label="Back to top"
    >
        <ArrowUpFromDot className='size-4 lg:size-5' />
    </button>
  );
}
