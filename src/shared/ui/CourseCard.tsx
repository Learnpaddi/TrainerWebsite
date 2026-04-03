import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  instructor: string;
  rating: number;
  progress?: number;
  isEnrolled?: boolean;
  thumbnail?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  price,
  duration,
  instructor,
  rating = 0,
  progress = 0,
  isEnrolled = false,
  thumbnail
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <Link to={`/lms/course/${id}`} className="group bg-white/70 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all border border-white/50 hover:border-primary/30 overflow-hidden h-full flex flex-col">
      {/* Thumbnail */}
      <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform" />
        ) : (
          <div className="text-4xl opacity-75 font-bold text-primary">{title[0]}</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-1">{description}</p>

        {/* Meta */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-primary">₹{price}</span>
            <span className="text-gray-500">{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="text-sm text-gray-500 ml-2">({rating.toFixed(1)})</span>
          </div>
          <div className="text-sm text-gray-500">by {instructor}</div>
        </div>
      </div>

      {/* Progress & CTA */}
      {progress > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm">Progress</span>
            <span className="text-sm font-bold text-emerald-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-4 px-6 rounded-2xl hover:shadow-3xl hover:-translate-y-1 transition-all group-hover:shadow-primary/25">
        {isEnrolled ? 'Continue' : 'Enroll Now'}
        <Play className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
      </button>
    </Link>
  );
};

export default CourseCard;

