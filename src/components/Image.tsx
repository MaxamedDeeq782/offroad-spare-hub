
import React, { useState } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const Image: React.FC<ImageProps> = ({ src, alt, className = '', onClick }) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  return (
    <img
      src={error ? '/placeholder.svg' : src}
      alt={alt}
      className={`${className} transition-all duration-200`}
      onError={handleError}
      loading="lazy"
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    />
  );
};

export default Image;
