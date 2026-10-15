import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import {
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  BookOpen
} from 'lucide-react';
import type { Role } from '../types';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { selectDemoRole, login } = useAuth();
  const [showManualForm, setShowManualForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuickEnter = (role: 'teacher' | 'student' | 'coordinator') => {
    selectDemoRole(role);
    if (role === 'coordinator') {
      navigate('coordinator');
    } else if (role === 'teacher') {
      navigate('teacher-dashboard');
    } else {
      navigate('dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister
      ? {
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
          role: 'teacher',
          school_code: schoolCode.trim() ? schoolCode.trim().toUpperCase() : undefined
        }
      : { email: email.trim().toLowerCase(), password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      login(data.access_token, {
        id: data.user_id,
        email: data.email || email.trim(),
        full_name: data.full_name,
        role: data.role as Role,
        school_id: data.school_id,
        onboarding_completed: data.onboarding_completed,
        created_at: new Date().toISOString()
      });

      if (data.role === 'coordinator') {
        navigate('coordinator');
      } else if (data.role === 'teacher') {
        navigate('teacher-dashboard');
      } else {
        navigate('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      <PageHeader
        title="Instant Demo Workspace Access"
        subtitle="Skip sign-in and passwords. Select any persona to immediately explore SETU's accessible tools."
        badgeText="No Login Required"
        badgeVariant="saffron"
      />

      {/* 1-Click Persona Cards */}
      <div className="grid grid-cols-1 gap-3.5">
        <button
          type="button"
          onClick={() => handleQuickEnter('teacher')}
          className="group relative p-5 rounded-2xl bg-white border border-black/[0.08] hover:border-[#FF6B4A]/50 hover:shadow-md transition-all text-left flex items-start justify-between gap-4 active:scale-[0.99]"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#1A1A2E]">
                  Anita Sharma — Teacher Studio
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] text-[10px] font-extrabold uppercase">
                  Educator
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                Full lesson editor with simplified text generation, image descriptions, live classroom speech subtitles, and student question board.
              </p>
            </div>
          </div>
          <div className="shrink-0 p-2 rounded-full bg-slate-100 group-hover:bg-[#FF6B4A] group-hover:text-white text-slate-500 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleQuickEnter('student')}
          className="group relative p-5 rounded-2xl bg-white border border-black/[0.08] hover:border-[#0D7377]/50 hover:shadow-md transition-all text-left flex items-start justify-between gap-4 active:scale-[0.99]"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0D7377]/10 text-[#0D7377] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#1A1A2E]">
                  Aarav Sharma — Student Dashboard
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#0D7377]/10 text-[#0D7377] text-[10px] font-extrabold uppercase">
                  Hearing Need
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                Accessible student view with real-time live captions, visual alert cues, high contrast reading, and AAC phrase board.
              </p>
            </div>
          </div>
          <div className="shrink-0 p-2 rounded-full bg-slate-100 group-hover:bg-[#0D7377] group-hover:text-white text-slate-500 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleQuickEnter('coordinator')}
          className="group relative p-5 rounded-2xl bg-white border border-black/[0.08] hover:border-[#4A90D9]/50 hover:shadow-md transition-all text-left flex items-start justify-between gap-4 active:scale-[0.99]"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4A90D9]/10 text-[#4A90D9] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#1A1A2E]">
                  Dr. Sunita Rao — School Coordinator
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#4A90D9]/10 text-[#4A90D9] text-[10px] font-extrabold uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                Institutional portal for PM SHRI Govt Model High School, tracking inclusive classroom hours, caption corrections, and student needs.
              </p>
            </div>
          </div>
          <div className="shrink-0 p-2 rounded-full bg-slate-100 group-hover:bg-[#4A90D9] group-hover:text-white text-slate-500 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Collapsed Optional Custom Credentials */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowManualForm(!showManualForm)}
          className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#1A1A2E] font-medium"
        >
          <span>Need custom login or credentials?</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualForm ? 'rotate-180' : ''}`} />
        </button>

        {showManualForm && (
          <div className="mt-4 ios-card p-6 bg-white border border-black/[0.06] shadow-sm space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Smt. Anita Sharma"
                      className="ios-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                      School Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value)}
                      placeholder="e.g. DEL-001"
                      className="ios-input w-full uppercase"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                  Institutional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher.anita@setu.edu.in"
                  className="ios-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="ios-input w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-ios-primary py-3 text-sm font-bold shadow-md shadow-[#FF6B4A]/20 disabled:opacity-50"
              >
                <span>{isRegister ? 'Register Custom Account' : 'Sign In with Custom Account'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-[#6B7280] hover:text-[#1A1A2E] font-medium underline underline-offset-4"
              >
                {isRegister ? 'Already have an account? Sign in' : 'Create new custom account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
