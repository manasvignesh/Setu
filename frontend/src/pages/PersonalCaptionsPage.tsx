import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAccessibility } from '../context/AccessibilityContext';
import { AudioWaveVisualizer } from '../components/AudioWaveVisualizer';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  Download,
  Trash2,
  Pause,
  Play,
  Settings2,
  Sliders,
  Volume2,
  Sparkles,
  ArrowLeft,
  Radio,
  FileText,
  PlayCircle
} from 'lucide-react';

interface CaptionItem {
  id: string;
  text: string;
  timestamp: string;
  isInterim?: boolean;
}

interface PersonalCaptionsPageProps {
  navigate: (route: string) => void;
}

export const PersonalCaptionsPage: React.FC<PersonalCaptionsPageProps> = ({ navigate }) => {
  const { language, fontSize, theme } = useAccessibility();
  const [captions, setCaptions] = useState<CaptionItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customFontSize, setCustomFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [engineMode, setEngineMode] = useState<'streaming' | 'browser'>('streaming');
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'listening' | 'error'>('idle');

  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Browser speech recognition fallback
  const {
    isListening: isBrowserListening,
    interimText: browserInterim,
    startListening: startBrowserListening,
    stopListening: stopBrowserListening,
    error: browserError,
    isSupported: browserSupported
  } = useSpeechRecognition({
    onSegmentCaptured: (text, isFinal) => {
      if (isFinal && text.trim() && engineMode === 'browser' && !isPaused) {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setCaptions(prev => [
          ...prev,
          {
            id: `brow_${Date.now()}`,
            text: text.trim(),
            timestamp: now
          }
        ]);
      }
    },
    language
  });

  // Auto-scroll when new captions arrive
  useEffect(() => {
    if (!isPaused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [captions, browserInterim, isPaused]);

  // Connect to streaming WebSocket audio pipeline
  const startStreamingCaptions = async () => {
    try {
      setStreamStatus('connecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      mediaStreamRef.current = stream;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/speech/stream?language=${language}&provider=hybrid`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStreamStatus('listening');
        // Set up AudioContext to capture raw 16kHz PCM
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && !isPaused) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert float32 to int16 PCM
            const pcmBuffer = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcmBuffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            ws.send(pcmBuffer.buffer);
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (isPaused) return;

          if (data.type === 'CAPTION_FINAL' && data.text) {
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setCaptions(prev => [
              ...prev,
              {
                id: data.utterance_id || `cap_${Date.now()}`,
                text: data.text,
                timestamp: now
              }
            ]);
          }
        } catch (e) {
          console.warn('Error parsing caption message:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('Streaming STT WebSocket failed, switching to browser engine fallback:', e);
        fallbackToBrowser();
      };

      ws.onclose = () => {
        if (streamStatus === 'listening') {
          setStreamStatus('idle');
        }
      };
    } catch (err) {
      console.warn('Microphone permission or WebSocket init error:', err);
      fallbackToBrowser();
    }
  };

  const fallbackToBrowser = () => {
    stopStreamingCaptions();
    setEngineMode('browser');
    if (browserSupported) {
      startBrowserListening();
      setStreamStatus('listening');
    } else {
      setStreamStatus('error');
    }
  };

  const stopStreamingCaptions = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setStreamStatus('idle');
  };

  const toggleListening = () => {
    if (streamStatus === 'listening' || isBrowserListening) {
      if (engineMode === 'streaming') {
        stopStreamingCaptions();
      } else {
        stopBrowserListening();
        setStreamStatus('idle');
      }
    } else {
      if (engineMode === 'streaming') {
        startStreamingCaptions();
      } else {
        startBrowserListening();
        setStreamStatus('listening');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStreamingCaptions();
      stopBrowserListening();
    };
  }, []);

  const handleCopy = () => {
    const fullText = captions.map(c => `[${c.timestamp}] ${c.text}`).join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullText = captions.map(c => `[${c.timestamp}] ${c.text}`).join('\n');
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SETU-Live-Captions-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setCaptions([]);
  };

  const handleSimulateDemo = () => {
    const demoSentences = [
      "Welcome to this lecture on the fundamentals of electromagnetic wave propagation.",
      "Light waves travel through a vacuum at approximately 300,000 kilometers per second.",
      "When light encounters a denser medium like water or glass, it refracts and changes velocity."
    ];
    demoSentences.forEach((s, idx) => {
      setTimeout(() => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setCaptions(prev => [...prev, { id: `sim-${Date.now()}-${idx}`, text: s, timestamp: now }]);
      }, idx * 1200);
    });
  };

  const isLive = streamStatus === 'listening' || isBrowserListening;

  const fontClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-xl leading-relaxed font-medium',
    huge: 'text-2xl sm:text-3xl leading-relaxed font-semibold'
  }[customFontSize];

  return (
    <div className={`min-h-[calc(100vh-4rem)] flex flex-col p-4 sm:p-6 transition-colors ${
      highContrast 
        ? 'bg-[#0F1E2E] text-white' 
        : 'bg-[#F7F9F8] text-[#19324A]'
    }`}>
      {/* Top Header & Navigation */}
      <div className="max-w-4xl w-full mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('dashboard')}
            className={`p-2 rounded-xl border transition-colors flex items-center gap-2 text-sm font-semibold ${
              highContrast
                ? 'border-white/30 hover:bg-white/10 text-white'
                : 'border-slate-300 hover:bg-white text-slate-800'
            }`}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <span>Personal Live Captions</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E8F5F2] text-[#0A625D]">
                Personal Mode
              </span>
            </h1>
            <p className={`text-xs ${highContrast ? 'text-slate-300' : 'text-slate-600'}`}>
              Continuous speech recognition with sub-second live partials
            </p>
          </div>
        </div>

        {/* Live Audio Status Indicator & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <AudioWaveVisualizer isActive={isLive} />

          <button
            onClick={handleSimulateDemo}
            className="px-3 py-1.5 rounded-full text-xs font-bold border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center gap-1.5 transition"
            title="Simulate speech without microphone"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Demo Speech</span>
          </button>

          <button
            onClick={toggleListening}
            className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
              isLive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#0A625D] hover:bg-[#084F4B] text-white'
            }`}
            aria-label={isLive ? 'Stop Live Captions' : 'Start Live Captions'}
          >
            {isLive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isLive ? 'Stop Captions' : 'Start Captions'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Font sizing, Contrast, Pause, Actions */}
      <div className="max-w-4xl w-full mx-auto my-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-0.5 overflow-hidden text-slate-800">
            <span className="px-2 font-bold text-slate-600">Text:</span>
            {(['normal', 'large', 'huge'] as const).map(s => (
              <button
                key={s}
                onClick={() => setCustomFontSize(s)}
                className={`px-2.5 py-1 font-bold rounded capitalize transition-colors ${
                  customFontSize === s
                    ? 'bg-[#19324A] text-white'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-3 py-1.5 rounded-lg border font-bold transition-colors ${
              highContrast
                ? 'bg-amber-400 text-black border-amber-500'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
            aria-pressed={highContrast}
          >
            High Contrast
          </button>

          {/* Pause / Freeze Stream */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-colors ${
              isPaused
                ? 'bg-amber-100 text-amber-900 border-amber-400'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
            }`}
            aria-label={isPaused ? 'Resume auto-scrolling captions' : 'Pause scrolling to read'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Paused (Reading)' : 'Pause Scroll'}</span>
          </button>
        </div>

        {/* Action buttons: Copy, Download, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            disabled={captions.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1"
            title="Copy all captions"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={captions.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1"
            title="Download transcript text"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
          <button
            onClick={handleClear}
            disabled={captions.length === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-40 font-bold flex items-center gap-1"
            title="Clear captions"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Captions Display Box */}
      <div
        ref={scrollRef}
        role="region"
        aria-live="polite"
        aria-label="Real-time speech captions"
        className={`max-w-4xl w-full mx-auto flex-1 rounded-2xl p-6 sm:p-8 overflow-y-auto min-h-[350px] shadow-sm border transition-colors ${
          highContrast
            ? 'bg-[#09131D] border-white/20 text-white'
            : 'bg-white border-slate-200 text-[#19324A]'
        }`}
      >
        {captions.length === 0 && !isLive && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 opacity-75">
            <Radio className="w-12 h-12 text-[#0A625D] mb-3 stroke-[1.5]" />
            <h3 className="text-lg font-bold">Captions are ready to start</h3>
            <p className="text-sm max-w-md mt-1 opacity-80">
              Press the "Start Captions" button above and speak into your microphone to view live real-time transcriptions.
            </p>
          </div>
        )}

        {captions.length === 0 && isLive && (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-4 h-4 rounded-full bg-[#0A625D] animate-ping mb-4" />
            <p className="text-base font-bold animate-pulse text-[#0A625D]">
              Listening to speech... Start speaking now.
            </p>
          </div>
        )}

        {/* Finalized captions */}
        <div className="space-y-4">
          {captions.map((cap) => (
            <div key={cap.id} className="group">
              <div className="flex items-baseline gap-3">
                <span className={`text-xs font-mono font-bold select-none opacity-50 shrink-0`}>
                  {cap.timestamp}
                </span>
                <p className={`${fontClasses} break-words`}>
                  {cap.text}
                </p>
              </div>
            </div>
          ))}

          {/* Live Interim Partial Caption */}
          {browserInterim && engineMode === 'browser' && (
            <div className="flex items-baseline gap-3 pt-2 text-[#0A625D] italic">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#E8F5F2] px-1.5 py-0.5 rounded">
                Live
              </span>
              <p className={`${fontClasses} break-words font-normal`}>
                {browserInterim}...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
