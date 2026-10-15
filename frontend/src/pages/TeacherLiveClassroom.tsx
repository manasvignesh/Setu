import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { QRCodeModal } from '../components/QRCodeModal';
import { AudioWaveVisualizer } from '../components/AudioWaveVisualizer';
import { CheckinPollModal } from '../components/CheckinPollModal';
import { LiveReactionsOverlay } from '../components/LiveReactionsOverlay';
import type { LiveSession, Lesson } from '../types';
import {
  Mic,
  MicOff,
  Radio,
  QrCode,
  Users,
  Megaphone,
  Check,
  Edit2,
  X,
  MessageSquare,
  BookOpen,
  LogOut,
  Send,
  AlertCircle,
  Clock,
  Download,
  BarChart2,
  PlayCircle,
  Sparkles
} from 'lucide-react';

interface TeacherLiveClassroomProps {
  navigate: (route: string, data?: any) => void;
  sessionData?: LiveSession;
}

export const TeacherLiveClassroom: React.FC<TeacherLiveClassroomProps> = ({ navigate, sessionData }) => {
  const { language } = useAccessibility();
  const {
    sessionId,
    roomCode,
    participantCount,
    captions,
    questions,
    currentSectionIndex,
    reactions,
    activeCheckinPoll,
    syncSection,
    publishAnnouncement,
    acknowledgeQuestion,
    answerQuestion,
    postCaption,
    broadcastInterimCaption,
    correctCaption,
    endSession,
    joinRoom,
    startCheckinPoll
  } = useLiveClassroom();

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(sessionData?.lesson || null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [isSimulatingSpeech, setIsSimulatingSpeech] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Manual caption fallback input
  const [manualCaptionInput, setManualCaptionInput] = useState('');

  // Announcement modal state
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Assignment' | 'Exam' | 'Timetable' | 'Safety' | 'General'>('General');

  // Answering student question
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const [activeSessionInfo, setActiveSessionInfo] = useState<any>(sessionData || null);

  useEffect(() => {
    if (!activeSessionInfo) {
      try {
        const stored = localStorage.getItem('setu_teacher_session');
        if (stored) {
          setActiveSessionInfo(JSON.parse(stored));
        }
      } catch (e) {
        console.warn('Failed to parse stored teacher session:', e);
      }
    }
  }, [activeSessionInfo]);

  const currentSession = sessionData || activeSessionInfo;

  useEffect(() => {
    const sid = currentSession?.id;
    const code = currentSession?.room_code;
    if (!sessionId && sid) {
      joinRoom(sid, code || 'ROOM', 'teacher', 'Teacher');
    }
  }, [joinRoom, sessionId, currentSession]);

  const handleSegmentCaptured = async (text: string, isFinal: boolean) => {
    if (isFinal && text.trim()) {
      await postCaption(text.trim(), language);
    }
  };

  const handleInterimCaptured = (text: string) => {
    broadcastInterimCaption(text);
  };

  const {
    isListening,
    interimText,
    error: micError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onSegmentCaptured: handleSegmentCaptured,
    onInterimCaptured: handleInterimCaptured,
    language,
    sessionId: sessionId || sessionData?.id
  });

  useEffect(() => {
    const lid = sessionData?.lesson_id || sessionData?.lesson?.id;
    if (lid && !activeLesson) {
      fetch(`/api/lessons/${lid}`)
        .then(res => res.json())
        .then(data => setActiveLesson(data))
        .catch(console.error);
    }
  }, [activeLesson, sessionData]);

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleManualCaptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCaptionInput.trim()) return;
    await postCaption(manualCaptionInput.trim(), language);
    setManualCaptionInput('');
  };

  const handleStartCaptionEdit = (capId: string, currentText: string) => {
    setEditingCaptionId(capId);
    setEditingCaptionText(currentText);
  };

  const handleSaveCaptionEdit = async (capId: string) => {
    if (!editingCaptionText.trim()) return;
    await correctCaption(capId, editingCaptionText.trim());
    setEditingCaptionId(null);
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    await publishAnnouncement(annTitle.trim(), annContent.trim(), annCategory);
    setAnnTitle('');
    setAnnContent('');
    setIsAnnouncing(false);
  };

  const handleSendAnswer = async (qId: string) => {
    if (!responseText.trim()) return;
    await answerQuestion(qId, responseText.trim());
    setAnsweringQuestionId(null);
    setResponseText('');
  };

  // Classroom session stopwatch timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulateSpeech = async () => {
    if (isSimulatingSpeech) return;
    setIsSimulatingSpeech(true);
    const sampleSentences = [
      "Now observe how Earth's tilted axis at 23.5 degrees creates our four distinct seasonal cycles.",
      "Notice that the gravitational attraction of the Sun keeps all eight planetary bodies in stable elliptical orbits.",
      "When one hemisphere leans toward the Sun, it receives concentrated solar radiation, producing summer."
    ];

    for (let i = 0; i < sampleSentences.length; i++) {
      broadcastInterimCaption(sampleSentences[i].slice(0, 30) + "...");
      await new Promise(r => setTimeout(r, 900));
      await postCaption(sampleSentences[i], language);
      await new Promise(r => setTimeout(r, 600));
    }
    setIsSimulatingSpeech(false);
  };

  const handleExportNotes = () => {
    const lines = [
      `SETU INCLUSIVE CLASSROOM TRANSCRIPT & NOTES`,
      `Room Code: ${roomCode || 'SETU'}`,
      `Lesson: ${activeLesson?.title || 'Science Lesson'}`,
      `Date: ${new Date().toLocaleDateString()} - Duration: ${formatTimer(elapsedSeconds)}`,
      `----------------------------------------\n`,
      `LIVE CAPTIONS STREAM:`,
      ...captions.map((c, i) => `[${i + 1}] ${c.text}`),
      `\n----------------------------------------`,
      `STUDENT AAC INQUIRIES & QUESTIONS:`,
      ...questions.map(q => `• ${q.student_nickname}: "${q.content}" [Status: ${q.status}]${q.response_text ? ` -> Reply: "${q.response_text}"` : ''}`)
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SETU_Class_${roomCode || 'Notes'}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLaunchPollPreset = (preset: 'follow' | 'speed' | 'quiz') => {
    if (preset === 'follow') {
      startCheckinPoll('Comprehension Check: Are you following this concept?', ['👍 Yes, clear!', '🤔 Need a quick recap', '✋ I have a question']);
    } else if (preset === 'speed') {
      startCheckinPoll('Pacing Check: How is the teaching speed?', ['🐇 A bit too fast', '🎯 Just right', '🐢 Please speak slower']);
    } else {
      startCheckinPoll('Quiz Check: Ready for the practice question?', ['🚀 Ready!', '⏳ Need 2 more minutes', '📖 Reviewing cards']);
    }
    setShowPollCreator(false);
  };

  const handleEndClass = async () => {
    if (window.confirm('Conclude this live classroom session?')) {
      stopListening();
      await endSession();
      navigate('teacher-dashboard');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Floating Reactions Layer & Active Poll for Teacher */}
      <LiveReactionsOverlay showBar={false} />
      <CheckinPollModal isTeacher={true} />
      
      {/* iOS Top Bar */}
      <div className="ios-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Live Classroom Cockpit
            </h1>
            <span className="badge-ios-blue text-xs font-mono font-bold">
              Room: {roomCode || sessionData?.room_code || 'SETU'}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-mono font-semibold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeLesson?.title || 'Interactive Lesson'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{participantCount} Connected</span>
          </div>

          {reactions.length > 0 && (
            <div className="px-3 py-1.5 rounded-full bg-[#FFF0EC] text-xs font-bold text-[#FF6B4A] flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{reactions.length} Pulse{reactions.length === 1 ? '' : 's'}</span>
            </div>
          )}

          <button
            onClick={() => setIsQRModalOpen(true)}
            className="btn-ios-secondary text-xs py-1.5 px-3"
            title="Project Room Code"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Project QR</span>
          </button>

          <button
            onClick={() => setShowPollCreator(!showPollCreator)}
            className="btn-ios-secondary text-xs py-1.5 px-3"
            title="Launch quick student comprehension check"
          >
            <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Quick Check-in</span>
          </button>

          <button
            onClick={() => setIsAnnouncing(true)}
            className="btn-ios-secondary text-xs py-1.5 px-3"
          >
            <Megaphone className="w-3.5 h-3.5 text-amber-600" />
            <span>Announce</span>
          </button>

          <button
            onClick={handleExportNotes}
            className="btn-ios-secondary text-xs py-1.5 px-3"
            title="Export session transcript and AAC log"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Notes</span>
          </button>

          <button
            onClick={handleEndClass}
            className="py-1.5 px-3 rounded-full text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            End Class
          </button>
        </div>
      </div>

      {/* Quick Check-in Poll Selector Popup */}
      {showPollCreator && (
        <div className="ios-card p-4 border border-emerald-200 bg-emerald-50/40 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              <span>Broadcast a Live Comprehension Check-in to All Students</span>
            </h3>
            <button
              onClick={() => setShowPollCreator(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mb-3">
            Students receive an instant accessible one-tap prompt on their screens, allowing you to gauge classroom pacing without calling anyone out.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleLaunchPollPreset('follow')}
              className="p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 text-left text-xs transition shadow-xs"
            >
              <div className="font-bold text-slate-900">Are you following?</div>
              <div className="text-[11px] text-slate-500 mt-1">Options: Yes / Need Recap / Question</div>
            </button>
            <button
              onClick={() => handleLaunchPollPreset('speed')}
              className="p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 text-left text-xs transition shadow-xs"
            >
              <div className="font-bold text-slate-900">Pacing Check</div>
              <div className="text-[11px] text-slate-500 mt-1">Options: Too fast / Just right / Slower</div>
            </button>
            <button
              onClick={() => handleLaunchPollPreset('quiz')}
              className="p-3 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 text-left text-xs transition shadow-xs"
            >
              <div className="font-bold text-slate-900">Ready for Quiz?</div>
              <div className="text-[11px] text-slate-500 mt-1">Options: Ready / Need 2 Mins / Review</div>
            </button>
          </div>
        </div>
      )}

      {/* Grid: Mic & Captions on Left, Steps & AAC on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* iOS Clean Mic Widget */}
          <div className="ios-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-red-50 text-red-600 animate-pulse'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {isListening ? 'MICROPHONE ACTIVE' : 'STANDBY'}
                    </span>
                    <AudioWaveVisualizer isActive={isListening} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isListening ? 'Streaming live speech...' : 'Press Start to transcribe lecture'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimulateSpeech}
                  disabled={isSimulatingSpeech}
                  className="btn-ios-secondary text-xs py-2 px-3 flex items-center gap-1.5"
                  title="Simulate speech to test live transcription without microphone"
                >
                  <PlayCircle className="w-4 h-4 text-purple-600" />
                  <span>{isSimulatingSpeech ? 'Streaming Demo...' : 'Demo Speech'}</span>
                </button>

                <button
                  onClick={handleToggleMic}
                  className={`text-xs py-2 px-5 font-semibold transition-all ${
                    isListening
                      ? 'rounded-full bg-red-600 text-white hover:bg-red-700'
                      : 'btn-ios-primary'
                  }`}
                >
                  {isListening ? 'Stop Mic' : 'Start Speech'}
                </button>
              </div>
            </div>

            {/* Interim Transcript Live Bubble */}
            {isListening && interimText && (
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs font-medium">
                Transcribing: {interimText}
              </div>
            )}

            {micError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">
                {micError}
              </div>
            )}

            {/* Manual Caption Input */}
            <form onSubmit={handleManualCaptionSubmit} className="pt-2 flex gap-2">
              <input
                type="text"
                value={manualCaptionInput}
                onChange={(e) => setManualCaptionInput(e.target.value)}
                placeholder="Or type a spoken note or key term to broadcast..."
                className="ios-input flex-1 text-xs py-2"
              />
              <button
                type="submit"
                className="btn-ios-primary text-xs py-2 px-4"
              >
                Broadcast
              </button>
            </form>
          </div>

          {/* Transcript History */}
          <div className="ios-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>Live Captions ({captions.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Click pencil to correct</span>
            </div>

            {captions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Captions will appear here when you speak into the microphone.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {captions.map((cap) => (
                  <div
                    key={cap.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      cap.is_corrected ? 'bg-amber-50/60 border-amber-200' : 'bg-[#F2F2F7] border-transparent'
                    }`}
                  >
                    {editingCaptionId === cap.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={editingCaptionText}
                          onChange={(e) => setEditingCaptionText(e.target.value)}
                          className="w-full p-2 text-xs rounded-xl border border-blue-500 bg-white"
                        />
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            onClick={() => setEditingCaptionId(null)}
                            className="px-2 py-1 text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveCaptionEdit(cap.id)}
                            className="btn-ios-primary text-xs py-1 px-3"
                          >
                            Save & Broadcast
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-900 leading-relaxed font-normal">
                            {cap.text}
                          </p>
                          {cap.is_corrected && (
                            <span className="badge-ios-amber text-[10px] mt-1">
                              ✓ Corrected by Teacher
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartCaptionEdit(cap.id, cap.text)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Lesson Progress */}
          <div className="ios-card p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Lesson Steps</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {currentSectionIndex + 1} / {activeLesson?.sections?.length || 1}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {activeLesson?.sections?.map((sec, idx) => {
                const isCurrent = idx === currentSectionIndex;
                return (
                  <button
                    key={sec.id || idx}
                    onClick={() => syncSection(idx)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs font-semibold ${
                      isCurrent
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-[#F2F2F7] text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[180px]">{sec.title}</span>
                    </div>
                    {isCurrent && <span className="text-[10px] text-blue-600 font-bold">Current</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Questions */}
          <div className="ios-card p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>Student Inquiries ({questions.length})</span>
              </h3>
            </div>

            {questions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Student phrase board messages and questions appear here.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {questions.map((q) => (
                  <div key={q.id} className="p-3 rounded-2xl bg-[#F2F2F7] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{q.student_nickname || 'Student'}</span>
                      <span className={q.message_type === 'aac_phrase' ? 'badge-ios-amber text-[10px]' : 'badge-ios-blue text-[10px]'}>
                        {q.message_type === 'aac_phrase' ? 'AAC Phrase' : 'Question'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800">"{q.content}"</p>
                    {q.status === 'answered' && q.response_text && (
                      <div className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded-xl">
                        <strong>Reply:</strong> {q.response_text}
                      </div>
                    )}
                    {q.status !== 'answered' && (
                      <div className="flex justify-end gap-2 pt-1 text-xs">
                        {q.status === 'pending' && (
                          <button
                            onClick={() => acknowledgeQuestion(q.id)}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => setAnsweringQuestionId(q.id)}
                          className="text-blue-600 font-semibold"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                    {answeringQuestionId === q.id && (
                      <div className="pt-1.5 flex gap-1.5">
                        <input
                          type="text"
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Type reply..."
                          className="ios-input flex-1 text-xs py-1.5"
                        />
                        <button
                          onClick={() => handleSendAnswer(q.id)}
                          className="btn-ios-primary text-xs py-1.5 px-3"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isQRModalOpen && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          roomCode={roomCode || sessionData?.room_code || 'SETU'}
          classNameTitle={activeLesson?.title || 'Interactive Lesson'}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {isAnnouncing && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="ios-card bg-white p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-base text-slate-900">
                Publish Announcement
              </h3>
              <button onClick={() => setIsAnnouncing(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePublishAnnouncement} className="space-y-3">
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Title"
                className="ios-input w-full text-xs"
              />
              <textarea
                rows={3}
                required
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="Announcement message..."
                className="ios-input w-full text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAnnouncing(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-ios-primary text-xs py-2 px-5">
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
