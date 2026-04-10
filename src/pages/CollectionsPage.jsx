import { useState, useEffect } from 'react';
import { Grid3X3, ChevronDown, ChevronUp } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import EditModal from '../components/EditModal';
import { getAllVideos, getAllTags, deleteVideo } from '../utils/storageManager';
import { useHaptic } from '../hooks/useHaptic';

export default function CollectionsPage() {
  const haptic = useHaptic();
  const [videos,      setVideos]      = useState([]);
  const [tags,        setTags]        = useState([]);
  const [activeTag,   setActiveTag]   = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [sort,        setSort]        = useState('newest');
  const [showSort,    setShowSort]    = useState(false);
  const [editVideo,   setEditVideo]   = useState(null);

  const load = async () => {
    setLoading(true);
    const [v, t] = await Promise.all([getAllVideos(), getAllTags()]);
    setVideos(v);
    setTags(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    haptic.tap();
    await deleteVideo(id);
    load();
  };

  const handleSaved = (updated) => {
    setVideos(prev => prev.map(v => v.id === updated.id ? updated : v));
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
      <div className="flex-shrink-0 px-5 pt-6 pb-3 bg-lavender-50 border-b border-lavender-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-lavender-800">Collection</h2>
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
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
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
