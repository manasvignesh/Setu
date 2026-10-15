import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Lesson, LessonSection } from '../types';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Eye,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ListOrdered,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface AccessibleLessonsPageProps {
  navigate: (route: string, data?: any) => void;
}

export const AccessibleLessonsPage: React.FC<AccessibleLessonsPageProps> = ({ navigate }) => {
  const { fontSize, dyslexiaFont, speechRate, language } = useAccessibility();
  const { speak, pause, resume, cancel, isSpeaking, isPaused } = useSpeechSynthesis();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showSimplified, setShowSimplified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'read' | 'listen' | 'follow' | 'understand'>('read');

  // Load published lessons
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/lessons/published');
        if (res.ok) {
          const data: Lesson[] = await res.json();
          setLessons(data);
          if (data.length > 0) {
            setSelectedLesson(data[0]);
          }
        }
      } catch (e) {
        console.warn('Could not fetch published lessons:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const activeSection: LessonSection | undefined = selectedLesson?.sections?.[activeSectionIndex];

  // Auto-cancel speech synthesis when switching section, lesson, or simplified mode
  useEffect(() => {
    cancel();
  }, [activeSectionIndex, selectedLesson?.id, showSimplified, cancel]);

  const handlePlayTTS = () => {
    if (!activeSection) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      const textToRead = showSimplified && activeSection.simplified_text
        ? `${activeSection.title}. ${activeSection.simplified_text}`
        : `${activeSection.title}. ${activeSection.content_text}`;
      speak(textToRead);
    }
  };

  const handleNextSection = () => {
    cancel();
    if (selectedLesson && activeSectionIndex < selectedLesson.sections.length - 1) {
      setActiveSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevSection = () => {
    cancel();
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F9F8] text-[#19324A] p-4 sm:p-6 flex flex-col">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('dashboard')}
              className="p-2 rounded-xl border border-slate-300 hover:bg-white text-slate-800 transition-colors flex items-center gap-2 text-sm font-semibold"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <span>Accessible Learning Curriculum</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E8F5F2] text-[#0A625D]">
                  4 Formats
                </span>
              </h1>
              <p className="text-xs text-slate-600">
                Experience any curriculum lesson through Read, Listen, Follow, and Plain-language formats
              </p>
            </div>
          </div>

          {/* Lesson Selector Dropdown if multiple lessons exist */}
          {lessons.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-700">Lesson:</label>
              <select
                value={selectedLesson?.id || ''}
                onChange={(e) => {
                  cancel();
                  const found = lessons.find(l => l.id === e.target.value);
                  if (found) {
                    setSelectedLesson(found);
                    setActiveSectionIndex(0);
                  }
                }}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
              >
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* If no lesson loaded */}
        {loading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#0A625D] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading accessible lessons...</p>
          </div>
        )}

        {!loading && !selectedLesson && (
          <div className="py-20 text-center">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold">No published lessons found</h3>
            <p className="text-sm text-slate-600 mt-1">Please ask your teacher to publish a lesson.</p>
          </div>
        )}

        {!loading && selectedLesson && activeSection && (
          <div className="mt-4 flex-1 flex flex-col gap-4">
            {/* Lesson Title & Stepper Header */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-[#E8F5F2] text-[#0A625D]">
                    {selectedLesson.subject} • Grade {selectedLesson.grade}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Section {activeSectionIndex + 1} of {selectedLesson.sections.length}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#19324A]">
                  {selectedLesson.title}
                </h2>
              </div>

              {/* Format Switcher Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                {[
                  { id: 'read', label: '1. Read', icon: BookOpen },
                  { id: 'listen', label: '2. Listen', icon: Volume2 },
                  { id: 'follow', label: '3. Follow', icon: ListOrdered },
                  { id: 'understand', label: '4. Understand', icon: Sparkles }
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeTab === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setActiveTab(mode.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-[#19324A] text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex gap-2">
              {selectedLesson.sections.map((sec, idx) => (
                <button
                  key={sec.id || idx}
                  onClick={() => {
                    cancel();
                    setActiveSectionIndex(idx);
                  }}
                  className={`flex-1 h-2.5 rounded-full transition-all ${
                    idx === activeSectionIndex
                      ? 'bg-[#0A625D]'
                      : idx < activeSectionIndex
                      ? 'bg-[#0A625D]/40'
                      : 'bg-slate-200'
                  }`}
                  title={`Go to section ${idx + 1}: ${sec.title}`}
                  aria-label={`Section ${idx + 1}: ${sec.title}`}
                />
              ))}
            </div>

            {/* Main Lesson Content Area */}
            <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                {/* Section Title & Audio Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                  <h3 className="text-lg sm:text-xl font-bold text-[#19324A]">
                    {activeSection.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    {/* Simplified Plain-Language Toggle */}
                    <button
                      onClick={() => setShowSimplified(!showSimplified)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        showSimplified
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                      aria-pressed={showSimplified}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{showSimplified ? 'Simplified Plain-Language' : 'Standard Language'}</span>
                    </button>

                    {/* Audio Narration Button */}
                    <button
                      onClick={handlePlayTTS}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        isSpeaking && !isPaused
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isPaused
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-[#0A625D] text-white hover:bg-[#084F4B]'
                      }`}
                      aria-label={
                        isSpeaking && !isPaused
                          ? 'Pause audio narration'
                          : isPaused
                          ? 'Resume audio narration'
                          : 'Read section aloud'
                      }
                    >
                      {isSpeaking && !isPaused ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Audio</span>
                        </>
                      ) : isPaused ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Resume Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Section Text */}
                <div className={`prose max-w-none text-slate-800 ${
                  fontSize === 'extra-large' ? 'text-2xl leading-relaxed' : fontSize === 'large' ? 'text-xl leading-relaxed' : 'text-lg leading-relaxed'
                } ${dyslexiaFont ? 'font-dyslexia' : ''}`}>
                  <p className="whitespace-pre-line">
                    {showSimplified && activeSection.simplified_text
                      ? activeSection.simplified_text
                      : activeSection.content_text}
                  </p>
                </div>

                {/* Key Terms Box */}
                {activeSection.key_terms && (
                  <div className="mt-6 p-4 rounded-xl bg-[#E8F5F2] border border-[#0A625D]/20">
                    <h4 className="text-xs font-bold text-[#0A625D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Key Academic Terms</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeSection.key_terms.split(',').map((term, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#0A625D]/30 text-xs font-bold text-[#19324A]"
                        >
                          {term.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedagogical Diagram if provided */}
                {activeSection.image_url && (
                  <div className="mt-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
                      <ImageIcon className="w-4 h-4 text-[#0A625D]" />
                      <span>Pedagogical Illustration</span>
                    </div>
                    <img
                      src={activeSection.image_url}
                      alt={activeSection.image_alt || activeSection.title}
                      className="rounded-lg max-h-72 object-contain mx-auto"
                    />
                    {activeSection.image_pedagogical_description && (
                      <p className="mt-2 text-xs text-slate-600 italic">
                        <strong>Description for Screen Readers / Visual Support:</strong> {activeSection.image_pedagogical_description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Section Stepper Controls */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handlePrevSection}
                  disabled={activeSectionIndex === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-30 flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Section</span>
                </button>

                <span className="text-xs font-bold text-slate-500">
                  {activeSectionIndex + 1} / {selectedLesson.sections.length}
                </span>

                <button
                  onClick={handleNextSection}
                  disabled={activeSectionIndex === selectedLesson.sections.length - 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#19324A] text-white hover:bg-[#122436] disabled:opacity-30 flex items-center gap-1.5 transition-colors"
                >
                  <span>Next Section</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
