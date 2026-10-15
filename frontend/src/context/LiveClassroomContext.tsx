import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CaptionSegment, Announcement, StudentQuestion, LiveSession, LessonSection } from '../types';
import { playAudioCue } from '../utils/audioCues';

export interface LiveReaction {
  id: string;
  emoji: string;
  label: string;
  sender?: string;
  timestamp: number;
}

export interface CheckinPoll {
  id: string;
  question: string;
  options: string[];
  votes: Record<number, number>;
  totalVotes: number;
  isOpen: boolean;
  myVote?: number;
}

interface LiveClassroomContextType {
  sessionId: string | null;
  roomCode: string | null;
  role: 'teacher' | 'student';
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  participantCount: number;
  currentSectionIndex: number;
  captions: CaptionSegment[];
  interimCaption: string | null;
  announcements: Announcement[];
  questions: StudentQuestion[];
  latestAnnouncement: Announcement | null;
  setLatestAnnouncement: (a: Announcement | null) => void;
  isSessionActive: boolean;
  reactions: LiveReaction[];
  activeCheckinPoll: CheckinPoll | null;
  
  // Actions
  joinRoom: (sessionId: string, roomCode: string, role: 'teacher' | 'student', nickname?: string) => void;
  leaveRoom: () => void;
  syncSection: (index: number) => Promise<void>;
  publishAnnouncement: (title: string, content: string, category?: string, priority?: 'normal' | 'urgent') => Promise<void>;
  submitQuestion: (content: string, type?: 'aac_phrase' | 'custom_text' | 'clarification', nickname?: string) => Promise<void>;
  acknowledgeQuestion: (questionId: string) => Promise<void>;
  answerQuestion: (questionId: string, responseText: string) => Promise<void>;
  postCaption: (text: string, language?: string) => Promise<void>;
  broadcastInterimCaption: (interimText: string) => void;
  correctCaption: (segmentId: string, correctedText: string) => Promise<void>;
  endSession: () => Promise<void>;
  sendReaction: (emoji: string, label: string) => Promise<void>;
  startCheckinPoll: (question: string, options: string[]) => Promise<void>;
  voteCheckinPoll: (pollId: string, optionIndex: number) => Promise<void>;
  closeCheckinPoll: (pollId: string) => Promise<void>;
}

const LiveClassroomContext = createContext<LiveClassroomContextType | undefined>(undefined);

