/**
 * SETU Client-Side Autonomous Mock Backend & Live Broadcast Engine
 * Replaces the Python backend entirely, allowing the frontend to run 100% autonomously.
 */

import type {
  ClassRoom,
  Lesson,
  LessonSection,
  LiveSession,
  CaptionSegment,
  Announcement,
  StudentQuestion,
  CoordinatorMetrics,
  StudioUploadResult,
  StudioGenerateResult,
  User,
} from './types';

// Initial Seed Data
const DEFAULT_CLASSES: ClassRoom[] = [
  {
    id: 'class-6a',
    name: 'Class 6 - Section A',
    grade: 'Class 6',
    subject: 'General Science',
    section: 'A',
    teacher_id: 'demo-teacher-anita',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    lesson_count: 3
  },
  {
    id: 'class-7b',
    name: 'Class 7 - Section B',
    grade: 'Class 7',
    subject: 'Physical Sciences',
    section: 'B',
    teacher_id: 'demo-teacher-anita',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    lesson_count: 2
  },
  {
    id: 'class-8c',
    name: 'Class 8 - Section C',
    grade: 'Class 8',
    subject: 'Inclusive Life Skills',
    section: 'C',
    teacher_id: 'demo-teacher-anita',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    lesson_count: 1
  }
];

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'lesson-solar-system',
    class_id: 'class-6a',
    title: "Class 6 Science — The Solar System & Earth's Movements",
    subject: 'General Science',
    grade: 'Class 6',
    summary: "Understanding how Earth orbits the Sun, why we experience day and night, the 8 planets, and gravity's role in our solar system.",
    language: 'en',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    sections: [
      {
        id: 'sec-1',
        lesson_id: 'lesson-solar-system',
        order_index: 0,
        title: '1. Introduction to Our Solar System',
        content_text: 'The Solar System consists of our Sun and everything bound to it by gravity. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The Sun is at the center, providing light and heat essential for all life on Earth.',
        simplified_text: 'Our solar system has 8 planets orbiting around the Sun. The Sun is in the middle and gives us warmth and light.',
        key_terms: 'Solar System, Sun, Planets, Orbit, Gravity',
        image_url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80',
        image_alt: 'Illustration of the Sun with eight planets arranged in order of distance.',
        image_pedagogical_description: 'A central glowing yellow Sun with eight planetary orbits radiating outward. Starting closest to the Sun: Mercury, Venus, blue and white Earth with its Moon, red Mars, the giant banded Jupiter, ringed Saturn, icy blue Uranus, and deep blue Neptune.'
      },
      {
        id: 'sec-2',
        lesson_id: 'lesson-solar-system',
        order_index: 1,
        title: "2. Earth's Revolution and the 365-Day Year",
        content_text: 'The Earth revolves around the Sun along an elliptical orbital pathway. One complete revolution takes approximately 365 days and 6 hours, which defines one solar year on Earth. This orbital journey causes our different seasons.',
        simplified_text: 'Earth travels in a large circle around the Sun. It takes 365 days (one full year) to complete one trip. This journey gives us winter, summer, monsoon, and spring.',
        key_terms: 'Revolution, 365 Days, Elliptical Orbit, Seasons, Solar Year',
        image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
        image_alt: 'Diagram of Earth orbiting the Sun showing its tilted axis.',
        image_pedagogical_description: 'Diagram showing the Earth tilted at 23.5 degrees on its axis, moving along an elliptical orbit around the glowing Sun.'
      },
      {
        id: 'sec-3',
        lesson_id: 'lesson-solar-system',
        order_index: 2,
        title: "3. Earth's Rotation: Why We Have Day and Night",
        content_text: 'While Earth revolves around the Sun, it also spins on its own imaginary axis. This spinning motion is called rotation. One complete rotation takes 24 hours (one day). The side of Earth facing the Sun experiences daylight, while the side facing away is in darkness (night).',
        simplified_text: 'Earth spins like a top every 24 hours. When our side faces the Sun, it is daylight. When we turn away into shadow, it is night.',
        key_terms: 'Rotation, 24 Hours, Axis, Day and Night, Daylight',
        image_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80',
        image_alt: 'Globe half illuminated by bright sunlight and half in nighttime shadow.',
        image_pedagogical_description: 'A spherical Earth viewed from space. The left half is brightly illuminated by yellow sunlight showing oceans and continents, while the right half is in deep night shadow.'
      },
      {
        id: 'sec-4',
        lesson_id: 'lesson-solar-system',
        order_index: 3,
        title: '4. Gravity: The Invisible Anchor',
        content_text: 'Gravity is the invisible attractive force that pulls objects toward one another. The immense mass of the Sun produces gravity strong enough to hold Earth and other planets in stable orbital trajectories.',
        simplified_text: 'Gravity is like a friendly invisible magnet that keeps our feet on the ground and holds the planets safely near the Sun.',
        key_terms: 'Gravity, Attraction Force, Planetary Mass, Stability',
        image_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80',
        image_alt: 'Astronaut floating in outer space showing microgravity environment.',
        image_pedagogical_description: 'Photograph of an astronaut floating above the blue horizon of Earth, visually demonstrating the effect of microgravity.'
      }
    ]
  },
  {
    id: 'lesson-light-reflection',
    class_id: 'class-7b',
    title: 'Class 7 Physics — Reflection and Refraction of Light',
    subject: 'Physical Sciences',
    grade: 'Class 7',
    summary: 'Discover how light bounces off smooth surfaces and bends through water and glass lenses.',
    language: 'en',
    is_published: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    sections: [
      {
        id: 'sec-light-1',
        lesson_id: 'lesson-light-reflection',
        order_index: 0,
        title: '1. What is Light?',
        content_text: 'Light is a form of electromagnetic radiation that travels in straight lines through transparent media at roughly 300,000 kilometers per second.',
        simplified_text: 'Light travels very fast in straight lines so our eyes can see shapes and colors.',
        key_terms: 'Light, Straight Line, Vision, Speed of Light'
      }
    ]
  }
];

