import { useState, useCallback, useEffect } from 'react';
import { Link2, Tag, Plus, Check, Clipboard } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import Toast from '../components/Toast';
import { saveVideo, getAllTags } from '../utils/storageManager';
import { parseVideoUrl, isValidUrl } from '../utils/videoParser';
import { useHaptic } from '../hooks/useHaptic';

export default function SavePage() {
  const haptic = useHaptic();
  const [url,        setUrl]        = useState('');
  const [reason,     setReason]     = useState('');
  const [vibe,       setVibe]       = useState('');
  const [color,      setColor]      = useState('');
  const [location,   setLocation]   = useState('');
  const [tag,        setTag]        = useState('');
  const [newTag,     setNewTag]     = useState('');
  const [allTags,    setAllTags]    = useState([]);
  const [showNewTag, setShowNewTag] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState({ visible: false, message: '', type: 'success' });
  const [parsed,     setParsed]     = useState(null);

  useEffect(() => {
    getAllTags().then(setAllTags);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const handleUrlChange = useCallback((val) => {
    setUrl(val);
    if (isValidUrl(val)) {
      setParsed(parseVideoUrl(val));
    } else {
      setParsed(null);
    }
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleUrlChange(text.trim());
      haptic.tap();
    } catch {
      showToast('Paste from clipboard failed. Try long-press.', 'error');
    }
  };

  const handleSave = async () => {
    if (!url.trim())    { showToast('Paste a video URL first.', 'error');  return; }
    if (!isValidUrl(url)) { showToast('That URL looks invalid.', 'error'); return; }

    haptic.tap();
    setSaving(true);

    try {
      const finalTag = showNewTag ? newTag.trim() : tag;
      const video = {
        url:       parsed?.url || url.trim(),
        platform:  parsed?.platform || 'other',
        thumbnail: parsed?.thumbnail || null,
        title:     parsed?.title     || null,
        reason:    reason.trim() || null,
        vibe:      vibe.trim() || null,
        color:     color.trim() || null,
        location:  location.trim() || null,
        tag:       finalTag || null,
      };

      await saveVideo(video);
      haptic.success();
      showToast('Saved!');

      // Reset
      setUrl('');
      setReason('');
      setVibe('');
      setColor('');
      setLocation('');
      setTag('');
      setNewTag('');
      setShowNewTag(false);
      setParsed(null);

      // Refresh tags
      getAllTags().then(setAllTags);
    } catch (err) {
      haptic.error();
      showToast('Save failed. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeTag = showNewTag ? newTag.trim() : tag;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar">
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-lavender-300 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SR</span>
          </div>
          <h1 className="text-xl font-bold text-lavender-800">SavedReels</h1>
        </div>
        <p className="text-xs text-lavender-400 font-medium">Save videos. Find them later.</p>
      </div>

      <div className="px-5 pb-6 flex flex-col gap-5">

        {/* URL Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider px-1">
            Video URL
          </label>
          <div className={`
            flex items-center gap-2 bg-white rounded-2xl border-2 px-4 py-3 transition-all
            ${parsed ? 'border-teal-400' : 'border-lavender-200 focus-within:border-lavender-400'}
          `}>
            <Link2 size={16} className={parsed ? 'text-teal-400' : 'text-lavender-300'} />
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste TikTok, YouTube, Instagram URL..."
              className="flex-1 text-sm text-lavender-800 placeholder-lavender-300 bg-transparent outline-none"
              inputMode="url"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={handlePaste}
              className="text-lavender-400 active:text-lavender-600 transition-colors"
              aria-label="Paste URL"
            >
              <Clipboard size={16} />
            </button>
          </div>

          {/* Platform preview */}
          {parsed && (
            <div className="flex items-center gap-2 px-1 animate-fade-up">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="text-xs text-teal-500 font-medium capitalize">{parsed.platform} detected</span>
            </div>
          )}
        </div>

        {/* YouTube thumbnail preview */}
        {parsed?.thumbnail && (
          <div className="rounded-2xl overflow-hidden border border-lavender-100 animate-pop">
            <img src={parsed.thumbnail} alt="Video preview" className="w-full h-36 object-cover" />
          </div>
        )}

        {/* Voice Input */}
        <VoiceInput value={reason} onChange={setReason} />

        {/* Context Fields */}
        <div className="flex flex-col gap-3">
          {/* Vibe */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider px-1">
              Vibe
            </label>
            <select
              value={vibe}
              onChange={(e) => { setVibe(e.target.value); haptic.tap(); }}
              className="bg-white rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 focus:border-lavender-400 focus:outline-none transition-all"
            >
              <option value="">Choose vibe...</option>
              <option value="trending">Trending</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="sporty">Sporty</option>
              <option value="y2k">Y2K</option>
              <option value="cottagecore">Cottagecore</option>
              <option value="dark academia">Dark Academia</option>
              <option value="clean girl">Clean Girl</option>
              <option value="indie">Indie</option>
              <option value="vintage">Vintage</option>
              <option value="minimalist">Minimalist</option>
              <option value="grunge">Grunge</option>
              <option value="romantic">Romantic</option>
              <option value="other">Other</option>
            </select>

            {vibe === 'other' && (
              <input
                type="text"
                placeholder="Describe your vibe..."
                onChange={(e) => setVibe(e.target.value)}
                className="bg-white rounded-2xl border-2 border-teal-400 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-teal-500 focus:outline-none transition-all animate-fade-up"
                autoFocus
              />
            )}
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider px-1">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., red, blue, pastels..."
              className="bg-white rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none transition-all"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider px-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., beach, gym, bedroom..."
              className="bg-white rounded-2xl border-2 border-lavender-200 px-4 py-3 text-sm text-lavender-800 placeholder-lavender-300 focus:border-lavender-400 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-lavender-700 uppercase tracking-wider px-1">
            Tag
          </label>

          {allTags.length > 0 && !showNewTag && (
            <div className="flex flex-wrap gap-2">
              {allTags.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTag(t === tag ? '' : t); haptic.tap(); }}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95
                    ${tag === t
                      ? 'bg-lavender-600 text-white shadow-sm'
                      : 'bg-lavender-100 text-lavender-600'}
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {showNewTag ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl border-2 border-lavender-400 px-4 py-3">
                <Tag size={14} className="text-lavender-400 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="New tag name..."
                  className="flex-1 text-sm text-lavender-800 placeholder-lavender-300 bg-transparent outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') setShowNewTag(false); }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowNewTag(false)}
                className="w-11 h-11 rounded-xl bg-lavender-100 text-lavender-500 flex items-center justify-center active:bg-lavender-200 transition-all"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setShowNewTag(true); setTag(''); haptic.tap(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-lavender-200 text-lavender-400 text-xs font-semibold w-fit transition-all active:bg-lavender-50"
            >
              <Plus size={14} />
              New tag
            </button>
          )}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !url.trim()}
          className={`
            w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 active:scale-[0.98]
            ${saving || !url.trim()
              ? 'bg-lavender-100 text-lavender-300 cursor-not-allowed'
              : 'bg-lavender-600 text-white shadow-lg shadow-lavender-200 active:bg-lavender-700'}
          `}
        >
          {saving ? 'Saving...' : activeTag ? `Save to "${activeTag}"` : 'Save Video'}
        </button>

      </div>
    </div>
  );
}
