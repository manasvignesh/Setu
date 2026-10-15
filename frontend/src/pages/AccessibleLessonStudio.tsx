import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import type { ClassRoom, LessonSection, StudioUploadResult, StudioGenerateResult, StudioVocabularyItem } from '../types';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowLeft,
  Check,
  AlertCircle,
  RefreshCw,
  Edit3,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Eye,
  Sliders,
  ChevronRight,
  ListOrdered
} from 'lucide-react';

interface AccessibleLessonStudioProps {
  navigate: (route: string, data?: any) => void;
  initialClassId?: string;
}

type StudioStep = 'upload' | 'review' | 'published';

export const AccessibleLessonStudio: React.FC<AccessibleLessonStudioProps> = ({
  navigate,
  initialClassId
}) => {
  const { token, user } = useAuth();
  const effectiveToken = token || localStorage.getItem('setu_auth_token') || '';
  const { fontSize, dyslexiaFont } = useAccessibility();
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported: ttsSupported } = useSpeechSynthesis();

  // Workflow State
  const [currentStep, setCurrentStep] = useState<StudioStep>('upload');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || '');

  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<StudioUploadResult | null>(null);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lesson Metadata
  const [lessonTitle, setLessonTitle] = useState('');
  const [subject, setSubject] = useState('General Science');
  const [grade, setGrade] = useState('Class 6');
  const [language, setLanguage] = useState('en');

  // Generation & Review State
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<StudioGenerateResult | null>(null);
  const [originalExtractedText, setOriginalExtractedText] = useState('');

  // Editable fields in Review
  const [editableSimplified, setEditableSimplified] = useState('');
  const [editableKeyPoints, setEditableKeyPoints] = useState<string[]>([]);
  const [editableVocab, setEditableVocab] = useState<StudioVocabularyItem[]>([]);
  const [editableSections, setEditableSections] = useState<LessonSection[]>([]);
  const [editableAudioScript, setEditableAudioScript] = useState('');
  const [editableDiagramDesc, setEditableDiagramDesc] = useState('');

  // Active view tab in review
  const [reviewTab, setReviewTab] = useState<'content' | 'sections' | 'audio' | 'raw'>('content');

  // Publishing State
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishedLessonId, setPublishedLessonId] = useState<string | null>(null);

  // Error & Status Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load classes for teacher
  useEffect(() => {
    if (!effectiveToken) return;
    fetch('/api/classes', {
      headers: { 'Authorization': `Bearer ${effectiveToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setClasses(data);
          if (!selectedClassId && data.length > 0) {
            setSelectedClassId(data[0].id);
          }
        }
      })
      .catch(err => console.warn('Could not load classes:', err));
  }, [effectiveToken, selectedClassId]);

  // Clean up speech on unmount or when leaving the audio tab
  useEffect(() => {
    if (reviewTab !== 'audio') {
      cancel();
    }
    return () => {
      cancel();
    };
  }, [reviewTab, cancel]);

  // File Validation
  const validateFile = (file: File): string | null => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.bmp'];
    const fileName = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExt) {
      return `Unsupported file format. Please upload a PDF or image (${validExtensions.join(', ')}).`;
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      return `File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed upload size is 10MB.`;
    }
    return null;
  };

  // Upload Handler
  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setStatusMessage(null);

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setUploadLoading(true);
    setUploadProgress(`Uploading and analyzing ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/lessons/studio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: formData
      });

      const data: StudioUploadResult = await res.json();
      if (!res.ok) {
        throw new Error((data as any).detail || 'Failed to extract content from file.');
      }

      setUploadResult(data);
      setOriginalExtractedText(data.extracted_text || '');

      // Infer title from filename if empty
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setLessonTitle(prev => prev || baseName.charAt(0).toUpperCase() + baseName.slice(1));

      if (data.has_text) {
        setStatusMessage(`Successfully extracted text (${data.page_count} pages, ${data.extracted_text.length} characters).`);
      } else if (data.error) {
        setErrorMessage(data.error);
        setShowManualInput(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during file upload.');
    } finally {
      setUploadLoading(false);
      setUploadProgress(null);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Trigger Generation
  const handleGenerate = async () => {
    const textToProcess = originalExtractedText.trim() || manualText.trim();
    if (!textToProcess) {
      setErrorMessage('Please upload a document with text or enter lesson notes.');
      return;
    }

    setErrorMessage(null);
    setGenerating(true);
    cancel();

    try {
      const res = await fetch('/api/lessons/studio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: JSON.stringify({
          text: textToProcess,
          title: lessonTitle || 'Accessible Lesson',
          grade,
          subject,
          image_url: uploadResult?.image_url || null
        })
      });

      const data: StudioGenerateResult = await res.json();
      if (!res.ok) {
        throw new Error((data as any).detail || 'Failed to generate accessible content.');
      }

      setGeneratedData(data);
      setLessonTitle(data.title || lessonTitle);
      setEditableSimplified(data.simplified_explanation || '');
      setEditableKeyPoints(data.key_points || []);
      setEditableVocab(data.vocabulary || []);
      setEditableSections(data.step_by_step_sections || []);
      setEditableAudioScript(data.audio_ready_script || '');
      setEditableDiagramDesc(data.diagram_description || '');

      setCurrentStep('review');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while generating accessible content.');
    } finally {
      setGenerating(false);
    }
  };

  // Browser TTS Controls
  const handleToggleAudio = () => {
    if (!editableAudioScript) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(editableAudioScript, language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-IN');
    }
  };

  // Publish Lesson
  const handlePublish = async () => {
    if (!selectedClassId) {
      setErrorMessage('Please select a target classroom to publish this lesson.');
      return;
    }
    if (editableSections.length === 0) {
      setErrorMessage('At least one concept section is required.');
      return;
    }

    setErrorMessage(null);
    setPublishing(true);
    cancel();

    const payload = {
      class_id: selectedClassId,
      title: lessonTitle.trim() || 'Accessible Lesson',
      subject,
      grade,
      summary: editableSimplified.slice(0, 300),
      simplified_explanation: editableSimplified,
      audio_ready_script: editableAudioScript,
      language,
      sections: editableSections.map((sec, idx) => ({
        ...sec,
        order_index: idx,
        simplified_text: sec.simplified_text || sec.content_text
      }))
    };

    try {
      const res = await fetch('/api/lessons/studio/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not persist lesson.');
      }

      setPublishedLessonId(data.id);
      setPublishSuccess(true);
      setCurrentStep('published');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish lesson to database.');
    } finally {
      setPublishing(false);
    }
  };

  const handleLoadSampleNCERT = (type: 'photosynthesis' | 'water' | 'circuits') => {
    if (type === 'photosynthesis') {
      const title = 'Class 6 Science — Photosynthesis and Plant Cells';
      const text = `Photosynthesis is the fundamental biological process by which autotrophic plants synthesize glucose and chemical energy from sunlight, water, and atmospheric carbon dioxide. The primary reaction occurs in the chloroplasts, where chlorophyll pigments absorb photons and drive the electron transport chain, releasing vital oxygen into Earth's atmosphere.`;
      setLessonTitle(title);
      setSubject('General Science');
      setGrade('Class 6');
      setManualText(text);
      setShowManualInput(true);
      setOriginalExtractedText(text);
      setUploadResult({
        filename: 'ncert_class6_photosynthesis.pdf',
        file_type: 'pdf',
        page_count: 1,
        extracted_text: text,
        has_text: true,
        ocr_available: true,
        error: null
      });
      setStatusMessage('Loaded NCERT Photosynthesis curriculum sample. Press "Generate Multimodal Lesson" below.');
    } else if (type === 'water') {
      const title = 'Class 7 Science — The Water Cycle & Precipitation';
      const text = `The hydrologic water cycle represents the continuous movement of water on, above, and below the surface of the Earth. Solar radiation heats water in oceans and rivers, driving evaporation into atmospheric water vapor. As moisture ascends, adiabatic cooling causes condensation into clouds, eventually precipitating as rain and returning to aquifers.`;
      setLessonTitle(title);
      setSubject('Physical Sciences');
      setGrade('Class 7');
      setManualText(text);
      setShowManualInput(true);
      setOriginalExtractedText(text);
      setUploadResult({
        filename: 'ncert_class7_water_cycle.pdf',
        file_type: 'pdf',
        page_count: 1,
        extracted_text: text,
        has_text: true,
        ocr_available: true,
        error: null
      });
      setStatusMessage('Loaded NCERT Water Cycle curriculum sample. Press "Generate Multimodal Lesson" below.');
    } else {
      const title = 'Class 8 Science — Electricity & Electrical Conductivity';
      const text = `Electric current is the rate of flow of electric charges through a conducting material. Metals such as copper and aluminum possess free delocalized valence electrons that drift when subjected to an electromotive potential difference. Insulators have tightly bound electrons preventing electrical transmission.`;
      setLessonTitle(title);
      setSubject('Physics & Energy');
      setGrade('Class 8');
      setManualText(text);
      setShowManualInput(true);
      setOriginalExtractedText(text);
      setUploadResult({
        filename: 'ncert_class8_electricity.pdf',
        file_type: 'pdf',
        page_count: 1,
        extracted_text: text,
        has_text: true,
        ocr_available: true,
        error: null
      });
      setStatusMessage('Loaded NCERT Electricity curriculum sample. Press "Generate Multimodal Lesson" below.');
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#FAFAF8] text-[#1A1A2E] p-4 sm:p-6 lg:p-8 flex flex-col">
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col space-y-6">

        {/* Top Header & Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('teacher-dashboard')}
              className="p-2 rounded-2xl border border-black/10 hover:bg-white text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Back to Teacher Workspace"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Workspace</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge-ios-blue text-[11px] font-bold">
                  Phase 1 Accessible Studio
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStep === 'upload' ? 'Step 1/2' : currentStep === 'review' ? 'Step 2/2' : 'Completed'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-0.5">
                Accessible Lesson Studio
              </h1>
            </div>
          </div>

          {/* Stepper Indicator */}
          <nav aria-label="Studio steps" className="flex items-center gap-2 text-xs font-bold">
            <span className={`px-3 py-1 rounded-full transition-colors ${
              currentStep === 'upload'
                ? 'bg-[#FF6B4A] text-white shadow-xs'
                : 'bg-black/[0.04] text-slate-600'
            }`}>
              1. Upload & Extract
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={`px-3 py-1 rounded-full transition-colors ${
              currentStep === 'review'
                ? 'bg-[#0A625D] text-white shadow-xs'
                : 'bg-black/[0.04] text-slate-600'
            }`}>
              2. Review & Edit
            </span>
          </nav>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800 font-bold ml-2 text-sm"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Status Banner */}
        {statusMessage && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ================= STEP 1: UPLOAD & EXTRACT ================= */}
        {currentStep === 'upload' && (
          <div className="space-y-6">

            {/* Lesson Target Configuration */}
            <div className="ios-card p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF6B4A]" />
                <span>Curriculum Targeting</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label htmlFor="studio-target-class" className="block text-slate-600 font-bold mb-1">
                    TARGET CLASSROOM <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="studio-target-class"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:border-[#FF6B4A]"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                    ))}
                    {classes.length === 0 && (
                      <option value="">No classrooms found</option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="studio-lesson-subject" className="block text-slate-600 font-bold mb-1">
                    SUBJECT
                  </label>
                  <input
                    id="studio-lesson-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="General Science"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  />
                </div>

                <div>
                  <label htmlFor="studio-lesson-grade" className="block text-slate-600 font-bold mb-1">
                    GRADE / LEVEL
                  </label>
                  <input
                    id="studio-lesson-grade"
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="Class 6"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="studio-lesson-title" className="block text-slate-600 font-bold mb-1">
                  LESSON TITLE
                </label>
                <input
                  id="studio-lesson-title"
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Photosynthesis and Food Production"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold"
                />
              </div>

              {/* 1-Click NCERT Curriculum Sample Loader */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider">
                      Quick Evaluation Templates (NCERT Curriculum)
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                    1-Click Auto-Fill
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSampleNCERT('photosynthesis')}
                    className="px-3 py-1.5 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition shadow-2xs hover:scale-102 flex items-center gap-1.5"
                  >
                    <span>🌿</span>
                    <span>Class 6: Photosynthesis & Plant Cells</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleNCERT('water')}
                    className="px-3 py-1.5 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition shadow-2xs hover:scale-102 flex items-center gap-1.5"
                  >
                    <span>💧</span>
                    <span>Class 7: The Water Cycle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSampleNCERT('circuits')}
                    className="px-3 py-1.5 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition shadow-2xs hover:scale-102 flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>Class 8: Electricity & Circuits</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`ios-card p-8 border-2 border-dashed transition-all text-center flex flex-col items-center justify-center min-h-[240px] ${
                dragActive
                  ? 'border-[#FF6B4A] bg-[#FFF0EC]'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="studio-file-picker"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.bmp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
                aria-label="Upload PDF or diagram image"
              />

              <div className="w-14 h-14 rounded-3xl bg-[#FFF0EC] text-[#FF6B4A] flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                Drop your curriculum PDF or diagram image here
              </h3>
              <p className="text-xs text-slate-500 max-w-md mb-4">
                Supports PDF textbooks, educational worksheets, and scientific diagrams up to 10MB.
                Text is extracted automatically using embedded PDF parsing.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadLoading}
                  className="btn-ios-primary text-xs py-2 px-5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Choose PDF or Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="btn-ios-secondary text-xs py-2 px-4"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{showManualInput ? 'Hide Text Box' : 'Paste Notes Instead'}</span>
                </button>
              </div>

              {uploadLoading && (
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#FF6B4A]">
                  <div className="w-4 h-4 rounded-full border-2 border-[#FF6B4A] border-t-transparent animate-spin" />
                  <span>{uploadProgress || 'Processing upload...'}</span>
                </div>
              )}
            </div>

            {/* Manual text input drawer or fallback */}
            {showManualInput && (
              <div className="ios-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="studio-manual-text" className="text-xs font-bold text-slate-700">
                    PASTE OR TYPE LESSON TEXT (OPTIONAL / FALLBACK)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Useful if your document is scanned or notes are handwritten
                  </span>
                </div>
                <textarea
                  id="studio-manual-text"
                  rows={6}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste textbook excerpt or lesson text here..."
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-xs font-normal bg-white"
                />
              </div>
            )}

            {/* Extracted Content Preview if available */}
            {originalExtractedText && (
              <div className="ios-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Extracted Text Preview ({originalExtractedText.length} characters)
                    </h3>
                  </div>
                  <span className="badge-ios-blue text-[11px] font-bold">
                    {uploadResult?.file_type?.toUpperCase() || 'EXTRACTED'}
                  </span>
                </div>

                {uploadResult?.image_url && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                    <img
                      src={uploadResult.image_url}
                      alt="Uploaded Diagram Preview"
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <div className="text-xs">
                      <div className="font-bold text-slate-800">Uploaded Diagram Attached</div>
                      <div className="text-slate-500">Will be linked to concept step for visual learners</div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-48 overflow-y-auto text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {originalExtractedText}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalExtractedText('');
                      setUploadResult(null);
                    }}
                    className="btn-ios-secondary text-xs"
                  >
                    Clear & Re-upload
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="btn-ios-primary text-xs"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Multimodal Formats...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Accessible Formats</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* If manual text is typed and no file uploaded */}
            {!originalExtractedText && manualText.trim().length > 10 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn-ios-primary text-xs"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Formats...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Accessible Formats</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        )}

        {/* ================= STEP 2: REVIEW & EDIT ================= */}
        {currentStep === 'review' && (
          <div className="space-y-6">

            {/* Header info & Tab Switcher */}
            <div className="ios-card p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500">
                  {subject} • {grade}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {lessonTitle}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>Engine: {generatedData?.provider_used === 'openai' ? 'OpenAI AI Model' : generatedData?.provider_used === 'gemini' ? 'Gemini AI Model' : 'Deterministic Curriculum Engine'}</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setReviewTab('content')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reviewTab === 'content'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  1. Plain Explanation & Terms
                </button>
                <button
                  onClick={() => setReviewTab('sections')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reviewTab === 'sections'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2. Sequential Steps ({editableSections.length})
                </button>
                <button
                  onClick={() => setReviewTab('audio')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reviewTab === 'audio'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  3. Spoken Audio Narration
                </button>
                <button
                  onClick={() => setReviewTab('raw')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    reviewTab === 'raw'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Source Text
                </button>
              </div>
            </div>

            {/* TAB 1: PLAIN EXPLANATION & VOCABULARY */}
            {reviewTab === 'content' && (
              <div className="space-y-6">
                
                {/* Simplified Explanation */}
                <div className="ios-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="studio-simplified-text" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>SIMPLIFIED EXPLANATION (STUDENT-FRIENDLY PLAIN LANGUAGE)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Editable for dyslexia & cognitive support
                    </span>
                  </div>
                  <textarea
                    id="studio-simplified-text"
                    rows={4}
                    value={editableSimplified}
                    onChange={(e) => setEditableSimplified(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-normal bg-white"
                  />
                </div>

                {/* Key Points */}
                <div className="ios-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">
                      Core Key Points
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditableKeyPoints([...editableKeyPoints, 'New key point...'])}
                      className="text-xs font-bold text-[#0A625D] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Point</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editableKeyPoints.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FF6B4A]">•</span>
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => {
                            const updated = [...editableKeyPoints];
                            updated[pIdx] = e.target.value;
                            setEditableKeyPoints(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setEditableKeyPoints(editableKeyPoints.filter((_, i) => i !== pIdx))}
                          className="text-slate-400 hover:text-red-500 p-1"
                          aria-label={`Remove point ${pIdx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Academic Vocabulary */}
                <div className="ios-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">
                      Important Vocabulary & Definitions
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditableVocab([...editableVocab, { term: 'New Term', definition: 'Student-friendly definition' }])}
                      className="text-xs font-bold text-[#0A625D] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Vocabulary</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editableVocab.map((v, vIdx) => (
                      <div key={vIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 relative">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={v.term}
                            onChange={(e) => {
                              const updated = [...editableVocab];
                              updated[vIdx] = { ...updated[vIdx], term: e.target.value };
                              setEditableVocab(updated);
                            }}
                            className="font-bold text-xs text-[#0A625D] bg-white px-2 py-1 rounded border border-slate-200"
                            placeholder="Term"
                          />
                          <button
                            type="button"
                            onClick={() => setEditableVocab(editableVocab.filter((_, i) => i !== vIdx))}
                            className="text-slate-400 hover:text-red-500 p-1"
                            aria-label={`Remove term ${v.term}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={v.definition}
                          onChange={(e) => {
                            const updated = [...editableVocab];
                            updated[vIdx] = { ...updated[vIdx], definition: e.target.value };
                            setEditableVocab(updated);
                          }}
                          className="w-full text-xs text-slate-600 bg-white p-2 rounded border border-slate-200"
                          placeholder="Simple explanation..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SEQUENTIAL CONCEPT STEPS */}
            {reviewTab === 'sections' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Step-by-Step Concept Cards ({editableSections.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const nextOrder = editableSections.length;
                      setEditableSections([
                        ...editableSections,
                        {
                          order_index: nextOrder,
                          title: `Step ${nextOrder + 1}: New Topic`,
                          content_text: '',
                          simplified_text: '',
                          key_terms: ''
                        }
                      ]);
                    }}
                    className="btn-ios-secondary text-xs py-1.5 px-3"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                {editableSections.map((sec, sIdx) => (
                  <div key={sIdx} className="ios-card p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="badge-ios-blue text-[11px] font-bold">
                        Step {sIdx + 1}
                      </span>
                      {editableSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditableSections(editableSections.filter((_, i) => i !== sIdx))}
                          className="text-slate-400 hover:text-red-500 p-1"
                          aria-label={`Delete step ${sIdx + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold text-xs mb-1">
                        STEP TITLE
                      </label>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...editableSections];
                          updated[sIdx] = { ...updated[sIdx], title: e.target.value };
                          setEditableSections(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-bold mb-1">
                          ACADEMIC CONTENT
                        </label>
                        <textarea
                          rows={3}
                          value={sec.content_text}
                          onChange={(e) => {
                            const updated = [...editableSections];
                            updated[sIdx] = { ...updated[sIdx], content_text: e.target.value };
                            setEditableSections(updated);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-bold mb-1">
                          SIMPLIFIED LANGUAGE
                        </label>
                        <textarea
                          rows={3}
                          value={sec.simplified_text || ''}
                          onChange={(e) => {
                            const updated = [...editableSections];
                            updated[sIdx] = { ...updated[sIdx], simplified_text: e.target.value };
                            setEditableSections(updated);
                          }}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold text-xs mb-1">
                        KEY TERMS (COMMA-SEPARATED)
                      </label>
                      <input
                        type="text"
                        value={sec.key_terms || ''}
                        onChange={(e) => {
                          const updated = [...editableSections];
                          updated[sIdx] = { ...updated[sIdx], key_terms: e.target.value };
                          setEditableSections(updated);
                        }}
                        placeholder="e.g. Chloroplast, Solar Energy"
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    {/* Image Attachment & Spoken Description */}
                    {sec.image_url && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={sec.image_url}
                            alt={sec.image_alt || 'Step diagram'}
                            className="w-16 h-16 rounded object-cover border"
                          />
                          <div className="flex-1 text-xs">
                            <label className="block font-bold text-slate-700 mb-1">
                              SPOKEN AUDIO DESCRIPTION FOR VISUALLY IMPAIRED
                            </label>
                            <textarea
                              rows={2}
                              value={sec.image_pedagogical_description || ''}
                              onChange={(e) => {
                                const updated = [...editableSections];
                                updated[sIdx] = {
                                  ...updated[sIdx],
                                  image_pedagogical_description: e.target.value
                                };
                                setEditableSections(updated);
                              }}
                              className="w-full p-2 rounded border border-slate-300 text-xs bg-white"
                              placeholder="Describe the scientific diagram clearly..."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: AUDIO-READY NARRATION & BROWSER TTS PLAYER */}
            {reviewTab === 'audio' && (
              <div className="ios-card p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-[#0A625D]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Browser Text-to-Speech Playback & Narration
                    </h3>
                  </div>

                  {/* Play / Pause TTS Button */}
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                      isSpeaking && !isPaused
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isPaused
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-[#0A625D] text-white hover:bg-[#084F4B]'
                    }`}
                    aria-label={
                      isSpeaking && !isPaused
                        ? 'Pause audio preview'
                        : isPaused
                        ? 'Resume audio preview'
                        : 'Play audio preview'
                    }
                  >
                    {isSpeaking && !isPaused ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Audio</span>
                      </>
                    ) : isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Narration</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Play Audio Preview</span>
                      </>
                    )}
                  </button>
                </div>

                {!ttsSupported && (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold">
                    Browser Text-to-Speech is not supported in this browser. Narration script is still saved for supported student devices.
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  This script is optimized for smooth, conversational browser speech synthesis.
                  You can edit the narration below to adjust pacing or phonetic clarity.
                </p>

                <textarea
                  rows={6}
                  value={editableAudioScript}
                  onChange={(e) => setEditableAudioScript(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-300 text-sm font-normal bg-white"
                />

                {isSpeaking && (
                  <div className="p-3 rounded-xl bg-[#E8F5F2] border border-[#0A625D]/20 flex items-center gap-3 text-xs font-bold text-[#0A625D]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0A625D] animate-ping" />
                    <span>Speaking narration through browser speech synthesis...</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ORIGINAL EXTRACTED TEXT */}
            {reviewTab === 'raw' && (
              <div className="ios-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">
                    Original Extracted Textbook Content
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {originalExtractedText.length} characters extracted
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {originalExtractedText}
                </div>
              </div>
            )}

            {/* Action Buttons: Cancel, Re-generate, Approve & Publish */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/[0.06]">
              <button
                type="button"
                onClick={() => {
                  cancel();
                  setCurrentStep('upload');
                }}
                className="btn-ios-secondary text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Upload</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn-ios-secondary text-xs"
                  title="Re-run accessible transformation"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  <span>Re-generate</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="btn-ios-primary text-xs"
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing to Classroom...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Publish Lesson</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= STEP 3: PUBLISHED SUCCESS ================= */}
        {currentStep === 'published' && (
          <div className="ios-card p-10 text-center max-w-xl mx-auto space-y-6 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="badge-ios-green text-xs font-bold">
                Saved & Published
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">
                Accessible Lesson Published!
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                "{lessonTitle}" is now active in your classroom and instantly accessible
                through Read, Listen, Follow, and Plain-Language modes.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('accessible-lessons')}
                className="btn-ios-primary text-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Preview in 4 Modes</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('teacher-dashboard')}
                className="btn-ios-secondary text-xs"
              >
                <span>Return to Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOriginalExtractedText('');
                  setGeneratedData(null);
                  setLessonTitle('');
                  setUploadResult(null);
                  setCurrentStep('upload');
                }}
                className="btn-ios-secondary text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Another</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
};
