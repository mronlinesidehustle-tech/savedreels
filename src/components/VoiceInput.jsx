import { Mic, MicOff, X } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useHaptic } from '../hooks/useHaptic';
import { useState } from 'react';

export default function VoiceInput({ value, onChange, placeholder = 'Tap mic and say why you saved this...' }) {
  const haptic = useHaptic();
  const [error, setError] = useState('');

  const { isListening, isSupported, start, stop } = useSpeechRecognition({
    onResult: (text) => {
      onChange(text);
      haptic.micOff();
    },
    onError: (msg) => {
      setError(msg);
      setTimeout(() => setError(''), 4000);
    },
  });

  const handleMicToggle = () => {
    setError('');
    if (isListening) {
      stop();
      haptic.micOff();
    } else {
      start();
      haptic.micOn();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-lavender-700 dark:text-lavender-400 uppercase tracking-wider px-1">
        Why did you save this?
      </label>

      <div className={`
        relative flex items-start gap-2 rounded-2xl border-2 bg-white dark:bg-gray-800 transition-all duration-200
        ${isListening
          ? 'border-teal-400 shadow-lg shadow-teal-100'
          : 'border-lavender-200 focus-within:border-lavender-400'}
      `}>
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 resize-none rounded-2xl px-4 pt-3 pb-3 text-sm text-lavender-800 dark:text-lavender-200 placeholder-lavender-300 bg-transparent outline-none leading-relaxed"
        />

        <div className="flex flex-col gap-1 pt-2 pr-2">
          {/* Mic button */}
          <button
            type="button"
            onClick={handleMicToggle}
            disabled={!isSupported}
            aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            className={`
              w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
              ${!isSupported
                ? 'bg-lavender-100 text-lavender-300 cursor-not-allowed'
                : isListening
                  ? 'bg-teal-400 text-white animate-pulse-mic shadow-md'
                  : 'bg-lavender-100 text-lavender-500 active:bg-lavender-200 active:scale-95'}
            `}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Clear text"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-lavender-50 text-lavender-400 active:bg-lavender-100 active:scale-95 transition-all"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-1 animate-fade-up">
          <span className="flex gap-1">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1 h-3 rounded-full bg-teal-400"
                style={{ animation: `pulse-mic 1s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
          <span className="text-xs text-teal-500 font-medium">Listening...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 px-1 animate-fade-up">{error}</p>
      )}

      {/* No support notice */}
      {!isSupported && (
        <p className="text-xs text-lavender-400 px-1">
          Voice input not supported on this browser. Type your reason above.
        </p>
      )}
    </div>
  );
}
