import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { StatusIndicator } from '../components/StatusIndicator';
import { BridgeMotif } from '../components/BridgeMotif';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { CheckinPollModal } from '../components/CheckinPollModal';
import { LiveReactionsOverlay } from '../components/LiveReactionsOverlay';
import { ScienceGlossaryModal } from '../components/ScienceGlossaryModal';
import type { StudentMode, Lesson, LessonSection } from '../types';
import {
  BookOpen,
  Volume2,
  MessageSquare,
  ListOrdered,
  Radio,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Send,
  Play,
  Pause,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
  Check,
  Download,
  BookMarked
} from 'lucide-react';

interface StudentSessionViewProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: any;
}

export const StudentSessionView: React.FC<StudentSessionViewProps> = ({ sessionData, navigate }) => {
  const { t, speechRate, fontSize } = useAccessibility();
  const {
    sessionId,
    roomCode,
    connectionStatus,
    captions,
    interimCaption,
    announcements,
    questions,
    currentSectionIndex: teacherSectionIndex,
    submitQuestion,
    joinRoom
  } = useLiveClassroom();

  const { speak, pause, resume, cancel, isSpeaking, isPaused, activeWord } = useSpeechSynthesis();

  const [activeMode, setActiveMode] = useState<StudentMode>('read');
  const [followTeacher, setFollowTeacher] = useState(true);
  const [studentSectionIndex, setStudentSectionIndex] = useState(0);
  const [autoScrollCaptions, setAutoScrollCaptions] = useState(true);
  const [showSimplified, setShowSimplified] = useState(false);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<string | null>(null);

  // AAC / Question input state
  const [customQuestion, setCustomQuestion] = useState('');
  const [questionSentNotification, setQuestionSentNotification] = useState<string | null>(null);

  // Lesson data
  const [activeSessionInfo, setActiveSessionInfo] = useState<any>(sessionData || null);

  useEffect(() => {
    if (!activeSessionInfo) {
      try {
        const stored = localStorage.getItem('setu_student_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          setActiveSessionInfo(parsed);
        }
      } catch (e) {
        console.warn('Failed to parse stored session:', e);
      }
    }
  }, [activeSessionInfo]);

  const currentSession = sessionData || activeSessionInfo;
  const lesson: Lesson | null = currentSession?.lesson || null;
  const captionsContainerRef = useRef<HTMLDivElement>(null);

  // Restore room connection if refreshing directly on session screen
  useEffect(() => {
    const sid = currentSession?.session_id;
    const code = currentSession?.room_code || 'ROOM';
    const nick = currentSession?.student_nickname || 'Student';
    if (!sessionId && sid) {
      joinRoom(sid, code, 'student', nick);
    }
  }, [joinRoom, sessionId, currentSession]);

  // Sync section with teacher if "Follow Teacher" is on
  useEffect(() => {
    if (followTeacher) {
      setStudentSectionIndex(teacherSectionIndex);
    }
  }, [followTeacher, teacherSectionIndex]);

  // Auto-scroll captions
  useEffect(() => {
    if (autoScrollCaptions && captionsContainerRef.current) {
      captionsContainerRef.current.scrollTop = captionsContainerRef.current.scrollHeight;
    }
  }, [autoScrollCaptions, captions]);

  // Cancel any active speech when student changes section, mode tab, or text simplification
  useEffect(() => {
    cancel();
  }, [studentSectionIndex, activeMode, showSimplified, cancel]);

  const activeSection: LessonSection | undefined = lesson?.sections?.[studentSectionIndex];

  // AAC Phrase board items
  const aacPhrases = [
    { id: 'repeat', text: 'Please repeat that', icon: '🔁' },
    { id: 'needTime', text: 'I need a moment to write', icon: '⏳' },
    { id: 'understood', text: 'I understand this concept', icon: '✅' },
    { id: 'confused', text: 'Could you explain that again?', icon: '❓' },
    { id: 'answer', text: 'May I answer the question?', icon: '🙋' },
    { id: 'diagram', text: 'Please show the diagram again', icon: '🖼️' },
    { id: 'louder', text: 'Could you please speak a little louder?', icon: '🔊' },
    { id: 'help', text: 'I need teacher assistance', icon: '🆘' }
  ];

  const handleSendAAC = async (content: string) => {
    cancel();
    speak(content);
    await submitQuestion(content, 'aac_phrase');
    setQuestionSentNotification(`Sent to teacher: "${content}"`);
    setTimeout(() => setQuestionSentNotification(null), 5000);
  };

  const handleSendCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    await submitQuestion(customQuestion.trim(), 'custom_text');
    setQuestionSentNotification(`Question sent to teacher.`);
    setCustomQuestion('');
    setTimeout(() => setQuestionSentNotification(null), 5000);
  };

  const handleTTSPlaySection = () => {
    if (!activeSection) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      const textToRead = showSimplified
        ? `${activeSection.title}. ${activeSection.simplified_text || activeSection.content_text}`
        : `${activeSection.title}. ${activeSection.content_text}`;
      speak(textToRead);
    }
  };

  const handleExportNotes = () => {
    const lines = [
      `SETU INCLUSIVE CLASSROOM TRANSCRIPT & NOTES`,
      `Room Code: ${roomCode || 'SETU'}`,
      `Lesson: ${lesson?.title || 'Science Lesson'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `----------------------------------------\n`,
      `CLASSROOM LIVE CAPTIONS:`,
      ...captions.map((c, i) => `[${i + 1}] ${c.text}`),
      `\n----------------------------------------`,
      `LESSON OVERVIEW:`,
      `${lesson?.summary || 'N/A'}\n`,
      `SECTIONS & CONCEPTS:`,
      ...(lesson?.sections || []).map((sec, i) => `[Step ${i + 1}] ${sec.title}\n${sec.simplified_text || sec.content_text}\nKey terms: ${sec.key_terms || 'None'}\n`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SETU_Notes_${roomCode || 'Class'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTTSPlayDiagramDescription = () => {
    if (!activeSection?.image_pedagogical_description) return;
    speak(`Audio description for diagram: ${activeSection.image_pedagogical_description}`);
  };

  const modes = [
    { id: 'read', label: '1. Read (Captions)', icon: BookOpen },
    { id: 'listen', label: '2. Listen (Audio)', icon: Volume2 },
    { id: 'respond', label: '3. Communicate (AAC)', icon: MessageSquare },
    { id: 'follow', label: '4. Follow Steps', icon: ListOrdered }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Interactive Overlays */}
      <LiveReactionsOverlay showBar={true} />
      <CheckinPollModal isTeacher={false} />
      <ScienceGlossaryModal
        term={selectedGlossaryTerm}
        onClose={() => setSelectedGlossaryTerm(null)}
      />
      
      {/* Session Header Card (Clean Crisp Light Theme) */}
      <div className="civic-card p-5 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] border border-[#BCE3DC] flex items-center justify-center text-[#0D7377]">
            <BridgeMotif size="md" variant="teal" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                {sessionData?.class_name || 'Class 6 Science'}
              </h1>
              <span className="badge-navy text-xs font-mono font-bold">
                Room: {roomCode || 'SETU'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
              <StatusIndicator status={connectionStatus} />
              <span>•</span>
              <span className="font-medium">{lesson?.title || 'Interactive Lesson'}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportNotes}
            title="Download lesson transcript & notes"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Notes</span>
          </button>

          <button
            onClick={() => setFollowTeacher(!followTeacher)}
            aria-pressed={followTeacher}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              followTeacher
                ? 'bg-[#E6F4F1] text-[#0D7377] border-[#BCE3DC]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {followTeacher ? '✓ Follow Teacher Steps' : 'Self-Paced Navigation'}
          </button>
        </div>
      </div>

      {/* Announcements Banner if any */}
      {announcements.length > 0 && (
        <AnnouncementBanner announcement={announcements[0]} />
      )}

      {/* 4 Mode Switcher Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as StudentMode)}
              aria-selected={isActive}
              role="tab"
              className={`p-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
                isActive
                  ? 'bg-[#0D7377] text-white border-[#095356] shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Toast */}
      {questionSentNotification && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#E6F4F1] border border-[#BCE3DC] text-[#0D7377] text-sm font-semibold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{questionSentNotification}</span>
        </div>
      )}

      {/* Active Mode Display Container */}
      <div className="civic-card p-6 md:p-8 bg-white border border-slate-200 shadow-sm">
        
        {/* ================= MODE 1: READ (CAPTIONS) ================= */}
        {activeMode === 'read' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#0D7377] animate-pulse" />
                <h2 className="text-base font-bold text-slate-900">
                  Live Classroom Captions ({captions.length})
                </h2>
              </div>
              <button
                onClick={() => setAutoScrollCaptions(!autoScrollCaptions)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                  autoScrollCaptions
                    ? 'bg-[#E6F4F1] text-[#0D7377] border-[#BCE3DC]'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Auto-scroll: {autoScrollCaptions ? 'ON' : 'OFF'}
              </button>
            </div>

            {captions.length === 0 && !interimCaption ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E6F4F1] text-[#0D7377] flex items-center justify-center mx-auto">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Listening for Teacher Speech
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Live speech transcriptions will stream here in real time. Teacher corrections are applied automatically.
                </p>
              </div>
            ) : (
              <div
                ref={captionsContainerRef}
                className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
                aria-live="polite"
              >
                {captions.map((cap) => (
                  <div
                    key={cap.id}
                    className={`p-4 rounded-xl border transition-all ${
                      cap.is_corrected
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Segment {cap.segment_index}</span>
                      {cap.is_corrected && (
                        <span className="badge-saffron text-[10px]">
                          ✓ Teacher Verified
                        </span>
                      )}
                    </div>
                    <p className="text-base sm:text-lg leading-relaxed text-slate-900 select-text font-normal">
                      {cap.text}
                    </p>
                  </div>
                ))}

                {/* Real-time Streaming Interim Caption Bubble */}
                {interimCaption && (
                  <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 transition-all animate-pulse">
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold mb-1">
                      <Radio className="w-3.5 h-3.5 animate-spin" />
                      <span>Speaking now...</span>
                    </div>
                    <p className="text-base sm:text-lg leading-relaxed text-blue-950 font-normal italic">
                      {interimCaption}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 2: LISTEN (TTS & DIAGRAM DESCRIPTIONS) ================= */}
        {activeMode === 'listen' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-[#0D7377]" />
                <h2 className="text-base font-bold text-slate-900">
                  Audio Playback & Visual Descriptions
                </h2>
              </div>
              <span className="badge-mint text-xs">
                Speed: {speechRate}x
              </span>
            </div>

            {activeSection ? (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-[#E6F4F1] border border-[#BCE3DC] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#0D7377]">
                        Section {studentSectionIndex + 1} of {lesson?.sections?.length || 1}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                        {activeSection.title}
                      </h3>
                    </div>

                    <button
                      onClick={handleTTSPlaySection}
                      className={`py-2.5 px-5 rounded-xl shadow-xs font-bold flex items-center gap-2 transition-all ${
                        isSpeaking && !isPaused
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                          : isPaused
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'btn-civic-primary'
                      }`}
                      aria-label={
                        isSpeaking && !isPaused
                          ? 'Pause audio playback'
                          : isPaused
                          ? 'Resume audio playback'
                          : 'Listen to section audio'
                      }
                    >
                      {isSpeaking && !isPaused ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Audio</span>
                        </>
                      ) : isPaused ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Resume Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Listen to Section</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-800">
                    {showSimplified
                      ? activeSection.simplified_text || activeSection.content_text
                      : activeSection.content_text}
                  </p>

                  {/* Active Speech Word Reading Guide */}
                  {isSpeaking && activeWord && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold animate-pulse">
                      <Volume2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Reading currently:</span>
                      <span className="font-mono bg-purple-200/80 px-2 py-0.5 rounded-md text-purple-950 font-bold">
                        "{activeWord}"
                      </span>
                    </div>
                  )}

                  {/* Key Terms Interactive Glossary Chips */}
                  {activeSection.key_terms && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FF6B4A]" />
                        Key Terms:
                      </span>
                      {activeSection.key_terms.split(',').map((term, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => setSelectedGlossaryTerm(term.trim())}
                          className="px-2.5 py-1 rounded-lg bg-[#E6F4F1] hover:bg-[#BCE3DC] text-[#0D7377] text-xs font-semibold transition flex items-center gap-1 shadow-2xs hover:scale-105 active:scale-95"
                          title="Click to view simple definition and pronunciation"
                        >
                          <BookMarked className="w-3 h-3" />
                          <span>{term.trim()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pedagogical Image Audio Description */}
                {activeSection.image_url && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#C67D0A]" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          Tactile & Pedagogical Image Description
                        </h4>
                      </div>
                      {activeSection.image_pedagogical_description && (
                        <button
                          onClick={handleTTSPlayDiagramDescription}
                          className="btn-civic-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#0D7377]" />
                          <span>Read Description</span>
                        </button>
                      )}
                    </div>

                    <img
                      src={activeSection.image_url}
                      alt={activeSection.image_alt || 'Diagram illustrating classroom lesson'}
                      className="w-full max-h-72 object-contain rounded-xl bg-slate-50 border border-slate-200"
                    />

                    {activeSection.image_pedagogical_description && (
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <strong>Spoken description:</strong> {activeSection.image_pedagogical_description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">
                No lesson sections currently loaded.
              </div>
            )}
          </div>
        )}

        {/* ================= MODE 3: RESPOND (AAC PHRASE BOARD) ================= */}
        {activeMode === 'respond' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0D7377]" />
                <h2 className="text-base font-bold text-slate-900">
                  Assistive Communication (AAC) & Inquiries
                </h2>
              </div>
              <span className="badge-saffron text-xs font-bold">
                Tap to speak & notify teacher
              </span>
            </div>

            {/* Quick Tap Phrase Board */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {aacPhrases.map((phrase) => (
                <button
                  key={phrase.id}
                  onClick={() => handleSendAAC(phrase.text)}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#E6F4F1] hover:border-[#0D7377] text-left transition-all group flex flex-col justify-between min-h-[90px]"
                >
                  <span className="text-2xl mb-1">{phrase.icon}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0D7377]">
                    {phrase.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Question or Message Form */}
            <form onSubmit={handleSendCustomQuestion} className="pt-4 border-t border-slate-100 space-y-3">
              <label
                htmlFor="student-question-input"
                className="block text-sm font-bold text-slate-900"
              >
                Send Private Question or Note to Teacher
              </label>
              <div className="flex gap-2">
                <input
                  id="student-question-input"
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Type a question or clarification request..."
                  className="flex-1 p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-[#0D7377] focus:bg-white"
                />
                <button
                  type="submit"
                  className="btn-civic-primary py-2.5 px-5 rounded-xl shrink-0 font-bold"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODE 4: FOLLOW (STEP CARDS) ================= */}
        {activeMode === 'follow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-[#0D7377]" />
                <h2 className="text-base font-bold text-slate-900">
                  Step-by-Step Lesson Progress
                </h2>
              </div>
              <div className="text-xs font-semibold text-slate-600">
                Step {studentSectionIndex + 1} of {lesson?.sections?.length || 1}
              </div>
            </div>

            <div className="space-y-3">
              {lesson?.sections?.map((sec, idx) => {
                const isCurrent = idx === studentSectionIndex;
                const isCompleted = idx < studentSectionIndex;
                return (
                  <div
                    key={sec.id || idx}
                    onClick={() => {
                      setFollowTeacher(false);
                      setStudentSectionIndex(idx);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#E6F4F1] border-[#0D7377] shadow-xs'
                        : isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-[#0D7377] text-white'
                            : isCompleted
                            ? 'bg-[#BCE3DC] text-[#0D7377]'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">
                            {sec.title}
                          </h4>
                          {isCurrent && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {sec.content_text.slice(0, 160)}...
                            </p>
                          )}
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="badge-mint text-[11px] shrink-0 font-bold">
                          Active Step
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
