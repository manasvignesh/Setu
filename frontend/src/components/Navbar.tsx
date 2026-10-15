import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import {
  LogOut,
  Menu,
  X,
  User,
  Settings,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

/**
 * Clean minimal nav — only logo + contextual actions.
 * No clutter, just what's needed for the current state.
 */
export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout, selectDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = isAuthenticated && (user?.role === 'teacher' || user?.role === 'coordinator' || user?.role === 'admin');
  const isStudent = isAuthenticated && (user?.role === 'student' || user?.role === 'adult_learner');

  // Hide navbar on landing page for clean hero experience
  const isLanding = currentRoute === 'home';

  return (
    <header className={`sticky top-0 z-30 transition-all ${
      isLanding 
        ? 'bg-transparent' 
        : 'bg-white/80 backdrop-blur-xl border-b border-black/[0.04]'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 group"
            aria-label="SETU Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#FF9A8B] flex items-center justify-center text-white shadow-sm font-bold text-sm">
              S
            </div>
            <span className="font-bold text-lg text-[#1A1A2E] tracking-tight">
              SETU
            </span>
          </button>

          {/* Core 4 Pillar Navigation on Desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Core Navigation">
            <button
              onClick={() => navigate('live-captions')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                currentRoute === 'live-captions'
                  ? 'bg-[#0A625D]/10 text-[#0A625D]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]'
              }`}
            >
              Live Captions
            </button>
            <button
              onClick={() => navigate('learn')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                currentRoute === 'learn'
                  ? 'bg-[#19324A]/10 text-[#19324A]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]'
              }`}
            >
              Lessons
            </button>
            <button
              onClick={() => navigate('communicate')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                currentRoute === 'communicate'
                  ? 'bg-[#B07822]/10 text-[#B07822]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]'
              }`}
            >
              Communicate
            </button>
            <button
              onClick={() => navigate('student-join')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                currentRoute === 'student-join'
                  ? 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.04]'
              }`}
            >
              Join Room
            </button>
            {isTeacher && (
              <button
                onClick={() => navigate('lesson-studio')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  currentRoute === 'lesson-studio'
                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                    : 'text-[#FF6B4A] hover:bg-[#FFF0EC]'
                }`}
              >
                Lesson Studio
              </button>
            )}
          </nav>

          {/* Right Actions — Context-aware, minimal with Demo Role Switcher */}
          <div className="flex items-center gap-2">
            <AccessibilityToolbar />

            {/* Dummy Role Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100/90 p-0.5 rounded-full border border-black/[0.06] text-xs font-semibold">
              <button
                onClick={() => {
                  selectDemoRole('teacher');
                  navigate('teacher-dashboard');
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  user?.role === 'teacher'
                    ? 'bg-white text-[#FF6B4A] shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
                title="Switch to Demo Teacher (Anita Sharma)"
              >
                Teacher
              </button>
              <button
                onClick={() => {
                  selectDemoRole('student');
                  navigate('dashboard');
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  user?.role === 'student'
                    ? 'bg-white text-[#0D7377] shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
                title="Switch to Demo Student (Aarav Sharma)"
              >
                Student
              </button>
              <button
                onClick={() => {
                  selectDemoRole('coordinator');
                  navigate('coordinator');
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  user?.role === 'coordinator'
                    ? 'bg-white text-[#4A90D9] shadow-xs font-bold'
                    : 'text-[#6B7280] hover:text-[#1A1A2E]'
                }`}
                title="Switch to Demo Coordinator (Dr. Sunita Rao)"
              >
                Coordinator
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Dashboard link */}
              <button
                onClick={() => navigate(isTeacher ? 'teacher-dashboard' : 'dashboard')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#6B7280] hover:text-[#1A1A2E] hover:bg-black/[0.04] transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>{user?.full_name?.split(' ')[0]}</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate('profile-setup')}
                className="p-2 rounded-full hover:bg-black/[0.04] text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
                aria-label="Settings"
                title="Accessibility & Profile Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-[#6B7280] rounded-xl hover:bg-black/[0.04]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-black/[0.04] bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1">
          <button
            onClick={() => { navigate('home'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
          >
            Home
          </button>
          <button
            onClick={() => { navigate('live-captions'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-[#0A625D] rounded-xl hover:bg-[#E8F5F2]"
          >
            🎙️ Live Captions
          </button>
          <button
            onClick={() => { navigate('learn'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-[#19324A] rounded-xl hover:bg-slate-100"
          >
            📚 Accessible Lessons
          </button>
          <button
            onClick={() => { navigate('communicate'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-[#B07822] rounded-xl hover:bg-amber-50"
          >
            💬 Communicate (AAC)
          </button>
          <button
            onClick={() => { navigate('student-join'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-[#FF6B4A] rounded-xl hover:bg-[#FFF0EC]"
          >
            👥 Join Room
          </button>

          <div className="pt-2 pb-1 border-t border-black/[0.06]">
            <div className="text-[11px] font-bold text-[#6B7280] px-3 pb-1.5 uppercase tracking-wider">
              Switch Demo Role
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              <button
                onClick={() => {
                  selectDemoRole('teacher');
                  navigate('teacher-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs py-2 rounded-xl font-bold transition-all ${
                  user?.role === 'teacher'
                    ? 'bg-[#FF6B4A]/10 text-[#FF6B4A] ring-1 ring-[#FF6B4A]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Teacher
              </button>
              <button
                onClick={() => {
                  selectDemoRole('student');
                  navigate('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs py-2 rounded-xl font-bold transition-all ${
                  user?.role === 'student'
                    ? 'bg-[#0D7377]/10 text-[#0D7377] ring-1 ring-[#0D7377]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  selectDemoRole('coordinator');
                  navigate('coordinator');
                  setMobileMenuOpen(false);
                }}
                className={`text-xs py-2 rounded-xl font-bold transition-all ${
                  user?.role === 'coordinator'
                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-500'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {isAuthenticated && (
            <>
              <button
                onClick={() => { navigate(isTeacher ? 'teacher-dashboard' : 'dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
              >
                Dashboard
              </button>
              <button
                onClick={() => { navigate('student-join'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
              >
                Join Classroom
              </button>
              {isTeacher && (
                <>
                  <button
                    onClick={() => { navigate('classes'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#1A1A2E] rounded-xl hover:bg-black/[0.04]"
                  >
                    My Classes
                  </button>
                  <button
                    onClick={() => { navigate('lesson-studio'); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#FF6B4A] rounded-xl hover:bg-[#FFF0EC]"
                  >
                    ✨ Accessible Lesson Studio
                  </button>
                </>
              )}
              <button
                onClick={() => { navigate('profile-setup'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm font-medium text-[#6B7280] rounded-xl hover:bg-black/[0.04]"
              >
                Profile & Accessibility
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
