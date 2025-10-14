'use client';

import Image from "next/image";
import { useEffect, useState } from "react";


export const SafeImage = ({
  src,
  alt = "image",
  placeholderSrc = "/assets/images/placeholder.webp",
  width = 800,
  height = 400,
  className = "",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || placeholderSrc);

  // 🔁 If `src` changes (e.g., fetched later), try loading it again
  useEffect(() => {
    if (src) setImgSrc(src);
    else setImgSrc(placeholderSrc);
  }, [src, placeholderSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgSrc(placeholderSrc)}
    />
  );
};