import { defaultModules } from '../data/courses.js';

export class ApiError extends Error {
  constructor(message, status = 500, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const STATE_KEY = 'djangue.state.v1';
// Keys used by the previous account-based version, read once to migrate data.
const LEGACY_KEYS = {
  session: 'djangue.session.v1',
  progress: 'djangue.progress.v1',
  attempts: 'djangue.attempts.v1',
};

const LOCAL_PROFILE_ID = 'local-profile';
const LEGACY_GUEST_ID = 'guest-local';

const memory = new Map();
let initialization;

function clone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function read(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return JSON.parse(value);
  } catch {
    if (memory.has(key)) return clone(memory.get(key));
  }
  return clone(fallback);
}

function write(key, value) {
  const serialized = JSON.stringify(value);
  memory.set(key, clone(value));
  try {
    window.localStorage.setItem(key, serialized);
  } catch {
    // The memory fallback keeps the app usable when storage is disabled.
  }
}

function fail(status, message, field) {
  throw new ApiError(message, status, field ? { field } : {});
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function now() {
  return new Date().toISOString();
}

function normalizeModule(course, courseIndex = 0) {
  return {
    ...course,
    orderIndex: course.orderIndex ?? courseIndex + 1,
    published: course.published !== false,
    chapters: (course.chapters || []).map((chapter, chapterIndex) => ({
      ...chapter,
      orderIndex: chapterIndex + 1,
      questions: (chapter.questions || []).map((question, questionIndex) => ({
        ...question,
        id: `quiz-${chapter.slug}-q${questionIndex + 1}`,
        orderIndex: questionIndex + 1,
        type: question.type || (question.options?.length === 2 && question.options.every((option) => ['Vrai', 'Faux'].includes(option)) ? 'boolean' : 'mcq'),
      })),
    })),
    final: (course.final || []).map((question, questionIndex) => ({
      ...question,
      id: `final-${course.slug}-q${questionIndex + 1}`,
      orderIndex: questionIndex + 1,
      type: question.type || (question.options?.length === 2 && question.options.every((option) => ['Vrai', 'Faux'].includes(option)) ? 'boolean' : 'mcq'),
    })),
  };
}

function defaultProfile() {
  return {
    id: LOCAL_PROFILE_ID,
    name: 'Apprenant Djangue',
    bio: 'Je découvre les fondamentaux du développement web et des outils de modélisation.',
    avatar: null,
    createdAt: now(),
  };
}

function defaultProgress() {
  return { [LOCAL_PROFILE_ID]: {} };
}

function seedState() {
  return {
    profile: defaultProfile(),
    courses: defaultModules.map((course, index) => normalizeModule(course, index)),
    progress: defaultProgress(),
    attempts: [],
  };
}

// Rebuilds the state from a previous account-based version so no progress is lost.
function migrateState(previous) {
  const legacySessionId = read(LEGACY_KEYS.session, null);
  const legacyUser = (previous.users || []).find((user) => user.id === legacySessionId)
    || (previous.users || []).find((user) => user.role !== 'admin')
    || (previous.users || [])[0]
    || null;

  const profile = legacyUser
    ? {
      id: LOCAL_PROFILE_ID,
      name: legacyUser.name || defaultProfile().name,
      bio: legacyUser.bio ?? defaultProfile().bio,
      avatar: legacyUser.avatar ?? null,
      createdAt: legacyUser.createdAt || now(),
    }
    : defaultProfile();

  const rawProgress = { ...(previous.progress || {}), ...(read(LEGACY_KEYS.progress, {}) || {}) };
  const owned = { ...(rawProgress[LEGACY_GUEST_ID] || {}), ...(rawProgress[legacyUser?.id] || {}), ...(rawProgress[LOCAL_PROFILE_ID] || {}) };

  const rawAttempts = [...(previous.attempts || []), ...(read(LEGACY_KEYS.attempts, []) || [])];
  const seen = new Set();
  const attempts = rawAttempts
    .filter((attempt) => attempt && (attempt.userId === LEGACY_GUEST_ID || !attempt.userId || attempt.userId === legacyUser?.id || attempt.userId === LOCAL_PROFILE_ID))
    .filter((attempt) => {
      const key = attempt.id || `${attempt.quizId}-${attempt.createdAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((attempt) => ({ ...attempt, userId: LOCAL_PROFILE_ID }));

  return {
    profile,
    courses: Array.isArray(previous.courses) && previous.courses.length
      ? previous.courses.map((course, index) => normalizeModule(course, index))
      : seedState().courses,
    progress: { [LOCAL_PROFILE_ID]: owned },
    attempts,
  };
}

async function ensureState() {
  if (!initialization) {
    initialization = (async () => {
      const previous = read(STATE_KEY, null);
      if (previous && Array.isArray(previous.courses)) {
        const migrated = previous.profile
          ? { progress: defaultProgress(), attempts: [], ...previous }
          : migrateState(previous);
        write(STATE_KEY, migrated);
        return migrated;
      }
      const initial = seedState();
      write(STATE_KEY, initial);
      return initial;
    })().catch((error) => {
      // A rejected promise must not poison every later request.
      initialization = undefined;
      throw error;
    });
  }
  return initialization;
}

function state() {
  return read(STATE_KEY, null) || { profile: defaultProfile(), courses: [], progress: defaultProgress(), attempts: [] };
}

function saveState(next) {
  write(STATE_KEY, next);
}

// The single local profile. There is no account, so this never fails.
function localProfile() {
  const current = state();
  if (!current.profile) {
    const next = { ...current, profile: defaultProfile() };
    saveState(next);
    return next.profile;
  }
  return current.profile;
}

function userProgress() {
  return state().progress?.[LOCAL_PROFILE_ID] || {};
}

function getAttempts() {
  return (state().attempts || []).slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function courseSummary(course) {
  const progress = userProgress();
  const completedChapters = course.chapters.filter((chapter) => progress[chapter.id]).length;
  return {
    id: course.id,
    slug: course.slug,
    technology: course.technology,
    title: course.title,
    shortDescription: course.shortDescription,
    description: course.description,
    level: course.level,
    durationMinutes: course.duration,
    icon: course.icon,
    accent: course.accent,
    orderIndex: course.orderIndex,
    published: course.published !== false,
    totalChapters: course.chapters.length,
    completedChapters,
    progress: course.chapters.length ? Math.round((completedChapters / course.chapters.length) * 100) : 0,
  };
}

function chapterQuiz(course, chapter) {
  if (!chapter.questions?.length) return null;
  return {
    id: `quiz-${chapter.slug}`,
    title: `Quiz · ${chapter.title}`,
    description: 'Validez les notions essentielles de cette leçon.',
    kind: 'chapter',
    passScore: 70,
  };
}

function finalQuiz(course) {
  if (!course.final?.length) return null;
  return {
    id: `final-${course.slug}`,
    title: `Évaluation finale · ${course.title}`,
    description: 'Une synthèse chronométrée pour valider le module.',
    kind: 'module',
    passScore: 70,
  };
}

function findCourseById(courseId) {
  return state().courses.find((course) => course.id === courseId);
}

function findQuiz(quizId) {
  for (const course of state().courses) {
    const final = finalQuiz(course);
    if (final?.id === quizId) return { quiz: final, course, chapter: null };
    for (const chapter of course.chapters) {
      const quiz = chapterQuiz(course, chapter);
      if (quiz?.id === quizId) return { quiz, course, chapter };
    }
  }
  return null;
}

function bestAttemptFor(quizId) {
  return getAttempts()
    .filter((attempt) => attempt.quizId === quizId)
    .sort((a, b) => b.score - a.score)[0] || null;
}

function bestAttemptView(attempt) {
  if (!attempt) return null;
  const { id, score, total, passed, createdAt } = attempt;
  return { id, score, total, passed, createdAt };
}

function chapterViews(course) {
  const progress = userProgress();
  return course.chapters.map((chapter) => {
    const quiz = chapterQuiz(course, chapter);
    return {
      ...chapter,
      durationMinutes: chapter.duration,
      completed: Boolean(progress[chapter.id]),
      quiz: quiz ? { ...quiz, bestAttempt: bestAttemptView(bestAttemptFor(quiz.id)) } : null,
    };
  });
}

function courseDetail(course, chapters) {
  const final = finalQuiz(course);
  return {
    ...courseSummary(course),
    totalChapters: chapters.length,
    completedChapters: chapters.filter((chapter) => chapter.completed).length,
    finalQuiz: final ? { ...final, bestAttempt: bestAttemptView(bestAttemptFor(final.id)) } : null,
  };
}

function attemptView(attempt) {
  const context = findQuiz(attempt.quizId);
  if (!context) return null;
  return {
    id: attempt.id,
    quizId: attempt.quizId,
    title: context.quiz.title,
    kind: context.quiz.kind,
    score: attempt.score,
    total: attempt.total,
    passed: attempt.passed,
    createdAt: attempt.createdAt,
    courseTitle: context.course.title,
    courseSlug: context.course.slug,
    accent: context.course.accent,
    chapterTitle: context.chapter?.title || 'Évaluation finale',
  };
}

// The identifier is derived from the attempt so the dashboard list and the quiz
// result screen always show the same certificate id.
function certificateView(course, attempt) {
  const suffix = String(attempt.id).replace('attempt-', '').toUpperCase().slice(-6);
  return {
    id: `DJG-${String(course.id).replace('course-', '').toUpperCase()}-${suffix}`,
    courseTitle: course.title,
    courseSlug: course.slug,
    accent: course.accent,
    issuedAt: attempt.createdAt,
  };
}

// Whitelists the writable course fields so summary-only keys never leak into storage.
function readCourseInput(body = {}, fallback = {}) {
  const text = (field) => (body[field] === undefined ? fallback[field] : String(body[field]).trim());
  const duration = body.durationMinutes ?? body.duration;
  return {
    title: text('title'),
    technology: text('technology'),
    shortDescription: text('shortDescription'),
    description: text('description'),
    level: text('level'),
    icon: text('icon'),
    accent: text('accent'),
    published: body.published === undefined ? fallback.published : body.published !== false,
    duration: duration === undefined ? fallback.duration : Number(duration),
  };
}

async function routeGet(path) {
  await ensureState();
  localProfile();

  if (path === '/profile' || path === '/users/profile') return { user: state().profile };

  if (path === '/courses') {
    return { courses: state().courses.filter((course) => course.published !== false).map(courseSummary) };
  }

  if (path === '/dashboard') {
    const courses = state().courses.filter((course) => course.published !== false).map(courseSummary);
    const allChapters = courses.reduce((sum, course) => sum + course.totalChapters, 0);
    const completedChapters = courses.reduce((sum, course) => sum + course.completedChapters, 0);
    const attempts = getAttempts();
    const recentAttempts = attempts.slice(0, 6).map(attemptView).filter(Boolean);
    const certificates = attempts
      .map((attempt) => ({ attempt, context: findQuiz(attempt.quizId) }))
      .filter(({ attempt, context }) => attempt.passed && context?.quiz.kind === 'module')
      .map(({ attempt, context }) => certificateView(context.course, attempt));
    const startedCourses = courses.filter((course) => course.progress > 0 && course.progress < 100);
    return {
      summary: { totalCourses: courses.length, totalChapters: allChapters, completedChapters, passedAttempts: attempts.filter((attempt) => attempt.passed).length, totalAttempts: attempts.length, progress: allChapters ? Math.round((completedChapters / allChapters) * 100) : 0 },
      continueCourse: startedCourses[0] || courses[0] || null,
      courses,
      recentAttempts,
      certificates,
    };
  }

  if (path === '/quizzes/attempts') {
    return { attempts: getAttempts().map(attemptView).filter(Boolean) };
  }

  if (path === '/users/profile') {
    return { user: state().profile };
  }

  if (path === '/admin/courses') {
    return { courses: state().courses.map((course) => ({ ...courseSummary(course), chapterCount: course.chapters.length, quizCount: course.chapters.filter((chapter) => chapter.questions?.length).length + (course.final?.length ? 1 : 0) })) };
  }

  // Admin detail: also serves unpublished modules, unlike the public course route.
  const adminCourseMatch = path.match(/^\/admin\/courses\/([^/]+)$/);
  if (adminCourseMatch) {
    const course = findCourseById(decodeURIComponent(adminCourseMatch[1]));
    if (!course) fail(404, 'Module introuvable.');
    const chapters = chapterViews(course);
    return { course: courseDetail(course, chapters), chapters };
  }

  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    const course = state().courses.find((item) => item.slug === decodeURIComponent(courseMatch[1]) && item.published !== false);
    if (!course) fail(404, 'Module introuvable.');
    const chapters = chapterViews(course);
    return { course: courseDetail(course, chapters), chapters };
  }

  const quizMatch = path.match(/^\/quizzes\/([^/]+)$/);
  if (quizMatch) {
    const context = findQuiz(decodeURIComponent(quizMatch[1]));
    if (!context) fail(404, 'Quiz introuvable.');
    const questions = context.chapter ? context.chapter.questions : context.course.final;
    const history = getAttempts().filter((attempt) => attempt.quizId === context.quiz.id).slice(0, 5);
    return { quiz: { ...context.quiz, chapterId: context.chapter?.id || null, courseId: context.course.id, courseTitle: context.course.title, courseSlug: context.course.slug, accent: context.course.accent, chapterTitle: context.chapter?.title || null, questions: questions.map((question) => ({ id: question.id, type: question.type, prompt: question.prompt, options: question.options, orderIndex: question.orderIndex })), history: history.map((attempt) => ({ id: attempt.id, score: attempt.score, total: attempt.total, passed: attempt.passed, createdAt: attempt.createdAt })) } };
  }

  fail(404, 'Point de terminaison introuvable.');
}

async function routePost(path, body = {}) {
  await ensureState();
  localProfile();

  const attemptMatch = path.match(/^\/quizzes\/([^/]+)\/attempts$/);
  if (attemptMatch) {
    const context = findQuiz(attemptMatch[1]);
    if (!context) fail(404, 'Quiz introuvable.');
    const questions = context.chapter ? context.chapter.questions : context.course.final;
    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    const results = questions.map((question) => {
      const selectedIndex = Number(answers[question.id]);
      const hasAnswer = Number.isInteger(selectedIndex) && selectedIndex >= 0;
      return { questionId: question.id, selectedIndex: hasAnswer ? selectedIndex : null, correctIndex: question.correct, correct: hasAnswer && selectedIndex === question.correct, explanation: question.explanation };
    });
    const correctCount = results.filter((result) => result.correct).length;
    const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;
    const passed = score >= context.quiz.passScore;
    const attempt = { id: id('attempt'), userId: LOCAL_PROFILE_ID, quizId: context.quiz.id, score, total: questions.length, passed, answers, createdAt: now() };
    const current = state();
    saveState({ ...current, attempts: [...(current.attempts || []), attempt] });
    const certificate = passed && context.quiz.kind === 'module'
      ? certificateView(context.course, attempt)
      : null;
    return { attempt: { id: attempt.id, quizId: attempt.quizId, quizTitle: context.quiz.title, score, total: questions.length, correctCount, passed, passScore: context.quiz.passScore, createdAt: attempt.createdAt, results }, certificate };
  }

  if (path === '/admin/courses') {
    const current = state();
    const input = readCourseInput(body, { title: '', technology: '', shortDescription: '', description: '', level: 'Débutant', icon: 'code-2', accent: '#00ff9d', published: true, duration: 120 });
    if (!input.title || !input.technology || !input.shortDescription || !input.description) fail(400, 'Les informations essentielles du module sont obligatoires.');
    let slug = slugify(body.slug || input.title);
    if (current.courses.some((course) => course.slug === slug)) slug = `${slug}-${Date.now().toString(36).slice(-5)}`;
    const course = { id: id('course'), orderIndex: current.courses.length + 1, chapters: [], final: [], ...input, slug };
    saveState({ ...current, courses: [...current.courses, course] });
    return { course, message: 'Module créé.' };
  }

  const adminChapterMatch = path.match(/^\/admin\/courses\/([^/]+)\/chapters$/);
  if (adminChapterMatch) {
    const current = state();
    const course = current.courses.find((item) => item.id === adminChapterMatch[1]);
    if (!course) fail(404, 'Module introuvable.');
    if (!String(body.title || '').trim() || !String(body.summary || '').trim() || !String(body.content || '').trim()) fail(400, 'Le titre, le résumé et le contenu sont obligatoires.');
    const chapter = { id: id('chapter'), slug: slugify(body.slug || body.title), title: String(body.title).trim(), summary: String(body.summary).trim(), content: String(body.content).trim(), code: String(body.code || ''), language: String(body.language || 'text').toLowerCase(), duration: Number(body.durationMinutes || 30), questions: [] };
    const updated = { ...course, chapters: [...course.chapters, chapter] };
    saveState({ ...current, courses: current.courses.map((item) => item.id === course.id ? updated : item) });
    return { chapter, message: 'Chapitre créé.' };
  }

  fail(404, 'Point de terminaison introuvable.');
}

async function routePatch(path, body = {}) {
  await ensureState();
  const profile = localProfile();

  const progressMatch = path.match(/^\/courses\/([^/]+)\/chapters\/([^/]+)\/progress$/);
  if (progressMatch) {
    const course = findCourseById(progressMatch[1]);
    const chapter = course?.chapters.find((item) => item.id === progressMatch[2]);
    if (!course || !chapter) fail(404, 'Chapitre introuvable.');
    const current = state();
    const completed = Boolean(body.completed);
    saveState({ ...current, progress: { ...(current.progress || {}), [LOCAL_PROFILE_ID]: { ...(current.progress?.[LOCAL_PROFILE_ID] || {}), [chapter.id]: completed } } });
    return { completed, courseProgress: courseSummary(course).progress };
  }

  if (path === '/users/profile' || path === '/profile') {
    const name = String(body.name ?? profile.name).trim();
    const bio = String(body.bio ?? profile.bio ?? '').trim();
    const avatar = body.avatar === null ? null : String(body.avatar ?? profile.avatar ?? '').trim() || null;
    if (name.length < 2 || name.length > 80) fail(400, 'Le nom doit contenir entre 2 et 80 caractères.', 'name');
    if (bio.length > 240) fail(400, 'La bio ne peut pas dépasser 240 caractères.', 'bio');
    if (avatar && (!/^data:image\/(png|jpeg|webp);base64,/.test(avatar) || avatar.length > 600000)) fail(400, 'L’avatar doit être une image PNG, JPEG ou WebP de moins de 450 Ko.', 'avatar');
    const updated = { ...profile, name, bio, avatar };
    saveState({ ...state(), profile: updated });
    return { user: updated, message: 'Profil mis à jour.' };
  }

  const courseMatch = path.match(/^\/admin\/courses\/([^/]+)$/);
  if (courseMatch) {
    const current = state();
    const existing = current.courses.find((course) => course.id === courseMatch[1]);
    if (!existing) fail(404, 'Module introuvable.');
    const changes = readCourseInput(body, {});
    if (changes.title !== undefined && !changes.title) fail(400, 'Le titre du module ne peut pas être vide.', 'title');
    const defined = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined));
    const updated = { ...existing, ...defined, id: existing.id, slug: slugify(body.slug || changes.title || existing.slug) };
    saveState({ ...current, courses: current.courses.map((course) => course.id === existing.id ? updated : course) });
    return { course: updated, message: 'Module mis à jour.' };
  }

  const chapterMatch = path.match(/^\/admin\/chapters\/([^/]+)$/);
  if (chapterMatch) {
    const current = state();
    const course = current.courses.find((item) => item.chapters.some((chapter) => chapter.id === chapterMatch[1]));
    if (!course) fail(404, 'Chapitre introuvable.');
    const oldChapter = course.chapters.find((chapter) => chapter.id === chapterMatch[1]);
    const updatedChapter = { ...oldChapter, ...body, id: oldChapter.id, slug: slugify(body.slug || body.title || oldChapter.slug), duration: Number(body.durationMinutes ?? oldChapter.duration) };
    saveState({ ...current, courses: current.courses.map((item) => item.id === course.id ? { ...item, chapters: item.chapters.map((chapter) => chapter.id === oldChapter.id ? updatedChapter : chapter) } : item) });
    return { chapter: updatedChapter, message: 'Chapitre mis à jour.' };
  }

  fail(404, 'Point de terminaison introuvable.');
}

async function routeDelete(path) {
  await ensureState();
  localProfile();

  const courseMatch = path.match(/^\/admin\/courses\/([^/]+)$/);
  if (courseMatch) {
    const current = state();
    const courses = current.courses.filter((course) => course.id !== courseMatch[1]);
    if (courses.length === current.courses.length) fail(404, 'Module introuvable.');
    saveState({ ...current, courses });
    return null;
  }
  const chapterMatch = path.match(/^\/admin\/chapters\/([^/]+)$/);
  if (chapterMatch) {
    const current = state();
    let found = false;
    const courses = current.courses.map((course) => {
      if (!course.chapters.some((chapter) => chapter.id === chapterMatch[1])) return course;
      found = true;
      return { ...course, chapters: course.chapters.filter((chapter) => chapter.id !== chapterMatch[1]) };
    });
    if (!found) fail(404, 'Chapitre introuvable.');
    saveState({ ...current, courses });
    return null;
  }
  fail(404, 'Point de terminaison introuvable.');
}

export const api = {
  async get(path) { return routeGet(path); },
  async post(path, body) { return routePost(path, body); },
  async patch(path, body) { return routePatch(path, body); },
  async delete(path) { return routeDelete(path); },
};

export function resetLocalData() {
  try {
    [STATE_KEY, ...Object.values(LEGACY_KEYS)].forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore unavailable storage.
  }
  memory.clear();
  initialization = undefined;
}