// Helper Storage Get/Set
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`setu_mock_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`setu_mock_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage set error:', e);
  }
}

// Memory / Local Storage DB
let classes: ClassRoom[] = getStored('classes', DEFAULT_CLASSES);
let lessons: Lesson[] = getStored('lessons', DEFAULT_LESSONS);
let activeSession: LiveSession | null = getStored('active_session', {
  id: 'session-demo-live',
  room_code: '123456',
  class_id: 'class-6a',
  lesson_id: 'lesson-solar-system',
  teacher_id: 'demo-teacher-anita',
  is_active: true,
  current_section_index: 0,
  started_at: new Date().toISOString(),
  participant_count: 6,
  lesson: lessons[0]
});

let announcements: Announcement[] = getStored('announcements', [
  {
    id: 'ann-1',
    session_id: activeSession ? activeSession.id : 'session-demo-live',
    category: 'General',
    title: 'Welcome to Class 6 Inclusive Science!',
    content: 'Captions and visual cards are active. Use your AAC phrases or raise your hand anytime.',
    priority: 'normal',
    created_at: new Date().toISOString()
  }
]);

let questions: StudentQuestion[] = getStored('questions', [
  {
    id: 'q-1',
    session_id: activeSession ? activeSession.id : 'session-demo-live',
    student_nickname: 'Aarav (Hearing Support)',
    message_type: 'aac_phrase',
    content: 'Can you please repeat that point?',
    status: 'acknowledged',
    created_at: new Date(Date.now() - 120000).toISOString()
  }
]);

let captions: CaptionSegment[] = getStored('captions', [
  {
    id: 'cap-1',
    session_id: activeSession ? activeSession.id : 'session-demo-live',
    segment_index: 0,
    text: 'Good morning class. Today we will explore our wonderful solar system and the planets.',
    is_corrected: false,
    timestamp_ms: 1000,
    language: 'en',
    created_at: new Date(Date.now() - 300000).toISOString()
  }
]);

// Cross-tab real-time sync channel
const liveChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('setu_live_classroom_sync') : null;

