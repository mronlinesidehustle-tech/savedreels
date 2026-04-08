import { useState, useEffect, useCallback } from 'react';
import { Search, Mic, MicOff, X } from 'lucide-react';
import VideoCard from '../components/VideoCard';
import { searchVideos, deleteVideo } from '../utils/storageManager';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useHaptic } from '../hooks/useHaptic';

export default function SearchPage() {
  const haptic = useHaptic();
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    const data = await searchVideos(q);
    setResults(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => runSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  const { isListening, isSupported, start, stop } = useSpeechRecognition({
    onResult: (text) => {
      setQuery(text);
      haptic.micOff();
    },
  });

  const handleMic = () => {
    if (isListening) {
      stop();
      haptic.micOff();
    } else {
      start();
      haptic.micOn();
    }
  };

  const handleDelete = async (id) => {
    haptic.tap();
    await deleteVideo(id);
    runSearch(query);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Header + Search */}
      <div className="flex-shrink-0 px-5 pt-6 pb-4 bg-lavender-50 border-b border-lavender-100">
        <h2 className="text-xl font-bold text-lavender-800 mb-4">Search</h2>

        <div className={`
          flex items-center gap-3 bg-white rounded-2xl border-2 px-4 py-3 transition-all
          ${isListening ? 'border-teal-400 shadow-teal-100 shadow-md' : 'border-lavender-200 focus-within:border-lavender-400'}
        `}>
          <Search size={16} className="text-lavender-300 flex-shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, reason, tag..."
            className="flex-1 text-sm text-lavender-800 placeholder-lavender-300 bg-transparent outline-none"
            autoComplete="off"
          />
          {query ? (
            <button onClick={() => setQuery('')} className="text-lavender-300 active:text-lavender-500">
              <X size={15} />
            </button>
          ) : isSupported ? (
            <button
              onClick={handleMic}
              className={`transition-all ${isListening ? 'text-teal-400 animate-pulse-mic' : 'text-lavender-300'}`}
              aria-label="Voice search"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          ) : null}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-lavender-300 border-t-lavender-600 animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-lavender-100 flex items-center justify-center">
              <Search size={24} className="text-lavender-300" />
            </div>
            <p className="text-sm text-lavender-400 font-medium">
              {query ? `No results for "${query}"` : 'Start typing or tap the mic to search'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-lavender-400 font-medium px-1">
              {results.length} {results.length === 1 ? 'result' : 'results'}
              {query ? ` for "${query}"` : ''}
            </p>
            {results.map(video => (
              <VideoCard key={video.id} video={video} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
