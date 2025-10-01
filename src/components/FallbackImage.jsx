"use client";
import Image from "next/image";
import { useState } from "react";

export default function FallbackImage({ src, alt, className, ...props }) {
  const [imgSrc, setImgSrc] = useState( src || "/assets/default-featured-image.png" );
  return (
    <Image
      src={imgSrc}
      alt={alt || "image"}
      width={props.width || 96}
      height={props.height || 96}
      className={className}
      onError={() => setImgSrc("/assets/default-featured-image.png")}
      {...props}
    />
  );
}