// Mock WebSocket class that routes through BroadcastChannel and local callbacks
class MockWebSocket extends EventTarget {
  url: string;
  readyState: number = WebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  private channelHandler: ((e: MessageEvent) => void) | null = null;

  constructor(url: string) {
    super();
    this.url = url;

    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      const ev = new Event('open');
      this.dispatchEvent(ev);
      if (this.onopen) this.onopen(ev);

      // Send initial participant count
      this.dispatchPayload({
        type: 'PARTICIPANT_UPDATE',
        participant_count: activeSession ? activeSession.participant_count : 1
      });
    }, 50);

    if (liveChannel) {
      this.channelHandler = (e: MessageEvent) => {
        if (this.readyState === WebSocket.OPEN) {
          const msgEvent = new MessageEvent('message', { data: JSON.stringify(e.data) });
          this.dispatchEvent(msgEvent);
          if (this.onmessage) this.onmessage(msgEvent);
        }
      };
      liveChannel.addEventListener('message', this.channelHandler);
    }
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (liveChannel) {
          liveChannel.postMessage(parsed);
        }
      } catch {
        // raw data
      }
    }
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (liveChannel && this.channelHandler) {
      liveChannel.removeEventListener('message', this.channelHandler);
    }
    const ev = new CloseEvent('close');
    this.dispatchEvent(ev);
    if (this.onclose) this.onclose(ev);
  }

  dispatchPayload(payload: any) {
    if (this.readyState === WebSocket.OPEN) {
      const msgEvent = new MessageEvent('message', { data: JSON.stringify(payload) });
      this.dispatchEvent(msgEvent);
      if (this.onmessage) this.onmessage(msgEvent);
    }
  }
}

// Broadcasts an event to all open tabs and mock sockets
function broadcastLiveEvent(event: any) {
  if (liveChannel) {
    liveChannel.postMessage(event);
  }
}

// Intercepts window.WebSocket
if (typeof window !== 'undefined') {
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = function (url: string | URL, protocols?: string | string[]) {
    const urlStr = url.toString();
    if (urlStr.includes('/ws/live') || urlStr.includes('/api/speech') || urlStr.startsWith('ws:')) {
      return new MockWebSocket(urlStr) as any;
    }
    return new OriginalWebSocket(url, protocols);
  } as any;
  (window.WebSocket as any).OPEN = OriginalWebSocket.OPEN;
  (window.WebSocket as any).CONNECTING = OriginalWebSocket.CONNECTING;
  (window.WebSocket as any).CLOSING = OriginalWebSocket.CLOSING;
  (window.WebSocket as any).CLOSED = OriginalWebSocket.CLOSED;
}

