import React, { useState } from 'react';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { Sparkles } from 'lucide-react';

interface LiveReactionsOverlayProps {
  showBar?: boolean;
}

const REACTION_OPTIONS = [
  { emoji: '💡', label: 'Got It!' },
  { emoji: '🙋', label: 'Hand Raised' },
  { emoji: '👏', label: 'Great Point' },
  { emoji: '🐢', label: 'Go Slower' },
  { emoji: '🚀', label: 'Ready for Next' }
];

export const LiveReactionsOverlay: React.FC<LiveReactionsOverlayProps> = ({ showBar = true }) => {
  const { reactions, sendReaction } = useLiveClassroom();
  const [activeBubble, setActiveBubble] = useState<string | null>(null);

  const handleSend = (emoji: string, label: string) => {
    setActiveBubble(emoji);
    sendReaction(emoji, label);
    setTimeout(() => setActiveBubble(null), 1200);
  };

  return (
    <>
      {/* Floating Animated Reaction Emojis */}
      <div className="pointer-events-none fixed bottom-24 right-8 z-40 flex flex-col-reverse items-end gap-2 overflow-hidden max-h-64 select-none">
        {reactions.slice(0, 5).map((rx, idx) => (
          <div
            key={rx.id || idx}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-zinc-800/95 shadow-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold animate-bounce transition-all duration-300"
            style={{
              opacity: Math.max(0.2, 1 - idx * 0.2),
              transform: `scale(${Math.max(0.75, 1 - idx * 0.08)})`
            }}
          >
            <span className="text-base">{rx.emoji}</span>
            <span className="text-slate-700 dark:text-zinc-200">{rx.label}</span>
            {rx.sender && (
              <span className="text-[10px] text-slate-400 font-mono">({rx.sender})</span>
            )}
          </div>
        ))}
      </div>

      {/* Floating Reaction Bar (for Students) */}
      {showBar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-slate-200 dark:border-zinc-800 shadow-xl">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 hidden sm:flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FF6B4A]" />
            <span>React:</span>
          </div>

          {REACTION_OPTIONS.map((opt) => (
            <button
              key={opt.emoji}
              onClick={() => handleSend(opt.emoji, opt.label)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 transition active:scale-90"
              title={opt.label}
            >
              <span className="text-sm">{opt.emoji}</span>
              <span className="hidden md:inline text-[11px] font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
};
