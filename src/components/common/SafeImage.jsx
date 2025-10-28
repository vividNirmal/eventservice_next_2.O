"use client";

import { useEffect, useState } from "react";

export const SafeImage = ({
  src,
  mobileSrc, // prop for mobile version
  alt = "image",
  placeholderSrc = "/assets/images/login-img.webp",
  width = 800,
  height = 400,
  className = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [mobileImgSrc, setMobileImgSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If src is undefined/null, we're still waiting for data
    if (src === undefined || src === null) {
      setIsLoading(true);
      return;
    }

    // If src is empty string, use placeholder immediately
    if (src === "") {
      setImgSrc(placeholderSrc);
      setMobileImgSrc(placeholderSrc);
      setIsLoading(false);
      return;
    }

    // We have a valid src, set it and wait for load
    setImgSrc(src);
    setMobileImgSrc(mobileSrc || src);
    setIsLoading(true);
    setHasError(false);
  }, [src, mobileSrc, placeholderSrc]);


  // // Show loader while waiting for src or image to load
  if (isLoading && !imgSrc) {
    return (
     <>
        {/* Spinner Loader */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <picture>
      {/* Mobile version (up to 768px) */}
      <source srcSet={mobileImgSrc} media="(max-width: 768px)" />

      {/* Desktop version (default fallback) */}
      <source srcSet={imgSrc} media="(min-width: 769px)" />

      {/* Fallback <img> tag */}
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={() => setImgSrc(placeholderSrc)}
        loading="lazy"
      />
    </picture>
  );
};