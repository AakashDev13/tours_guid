import { useState } from 'react';
import { categoryIcon } from '../constants.js';

// Shows the photo, or a gradient placeholder if there is no image / it fails to load
export default function DestImage({ src, alt, category, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <span>{categoryIcon(category)}</span>
      </div>
    );
  }
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
