import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export interface UseSpeechSynthesisReturn {
  speak: (text: string, langOverride?: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  toggle: (text: string, langOverride?: string) => void;
  isSpeaking: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  activeWord: string;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const { speechRate, language } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeWord, setActiveWord] = useState('');
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveWord('');
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.pause();
    } catch (e) {
      console.warn('speechSynthesis pause error:', e);
    }
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      console.warn('speechSynthesis resume error:', e);
    }
    setIsPaused(false);
  }, [isSupported]);

  const speak = useCallback((text: string, langOverride?: string) => {
    if (!isSupported || !text.trim()) return;

    cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick language
    const targetLang = langOverride || (language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN');
    utterance.lang = targetLang;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.replace('_', '-').startsWith(targetLang.split('-')[0]));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveWord('');
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      setActiveWord('');
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const word = text.substring(event.charIndex, event.charIndex + event.charLength);
        setActiveWord(word);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [cancel, isSupported, language, speechRate]);

  const toggle = useCallback((text: string, langOverride?: string) => {
    if (!isSupported) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(text, langOverride);
    }
  }, [isSupported, isSpeaking, isPaused, resume, pause, speak]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    cancel,
    toggle,
    isSpeaking,
    isPlaying: isSpeaking && !isPaused,
    isPaused,
    isSupported,
    activeWord
  };
};
