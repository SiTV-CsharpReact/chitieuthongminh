"use client";

import React, { useState, useRef } from 'react';

interface PortraitCardVisualProps {
  imageUrl?: string;
  name: string;
  className?: string; // extra classes on the outer wrapper
  roundedClass?: string; // custom rounded class, default is rounded-[18px]
}

/**
 * Detects portrait (vertical) card images and renders them on a dark
 * "spotlight pedestal" background. Landscape images render normally.
 */
export const PortraitCardVisual: React.FC<PortraitCardVisualProps> = ({ 
  imageUrl, 
  name, 
  className = '',
  roundedClass = 'rounded-[18px]'
}) => {
  const [isPortrait, setIsPortrait] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setIsPortrait(naturalHeight > naturalWidth * 1.1);
    }
  };

  return (
    <div
      className={`card-visual ${className} ${roundedClass}`}
    >
      <div className="spotlight"></div>
      <div className="back-glow"></div>
      <div className="floor-glow"></div>
      <div className="floor-line"></div>

      <img
        ref={imgRef}
        src={imageUrl}
        alt={name}
        className={`credit-card ${roundedClass === 'rounded-[18px]' ? '' : roundedClass} ${isPortrait ? '' : '!w-[75%] !max-h-[75%]'} transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2`}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default PortraitCardVisual;
