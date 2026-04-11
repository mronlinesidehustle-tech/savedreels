import { useState, useCallback, useEffect, useRef } from 'react';
import { Link2, Tag, Plus, Check, Clipboard, AlertCircle } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';
import Toast from '../components/Toast';
import { saveVideo, getAllTags, findVideoByUrl, getSuggestedTags } from '../utils/storageManager';
import { parseVideoUrl, isValidUrl } from '../utils/videoParser';
import { useHaptic } from '../hooks/useHaptic';

export default function SavePage() {
  const haptic = useHaptic();
  const [url,           setUrl]           = useState('');
  const [reason,        setReason]        = useState('');
  const [color,         setColor]         = useState('');
  const [location,      setLocation]      = useState('');
  const [tag,           setTag]           = useState('');
  const [newTag,        setNewTag]        = useState('');
  const [allTags,       setAllTags]       = useState([]);
  const [showNewTag,    setShowNewTag]    = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState({ visible: false, message: '', type: 'success' });
  const [parsed,        setParsed]        = useState(null);
  const [duplicate,     setDuplicate]     = useState(null);   // #5
  const [orphanWarn,    setOrphanWarn]    = useState(false);  // #2
  const [suggestedTags, setSuggestedTags] = useState([]);     // #6
  const reasonDebounce  = useRef(null);

  useEffect(() => { getAllTags().then(setAllTags); }, []);

  // #6 — debounce suggested tags on reason change
  useEffect(() => {
    clearTimeout(reasonDebounce.current);
    reasonDebounce.current = setTimeout(async () => {
      const suggestions = await getSuggestedTags(reason);
      const activeTag = showNewTag ? newTag.trim() : tag;
      setSuggestedTags(suggestions.filter(s => s !== activeTag));
    }, 400);
    return () => clearTimeout(reasonDebounce.current);
  }, [reason, tag, newTag, showNewTag]);

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  const handleUrlChange = useCallback(async (val) => {
    setUrl(val);
    setDuplicate(null);
    if (isValidUrl(val)) {
      setParsed(parseVideoUrl(val));
      // #5 — check for duplicate
      const existing = await findVideoByUrl(val);
      if (existing) setDuplicate(existing);
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

  const doSave = async () => {
    haptic.tap();
    setSaving(true);
    setOrphanWarn(false);
    try {
      const finalTag = showNewTag ? newTag.trim() : tag;
      const video = {
        url:       parsed?.url || url.trim(),
        platform:  parsed?.platform || 'other',
        thumbnail: parsed?.thumbnail || null,
        title:     parsed?.title     || null,
        reason:    reason.trim()   || null,
        color:     color.trim()    || null,
        location:  location.trim() || null,
        tag:       finalTag        || null,
      };
      await saveVideo(video);
      haptic.success();
      showToast('Saved!');
      setUrl(''); setReason(''); setColor(''); setLocation('');
      setTag(''); setNewTag(''); setShowNewTag(false);
      setParsed(null); setDuplicate(null); setSuggestedTags([]);
      getAllTags().then(setAllTags);
    } catch {
      haptic.tap();
      showToast('Save failed. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!url.trim())      { showToast('Paste a video URL first.', 'error'); return; }
    if (!isValidUrl(url)) { showToast('That URL looks invalid.', 'error');  return; }

    // #2 — orphan check: warn if zero context
    const finalTag = showNewTag ? newTag.trim() : tag;
    const hasContext = reason.trim() || finalTag || color.trim() || location.trim();
    if (!hasContext && !orphanWarn) {
      setOrphanWarn(true);
      return; // first tap shows warning, second tap saves anyway
    }
    doSave();
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
          {parsed && !duplicate && (
            <div className="flex items-center gap-2 px-1 animate-fade-up">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <span className="text-xs text-teal-500 font-medium capitalize">{parsed.platform} detected</span>
            </div>
          )}

          {/* #5 Duplicate warning */}
          {duplicate && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-peach-50 border border-peach-200 rounded-xl animate-fade-up">
              <AlertCircle size={14} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-orange-600">Already saved</p>
                <p className="text-xs text-orange-400">
                  You saved this on {new Date(duplicate.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                  Tap Save to keep both.
                </p>
              </div>
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

        {/* #6 Suggested tags */}
        {suggestedTags.length > 0 && (
          <div className="flex flex-col gap-2 animate-fade-up">
            <p className="text-xs text-lavender-400 font-medium px-1">Suggested tags</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setTag(s); setShowNewTag(false); haptic.tap(); setSuggestedTags([]); }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-600 border border-teal-200 active:bg-teal-100 transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* #2 Orphan warning — shows on first Save tap with no context */}
        {orphanWarn && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-lavender-50 border border-lavender-200 rounded-xl animate-fade-up">
            <AlertCircle size={14} className="text-lavender-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-lavender-500">
              No context added — this video will be hard to find later. Add a reason, tag, or keyword. Or tap <strong>Save anyway</strong> to continue.
            </p>
          </div>
        )}

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
          {saving ? 'Saving...' : orphanWarn ? 'Save anyway' : activeTag ? `Save to "${activeTag}"` : 'Save Video'}
        </button>

      </div>
    </div>
  );
}
