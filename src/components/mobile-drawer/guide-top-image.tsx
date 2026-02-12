"use client";

import Image from "next/image";

export function GuideTopImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-full w-full relative photo-filter">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}
