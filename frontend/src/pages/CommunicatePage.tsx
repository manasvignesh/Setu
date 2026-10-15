import React, { useState, useEffect } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAccessibility } from '../context/AccessibilityContext';
import { playAudioCue } from '../utils/audioCues';
import {
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  MessageCircle,
  AlertCircle,
  Smile,
  Hand,
  Clock,
  Search,
  Play,
  RotateCcw,
  X
} from 'lucide-react';

interface AACPhrase {
  id: string;
  category: 'needs' | 'questions' | 'participation' | 'social';
  text: string;
  icon: string;
  isCustom?: boolean;
}

interface CommunicatePageProps {
  navigate: (route: string) => void;
}

const DEFAULT_PHRASES: AACPhrase[] = [
  // Needs
  { id: 'need_help', category: 'needs', text: 'I need assistance, please', icon: '🆘' },
  { id: 'need_water', category: 'needs', text: 'May I please have water?', icon: '💧' },
  { id: 'need_moment', category: 'needs', text: 'I need a moment to write this down', icon: '⏳' },
  { id: 'need_break', category: 'needs', text: 'May I take a quiet break?', icon: '🌿' },
  { id: 'need_repeat', category: 'needs', text: 'Please repeat that once more', icon: '🔁' },
  { id: 'need_louder', category: 'needs', text: 'Could you please speak a little louder?', icon: '🔊' },

  // Questions
  { id: 'q_explain', category: 'questions', text: 'Could you explain that again simply?', icon: '❓' },
  { id: 'q_meaning', category: 'questions', text: 'What does this word mean?', icon: '📖' },
  { id: 'q_question', category: 'questions', text: 'May I ask a question about this?', icon: '🙋' },
  { id: 'q_diagram', category: 'questions', text: 'Please show the diagram or picture again', icon: '🖼️' },

  // Participation
  { id: 'p_understood', category: 'participation', text: 'I understand this concept completely', icon: '✅' },
  { id: 'p_answer', category: 'participation', text: 'May I try to answer the question?', icon: '✋' },
  { id: 'p_agree', category: 'participation', text: 'I agree with this idea', icon: '👍' },
  { id: 'p_disagree', category: 'participation', text: 'I have a different perspective on this', icon: '💭' },

  // Social
  { id: 's_morning', category: 'social', text: 'Good morning, everyone!', icon: '☀️' },
  { id: 's_thanks', category: 'social', text: 'Thank you very much for your help', icon: '🙏' },
  { id: 's_yes', category: 'social', text: 'Yes, that is correct', icon: '✔️' },
  { id: 's_no', category: 'social', text: 'No, that is not what I meant', icon: '❌' },
  { id: 's_bye', category: 'social', text: 'Thank you, see you tomorrow', icon: '👋' }
];

