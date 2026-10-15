import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ear,
  Eye,
  Hand,
  Brain,
  MessageSquare,
  Sparkles,
  GraduationCap,
  Briefcase,
  BookOpen,
  ArrowRight,
  Check
} from 'lucide-react';
import type { Role, User } from '../types';

interface SignUpPageProps {
  navigate: (route: string) => void;
}

export type DisabilityType = 'hearing' | 'vision' | 'motor' | 'cognitive' | 'speech' | 'none';
export type OnboardingRole = 'student' | 'adult_learner' | 'teacher';

interface DisabilityOption {
  id: DisabilityType;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

const DISABILITY_OPTIONS: DisabilityOption[] = [
  {
    id: 'hearing',
    name: 'Hearing',
    desc: 'Live real-time captions & visual cues',
    icon: Ear,
    iconBg: 'bg-[#FF6B4A]/10',
    iconColor: 'text-[#FF6B4A]'
  },
  {
    id: 'vision',
    name: 'Vision',
    desc: 'Spoken descriptions & high contrast text',
    icon: Eye,
    iconBg: 'bg-[#4A90D9]/10',
    iconColor: 'text-[#4A90D9]'
  },
  {
    id: 'motor',
    name: 'Motor',
    desc: 'Single-switch access & large click areas',
    icon: Hand,
    iconBg: 'bg-[#2ECC71]/10',
    iconColor: 'text-[#2ECC71]'
  },
  {
    id: 'cognitive',
    name: 'Cognitive',
    desc: 'Clear bite-sized steps & reduced clutter',
    icon: Brain,
    iconBg: 'bg-[#8B5CF6]/10',
    iconColor: 'text-[#8B5CF6]'
  },
  {
    id: 'speech',
    name: 'Speech',
    desc: 'AAC phrase boards & text-to-speech voice',
    icon: MessageSquare,
    iconBg: 'bg-[#F59E0B]/10',
    iconColor: 'text-[#F59E0B]'
  },
  {
    id: 'none',
    name: 'No specific need',
    desc: 'Adaptive learning with standard preferences',
    icon: Sparkles,
    iconBg: 'bg-[#0D9488]/10',
    iconColor: 'text-[#0D9488]'
  }
];

export const SignUpPage: React.FC<SignUpPageProps> = ({ navigate }) => {
  const { login, selectDemoRole } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDisabilities, setSelectedDisabilities] = useState<DisabilityType[]>([]);
  const [selectedRole, setSelectedRole] = useState<OnboardingRole>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDisability = (id: DisabilityType) => {
    if (id === 'none') {
      if (selectedDisabilities.includes('none')) {
        setSelectedDisabilities([]);
      } else {
        setSelectedDisabilities(['none']);
      }
      return;
    }

    const withoutNone = selectedDisabilities.filter(d => d !== 'none');
    if (withoutNone.includes(id)) {
      setSelectedDisabilities(withoutNone.filter(d => d !== id));
    } else {
      setSelectedDisabilities([...withoutNone, id]);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (selectedDisabilities.length === 0) {
      // Default to none if user didn't select anything
      setSelectedDisabilities(['none']);
    }
    setError(null);
    setStep(3);
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    setError(null);

    const formattedDisabilities = selectedDisabilities.map((d) => ({
      disability_type: d,
      severity: 'moderate'
    }));

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: selectedRole,
      disabilities: formattedDisabilities
    };

    // Store in local storage for local state persistence
    localStorage.setItem('setu_disability_profile', JSON.stringify(selectedDisabilities));
    localStorage.setItem('setu_user_role', selectedRole);
    localStorage.setItem('setu_user_name', fullName.trim());

    try {
      // First attempt POST /api/onboarding/register
      const res = await fetch('/api/onboarding/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const mappedRole: Role =
          (data.role as Role) ||
          (selectedRole === 'teacher' ? 'teacher' : selectedRole === 'adult_learner' ? 'adult_learner' : 'student');
        const user: User = {
          id: data.user_id || 'user-' + Date.now(),
          email: data.email || email.trim(),
          full_name: data.full_name || fullName.trim(),
          role: mappedRole,
          school_id: data.school_id || null,
          onboarding_completed: true,
          created_at: new Date().toISOString()
        };
        login(data.access_token || 'setu-session-token-' + Date.now(), user);
        if (mappedRole === 'teacher') {
          navigate('teacher-dashboard');
        } else {
          navigate('dashboard');
        }
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 400 || res.status === 403 || res.status === 422) {
          throw new Error(errData.detail || 'Registration failed. Please check your details.');
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('Failed to fetch')) {
        setError(err.message);
        setLoading(false);
        return;
      }
    }

    // Try standard auth register endpoint as fallback if onboarding endpoint was unreachable
    try {
      const authRole = selectedRole === 'teacher' ? 'teacher' : selectedRole === 'adult_learner' ? 'adult_learner' : 'student';
      const authRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          full_name: fullName.trim(),
          role: authRole,
          disabilities: formattedDisabilities
        })
      });

      if (authRes.ok) {
        const authData = await authRes.json();
        const user: User = {
          id: authData.user_id,
          email: authData.email || email.trim(),
          full_name: authData.full_name,
          role: authData.role as Role,
          school_id: authData.school_id,
          onboarding_completed: true,
          created_at: new Date().toISOString()
        };
        login(authData.access_token, user);
        if (authData.role === 'teacher') {
          navigate('teacher-dashboard');
        } else {
          navigate('dashboard');
        }
      } else {
        const errData = await authRes.json().catch(() => ({}));
        throw new Error(errData.detail || 'Registration request could not be completed.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please verify your connection and details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A2E] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Progress Indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2.5 transition-all duration-300 rounded-full ${
                  s === step
                    ? 'w-8 bg-[#FF6B4A]'
                    : s < step
                    ? 'w-2.5 bg-[#FF6B4A]/50'
                    : 'w-2.5 bg-black/10'
                }`}
                aria-current={s === step ? 'step' : undefined}
              />
            ))}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Step {step} of 3: {step === 1 ? 'Account Details' : step === 2 ? 'Disability Profile' : 'Role Selection'}
          </span>
        </div>

        {error && (
          <div
            role="alert"
            className="p-4 rounded-[1.25rem] bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
          >
            {error}
          </div>
        )}

        {/* STEP 1: Account Details */}
        {step === 1 && (
          <div className="bg-white rounded-[1.25rem] p-6 sm:p-8 shadow-xs border border-black/[0.04] space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
                Create your SETU Account
              </h1>
              <p className="text-sm text-[#6B7280]">
                Begin your barrier-free learning journey.
              </p>
            </div>

            {/* Quick Demo Bypass Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  ⚡ Skip Signup — Instant Demo Entry
                </span>
                <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  Pre-configured
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    selectDemoRole('teacher');
                    navigate('teacher-dashboard');
                  }}
                  className="px-2 py-2 rounded-xl bg-white border border-amber-200 hover:border-[#FF6B4A] hover:bg-[#FF6B4A]/5 text-[#1A1A2E] text-xs font-semibold text-center transition-all shadow-xs"
                >
                  👩‍🏫 Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    selectDemoRole('student');
                    navigate('dashboard');
                  }}
                  className="px-2 py-2 rounded-xl bg-white border border-amber-200 hover:border-[#0D7377] hover:bg-[#0D7377]/5 text-[#1A1A2E] text-xs font-semibold text-center transition-all shadow-xs"
                >
                  🧑‍🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    selectDemoRole('coordinator');
                    navigate('coordinator');
                  }}
                  className="px-2 py-2 rounded-xl bg-white border border-amber-200 hover:border-[#4A90D9] hover:bg-[#4A90D9]/5 text-[#1A1A2E] text-xs font-semibold text-center transition-all shadow-xs"
                >
                  🏛️ Admin
                </button>
              </div>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wide mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full h-12 px-4 rounded-xl border border-black/[0.08] bg-[#FAFAF8] text-[#1A1A2E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/40 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wide mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="learner@example.com"
                  className="w-full h-12 px-4 rounded-xl border border-black/[0.08] bg-[#FAFAF8] text-[#1A1A2E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/40 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-[#1A1A2E] uppercase tracking-wide mb-1.5"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-black/[0.08] bg-[#FAFAF8] text-[#1A1A2E] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/40 transition-all"
                />
              </div>

              <button
                type="submit"
                aria-label="Continue to disability profile selection"
                className="w-full min-h-[48px] h-12 rounded-full bg-[#FF6B4A] hover:bg-[#e05636] active:scale-[0.98] text-white font-semibold text-base shadow-sm shadow-[#FF6B4A]/30 transition-all inline-flex items-center justify-center gap-2 mt-2 focus-visible:outline-2 focus-visible:outline-[#FF6B4A]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-black/[0.06]">
              <p className="text-sm text-[#6B7280]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('login')}
                  className="font-semibold text-[#FF6B4A] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Disability Profile */}
        {step === 2 && (
          <div className="bg-white rounded-[1.25rem] p-6 sm:p-8 shadow-xs border border-black/[0.04] space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
                What support would help you learn best?
              </h1>
              <p className="text-sm text-[#6B7280]">
                Select all that apply. You can change this anytime.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2"
              role="group"
              aria-label="Disability support preferences"
            >
              {DISABILITY_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedDisabilities.includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleDisability(opt.id)}
                    aria-pressed={isSelected}
                    aria-label={`${opt.name}: ${opt.desc}`}
                    className={`relative p-4 rounded-[1.25rem] text-left transition-all border flex items-start gap-3.5 min-h-[76px] cursor-pointer ${
                      isSelected
                        ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 ring-1 ring-[#FF6B4A]'
                        : 'border-black/[0.08] bg-[#FAFAF8] hover:border-black/[0.18]'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full ${opt.iconBg} ${opt.iconColor} flex items-center justify-center shrink-0`}
                      aria-hidden="true"
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="font-bold text-sm text-[#1A1A2E]">
                        {opt.name}
                      </div>
                      <div className="text-xs text-[#6B7280] leading-snug line-clamp-2">
                        {opt.desc}
                      </div>
                    </div>

                    {isSelected && (
                      <div
                        className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center shadow-xs"
                        aria-hidden="true"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[48px] h-12 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1A1A2E] font-medium text-sm transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Continue}
                className="flex-1 min-h-[48px] h-12 rounded-full bg-[#FF6B4A] hover:bg-[#e05636] active:scale-[0.98] text-white font-semibold text-base shadow-sm shadow-[#FF6B4A]/30 transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#FF6B4A]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Role Selection */}
        {step === 3 && (
          <div className="bg-white rounded-[1.25rem] p-6 sm:p-8 shadow-xs border border-black/[0.04] space-y-6">
            <div className="space-y-1 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A2E] tracking-tight">
                How will you use SETU?
              </h1>
              <p className="text-sm text-[#6B7280]">
                Choose your primary role to configure your personalized dashboard.
              </p>
            </div>

            <div
              className="space-y-3 pt-2"
              role="radiogroup"
              aria-label="How will you use SETU"
            >
              {[
                {
                  id: 'student' as OnboardingRole,
                  title: 'Student',
                  subtitle: "I'm learning in school (Ages 6–18)",
                  icon: GraduationCap,
                  iconBg: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                },
                {
                  id: 'adult_learner' as OnboardingRole,
                  title: 'Adult Learner',
                  subtitle: "I'm building new skills (Vocational / Adult Ed)",
                  icon: Briefcase,
                  iconBg: 'bg-[#4A90D9]/10 text-[#4A90D9]'
                },
                {
                  id: 'teacher' as OnboardingRole,
                  title: 'Teacher',
                  subtitle: "I create & teach content (Educator)",
                  icon: BookOpen,
                  iconBg: 'bg-[#2ECC71]/10 text-[#2ECC71]'
                }
              ].map((roleItem) => {
                const Icon = roleItem.icon;
                const isSelected = selectedRole === roleItem.id;

                return (
                  <button
                    key={roleItem.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedRole(roleItem.id)}
                    className={`w-full p-4.5 rounded-[1.25rem] text-left transition-all border flex items-center justify-between gap-4 min-h-[64px] cursor-pointer ${
                      isSelected
                        ? 'border-[#FF6B4A] bg-[#FF6B4A]/5 ring-1 ring-[#FF6B4A]'
                        : 'border-black/[0.08] bg-[#FAFAF8] hover:border-black/[0.18]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full ${roleItem.iconBg} flex items-center justify-center shrink-0`}
                        aria-hidden="true"
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-[#1A1A2E]">
                          {roleItem.title}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          {roleItem.subtitle}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-[#FF6B4A] bg-[#FF6B4A] text-white'
                          : 'border-black/20 bg-white'
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="min-h-[48px] h-12 px-6 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1A1A2E] font-medium text-sm transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCompleteSetup}
                className="flex-1 min-h-[48px] h-12 rounded-full bg-[#FF6B4A] hover:bg-[#e05636] active:scale-[0.98] text-white font-semibold text-base shadow-sm shadow-[#FF6B4A]/30 transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#FF6B4A]"
              >
                <span>{loading ? 'Completing Setup...' : 'Complete Setup'}</span>
                {!loading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
