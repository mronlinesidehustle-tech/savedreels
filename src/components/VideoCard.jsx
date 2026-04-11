import { useState } from 'react';
import { Trash2, ExternalLink, Pencil, AlertTriangle } from 'lucide-react';
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    setConfirmDelete(true);
    // Auto-cancel confirmation after 4s
    setTimeout(() => setConfirmDelete(false), 4000);
  };

  const handleConfirm = () => {
    setConfirmDelete(false);
    onDelete(video.id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-lavender-100 dark:border-gray-700 overflow-hidden animate-fade-up">
      {/* Large Thumbnail */}
      <div className="relative w-full h-28 bg-lavender-100 dark:bg-gray-700 overflow-hidden">
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
          <p className="text-sm font-semibold text-lavender-800 dark:text-lavender-200 leading-snug line-clamp-2">
            {video.title || new URL(video.url.startsWith('http') ? video.url : 'https://' + video.url).hostname}
          </p>

          {video.reason && (
            <p className="text-xs text-lavender-500 dark:text-lavender-400 leading-snug line-clamp-2 italic">
              &ldquo;{video.reason}&rdquo;
            </p>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-2">
            {/* Left: tag + time */}
            <div className="flex items-center gap-2">
              {video.tag && (
                <span className="text-[10px] font-semibold bg-lavender-100 dark:bg-gray-700 text-lavender-600 dark:text-lavender-300 px-2 py-0.5 rounded-full">
                  {video.tag}
                </span>
              )}
              <span className="text-[10px] text-lavender-300 dark:text-gray-500">{timeAgo(video.createdAt)}</span>
            </div>

            {/* Right: action buttons — edit+visit together, delete separated */}
            {confirmDelete ? (
              /* Confirmation row */
              <div className="flex items-center gap-1.5 animate-fade-up">
                <span className="text-xs text-red-400 font-medium flex items-center gap-1">
                  <AlertTriangle size={11} />
                  Delete?
                </span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 rounded-lg bg-lavender-100 dark:bg-gray-700 text-lavender-500 dark:text-lavender-300 text-xs font-semibold active:bg-lavender-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold active:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {/* Edit + Visit site — grouped */}
                <div className="flex items-center gap-1 mr-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(video)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-lavender-50 dark:bg-gray-700 text-lavender-400 dark:text-lavender-300 active:bg-lavender-100 transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  <a
                    href={safeHref(video.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-lavender-50 dark:bg-gray-700 text-lavender-400 dark:text-lavender-300 active:bg-lavender-100 transition-colors"
                    aria-label="Open video"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>

                {/* Delete — separated */}
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-950 text-red-400 active:bg-red-100 transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
