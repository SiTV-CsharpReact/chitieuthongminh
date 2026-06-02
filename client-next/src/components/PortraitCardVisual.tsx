"use client";

import React, { useState, useRef } from 'react';

interface PortraitCardVisualProps {
  imageUrl?: string;
  name: string;
  className?: string; // extra classes on the outer wrapper
}

/**
 * Detects portrait (vertical) card images and renders them on a dark
 * "spotlight pedestal" background. Landscape images render normally.
 */
export const PortraitCardVisual: React.FC<PortraitCardVisualProps> = ({ imageUrl, name, className = '' }) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setIsPortrait(naturalHeight > naturalWidth * 1.1);
    }
  };

  if (isPortrait) {
    return (
      <div
        className={`card-visual ${className}`}
      >
        <div className="spotlight"></div>
        <div className="back-glow"></div>
        <div className="floor-glow"></div>
        <div className="floor-line"></div>

        <img
          ref={imgRef}
          src={imageUrl}
          alt={name}
          className="credit-card"
          onLoad={handleLoad}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-[18px] bg-slate-50 dark:bg-slate-950 ${className}`}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover"
        onLoad={handleLoad}
      />
    </div>
  );
};

export default PortraitCardVisual;
