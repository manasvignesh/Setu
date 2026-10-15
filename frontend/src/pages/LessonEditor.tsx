import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Lesson, LessonSection, ClassRoom } from '../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  Image as ImageIcon,
  Volume2,
  BookOpen,
  Check,
  Sparkles
} from 'lucide-react';

interface LessonEditorProps {
  navigate: (route: string, data?: any) => void;
  initialLesson?: Lesson;
  initialClassId?: string;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  navigate,
  initialLesson,
  initialClassId
}) => {
  const { token } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState(initialLesson?.class_id || initialClassId || '');
  const [title, setTitle] = useState(initialLesson?.title || '');
  const [subject, setSubject] = useState(initialLesson?.subject || 'General Science');
  const [grade, setGrade] = useState(initialLesson?.grade || 'Class 6');
  const [summary, setSummary] = useState(initialLesson?.summary || '');
  const [sections, setSections] = useState<LessonSection[]>(
    initialLesson?.sections || [
      {
        order_index: 0,
        title: '1. Introduction',
        content_text: '',
        simplified_text: '',
        key_terms: '',
        image_url: '',
        image_alt: '',
        image_pedagogical_description: ''
      }
    ]
  );

  const [importMode, setImportMode] = useState(false);
  const [rawImportText, setRawImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setClasses(data || []);
        if (!classId && data && data.length > 0) {
          setClassId(data[0].id);
        }
      })
      .catch(console.error);
  }, [classId, token]);

  const handleAddSection = () => {
    const nextIndex = sections.length;
    setSections([
      ...sections,
      {
        order_index: nextIndex,
        title: `${nextIndex + 1}. New Topic`,
        content_text: '',
        simplified_text: '',
        key_terms: '',
        image_url: '',
        image_alt: '',
        image_pedagogical_description: ''
      }
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index: number, field: keyof LessonSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const handleImportText = async () => {
    if (!rawImportText.trim() || !classId) {
      setError('Please provide text and select a class.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/lessons/import-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          class_id: classId,
          title: title || 'Imported Lesson',
          subject,
          grade,
          raw_text: rawImportText,
          language: 'en'
        })
      });

      const data = await res.json();
      if (res.ok) {
        navigate('teacher-dashboard');
      } else {
        throw new Error(data.detail || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Error during text import');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) {
      setError('Please select a target classroom.');
      return;
    }
    setError(null);
    setLoading(true);

    const payload = {
      class_id: classId,
      title,
      subject,
      grade,
      summary,
      language: 'en',
      sections: sections.map((s, idx) => ({
        ...s,
        order_index: idx,
        simplified_text: s.simplified_text || s.content_text
      }))
    };

    try {
      const url = initialLesson?.id ? `/api/lessons/${initialLesson.id}` : '/api/lessons';
      const method = initialLesson?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not save lesson');
      }

      setSavedSuccess(true);
      setTimeout(() => {
        navigate('teacher-dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-zinc-900 dark:text-zinc-100 font-body">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('teacher-dashboard')}
            aria-label="Back to dashboard"
            className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="nothing-label text-[10px] text-red-500 font-bold">[ LESSON AUTHORING ]</div>
            <h1 className="text-2xl font-bold font-heading">
              {initialLesson ? 'Edit Accessible Lesson' : 'Prepare Accessible Lesson'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('lesson-studio', { classId })}
            className="px-3 py-1.5 rounded-full border border-red-500/30 bg-red-50 dark:bg-red-950/20 font-mono text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5"
            title="Upload PDF or diagram image to generate accessible formats"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            <span>ACCESSIBLE STUDIO (PDF/IMG)</span>
          </button>
          <button
            type="button"
            onClick={() => setImportMode(!importMode)}
            className="px-3 py-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-xs font-bold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-red-500" />
            <span>{importMode ? 'STEP EDITOR' : 'IMPORT TEXT'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-2xl bg-red-950/20 border border-red-500/80 text-red-500 text-xs font-mono font-bold">
          {error}
        </div>
      )}

      {savedSuccess && (
        <div role="status" className="p-4 rounded-2xl bg-zinc-900 text-white border border-red-500 text-xs font-mono font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-red-500" />
          <span>LESSON SAVED & FORMATTED FOR ACCESSIBILITY!</span>
        </div>
      )}

      {importMode ? (
        /* Text Import Mode */
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs font-mono">
          <h2 className="text-base font-bold font-heading">Paste Notes or Paragraphs</h2>
          <p className="text-xs text-zinc-500">
            Separate sections with double line breaks. SETU will structure accessible concept cards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="nothing-label block text-zinc-500 mb-1">TARGET CLASS</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="nothing-label block text-zinc-500 mb-1">LESSON TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class 6 Science - Photosynthesis"
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="nothing-label block text-zinc-500 mb-1">RAW LESSON TEXT</label>
            <textarea
              rows={10}
              value={rawImportText}
              onChange={(e) => setRawImportText(e.target.value)}
              placeholder="Paste lesson paragraphs here..."
              className="w-full p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleImportText}
            disabled={loading}
            className="w-full py-3 nothing-btn-primary font-mono text-xs font-bold"
          >
            {loading ? 'PROCESSING...' : 'IMPORT & CONVERT TO MULTIMODAL'}
          </button>
        </div>
      ) : (
        /* Manual Step-by-Step Editor */
        <form onSubmit={handleSaveLesson} className="space-y-6">
          
          {/* Metadata */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs font-mono text-xs">
            <h2 className="text-sm font-bold font-heading text-zinc-900 dark:text-white">GENERAL CONFIG</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="nothing-label block text-zinc-500 mb-1">TARGET CLASS</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="nothing-label block text-zinc-500 mb-1">LESSON TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Class 6 Science — The Solar System"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="nothing-label block text-zinc-500 mb-1">GRADE</label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Class 6"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                />
              </div>
              <div>
                <label className="nothing-label block text-zinc-500 mb-1">SUBJECT</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="General Science"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="nothing-label block text-zinc-500 mb-1">BRIEF OVERVIEW</label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key concepts covered..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono"
              />
            </div>
          </div>

          {/* Sequential Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono">
              <h2 className="text-sm font-bold font-heading flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-zinc-400" />
                <span>SECTIONS ({sections.length})</span>
              </h2>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1 border border-zinc-200 dark:border-zinc-700"
              >
                <Plus className="w-3 h-3 text-red-500" />
                <span>+ SECTION</span>
              </button>
            </div>

            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs relative"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 font-mono">
                  <span className="nothing-label text-[10px] text-red-500 font-bold">
                    ( 0{idx + 1} // SECTION )
                  </span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(idx)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-lg"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="nothing-label block text-zinc-500 mb-1">SECTION HEADING</label>
                  <input
                    type="text"
                    required
                    value={sec.title}
                    onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Earth's Revolution and the 365-Day Year"
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="nothing-label block text-zinc-500 mb-1">MAIN LESSON TEXT</label>
                  <textarea
                    rows={3}
                    required
                    value={sec.content_text}
                    onChange={(e) => handleSectionChange(idx, 'content_text', e.target.value)}
                    placeholder="Full academic text for this section..."
                    className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-normal"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="nothing-label block text-zinc-500 mb-1">
                      SIMPLIFIED EXPLANATION (FOR DYSLEXIA MODE)
                    </label>
                    <textarea
                      rows={2}
                      value={sec.simplified_text || ''}
                      onChange={(e) => handleSectionChange(idx, 'simplified_text', e.target.value)}
                      placeholder="Simpler wording..."
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-normal"
                    />
                  </div>
                  <div>
                    <label className="nothing-label block text-zinc-500 mb-1">
                      KEY SCIENCE VOCABULARY
                    </label>
                    <textarea
                      rows={2}
                      value={sec.key_terms || ''}
                      onChange={(e) => handleSectionChange(idx, 'key_terms', e.target.value)}
                      placeholder="e.g. Revolution, Orbit, 365 Days"
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-normal"
                    />
                  </div>
                </div>

                {/* Educational Diagram & Spoken Description */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3 font-mono text-xs">
                  <div className="nothing-label text-[10px] text-zinc-500 flex items-center gap-1.5 font-bold">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>DIAGRAM & SPOKEN AUDIO DESCRIPTION</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="nothing-label block text-zinc-400 mb-1">IMAGE URL</label>
                      <input
                        type="url"
                        value={sec.image_url || ''}
                        onChange={(e) => handleSectionChange(idx, 'image_url', e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="nothing-label block text-zinc-400 mb-1">IMAGE ALT</label>
                      <input
                        type="text"
                        value={sec.image_alt || ''}
                        onChange={(e) => handleSectionChange(idx, 'image_alt', e.target.value)}
                        placeholder="Diagram of Earth orbiting the Sun"
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="nothing-label block text-red-500 mb-1 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>PEDAGOGICAL SPOKEN DESCRIPTION (FOR VISUALLY IMPAIRED STUDENTS)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={sec.image_pedagogical_description || ''}
                      onChange={(e) => handleSectionChange(idx, 'image_pedagogical_description', e.target.value)}
                      placeholder="Describe visual elements and scientific concept..."
                      className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-normal"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 font-mono">
            <button
              type="button"
              onClick={() => navigate('teacher-dashboard')}
              className="px-5 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 nothing-btn-primary font-mono text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'SAVING...' : 'PUBLISH LESSON'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
