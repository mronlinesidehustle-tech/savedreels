import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { updateVideo, getAllTags } from '../utils/storageManager';
import { useHaptic } from '../hooks/useHaptic';

export default function EditModal({ video, onClose, onSaved }) {
  const haptic = useHaptic();
  const [reason,   setReason]   = useState(video.reason   || '');
  const [tag,      setTag]      = useState(video.tag       || '');
  const [color,    setColor]    = useState(video.color     || '');
  const [location, setLocation] = useState(video.location  || '');
  const [keywords, setKeywords] = useState(video.keywords  || '');
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    haptic.tap();
    try {
      const updated = await updateVideo(video.id, {
        reason:   reason.trim()   || null,
        tag:      tag.trim()      || null,
        color:    color.trim()    || null,
        location: location.trim() || null,
        keywords: keywords.trim() || null,
      });
      haptic.success();
      onSaved(updated);
      onClose();
    } catch {
      haptic.tap();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[480px] bg-white rounded-t-3xl pb-safe animate-fade-up overflow-hidden">

        {/* Handle + Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-lavender-100">
          <div className="w-10 h-1 bg-lavender-200 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
          <h3 className="text-base font-bold text-lavender-800">Edit Save</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-lavender-50 text-lavender-400 active:bg-lavender-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4 overflow-y-auto max-h-[70vh] no-scrollbar">

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider">
              Why you saved it
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add or update your reason..."
              rows={3}
              className="bg-lavender-50 rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none resize-none transition-all"
            />
          </div>

          {/* Keywords */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider">
              Keywords
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., recipe, budget, inspo..."
              className="bg-lavender-50 rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none transition-all"
            />
          </div>

          {/* Tag */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider">
              Tag
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Update or add a tag..."
              className="bg-lavender-50 rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none transition-all"
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., red, pastels..."
              className="bg-lavender-50 rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none transition-all"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., beach, gym, home..."
              className="bg-lavender-50 rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none transition-all"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              w-full py-4 rounded-2xl text-base font-bold transition-all active:scale-[0.98]
              ${saving
                ? 'bg-lavender-100 text-lavender-300'
                : 'bg-lavender-600 text-white shadow-lg shadow-lavender-200 active:bg-lavender-700'}
            `}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </div>
      </div>
    </div>
  );
}
