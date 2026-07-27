import { ImgHTMLAttributes, useState } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  priority?: boolean;
}

/**
 * Optimized Image Component
 * - Adds width/height to prevent layout shift
 * - Supports lazy loading with native loading attribute
 * - Adds automatic responsive sizing
 * - Handles image errors gracefully
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio = 'auto',
  priority = false,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const aspectRatioClass = {
    square: 'aspect-square',
    '4/3': 'aspect-video',
    '16/9': 'aspect-video',
    auto: '',
  }[aspectRatio];

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      className={`${className} ${aspectRatioClass} ${isLoading ? 'animate-pulse bg-gray-200' : ''} ${
        error ? 'opacity-50' : ''
      }`.trim()}
      onLoad={() => setIsLoading(false)}
      onError={() => {
        setIsLoading(false);
        setError(true);
      }}
      {...props}
    />
  );
}
