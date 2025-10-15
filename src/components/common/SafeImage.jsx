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
  const [imgSrc, setImgSrc] = useState(src || placeholderSrc);
  const [mobileImgSrc, setMobileImgSrc] = useState(mobileSrc || src || placeholderSrc);

  useEffect(() => {
    if (src) setImgSrc(src);
    else setImgSrc(placeholderSrc);

    if (mobileSrc) setMobileImgSrc(mobileSrc);
    else setMobileImgSrc(src || placeholderSrc);
  }, [src, mobileSrc, placeholderSrc]);

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
