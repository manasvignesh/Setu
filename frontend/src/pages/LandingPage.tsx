import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ear,
  Eye,
  Hand,
  Brain,
  MessageSquare,
  Sparkles,
  Users,
  Rocket,
  Heart,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { selectDemoRole } = useAuth();
  const disabilityCategories = [
    {
      name: 'Hearing Support',
      desc: 'Live captions & visual alerts',
      icon: Ear,
      color: '#FF6B4A',
      bgColor: 'bg-[#FF6B4A]/10',
      textColor: 'text-[#FF6B4A]',
      borderColor: 'hover:border-[#FF6B4A]/30'
    },
    {
      name: 'Vision Support',
      desc: 'Audio descriptions & screen reader',
      icon: Eye,
      color: '#4A90D9',
      bgColor: 'bg-[#4A90D9]/10',
      textColor: 'text-[#4A90D9]',
      borderColor: 'hover:border-[#4A90D9]/30'
    },
    {
      name: 'Motor Support',
      desc: 'Voice control & large targets',
      icon: Hand,
      color: '#2ECC71',
      bgColor: 'bg-[#2ECC71]/10',
      textColor: 'text-[#2ECC71]',
      borderColor: 'hover:border-[#2ECC71]/30'
    },
    {
      name: 'Cognitive Support',
      desc: 'Simplified content & step cards',
      icon: Brain,
      color: '#8B5CF6',
      bgColor: 'bg-[#8B5CF6]/10',
      textColor: 'text-[#8B5CF6]',
      borderColor: 'hover:border-[#8B5CF6]/30'
    },
    {
      name: 'Speech Support',
      desc: 'AAC boards & text-to-speech',
      icon: MessageSquare,
      color: '#F59E0B',
      bgColor: 'bg-[#F59E0B]/10',
      textColor: 'text-[#F59E0B]',
      borderColor: 'hover:border-[#F59E0B]/30'
    },
    {
      name: 'Universal Access',
      desc: 'Adaptive for everyone',
      icon: Sparkles,
      color: '#0D9488',
      bgColor: 'bg-[#0D9488]/10',
      textColor: 'text-[#0D9488]',
      borderColor: 'hover:border-[#0D9488]/30'
    }
  ];

  const steps = [
    {
      step: '1',
      title: 'Tell us about yourself',
      desc: 'Choose how you perceive, communicate, and navigate content comfortably.',
      icon: Heart,
      iconBg: 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
    },
    {
      step: '2',
      title: 'Choose your role',
      desc: 'Join as a student, adult learner, or teacher to tailor your workspace.',
      icon: Users,
      iconBg: 'bg-[#4A90D9]/10 text-[#4A90D9]'
    },
    {
      step: '3',
      title: 'Start learning',
      desc: 'Access interactive lessons, real-time live captions, and assisted AAC.',
      icon: Rocket,
      iconBg: 'bg-[#2ECC71]/10 text-[#2ECC71]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A2E] py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        
        {/* Hero Section */}
        <section
          aria-labelledby="hero-heading"
          className="text-center space-y-6 pt-4 max-w-3xl mx-auto"
        >
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#FF6B4A]" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Inclusive Learning for Everyone
            </span>
          </div>

          {/* Big Headline */}
          <h1
            id="hero-heading"
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1A1A2E] leading-[1.15]"
          >
            Every learner deserves
            <br />
            <span className="text-[#FF6B4A]">a bridge to knowledge.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
            SETU adapts to your unique abilities — hearing, vision, motor, cognitive, or speech. Learn your way.
          </p>

          {/* Direct Dummy Role Entry Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">
            <button
              onClick={() => {
                selectDemoRole('teacher');
                navigate('teacher-dashboard');
              }}
              aria-label="Enter Teacher Studio as Anita Sharma"
              className="w-full sm:w-auto min-h-[48px] h-12 px-7 rounded-full bg-[#FF6B4A] hover:bg-[#e05636] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-[#FF6B4A]/25 transition-all inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#FF6B4A]"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Enter Teacher Studio</span>
              <ArrowRight className="w-4 h-4 ml-0.5" aria-hidden="true" />
            </button>

            <button
              onClick={() => {
                selectDemoRole('student');
                navigate('dashboard');
              }}
              aria-label="Enter Student Dashboard as Aarav Sharma"
              className="w-full sm:w-auto min-h-[48px] h-12 px-7 rounded-full bg-white hover:bg-slate-100/80 active:scale-[0.98] text-[#1A1A2E] font-semibold text-sm border border-black/[0.08] shadow-xs transition-all inline-flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-[#0D7377]" aria-hidden="true" />
              <span>Enter Student Dashboard</span>
            </button>

            <button
              onClick={() => {
                selectDemoRole('coordinator');
                navigate('coordinator');
              }}
              aria-label="Enter School Coordinator Portal as Dr. Sunita Rao"
              className="w-full sm:w-auto min-h-[48px] h-12 px-6 rounded-full bg-white hover:bg-slate-100/80 active:scale-[0.98] text-[#1A1A2E] font-semibold text-sm border border-black/[0.08] shadow-xs transition-all inline-flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#4A90D9]" aria-hidden="true" />
              <span>Coordinator Portal</span>
            </button>
          </div>
        </section>

        {/* Disability Categories — Horizontal Cards */}
        <section aria-labelledby="categories-heading" className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2
              id="categories-heading"
              className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] tracking-tight"
            >
              Built for Every Learning Dimension
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280]">
              Personalized modalities that adapt to how you see, hear, move, and think.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {disabilityCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-[1.25rem] p-4 sm:p-5 flex flex-col items-center text-center shadow-xs border border-black/[0.04] transition-all hover:-translate-y-1 hover:shadow-md ${cat.borderColor}`}
                >
                  <div
                    className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full ${cat.bgColor} ${cat.textColor} flex items-center justify-center mb-3`}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1A2E] mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#6B7280] leading-snug">
                    {cat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works — 3 Steps */}
        <section aria-labelledby="how-it-works-heading" className="space-y-8">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B4A]">
              Simple & Accessible
            </span>
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl font-bold text-[#1A1A2E] tracking-tight"
            >
              How SETU Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((item) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white rounded-[1.25rem] p-6 sm:p-7 border border-black/[0.04] shadow-xs relative flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-full ${item.iconBg} flex items-center justify-center`}
                        aria-hidden="true"
                      >
                        <StepIcon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-black/10 select-none">
                        0{item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">
                      Step {item.step}: {item.title}
                    </h3>
                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Banner */}
        <section
          aria-labelledby="cta-banner-heading"
          className="rounded-[1.25rem] p-8 sm:p-12 bg-gradient-to-r from-[#FF6B4A] to-[#FF8A65] text-white shadow-lg shadow-[#FF6B4A]/20 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 text-center md:text-left">
            <h2
              id="cta-banner-heading"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
            >
              Ready to learn without barriers?
            </h2>
            <p className="text-white/90 text-sm sm:text-base max-w-lg">
              Explore teacher lesson creation, live accessible classroom, and student boards directly with instant demo access.
            </p>
          </div>

          <button
            onClick={() => {
              selectDemoRole('teacher');
              navigate('teacher-dashboard');
            }}
            aria-label="Launch Teacher Studio"
            className="min-h-[48px] h-12 px-8 rounded-full bg-white hover:bg-[#FAFAF8] text-[#FF6B4A] font-bold text-base shadow-sm transition-transform active:scale-[0.98] whitespace-nowrap inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>Launch Teacher Studio</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B4A]" aria-hidden="true" />
          </button>
        </section>

      </div>
    </div>
  );
};
