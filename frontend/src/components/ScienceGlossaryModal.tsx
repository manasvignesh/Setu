import React from 'react';
import { BookOpen, Volume2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface ScienceGlossaryModalProps {
  term: string | null;
  onClose: () => void;
}

const GLOSSARY_DATABASE: Record<string, {
  phonetic: string;
  simpleDef: string;
  scienceDef: string;
  example: string;
}> = {
  'solar system': {
    phonetic: 'SOH-ler SIS-tuhm',
    simpleDef: 'Our cosmic neighborhood with the Sun at the center and 8 planets circling around it.',
    scienceDef: 'A gravitationally bound system comprising the Sun and the objects that orbit it, either directly or indirectly.',
    example: 'Earth is the third planet from the Sun in our solar system.'
  },
  'sun': {
    phonetic: 'suhn',
    simpleDef: 'The giant glowing ball of fire and light in the center of our solar system.',
    scienceDef: 'A G-type main-sequence star composed primarily of hydrogen and helium undergoing nuclear fusion.',
    example: 'Without sunlight, plants cannot grow and Earth would be frozen.'
  },
  'planets': {
    phonetic: 'PLAN-its',
    simpleDef: 'Large round worlds that travel in circles around a star like our Sun.',
    scienceDef: 'Celestial bodies that are in orbit around the Sun, have sufficient mass for self-gravity to overcome rigid body forces, and have cleared their orbit.',
    example: 'Mars and Jupiter are two different planets in our solar system.'
  },
  'orbit': {
    phonetic: 'OR-bit',
    simpleDef: 'The curved path an object takes as it travels around a larger star or planet.',
    scienceDef: 'The gravitationally curved trajectory of an object around a point in space or another celestial body.',
    example: 'The Moon stays in a steady orbit around Earth.'
  },
  'gravity': {
    phonetic: 'GRAV-ih-tee',
    simpleDef: 'An invisible pulling force that keeps our feet on the ground and holds planets near the Sun.',
    scienceDef: 'A fundamental interaction causing mutual attraction between all things that have mass or energy.',
    example: 'Gravity causes an apple to fall down from a tree to the ground.'
  },
  'revolution': {
    phonetic: 'rev-uh-LOO-shuhn',
    simpleDef: 'One complete journey of Earth traveling around the Sun (takes 365 days or 1 year).',
    scienceDef: 'The orbital motion of an astronomical body around an external point or primary attractor.',
    example: 'Earth takes 365 days to finish one revolution around the Sun.'
  },
  'rotation': {
    phonetic: 'roh-TAY-shuhn',
    simpleDef: 'The spinning of Earth like a top on its own axis, giving us day and night.',
    scienceDef: 'The circular movement of an object around its own internal center of mass or axis.',
    example: 'Earth spins around every 24 hours, giving us morning and night.'
  },
  'axis': {
    phonetic: 'AK-sis',
    simpleDef: 'An imaginary straight line through the North and South poles that Earth spins around.',
    scienceDef: 'An imaginary straight line passing through the geographical poles around which a celestial sphere rotates.',
    example: 'Earth is tilted at about 23.5 degrees on its axis.'
  },
  'photosynthesis': {
    phonetic: 'foh-toh-SIN-thuh-sis',
    simpleDef: 'How green plants use sunlight, water, and air to make their own food and give us clean oxygen.',
    scienceDef: 'The biochemical process by which autotrophic organisms convert light energy into chemical energy stored in carbohydrate molecules.',
    example: 'Leaves perform photosynthesis whenever they are exposed to sunlight.'
  },
  'chloroplast': {
    phonetic: 'KLOR-uh-plast',
    simpleDef: 'Tiny green food factories inside plant cells that catch sunshine.',
    scienceDef: 'Specialized plastid organelles conducting photosynthesis where photosynthetic pigment chlorophyll captures sunlight energy.',
    example: 'Chloroplasts give plant leaves their vibrant green color.'
  },
  'chlorophyll': {
    phonetic: 'KLOR-uh-fil',
    simpleDef: 'The special green pigment that absorbs light inside leaves.',
    scienceDef: 'A green pigment present in all green plants and cyanobacteria responsible for the absorption of light to provide energy for photosynthesis.',
    example: 'Chlorophyll catches the photons from sunlight.'
  },
  'glucose': {
    phonetic: 'GLOO-kohs',
    simpleDef: 'Natural sweet food sugar created by plants that gives energy to living things.',
    scienceDef: 'A simple monosaccharide sugar with molecular formula C6H12O6 used by living organisms as an primary energy source.',
    example: 'Plants store extra glucose to help them grow strong.'
  },
  'light': {
    phonetic: 'lyt',
    simpleDef: 'A form of energy that travels very fast and lets our eyes see the world.',
    scienceDef: 'Electromagnetic radiation within a certain portion of the electromagnetic spectrum detectable by human photoreceptors.',
    example: 'Light from the Sun takes roughly 8 minutes to reach Earth.'
  }
};

export const ScienceGlossaryModal: React.FC<ScienceGlossaryModalProps> = ({ term, onClose }) => {
  const { speak } = useSpeechSynthesis();

  if (!term) return null;

  const cleanTerm = term.trim().toLowerCase();
  const data = GLOSSARY_DATABASE[cleanTerm] || {
    phonetic: term,
    simpleDef: `An important concept in science: ${term}. Used in classroom inquiry and observation.`,
    scienceDef: `Academic term: ${term}. Refer to your NCERT textbook chapter glossary for additional diagrams.`,
    example: `In this lesson, we study the function and characteristics of ${term}.`
  };

  const handleSpeak = () => {
    speak(`${term}. Pronounced: ${data.phonetic}. In simple words: ${data.simpleDef}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 dark:text-zinc-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D7377]/10 text-[#0D7377] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 font-bold">
                SCIENCE GLOSSARY
              </span>
              <h2 id="glossary-modal-title" className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {term}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close glossary modal"
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* Pronunciation & TTS */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Phonetic Pronunciation
              </span>
              <span className="font-mono text-sm font-semibold text-[#FF6B4A]">
                /{data.phonetic}/
              </span>
            </div>
            <button
              onClick={handleSpeak}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 hover:border-[#FF6B4A] text-slate-700 dark:text-white font-medium text-xs shadow-xs transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Listen</span>
            </button>
          </div>

          {/* Simple Explanation */}
          <div className="bg-[#E6F4F1] dark:bg-[#0D7377]/20 p-4 rounded-2xl border border-[#0D7377]/30">
            <h3 className="font-bold text-[#0D7377] dark:text-[#5CE1E6] flex items-center gap-1.5 mb-1 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simple Meaning (Everyday Words)</span>
            </h3>
            <p className="text-slate-800 dark:text-zinc-200 leading-relaxed text-sm">
              {data.simpleDef}
            </p>
          </div>

          {/* Textbook Scientific Definition */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700">
            <h4 className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Scientific Definition (Classroom Level)
            </h4>
            <p className="text-slate-700 dark:text-zinc-300 text-xs leading-relaxed">
              {data.scienceDef}
            </p>
          </div>

          {/* Example in classroom */}
          <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-400 italic">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Example: {data.example}</span>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
