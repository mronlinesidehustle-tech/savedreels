import { Trash2, ExternalLink, Pencil } from 'lucide-react';
import { getPlatformColor, safeHref } from '../utils/videoParser';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hrs   = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hrs   < 24)  return `${hrs}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function VideoCard({ video, onDelete, onEdit, compact = false }) {
  const { bg, text, label } = getPlatformColor(video.platform);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-lavender-100 overflow-hidden animate-fade-up">
      {/* Large Thumbnail */}
      <div className="relative w-full h-28 bg-lavender-100 overflow-hidden">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || 'Video thumbnail'}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: bg }}
          >
            {(label || '?')[0]}
          </div>
        )}
        {/* Platform badge overlay */}
        <span
          className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full shadow-md"
          style={{ background: bg, color: text }}
        >
          {label}
        </span>
      </div>

      <div className="flex flex-col p-3">
        {/* Video Info */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-lavender-800 leading-snug line-clamp-2">
              {video.title || new URL(video.url.startsWith('http') ? video.url : 'https://' + video.url).hostname}
            </p>
          </div>

          {video.reason && (
            <p className="text-xs text-lavender-500 leading-snug line-clamp-2 italic">
              &ldquo;{video.reason}&rdquo;
            </p>
          )}

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              {video.tag && (
                <span className="text-[10px] font-semibold bg-lavender-100 text-lavender-600 px-2 py-0.5 rounded-full">
                  {video.tag}
                </span>
              )}
              <span className="text-[10px] text-lavender-300">{timeAgo(video.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(video)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-lavender-50 text-lavender-400 active:bg-lavender-100 transition-colors"
                  aria-label="Edit"
                >
                  <Pencil size={13} />
                </button>
              )}
              <a
                href={safeHref(video.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-lavender-50 text-lavender-400 active:bg-lavender-100 transition-colors"
                aria-label="Open video"
              >
                <ExternalLink size={13} />
              </a>
              {onDelete && (
                <button
                  onClick={() => onDelete(video.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-lavender-50 text-lavender-400 active:bg-red-50 active:text-red-400 transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