export const LiveClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [studentNickname, setStudentNickname] = useState<string>('Student');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [captions, setCaptions] = useState<CaptionSegment[]>([]);
  const [interimCaption, setInterimCaption] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const [activeCheckinPoll, setActiveCheckinPoll] = useState<CheckinPoll | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);
  const roleRef = useRef<'teacher' | 'student'>('student');
  const nicknameRef = useRef<string>('Student');
  const captionsRef = useRef<CaptionSegment[]>([]);

  // Keep captionsRef updated
  useEffect(() => {
    captionsRef.current = captions;
  }, [captions]);

  // Load existing session details from backend
  const fetchSessionDetails = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/sessions/active/${sid}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.captions)) {
          setCaptions(data.captions);
          captionsRef.current = data.captions;
        }
        if (Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
        if (Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
        if (data.session) {
          setCurrentSectionIndex(data.session.current_section_index || 0);
          setIsSessionActive(data.session.is_active);
          setRoomCode(data.session.room_code);
        }
      }
    } catch (e) {
      console.warn('Could not fetch active session data:', e);
    }
  }, []);

  const connectWebSocket = useCallback((sid: string, currentRole: 'teacher' | 'student', nickname: string) => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = currentRole === 'teacher'
      ? (localStorage.getItem('setu_access_token') || '')
      : (localStorage.getItem('setu_student_token') || localStorage.getItem('setu_access_token') || '');
    const wsUrl = `${protocol}//${host}/ws/live/${sid}?role=${currentRole}&nickname=${encodeURIComponent(nickname)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus('connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'CAPTION_NEW':
            if (data.caption) {
              setInterimCaption(null); // Clear live partial caption once finalized
              setCaptions(prev => {
                if (prev.some(c => c.id === data.caption.id)) return prev;
                return [...prev, data.caption];
              });
            }
            break;

          case 'CAPTION_INTERIM':
            if (typeof data.text === 'string') {
              setInterimCaption(data.text);
            }
            break;

          case 'CAPTION_CORRECTED':
            if (data.caption) {
              setCaptions(prev => prev.map(c => c.id === data.caption.id ? data.caption : c));
            }
            break;

          case 'SECTION_CHANGED':
            if (typeof data.current_section_index === 'number') {
              setCurrentSectionIndex(data.current_section_index);
            }
            break;

          case 'ANNOUNCEMENT_NEW':
            if (data.announcement) {
              setAnnouncements(prev => [data.announcement, ...prev]);
              setLatestAnnouncement(data.announcement);
              playAudioCue('alert');
            }
            break;

          case 'QUESTION_NEW':
            if (data.question) {
              setQuestions(prev => [data.question, ...prev]);
              playAudioCue('chime');
            }
            break;

          case 'QUESTION_ACKNOWLEDGED':
            setQuestions(prev => prev.map(q => q.id === data.question_id ? { ...q, status: 'acknowledged' } : q));
            playAudioCue('success');
            break;

          case 'QUESTION_ANSWERED':
            setQuestions(prev => prev.map(q => q.id === data.question_id ? { ...q, status: 'answered', response_text: data.response_text } : q));
            playAudioCue('success');
            break;

          case 'REACTION_NEW':
            if (data.reaction) {
              setReactions(prev => [data.reaction, ...prev.slice(0, 19)]);
              playAudioCue('pop');
            }
            break;

          case 'CHECKIN_POLL_START':
            if (data.poll) {
              setActiveCheckinPoll(data.poll);
              playAudioCue('alert');
            }
            break;

          case 'CHECKIN_POLL_VOTE':
            if (data.poll_id) {
              setActiveCheckinPoll(prev => {
                if (!prev || prev.id !== data.poll_id) return prev;
                return {
                  ...prev,
                  votes: data.votes || prev.votes,
                  totalVotes: data.totalVotes !== undefined ? data.totalVotes : prev.totalVotes + 1
                };
              });
            }
            break;

          case 'CHECKIN_POLL_CLOSE':
            setActiveCheckinPoll(null);
            break;

          case 'PARTICIPANT_UPDATE':
            if (typeof data.participant_count === 'number') {
              setParticipantCount(data.participant_count);
            }
            break;

          case 'SESSION_ENDED':
            setIsSessionActive(false);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('reconnecting');
    };

    ws.onclose = () => {
      if (sessionIdRef.current) {
        setConnectionStatus('reconnecting');
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          if (sessionIdRef.current) {
            connectWebSocket(sessionIdRef.current, roleRef.current, nicknameRef.current);
          }
        }, 3000);
      } else {
        setConnectionStatus('disconnected');
      }
    };

    socketRef.current = ws;
  }, []);

  const joinRoom = useCallback((sid: string, code: string, userRole: 'teacher' | 'student', nickname: string = 'Student') => {
    setSessionId(sid);
    sessionIdRef.current = sid;
    setRoomCode(code);
    setRole(userRole);
    roleRef.current = userRole;
    setStudentNickname(nickname);
    nicknameRef.current = nickname;
    setIsSessionActive(true);

    fetchSessionDetails(sid);
    connectWebSocket(sid, userRole, nickname);
  }, [connectWebSocket, fetchSessionDetails]);

  const leaveRoom = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    sessionIdRef.current = null;
    setSessionId(null);
    setRoomCode(null);
    setConnectionStatus('disconnected');
    setCaptions([]);
    setAnnouncements([]);
    setQuestions([]);
    setLatestAnnouncement(null);
  }, []);

  const syncSection = async (index: number) => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    await fetch(`/api/sessions/${sessionId}/sync-section`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ current_section_index: index })
    });
    setCurrentSectionIndex(index);
  };

  const publishAnnouncement = async (title: string, content: string, category: string = 'General', priority: 'normal' | 'urgent' = 'normal') => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        session_id: sessionId,
        title,
        content,
        category,
        priority
      })
    });
  };

  const submitQuestion = async (content: string, type: 'aac_phrase' | 'custom_text' | 'clarification' = 'aac_phrase', nickname?: string) => {
    if (!sessionId) return;
    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        student_nickname: nickname || studentNickname,
        message_type: type,
        content
      })
    });
  };

  const acknowledgeQuestion = async (questionId: string) => {
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/questions/acknowledge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ question_id: questionId })
    });
  };

  const answerQuestion = async (questionId: string, responseText: string) => {
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/questions/answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ question_id: questionId, response_text: responseText })
    });
  };

  const postCaption = async (text: string, language: string = 'en') => {
    const activeSid = sessionId || sessionIdRef.current;
    if (!activeSid || !text.trim()) return;

    const token = localStorage.getItem('setu_auth_token');
    const segmentIndex = captionsRef.current.length + 1;

    try {
      const res = await fetch('/api/speech/captions/manual-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          session_id: activeSid,
          segment_index: segmentIndex,
          text: text.trim(),
          language
        })
      });

      if (res.ok) {
        const newCap = await res.json();
        // Optimistically append if not received via socket yet
        setCaptions(prev => {
          if (prev.some(c => c.id === newCap.id)) return prev;
          const updated = [...prev, newCap];
          captionsRef.current = updated;
          return updated;
        });
      }
    } catch (err) {
      console.warn('Failed to post caption:', err);
    }
  };

  const correctCaption = async (segmentId: string, correctedText: string) => {
    const token = localStorage.getItem('setu_auth_token');
    await fetch('/api/speech/captions/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        segment_id: segmentId,
        corrected_text: correctedText
      })
    });
  };

  const broadcastInterimCaption = (text: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({
          type: 'TEACHER_INTERIM',
          text
        }));
      } catch (e) {
        // Ignore socket write race condition
      }
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    const token = localStorage.getItem('setu_auth_token');
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    setIsSessionActive(false);
  };

  const sendReaction = async (emoji: string, label: string) => {
    if (!sessionId) return;
    playAudioCue('pop');
    setReactions(prev => [{
      id: `rx-${Date.now()}`,
      emoji,
      label,
      sender: studentNickname,
      timestamp: Date.now()
    }, ...prev.slice(0, 19)]);

    await fetch('/api/sessions/reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        emoji,
        label,
        sender: studentNickname
      })
    });
  };

  const startCheckinPoll = async (question: string, options: string[]) => {
    if (!sessionId) return;
    playAudioCue('chime');
    const token = localStorage.getItem('setu_auth_token');
    const res = await fetch('/api/sessions/checkin-poll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        session_id: sessionId,
        question,
        options
      })
    });
    if (res.ok) {
      const poll = await res.json();
      setActiveCheckinPoll(poll);
    }
  };

  const voteCheckinPoll = async (pollId: string, optionIndex: number) => {
    playAudioCue('chime');
    setActiveCheckinPoll(prev => prev && prev.id === pollId ? { ...prev, myVote: optionIndex } : prev);
    await fetch('/api/sessions/checkin-vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poll_id: pollId,
        option_index: optionIndex
      })
    });
  };

  const closeCheckinPoll = async (pollId: string) => {
    setActiveCheckinPoll(null);
    await fetch('/api/sessions/checkin-close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poll_id: pollId })
    });
  };

  return (
    <LiveClassroomContext.Provider value={{
      sessionId,
      roomCode,
      role,
      connectionStatus,
      participantCount,
      currentSectionIndex,
      captions,
      interimCaption,
      announcements,
      questions,
      latestAnnouncement,
      setLatestAnnouncement,
      isSessionActive,
      reactions,
      activeCheckinPoll,
      joinRoom,
      leaveRoom,
      syncSection,
      publishAnnouncement,
      submitQuestion,
      acknowledgeQuestion,
      answerQuestion,
      postCaption,
      broadcastInterimCaption,
      correctCaption,
      endSession,
      sendReaction,
      startCheckinPoll,
      voteCheckinPoll,
      closeCheckinPoll
    }}>
      {children}
    </LiveClassroomContext.Provider>
  );
};

export const useLiveClassroom = () => {
  const context = useContext(LiveClassroomContext);
  if (!context) {
    throw new Error('useLiveClassroom must be used within a LiveClassroomProvider');
  }
  return context;
};
