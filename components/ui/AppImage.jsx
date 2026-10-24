'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';

// next/image wrapper with a fallback. External hosts are optimised too (allowed in next.config.mjs),
// so product photos are served resized/WebP instead of full-size originals.
// next/image throws on values that aren't a path or http(s) URL (e.g. old orders saved "{ original: … }")
const isUsableSrc = (v) => typeof v === 'string' && (v.startsWith('/') || /^https?:\/\//.test(v));

function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  onClick,
  fallbackSrc = '/placeholder.png',
  ...props
}) {
  const [imageSrc, setImageSrc] = useState(isUsableSrc(src) ? src : fallbackSrc);

  // Follow prop changes (the same instance is reused when another product opens)
  useEffect(() => {
    setImageSrc(isUsableSrc(src) ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc);
  };

  const common = {
    src: imageSrc,
    alt: alt || 'image',
    quality,
    priority,
    onError: handleError,
    onClick,
    className: `${className} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`,
    ...props,
  };

  if (fill || (!width && !height)) {
    return (
      <div className="relative w-full h-full">
        <Image {...common} fill sizes={sizes || '(max-width: 768px) 100vw, 50vw'} style={{ objectFit: 'cover' }} />
      </div>
    );
  }

  return <Image {...common} width={width} height={height} sizes={sizes} />;
}

AppImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  className: PropTypes.string,
  priority: PropTypes.bool,
  quality: PropTypes.number,
  fill: PropTypes.bool,
  sizes: PropTypes.string,
  onClick: PropTypes.func,
  fallbackSrc: PropTypes.string,
};

export default AppImage;
