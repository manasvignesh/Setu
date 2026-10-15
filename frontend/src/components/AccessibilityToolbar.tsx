import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { AppLanguage, FontSize, AccessibilityTheme } from '../types';
import { Type, Sliders, Volume2, Globe, Sun } from 'lucide-react';

export const AccessibilityToolbar: React.FC = () => {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    dyslexiaFont, setDyslexiaFont,
    speechRate, setSpeechRate,
    language, setLanguage,
    readingGuide, setReadingGuide,
    soundEffects, setSoundEffects
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Display & reading preferences"
        className="btn-civic-secondary text-xs py-1.5 px-3 rounded-lg border border-slate-200 hover:border-slate-300"
      >
        <Sliders className="w-3.5 h-3.5 text-[#0D7377]" />
        <span className="font-semibold text-slate-800">Reading Options</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 w-80 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 space-y-4 text-sm"
            role="dialog"
            aria-label="Reading preferences panel"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0D7377]" />
                <span>Reading & Display Preferences</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                Close
              </button>
            </div>

            {/* Language Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0D7377]" />
                <span>Language / भाषा / భాష</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'en', label: 'English' },
                  { id: 'hi', label: 'हिन्दी' },
                  { id: 'te', label: 'తెలుగు' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as AppLanguage)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                      language === lang.id
                        ? 'bg-[#0D7377] text-white border-[#095356] font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#0D7377]" />
                <span>Text Size</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'normal', label: 'Default' },
                  { id: 'large', label: 'Large (125%)' },
                  { id: 'extra-large', label: 'Largest (150%)' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id as FontSize)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                      fontSize === s.id
                        ? 'bg-[#0D7377] text-white border-[#095356] font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contrast / Display Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-[#0D7377]" />
                <span>Display & Contrast Mode</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'standard', label: 'Standard' },
                  { id: 'high-contrast', label: 'High Contrast' },
                  { id: 'dark', label: 'Dark Mode' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setTheme(m.id as AccessibilityTheme)}
                    className={`py-1.5 px-2 text-xs rounded-lg font-medium border text-center transition-colors ${
                      theme === m.id
                        ? 'bg-[#0D7377] text-white border-[#095356] font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexia Friendly Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-800">
                Dyslexia-Friendly Letter Spacing
              </span>
              <button
                role="switch"
                aria-checked={dyslexiaFont}
                onClick={() => setDyslexiaFont(!dyslexiaFont)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  dyslexiaFont ? 'bg-[#0D7377]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    dyslexiaFont ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reading Guide Ruler Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-bold text-slate-800">Reading Line Guide</div>
                <div className="text-[10px] text-slate-500">Highlights active text line with cursor</div>
              </div>
              <button
                role="switch"
                aria-checked={readingGuide}
                onClick={() => setReadingGuide(!readingGuide)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  readingGuide ? 'bg-[#0D7377]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    readingGuide ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-bold text-slate-800">Auditory Cues & Chimes</div>
                <div className="text-[10px] text-slate-500">Soft feedback on actions & AAC</div>
              </div>
              <button
                role="switch"
                aria-checked={soundEffects}
                onClick={() => setSoundEffects(!soundEffects)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  soundEffects ? 'bg-[#0D7377]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 rounded-full bg-white transition-transform ${
                    soundEffects ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Speech Rate Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-[#0D7377]" />
                  Audio Narration Speed
                </span>
                <span>{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.25"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-[#0D7377]"
                aria-label="Text to speech playback speed"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
