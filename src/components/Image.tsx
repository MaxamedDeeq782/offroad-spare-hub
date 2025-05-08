
import React, { useState } from 'react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
}

const Image: React.FC<ImageProps> = ({ src, alt, className = '' }) => {
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
    />
  );
};

export default Image;