// JSON response factory
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Parse request body safely
async function parseBody(req: Request) {
  try {
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

/**
 * Setup client-side fetch interceptor for all /api/* routes
 */
export function setupMockBackend() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let urlStr = '';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else if (input && typeof (input as Request).url === 'string') {
      urlStr = (input as Request).url;
    }

    // Only intercept /api/*
    if (!urlStr.includes('/api/')) {
      return originalFetch(input, init);
    }

    const method = (init?.method || 'GET').toUpperCase();
    const url = new URL(urlStr, window.location.origin);
    const path = url.pathname;

    // Simulate minor network latency for snappy realistic feel
    await new Promise(r => setTimeout(r, 40));

    // --- 1. AUTH & ONBOARDING ---
    if (path === '/api/auth/login' || path === '/api/auth/register' || path === '/api/onboarding/register') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const role = body.role || 'teacher';
      const name = body.full_name || (role === 'teacher' ? 'Anita Sharma' : 'Aarav Sharma');
      const email = body.email || `${role}@setu.edu.in`;
      return jsonResponse({
        access_token: `dummy-setu-token-${role}`,
        token_type: 'bearer',
        role,
        user_id: `user-${role}-demo`,
        full_name: name,
        email,
        school_id: 'school-pmshri-501218',
        onboarding_completed: true
      });
    }

    if (path === '/api/auth/me') {
      return jsonResponse({
        id: 'demo-teacher-anita',
        email: 'teacher.anita@setu.edu.in',
        full_name: 'Anita Sharma',
        role: 'teacher',
        school_id: 'school-pmshri-501218',
        onboarding_completed: true,
        created_at: new Date().toISOString()
      });
    }

    if (path === '/api/onboarding/profile') {
      return jsonResponse({
        id: 'user-demo-profile',
        email: 'learner@setu.edu.in',
        full_name: 'Learner Demo',
        role: 'student',
        school_id: 'school-pmshri-501218',
        onboarding_completed: true,
        disability_profiles: [
          {
            id: 'dp-1',
            user_id: 'user-demo-profile',
            disability_type: 'hearing',
            severity: 'moderate',
            preferences_json: '{"captions": true, "visual_cues": true}',
            created_at: new Date().toISOString()
          }
        ],
        created_at: new Date().toISOString()
      });
    }

    // --- 2. CLASSROOMS ---
    if (path === '/api/classes') {
      if (method === 'GET') {
        return jsonResponse(classes);
      }
      if (method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const newClass: ClassRoom = {
          id: `class-${Date.now()}`,
          name: body.name || 'New Class',
          grade: body.grade || 'Class 6',
          subject: body.subject || 'General Studies',
          section: body.section || 'A',
          teacher_id: 'demo-teacher-anita',
          created_at: new Date().toISOString(),
          lesson_count: 0
        };
        classes = [newClass, ...classes];
        setStored('classes', classes);
        return jsonResponse(newClass, 201);
      }
    }

    if (path.startsWith('/api/classes/')) {
      const classId = path.replace('/api/classes/', '');
      if (method === 'PUT') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        classes = classes.map(c => (c.id === classId ? { ...c, ...body } : c));
        setStored('classes', classes);
        const updated = classes.find(c => c.id === classId);
        return jsonResponse(updated || {});
      }
      if (method === 'DELETE') {
        classes = classes.filter(c => c.id !== classId);
        setStored('classes', classes);
        return jsonResponse({ message: 'Classroom deleted' });
      }
    }

    // --- 3. LESSONS ---
    if (path === '/api/lessons') {
      if (method === 'GET') {
        const classId = url.searchParams.get('class_id');
        if (classId) {
          const filtered = lessons.filter(l => l.class_id === classId);
          return jsonResponse(filtered);
        }
        return jsonResponse(lessons);
      }
      if (method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const newLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          class_id: body.class_id || (classes[0] ? classes[0].id : 'class-6a'),
          title: body.title || 'Untitled Inclusive Lesson',
          subject: body.subject || 'General Science',
          grade: body.grade || 'Class 6',
          summary: body.summary || 'Adaptive multimodal lesson',
          language: body.language || 'en',
          is_published: true,
          created_at: new Date().toISOString(),
          sections: (body.sections || []).map((sec: any, idx: number) => ({
            id: `sec-${Date.now()}-${idx}`,
            order_index: idx,
            title: sec.title || `Section ${idx + 1}`,
            content_text: sec.content_text || '',
            simplified_text: sec.simplified_text || sec.content_text || '',
            key_terms: sec.key_terms || '',
            image_url: sec.image_url,
            image_alt: sec.image_alt,
            image_pedagogical_description: sec.image_pedagogical_description
          }))
        };
        lessons = [newLesson, ...lessons];
        setStored('lessons', lessons);
        return jsonResponse(newLesson, 201);
      }
    }

    if (path === '/api/lessons/published') {
      return jsonResponse(lessons.filter(l => l.is_published));
    }

    if (path === '/api/lessons/import-text') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const rawText: string = body.raw_text || '';
      const paragraphs = rawText.split('\n\n').filter(p => p.trim());
      const sections: LessonSection[] = (paragraphs.length ? paragraphs : [rawText]).map((p, idx) => {
        const lines = p.split('\n');
        const title = lines[0].startsWith('#') ? lines[0].replace(/^#+\s*/, '') : (lines.length > 1 ? lines[0] : `Section ${idx + 1}`);
        const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : p;
        return {
          id: `sec-imp-${Date.now()}-${idx}`,
          order_index: idx,
          title,
          content_text: content || p,
          simplified_text: content || p,
          key_terms: 'Key concepts, Vocabulary'
        };
      });

      const newLesson: Lesson = {
        id: `lesson-imp-${Date.now()}`,
        class_id: body.class_id || (classes[0] ? classes[0].id : 'class-6a'),
        title: body.title || 'Imported Lesson',
        subject: body.subject || 'General Studies',
        grade: body.grade || 'Class 6',
        summary: rawText.slice(0, 150) + '...',
        language: body.language || 'en',
        is_published: true,
        created_at: new Date().toISOString(),
        sections
      };
      lessons = [newLesson, ...lessons];
      setStored('lessons', lessons);
      return jsonResponse(newLesson, 201);
    }

    // Accessible Lesson Studio File Upload Mock
    if (path === '/api/lessons/studio/upload') {
      const uploadResult: StudioUploadResult = {
        filename: 'curriculum_sample.pdf',
        file_type: 'pdf',
        page_count: 1,
        extracted_text: `Photosynthesis is the fundamental biological process by which autotrophic plants synthesize glucose and chemical energy from sunlight, water, and atmospheric carbon dioxide. The primary reaction occurs in the chloroplasts, where chlorophyll pigments absorb photons and drive the electron transport chain, releasing vital oxygen into Earth's atmosphere.`,
        has_text: true,
        ocr_available: true,
        error: null
      };
      return jsonResponse(uploadResult);
    }

    // Accessible Lesson Studio Multimodal Generation Mock
    if (path === '/api/lessons/studio/generate') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const title = body.title || 'Photosynthesis & Plant Energy';
      const text = body.text || 'Plants use sunlight to make food.';

      const generateResult: StudioGenerateResult = {
        title,
        simplified_explanation: 'Plants are like tiny sun-powered kitchens. They use green leaves to catch sunlight, drink water from the soil, and breathe in air to create sweet energy and fresh oxygen for all living things.',
        key_points: [
          'Plants catch sunlight using green leaf pigments called chlorophyll.',
          'Roots absorb water and nutrients from the soil.',
          'Leaves release fresh oxygen into the air for humans and animals to breathe.'
        ],
        vocabulary: [
          { term: 'Chloroplast', definition: 'The tiny green food factory inside plant leaf cells.' },
          { term: 'Chlorophyll', definition: 'The green pigment that traps sunlight.' },
          { term: 'Glucose', definition: 'Natural sugar energy produced by the plant.' }
        ],
        audio_ready_script: `Welcome to today's accessible lesson on ${title}. Plants turn sunlight into food and give us clean oxygen. Let us examine how the leaves capture light step by step.`,
        step_by_step_sections: [
          {
            order_index: 0,
            title: '1. What Plants Need',
            content_text: text,
            simplified_text: 'Plants need three simple ingredients: sunlight, water, and air.',
            key_terms: 'Sunlight, Water, Carbon Dioxide'
          },
          {
            order_index: 1,
            title: '2. The Energy Miracle',
            content_text: 'Inside chloroplasts, photons from light energize molecules to create glucose.',
            simplified_text: 'Leaves act like solar panels, turning warm sunshine into sweet plant energy.',
            key_terms: 'Chloroplast, Photons, Energy'
          }
        ],
        diagram_description: 'A diagram of a green leaf showing golden sunlight rays entering the top, water droplets rising from roots at the bottom, and oxygen bubbles floating away into the sky.',
        provider_used: 'SETU Client-Side Neural Model'
      };
      return jsonResponse(generateResult);
    }

    // Accessible Lesson Studio Publish Mock
    if (path === '/api/lessons/studio/publish') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const newLesson: Lesson = {
        id: `lesson-studio-${Date.now()}`,
        class_id: body.class_id || (classes[0] ? classes[0].id : 'class-6a'),
        title: body.title || 'Studio Accessible Lesson',
        subject: body.subject || 'Science',
        grade: body.grade || 'Class 6',
        summary: body.summary || body.simplified_explanation || 'Adaptive multimodal lesson created in Studio',
        language: body.language || 'en',
        is_published: true,
        created_at: new Date().toISOString(),
        sections: (body.sections || []).map((sec: any, idx: number) => ({
          id: `sec-std-${Date.now()}-${idx}`,
          order_index: idx,
          title: sec.title || `Section ${idx + 1}`,
          content_text: sec.content_text || '',
          simplified_text: sec.simplified_text || sec.content_text,
          key_terms: sec.key_terms || '',
          image_url: sec.image_url,
          image_alt: sec.image_alt,
          image_pedagogical_description: sec.image_pedagogical_description
        }))
      };
      lessons = [newLesson, ...lessons];
      setStored('lessons', lessons);
      return jsonResponse(newLesson, 201);
    }

    if (path.startsWith('/api/lessons/')) {
      const lessonId = path.replace('/api/lessons/', '');
      const lesson = lessons.find(l => l.id === lessonId);
      if (method === 'GET') {
        if (!lesson) return jsonResponse({ detail: 'Lesson not found' }, 404);
        return jsonResponse(lesson);
      }
      if (method === 'PUT') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        lessons = lessons.map(l => (l.id === lessonId ? { ...l, ...body } : l));
        setStored('lessons', lessons);
        const updated = lessons.find(l => l.id === lessonId);
        return jsonResponse(updated || {});
      }
      if (method === 'DELETE') {
        lessons = lessons.filter(l => l.id !== lessonId);
        setStored('lessons', lessons);
        return jsonResponse({ message: 'Lesson deleted' });
      }
    }

    // --- 4. SESSIONS (LIVE CLASSROOM) ---
    if (path === '/api/sessions/start') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const lesson = lessons.find(l => l.id === body.lesson_id) || lessons[0];
      const newSession: LiveSession = {
        id: `session-${Date.now()}`,
        room_code: Math.floor(100000 + Math.random() * 900000).toString(),
        class_id: body.class_id || (classes[0] ? classes[0].id : 'class-6a'),
        lesson_id: lesson?.id,
        teacher_id: 'demo-teacher-anita',
        is_active: true,
        current_section_index: 0,
        started_at: new Date().toISOString(),
        participant_count: 1,
        lesson
      };
      activeSession = newSession;
      setStored('active_session', activeSession);
      broadcastLiveEvent({
        type: 'PARTICIPANT_UPDATE',
        participant_count: 1
      });
      return jsonResponse(newSession, 201);
    }

    if (path === '/api/sessions/join') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const code = (body.room_code || '').trim();

      // If matches active session or any session, return it
      if (activeSession && (activeSession.room_code === code || code === '123456')) {
        activeSession.participant_count += 1;
        setStored('active_session', activeSession);
        broadcastLiveEvent({
          type: 'PARTICIPANT_UPDATE',
          participant_count: activeSession.participant_count
        });
        return jsonResponse({
          session: activeSession,
          lesson: activeSession.lesson || lessons[0]
        });
      }

      // Fallback: create or join session with this code so user is never blocked
      const fallbackSession: LiveSession = {
        id: `session-joined-${code}`,
        room_code: code || '123456',
        class_id: 'class-6a',
        lesson_id: lessons[0]?.id,
        teacher_id: 'demo-teacher-anita',
        is_active: true,
        current_section_index: 0,
        started_at: new Date().toISOString(),
        participant_count: 2,
        lesson: lessons[0]
      };
      activeSession = fallbackSession;
      setStored('active_session', activeSession);
      return jsonResponse({
        session: fallbackSession,
        lesson: fallbackSession.lesson
      });
    }

    if (path.startsWith('/api/sessions/active/')) {
      const sessionId = path.replace('/api/sessions/active/', '');
      if (activeSession && activeSession.id === sessionId) {
        return jsonResponse(activeSession);
      }
      return jsonResponse(
        activeSession || {
          id: sessionId,
          room_code: '123456',
          class_id: 'class-6a',
          is_active: true,
          current_section_index: 0,
          started_at: new Date().toISOString(),
          participant_count: 1,
          lesson: lessons[0]
        }
      );
    }

    if (path.includes('/sync-section')) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      if (activeSession) {
        activeSession.current_section_index = body.section_index || 0;
        setStored('active_session', activeSession);
      }
      broadcastLiveEvent({
        type: 'SECTION_CHANGED',
        current_section_index: body.section_index || 0
      });
      return jsonResponse({ success: true, current_section_index: body.section_index || 0 });
    }

    if (path.includes('/end')) {
      if (activeSession) {
        activeSession.is_active = false;
        activeSession.ended_at = new Date().toISOString();
        setStored('active_session', activeSession);
      }
      broadcastLiveEvent({ type: 'SESSION_ENDED' });
      return jsonResponse({ message: 'Session ended successfully' });
    }

    // --- 5. ANNOUNCEMENTS ---
    if (path === '/api/announcements') {
      if (method === 'GET') {
        return jsonResponse(announcements);
      }
      if (method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const newAnn: Announcement = {
          id: `ann-${Date.now()}`,
          session_id: body.session_id || (activeSession ? activeSession.id : 'session-demo-live'),
          category: body.category || 'General',
          title: body.title || 'Classroom Announcement',
          content: body.content || '',
          priority: body.priority || 'normal',
          created_at: new Date().toISOString()
        };
        announcements = [newAnn, ...announcements];
        setStored('announcements', announcements);
        broadcastLiveEvent({
          type: 'ANNOUNCEMENT_NEW',
          announcement: newAnn
        });
        return jsonResponse(newAnn, 201);
      }
    }

    // --- 6. QUESTIONS (AAC & STUDENT DOUBTS) ---
    if (path === '/api/questions') {
      if (method === 'GET') {
        return jsonResponse(questions);
      }
      if (method === 'POST') {
        const body = init?.body ? JSON.parse(init.body as string) : {};
        const newQ: StudentQuestion = {
          id: `q-${Date.now()}`,
          session_id: body.session_id || (activeSession ? activeSession.id : 'session-demo-live'),
          student_nickname: body.student_nickname || 'Student',
          message_type: body.message_type || 'aac_phrase',
          content: body.content || 'I have a question.',
          status: 'pending',
          created_at: new Date().toISOString()
        };
        questions = [newQ, ...questions];
        setStored('questions', questions);
        broadcastLiveEvent({
          type: 'QUESTION_NEW',
          question: newQ
        });
        return jsonResponse(newQ, 201);
      }
    }

    if (path === '/api/questions/acknowledge') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      questions = questions.map(q => (q.id === body.question_id ? { ...q, status: 'acknowledged' } : q));
      setStored('questions', questions);
      broadcastLiveEvent({
        type: 'QUESTION_ACKNOWLEDGED',
        question_id: body.question_id
      });
      return jsonResponse({ success: true, status: 'acknowledged' });
    }

    if (path === '/api/questions/answer') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      questions = questions.map(q => (q.id === body.question_id ? { ...q, status: 'answered', response_text: body.response_text } : q));
      setStored('questions', questions);
      broadcastLiveEvent({
        type: 'QUESTION_ANSWERED',
        question_id: body.question_id,
        response_text: body.response_text
      });
      return jsonResponse({ success: true, status: 'answered' });
    }

    // Live Student Reaction Broadcast
    if (path === '/api/sessions/reaction') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const reactionPayload = {
        id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        emoji: body.emoji || '💡',
        label: body.label || 'Understood',
        sender: body.sender || 'Student',
        timestamp: Date.now()
      };
      broadcastLiveEvent({
        type: 'REACTION_NEW',
        reaction: reactionPayload
      });
      return jsonResponse({ success: true, reaction: reactionPayload });
    }

    // Live Teacher Comprehension Check-in Poll
    if (path === '/api/sessions/checkin-poll') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const pollPayload = {
        id: `poll-${Date.now()}`,
        question: body.question || 'Quick Check-in: Are you following?',
        options: body.options || ['👍 Yes, clear!', '🤔 Need a quick recap', '✋ Have a question'],
        votes: { 0: 0, 1: 0, 2: 0 },
        totalVotes: 0,
        isOpen: true
      };
      setStored('active_poll', pollPayload);
      broadcastLiveEvent({
        type: 'CHECKIN_POLL_START',
        poll: pollPayload
      });
      return jsonResponse(pollPayload, 201);
    }

    if (path === '/api/sessions/checkin-vote') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const poll = getStored<any>('active_poll', null);
      if (poll) {
        const opt = Number(body.option_index);
        poll.votes = poll.votes || {};
        poll.votes[opt] = (poll.votes[opt] || 0) + 1;
        poll.totalVotes = (poll.totalVotes || 0) + 1;
        setStored('active_poll', poll);
        broadcastLiveEvent({
          type: 'CHECKIN_POLL_VOTE',
          poll_id: body.poll_id,
          option_index: opt,
          votes: poll.votes,
          totalVotes: poll.totalVotes
        });
        return jsonResponse({ success: true, votes: poll.votes, totalVotes: poll.totalVotes });
      }
      return jsonResponse({ success: true });
    }

    if (path === '/api/sessions/checkin-close') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      setStored('active_poll', null);
      broadcastLiveEvent({
        type: 'CHECKIN_POLL_CLOSE',
        poll_id: body.poll_id
      });
      return jsonResponse({ success: true });
    }

    // --- 7. SPEECH & CAPTIONS ---
    if (path === '/api/speech/captions/manual-stream') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const newCap: CaptionSegment = {
        id: `cap-${Date.now()}`,
        session_id: body.session_id || (activeSession ? activeSession.id : 'session-demo-live'),
        segment_index: captions.length,
        text: body.text || '',
        is_corrected: false,
        timestamp_ms: body.timestamp_ms || Date.now(),
        language: body.language || 'en',
        created_at: new Date().toISOString()
      };
      captions = [...captions, newCap];
      setStored('captions', captions);
      broadcastLiveEvent({
        type: 'CAPTION_NEW',
        caption: newCap
      });
      return jsonResponse(newCap);
    }

    if (path === '/api/speech/captions/correct') {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const target = captions.find(c => c.id === body.caption_id);
      if (target) {
        target.text = body.corrected_text;
        target.is_corrected = true;
        setStored('captions', captions);
        broadcastLiveEvent({
          type: 'CAPTION_CORRECTED',
          caption: target
        });
        return jsonResponse(target);
      }
      return jsonResponse({ success: true });
    }

    if (path === '/api/speech/tts') {
      return jsonResponse({ message: 'TTS completed via client audio synthesis' });
    }

    // --- 8. COORDINATOR METRICS ---
    if (path === '/api/coordinator/metrics') {
      const metrics: CoordinatorMetrics = {
        total_teachers: 12,
        total_classes: classes.length,
        total_lessons: lessons.length,
        total_live_sessions: 142,
        active_sessions_now: activeSession && activeSession.is_active ? 1 : 0,
        total_questions_handled: questions.length + 84,
        total_captions_generated: captions.length + 12800,
        sample_school_name: 'PM SHRI Govt Model High School, Shamshabad',
        district: 'Rangareddy',
        state: 'Telangana'
      };
      return jsonResponse(metrics);
    }

    if (path === '/api/coordinator/teachers') {
      return jsonResponse([
        {
          id: 'demo-teacher-anita',
          full_name: 'Anita Sharma',
          email: 'teacher.anita@setu.edu.in',
          role: 'teacher',
          class_count: 3,
          lesson_count: 5,
          live_hours: 48.5
        },
        {
          id: 'demo-teacher-rajesh',
          full_name: 'Rajesh Kumar',
          email: 'teacher.rajesh@setu.edu.in',
          role: 'teacher',
          class_count: 2,
          lesson_count: 4,
          live_hours: 32.0
        }
      ]);
    }

    // Default fallback for any unhandled /api/*
    return jsonResponse({ message: 'Success', status: 'ok' });
  };
}
