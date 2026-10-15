export type Role = 'teacher' | 'coordinator' | 'admin' | 'student' | 'adult_learner';

export type DisabilityType = 'hearing' | 'vision' | 'motor' | 'cognitive' | 'speech' | 'none';

export interface DisabilityProfile {
  id?: string;
  user_id?: string;
  disability_type: DisabilityType;
  severity: 'mild' | 'moderate' | 'severe';
  preferences_json?: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  school_id?: string | null;
  onboarding_completed?: boolean;
  disability_profiles?: DisabilityProfile[];
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface School {
  id: string;
  name: string;
  code: string;
  district?: string;
  state?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  subject: string;
  section?: string;
  teacher_id: string;
  created_at: string;
  lesson_count?: number;
}

export interface LessonSection {
  id?: string;
  lesson_id?: string;
  order_index: number;
  title: string;
  content_text: string;
  simplified_text?: string;
  key_terms?: string;
  image_url?: string;
  image_alt?: string;
  image_pedagogical_description?: string;
}

export interface Lesson {
  id: string;
  class_id: string;
  title: string;
  subject: string;
  grade: string;
  summary?: string;
  language: string;
  is_published: boolean;
  created_at: string;
  sections: LessonSection[];
}

export interface LiveSession {
  id: string;
  room_code: string;
  class_id: string;
  lesson_id?: string;
  teacher_id: string;
  is_active: boolean;
  current_section_index: number;
  started_at: string;
  ended_at?: string;
  participant_count: number;
  lesson?: Lesson;
}

export interface CaptionSegment {
  id: string;
  session_id: string;
  segment_index: number;
  text: string;
  original_text?: string;
  is_corrected: boolean;
  timestamp_ms: number;
  language: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  session_id: string;
  category: 'Assignment' | 'Exam' | 'Timetable' | 'Safety' | 'General';
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  created_at: string;
}

export interface StudentQuestion {
  id: string;
  session_id: string;
  student_nickname: string;
  message_type: 'aac_phrase' | 'custom_text' | 'clarification';
  content: string;
  status: 'pending' | 'acknowledged' | 'answered';
  response_text?: string;
  created_at: string;
}

export interface CoordinatorMetrics {
  total_teachers: number;
  total_classes: number;
  total_lessons: number;
  total_live_sessions: number;
  active_sessions_now: number;
  total_questions_handled: number;
  total_captions_generated: number;
  sample_school_name: string;
  district: string;
  state: string;
}

export type AccessibilityTheme = 'standard' | 'high-contrast' | 'dark';
export type FontSize = 'normal' | 'large' | 'extra-large';
export type AppLanguage = 'en' | 'hi' | 'te';
export type StudentMode = 'read' | 'listen' | 'respond' | 'follow';

export interface StudioUploadResult {
  filename: string;
  file_type: 'pdf' | 'image';
  page_count: number;
  extracted_text: string;
  has_text: boolean;
  image_url?: string | null;
  error?: string | null;
  ocr_available: boolean;
}

export interface StudioVocabularyItem {
  term: string;
  definition: string;
}

export interface StudioGenerateResult {
  title: string;
  simplified_explanation: string;
  key_points: string[];
  vocabulary: StudioVocabularyItem[];
  audio_ready_script: string;
  step_by_step_sections: LessonSection[];
  diagram_description?: string | null;
  provider_used: string;
}

