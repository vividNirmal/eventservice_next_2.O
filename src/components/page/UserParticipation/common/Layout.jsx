// /common/layout.jsx
import React from 'react';
import { SafeImage } from '@/components/common/SafeImage';

export const Layout1 = ({ ticketData, eventData, children }) => {
  return (
    <div className="h-svh flex flex-wrap gap-5 p-4 bg-[#f7f9fc]">
      {/* Left Side - Image with Description */}
      <div className="w-1/3 relative rounded-2xl max-h-[calc(100svh_-_32px)] overflow-hidden hidden lg:block">
        <SafeImage 
          src={ticketData?.desktopBannerImageUrl} 
          mobileSrc={ticketData?.mobileBannerImageUrl} 
          placeholderSrc="/assets/images/login-img.webp" 
          alt="Event" 
          width={1200} 
          height={600} 
          className="max-w-full w-full h-full object-cover object-center absolute top-0 left-0" 
        />
        {eventData?.event_description && (
          <div className="absolute bottom-0 left-0 right-0 p-3 xl:p-4 m-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
            <h2 className="text-white text-xl 2xl:text-2xl mb-3 font-bold">
              {eventData?.eventName}
            </h2>
            <span className="h-px w-full block bg-linear-to-r from-white to-white/0 my-3"></span>
            <p className="z-1 text-white text-sm 2xl:text-lg font-normal leading-normal">
              {eventData?.event_description}
            </p>
          </div>
        )}
      </div>

      {/* Right Side - Form Content */}
      <div className="w-2/5 grow flex flex-col p-1 pr-3 border border-solid border-zinc-200 shadow-[0_0_6px_0_rgba(0,55,255,25%)] rounded-xl bg-white">
        {children}
      </div>
    </div>
  );
};

export const Layout2 = ({ ticketData, eventData, children }) => {
  return (
    <div className="min-h-svh flex flex-col bg-[#f7f9fc]">
      {/* Top - Image with Description */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
        <SafeImage 
          src={ticketData?.desktopBannerImageUrl} 
          mobileSrc={ticketData?.mobileBannerImageUrl} 
          placeholderSrc="/assets/images/login-img.webp" 
          alt="Event" 
          width={1200} 
          height={600} 
          className="max-w-full w-full h-full object-cover object-center" 
        />
        {eventData?.event_description && (
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
            <h2 className="text-white text-xl md:text-2xl mb-2 font-bold">
              {eventData?.eventName}
            </h2>
            <p className="text-white text-sm md:text-base font-normal leading-normal">
              {eventData?.event_description}
            </p>
          </div>
        )}
      </div>

      {/* Bottom - Form Content */}
      <div className="flex-1 p-4">
        <div className="max-w-5xl mx-auto bg-white rounded-xl border border-solid border-zinc-200 shadow-[0_0_6px_0_rgba(0,55,255,25%)] h-full flex flex-col p-1 pr-3">
          {children}
        </div>
      </div>
    </div>
  );
};