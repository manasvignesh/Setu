import React, { useEffect, useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Eye, X } from 'lucide-react';

export const ReadingGuide: React.FC = () => {
  const { readingGuide, setReadingGuide } = useAccessibility();
  const [mouseY, setMouseY] = useState(250);

  useEffect(() => {
    if (!readingGuide) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingGuide]);

  if (!readingGuide) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none" aria-hidden="true">
      {/* Upper dim layer */}
      <div
        className="absolute top-0 left-0 right-0 bg-black/15 transition-all duration-75"
        style={{ height: Math.max(0, mouseY - 28) }}
      />

      {/* Reading focus ruler strip */}
      <div
        className="absolute left-0 right-0 border-y-2 border-[#0D7377]/60 bg-[#0D7377]/10 backdrop-blur-[0.5px] transition-all duration-75"
        style={{
          top: Math.max(0, mouseY - 28),
          height: 56
        }}
      >
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
          <button
            onClick={() => setReadingGuide(false)}
            title="Turn off Reading Guide"
            className="p-1 rounded-full bg-white/90 shadow text-slate-700 hover:text-red-600 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lower dim layer */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-black/15 transition-all duration-75"
        style={{ top: mouseY + 28 }}
      />
    </div>
  );
};
