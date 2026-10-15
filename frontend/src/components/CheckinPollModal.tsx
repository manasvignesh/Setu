import React from 'react';
import { useLiveClassroom } from '../context/LiveClassroomContext';
import { HelpCircle, BarChart3, CheckCircle2, X } from 'lucide-react';

interface CheckinPollModalProps {
  isTeacher?: boolean;
}

export const CheckinPollModal: React.FC<CheckinPollModalProps> = ({ isTeacher = false }) => {
  const { activeCheckinPoll, voteCheckinPoll, closeCheckinPoll } = useLiveClassroom();

  if (!activeCheckinPoll) return null;

  const total = activeCheckinPoll.totalVotes || 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 text-slate-900 dark:text-zinc-100 animate-slide-up"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
              LIVE CHECK-IN
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
              {activeCheckinPoll.question}
            </h4>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => closeCheckinPoll(activeCheckinPoll.id)}
            title="End Poll"
            className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2.5">
        {activeCheckinPoll.options.map((opt, idx) => {
          const voteCount = activeCheckinPoll.votes?.[idx] || 0;
          const percentage = total > 0 ? Math.round((voteCount / total) * 100) : 0;
          const isSelected = activeCheckinPoll.myVote === idx;

          return (
            <button
              key={idx}
              disabled={isTeacher || activeCheckinPoll.myVote !== undefined}
              onClick={() => voteCheckinPoll(activeCheckinPoll.id, idx)}
              className={`w-full relative overflow-hidden text-left p-3 rounded-2xl border transition text-xs font-semibold ${
                isSelected
                  ? 'border-[#0D7377] bg-[#E6F4F1] dark:bg-[#0D7377]/20 text-[#0D7377] dark:text-[#5CE1E6] font-bold'
                  : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-600'
              }`}
            >
              {/* Progress bar background for vote results */}
              <div
                className="absolute inset-y-0 left-0 bg-[#0D7377]/10 dark:bg-[#0D7377]/20 pointer-events-none transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex items-center justify-between z-10">
                <span className="flex items-center gap-2">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0D7377] shrink-0" />}
                  <span>{opt}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {voteCount} ({percentage}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-zinc-800">
        <span className="flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 text-[#0D7377]" />
          <span>{total} response{total === 1 ? '' : 's'}</span>
        </span>
        {activeCheckinPoll.myVote !== undefined && !isTeacher && (
          <span className="text-emerald-600 font-bold">Vote recorded!</span>
        )}
      </div>
    </div>
  );
};
