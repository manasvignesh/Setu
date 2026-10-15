import React from 'react';
import { BridgeMotif } from './BridgeMotif';
import { ReadingGuide } from './ReadingGuide';

interface AppShellProps {
  children: React.ReactNode;
  currentRoute: string;
  navigate: (route: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, currentRoute, navigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1A1A2E]">
      <ReadingGuide />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>

      {/* Institutional Civic Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-3 text-center md:text-left">
            <BridgeMotif size="md" variant="teal" />
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>SETU</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E6F4F1] text-[#0D7377] font-semibold">
                  Inclusive Learning Layer
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                One Classroom. Many Ways to Learn • SevaFirst Innovation Challenge 2026 (Theme 03: Swasth & Samavesh Bharat)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-center text-xs font-semibold">
            <button
              onClick={() => navigate('about')}
              className="text-slate-700 hover:text-[#0D7377] hover:underline"
            >
              About the Initiative
            </button>
            <button
              onClick={() => navigate('accessibility')}
              className="text-slate-700 hover:text-[#0D7377] hover:underline"
            >
              WCAG 2.2 AA Conformance
            </button>
            <button
              onClick={() => navigate('privacy')}
              className="text-slate-700 hover:text-[#0D7377] hover:underline"
            >
              Child Privacy & Ethics
            </button>
            <button
              onClick={() => navigate('student-join')}
              className="text-[#0D7377] font-bold hover:underline"
            >
              Join Classroom
            </button>
            <button
              onClick={() => navigate('teacher-dashboard')}
              className="text-slate-700 hover:text-[#0D7377] hover:underline"
            >
              Teacher Studio
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
