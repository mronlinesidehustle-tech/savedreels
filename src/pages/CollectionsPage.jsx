import { useState, useEffect } from 'react';
import { Grid3X3, ChevronDown, ChevronUp, TrendingUp, X } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import EditModal from '../components/EditModal';
import { getAllVideos, getAllTags, deleteVideo, getWeeklyDigest } from '../utils/storageManager';
import { useHaptic } from '../hooks/useHaptic';

const DIGEST_KEY = 'sr_digest_dismissed';

export default function CollectionsPage() {
  const haptic = useHaptic();
  const [videos,      setVideos]      = useState([]);
  const [tags,        setTags]        = useState([]);
  const [activeTag,   setActiveTag]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [sort,        setSort]        = useState('newest');
  const [showSort,    setShowSort]    = useState(false);
  const [editVideo,   setEditVideo]   = useState(null);
  const [digest,      setDigest]      = useState(null);
  const [showDigest,  setShowDigest]  = useState(false);

  const load = async () => {
    setLoading(true);
    const [v, t] = await Promise.all([getAllVideos(), getAllTags()]);
    setVideos(v);
    setTags(t);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // #4 — show digest once per week, not on same day it was dismissed
    const lastDismissed = parseInt(localStorage.getItem(DIGEST_KEY) || '0', 10);
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (lastDismissed < weekAgo) {
      getWeeklyDigest().then(d => {
        if (d && d.total > 0) { setDigest(d); setShowDigest(true); }
      });
    }
  }, []);

  const handleDelete = async (id) => {
    haptic.tap();
    await deleteVideo(id);
    load();
  };

  const handleSaved = (updated) => {
    setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const dismissDigest = () => {
    localStorage.setItem(DIGEST_KEY, String(Date.now()));
    setShowDigest(false);
    haptic.tap();
  };

  const filtered = videos
    .filter(v => !activeTag || v.tag === activeTag)
    .sort((a, b) => sort === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {editVideo && (
        <EditModal
          video={editVideo}
          onClose={() => setEditVideo(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-6 pb-3 bg-lavender-50 dark:bg-gray-900 border-b border-lavender-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-lavender-800 dark:text-lavender-200">Collection</h2>
          <div className="relative">
            <button
              onClick={() => setShowSort(s => !s)}
              className="flex items-center gap-1 text-xs text-lavender-500 font-semibold bg-lavender-100 px-3 py-1.5 rounded-xl active:bg-lavender-200 transition-all"
            >
              {sort === 'newest' ? 'Newest' : 'Oldest'}
              {showSort ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showSort && (
              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-lavender-100 overflow-hidden z-10 animate-pop">
                {['newest', 'oldest'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setShowSort(false); haptic.tap(); }}
                    className={`
                      w-full text-left px-4 py-3 text-xs font-semibold transition-colors
                      ${sort === s ? 'bg-lavender-50 text-lavender-700' : 'text-lavender-500'}
                    `}
                  >
                    {s === 'newest' ? 'Newest first' : 'Oldest first'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* #4 Pattern Digest banner */}
        {showDigest && digest && (
          <div className="flex items-start gap-3 bg-lavender-600 rounded-2xl px-4 py-3 mb-3 animate-fade-up">
            <TrendingUp size={16} className="text-lavender-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">This week: {digest.total} save{digest.total !== 1 ? 's' : ''}</p>
              {digest.topTags.length > 0 && (
                <p className="text-xs text-lavender-200 mt-0.5">
                  Top: {digest.topTags.map(t => `${t.tag} (${t.count})`).join(', ')}
                </p>
              )}
              {digest.topPlatform && (
                <p className="text-xs text-lavender-300 mt-0.5 capitalize">
                  Mostly from {digest.topPlatform}
                </p>
              )}
            </div>
            <button onClick={dismissDigest} className="text-lavender-300 active:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tag filter chips */}
        {tags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => { setActiveTag(null); haptic.tap(); }}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95
                ${!activeTag ? 'bg-lavender-600 text-white' : 'bg-lavender-100 text-lavender-500'}
              `}
            >
              All
            </button>
            {tags.map(t => (
              <button
                key={t}
                onClick={() => { setActiveTag(t === activeTag ? null : t); haptic.tap(); }}
                className={`
                  flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95
                  ${activeTag === t ? 'bg-lavender-600 text-white' : 'bg-lavender-100 text-lavender-500'}
                `}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Video list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 dark:bg-gray-900">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-lavender-300 border-t-lavender-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-lavender-100 flex items-center justify-center">
              <Grid3X3 size={24} className="text-lavender-300" />
            </div>
            <p className="text-sm text-lavender-400 font-medium">
              {activeTag ? `Nothing saved under "${activeTag}" yet.` : 'No saved videos yet. Start saving!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-lavender-400 font-medium px-1">
              {filtered.length} {filtered.length === 1 ? 'video' : 'videos'}
              {activeTag ? ` in "${activeTag}"` : ' saved'}
            </p>
            {filtered.map(video => (
              <VideoCard key={video.id} video={video} onDelete={handleDelete} onEdit={setEditVideo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
