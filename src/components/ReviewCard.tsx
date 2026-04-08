import { Star } from 'lucide-react';

interface ReviewCardProps {
  name: string;
  role?: string;
  comment: string;
  rating: number;
  avatarUrl?: string;
}

const ReviewCard = ({ name, role, comment, rating, avatarUrl }: ReviewCardProps) => (
  <article className="rounded-xl border border-slate-200 bg-corporate-surface p-4 shadow-sm transition hover:shadow-md">
    <div className="flex items-start gap-3">
      <img
        src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EEF2FF&color=1E40AF`}
        alt={name}
        className="h-10 w-10 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div>
              <p className="truncate text-sm font-semibold text-corporate-text">{name}</p>
            {role && <p className="text-xs text-corporate-muted">{role}</p>}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-corporate-warning">
            <Star className="h-3.5 w-3.5 fill-current" />
            {rating.toFixed(1)}
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-corporate-muted">{comment}</p>
      </div>
    </div>
  </article>
);

export default ReviewCard;
