import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviews,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const renderStars = () => Array.from({ length: 5 }, (_, i) => {
    const starNum = i + 1;
    return (
      <Star 
        key={starNum} 
        className={`${sizeClasses[size]} ${
          starNum <= rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'fill-gray-200 text-gray-400'
        } transition-all duration-200 hover:scale-110 cursor-pointer`}
      />
    );
  });

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {renderStars()}
      {reviews !== undefined && (
        <span className="ml-2 text-sm text-gray-500 font-medium">({reviews})</span>
      )}
    </div>
  );
};

export default StarRating;