export const CommunicatePage: React.FC<CommunicatePageProps> = ({ navigate }) => {
  const { speechRate } = useAccessibility();
  const { speak, cancel, isSpeaking } = useSpeechSynthesis();

  const [activeCategory, setActiveCategory] = useState<'all' | 'needs' | 'questions' | 'participation' | 'social'>('all');
  const [phrases, setPhrases] = useState<AACPhrase[]>(DEFAULT_PHRASES);
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentenceStrip, setSentenceStrip] = useState<AACPhrase[]>([]);

  // Custom phrase creation form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseCategory, setNewPhraseCategory] = useState<'needs' | 'questions' | 'participation' | 'social'>('needs');
  const [newPhraseIcon, setNewPhraseIcon] = useState('💬');

  // Load custom phrases from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('setu_custom_aac_phrases');
      if (stored) {
        const custom: AACPhrase[] = JSON.parse(stored);
        setPhrases([...DEFAULT_PHRASES, ...custom]);
      }
    } catch (e) {
      console.warn('Could not load custom phrases:', e);
    }
  }, []);

  const handleSpeakPhrase = (phrase: AACPhrase) => {
    cancel();
    playAudioCue('chime');
    setActiveSpeakingText(phrase.text);
    speak(phrase.text);
    setTimeout(() => {
      setActiveSpeakingText(null);
    }, 2500);
  };

  const handleAddToStrip = (phrase: AACPhrase) => {
    playAudioCue('pop');
    setSentenceStrip(prev => [...prev, phrase]);
  };

  const handleRemoveFromStrip = (index: number) => {
    playAudioCue('pop');
    setSentenceStrip(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearStrip = () => {
    playAudioCue('pop');
    setSentenceStrip([]);
  };

  const handleSpeakSentenceStrip = () => {
    if (sentenceStrip.length === 0) return;
    cancel();
    playAudioCue('chime');
    const fullSentence = sentenceStrip.map(p => p.text).join(' ');
    setActiveSpeakingText(fullSentence);
    speak(fullSentence);
    setTimeout(() => {
      setActiveSpeakingText(null);
    }, 3500);
  };

  const handleCopyPhrase = (e: React.MouseEvent, phrase: AACPhrase) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phrase.text);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddCustomPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const newPhrase: AACPhrase = {
      id: `custom_${Date.now()}`,
      category: newPhraseCategory,
      text: newPhraseText.trim(),
      icon: newPhraseIcon || '💬',
      isCustom: true
    };

    const updated = [...phrases, newPhrase];
    setPhrases(updated);
    playAudioCue('success');

    // Save custom phrases to localStorage
    const customList = updated.filter(p => p.isCustom);
    localStorage.setItem('setu_custom_aac_phrases', JSON.stringify(customList));

    setNewPhraseText('');
    setShowAddModal(false);
  };

  const handleDeleteCustomPhrase = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = phrases.filter(p => p.id !== id);
    setPhrases(updated);
    const customList = updated.filter(p => p.isCustom);
    localStorage.setItem('setu_custom_aac_phrases', JSON.stringify(customList));
  };

  const filteredPhrases = phrases.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || p.text.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F9F8] text-[#19324A] p-4 sm:p-6 flex flex-col">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('dashboard')}
              className="p-2 rounded-xl border border-slate-300 hover:bg-white text-slate-800 transition-colors flex items-center gap-2 text-sm font-semibold"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                <span>Assistive Communication Board</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#E8F5F2] text-[#0A625D]">
                  AAC Speech
                </span>
              </h1>
              <p className="text-xs text-slate-600">
                Tap any phrase tile to immediately speak it out loud with clear voice output
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={cancel}
                className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center gap-1.5 animate-pulse"
                aria-label="Stop audio speech"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-full font-bold text-xs bg-[#0A625D] hover:bg-[#084F4B] text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Phrase</span>
            </button>
          </div>
        </div>

        {/* Active Speaking Banner */}
        {activeSpeakingText && (
          <div
            role="status"
            aria-live="assertive"
            className="my-3 p-4 rounded-xl bg-[#0A625D] text-white flex items-center justify-between shadow-md transition-all animate-fadeIn"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <Volume2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">Speaking:</span>
                <p className="text-base font-bold">{activeSpeakingText}</p>
              </div>
            </div>
            <button
              onClick={cancel}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold"
            >
              Stop
            </button>
          </div>
        )}

        {/* Interactive Sentence Strip Composer */}
        <div className="my-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-1.5 flex-wrap min-h-[42px] p-2 rounded-xl bg-slate-50 border border-slate-200">
            {sentenceStrip.length === 0 ? (
              <span className="text-xs text-slate-400 italic px-2">
                Tap the "+ Strip" button on any card below to build a full spoken phrase here...
              </span>
            ) : (
              sentenceStrip.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8F5F2] text-[#0A625D] text-xs font-bold border border-[#0A625D]/20 shadow-2xs animate-scale-up"
                >
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromStrip(idx);
                    }}
                    className="hover:text-red-500 rounded-full p-0.5 ml-0.5"
                    title="Remove token"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSpeakSentenceStrip}
              disabled={sentenceStrip.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                sentenceStrip.length > 0
                  ? 'bg-[#FF6B4A] hover:bg-[#E85A3A] text-white shadow-xs cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Speak Sentence ({sentenceStrip.length})</span>
            </button>

            {sentenceStrip.length > 0 && (
              <button
                onClick={handleClearStrip}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-slate-50 transition text-xs"
                title="Clear sentence strip"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="my-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All', icon: Sparkles },
              { id: 'needs', label: 'Needs & Comfort', icon: AlertCircle },
              { id: 'questions', label: 'Questions', icon: HelpCircle },
              { id: 'participation', label: 'Participation', icon: Hand },
              { id: 'social', label: 'Social & Daily', icon: Smile }
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isActive
                      ? 'bg-[#19324A] text-white border-[#19324A] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phrases..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0A625D] text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Phrase Tiles Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPhrases.map((phrase) => {
            const isCurrentlySpeaking = activeSpeakingText === phrase.text;
            return (
              <div
                key={phrase.id}
                onClick={() => handleSpeakPhrase(phrase)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSpeakPhrase(phrase);
                  }
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group focus:outline-none focus:ring-4 focus:ring-[#0A625D]/30 min-h-[115px] ${
                  isCurrentlySpeaking
                    ? 'bg-[#E8F5F2] border-[#0A625D] shadow-md ring-2 ring-[#0A625D]'
                    : 'bg-white border-slate-200 hover:border-[#0A625D] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{phrase.icon}</span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToStrip(phrase);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-[#E8F5F2] hover:text-[#0A625D] text-[11px] font-bold text-slate-600 transition"
                      title="Add to Sentence Strip"
                    >
                      + Strip
                    </button>
                    <button
                      onClick={(e) => handleCopyPhrase(e, phrase)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      title="Copy text"
                    >
                      {copiedId === phrase.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {phrase.isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustomPhrase(e, phrase.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        title="Delete custom phrase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="text-sm font-bold text-slate-900 leading-snug block">
                    {phrase.text}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1 block">
                    {phrase.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Phrase Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-label="Add custom communication phrase"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-[#19324A]">Add Custom Phrase</h3>
            <form onSubmit={handleAddCustomPhrase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phrase Content
                </label>
                <input
                  type="text"
                  required
                  value={newPhraseText}
                  onChange={(e) => setNewPhraseText(e.target.value)}
                  placeholder="e.g. Please give me 5 minutes"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-[#0A625D] focus:ring-2 focus:ring-[#0A625D]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newPhraseCategory}
                    onChange={(e) => setNewPhraseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                  >
                    <option value="needs">Needs & Comfort</option>
                    <option value="questions">Questions</option>
                    <option value="participation">Participation</option>
                    <option value="social">Daily & Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newPhraseIcon}
                    onChange={(e) => setNewPhraseIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-center text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0A625D] text-white hover:bg-[#084F4B]"
                >
                  Save Phrase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
