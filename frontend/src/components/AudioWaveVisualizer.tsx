import React from 'react';

interface AudioWaveVisualizerProps {
  isActive: boolean;
  barCount?: number;
  height?: string;
  className?: string;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isActive,
  barCount = 12,
  height = 'h-6',
  className = ''
}) => {
  return (
    <div
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/10 dark:bg-slate-100/10 ${height} ${className}`}
      aria-hidden="true"
      title={isActive ? 'Microphone capturing audio' : 'Microphone idle'}
    >
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary base heights for natural audio frequency waveform look
        const delay = (i * 0.08).toFixed(2);
        const duration = (0.5 + (i % 4) * 0.15).toFixed(2);

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all ${
              isActive
                ? 'bg-[#FF6B4A] animate-pulse'
                : 'bg-slate-300 dark:bg-slate-600 h-1.5'
            }`}
            style={
              isActive
                ? {
                    height: `${Math.max(20, Math.sin((i + 1) * 0.8) * 80 + 30)}%`,
                    animationDuration: `${duration}s`,
                    animationDelay: `${delay}s`
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
};
