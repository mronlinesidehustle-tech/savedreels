import { useState, useRef, useCallback } from 'react';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

export function useSpeechRecognition({ onResult, onError } = {}) {
  const [isListening,  setIsListening]  = useState(false);
  const [transcript,   setTranscript]   = useState('');
  const [isSupported]                   = useState(!!SpeechRecognition);
  const recognitionRef                  = useRef(null);

  const start = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.('Speech recognition is not supported on this browser.');
      return;
    }

    const recognition         = new SpeechRecognition();
    recognition.continuous    = false;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const text = (final || interim).trim();
      setTranscript(text);
      if (final) onResult?.(final.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const messages = {
        'not-allowed': 'Microphone permission denied. Tap mic again to retry.',
        'no-speech':   'No speech detected. Try again.',
        'network':     'Network error. Check your connection.',
        'aborted':     null,
      };
      const msg = messages[event.error];
      if (msg) onError?.(msg);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clear = useCallback(() => {
    setTranscript('');
  }, []);

  return { isListening, transcript, isSupported, start, stop, clear, setTranscript };
}
