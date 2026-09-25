import { defaultModules } from '../data/courses.js';

export class ApiError extends Error {
  constructor(message, status = 500, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const STORAGE = {
  session: 'djangue.session.v1',
  progress: 'djangue.progress.v1',
  attempts: 'djangue.attempts.v1',
};

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
    // The memory fallback keeps the demo usable when storage is disabled.
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

async function hashPassword(value) {
  const source = new TextEncoder().encode(String(value));
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', source);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  let hash = 2166136261;
  for (const byte of source) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return `local-${(hash >>> 0).toString(16)}`;
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

function seedState() {
  const users = [
    { id: 'user-admin', name: 'Administrateur Djangue', email: 'admin@djangue.dev', role: 'admin', bio: 'Compte administrateur de la plateforme.', avatar: null, createdAt: now() },
    { id: 'user-student', name: 'Camille Diallo', email: 'student@djangue.dev', role: 'student', bio: 'Apprenante en développement web et outils de modélisation.', avatar: null, createdAt: now() },
  ];
  return {
    users: users.map((user) => ({ ...user })),
    courses: defaultModules.map((course, index) => normalizeModule(course, index)),
    progress: {},
    attempts: [],
  };
}

async function ensureState() {
  if (!initialization) {
    initialization = (async () => {
      const state = read('djangue.state.v1', null);
      if (state?.users && state?.courses) {
        const migrated = { progress: {}, attempts: [], ...state };
        write('djangue.state.v1', migrated);
        return migrated;
      }

      const users = seedState().users;
      const initial = {
        users: await Promise.all(users.map(async (user) => ({
          ...user,
          passwordHash: user.role === 'admin' ? await hashPassword('DjangueAdmin2026!') : await hashPassword('DjangueStudent2026!'),
        }))),
        courses: seedState().courses,
        progress: read(STORAGE.progress, {}),
        attempts: read(STORAGE.attempts, []),
      };
      write('djangue.state.v1', initial);
      return initial;
    })();
  }
  return initialization;
}

function state() {
  return read('djangue.state.v1', null) || { users: [], courses: [], progress: {}, attempts: [] };
}

function saveState(next) {
  write('djangue.state.v1', next);
}

const GUEST_ID = 'guest-local';

function currentUser() {
  const sessionId = read(STORAGE.session, null);
  if (!sessionId) return null;
  return state().users.find((user) => user.id === sessionId) || null;
}

function courseUser() {
  return currentUser() || { id: GUEST_ID, name: 'Visiteur', email: null, role: 'guest', bio: '', avatar: null, createdAt: now() };
}

function mergeGuestData(userId) {
  const current = state();
  const guestProgress = current.progress?.[GUEST_ID];
  const guestAttempts = (current.attempts || []).filter((attempt) => attempt.userId === GUEST_ID);
  if ((!guestProgress || Object.keys(guestProgress).length === 0) && guestAttempts.length === 0) return;

  const progress = { ...(current.progress || {}) };
  progress[userId] = { ...(guestProgress || {}), ...(progress[userId] || {}) };
  const attempts = [
    ...(current.attempts || []).filter((attempt) => attempt.userId !== GUEST_ID),
    ...guestAttempts.map((attempt) => ({ ...attempt, userId })),
  ];
  saveState({ ...current, progress, attempts });
}

function requireCourseUser() {
  return courseUser();
}

function requireUser() {
  const user = currentUser();
  if (!user) fail(401, 'Authentification requise.');
  return user;
}

function requireAdmin() {
  const user = requireUser();
  if (user.role !== 'admin') fail(403, 'Accès réservé aux administrateurs.');
  return user;
}

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function userProgress(userId) {
  return state().progress?.[userId] || {};
}

function courseSummary(course, userId = null) {
  const progress = userId ? userProgress(userId) : {};
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

function getAttempts(userId) {
  return state().attempts.filter((attempt) => attempt.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function validatePassword(password) {
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    fail(400, 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.', 'password');
  }
}

async function routeGet(path) {
  await ensureState();
  if (path === '/auth/me') return { user: publicUser(currentUser()) };
  if (path === '/courses') {
    const user = courseUser();
    return { courses: state().courses.filter((course) => course.published !== false).map((course) => courseSummary(course, user.id)) };
  }
  if (path === '/dashboard') {
    const user = requireUser();
    const courses = state().courses.filter((course) => course.published !== false).map((course) => courseSummary(course, user.id));
    const allChapters = courses.reduce((sum, course) => sum + course.totalChapters, 0);
    const completedChapters = courses.reduce((sum, course) => sum + course.completedChapters, 0);
    const attempts = getAttempts(user.id);
    const recentAttempts = attempts.slice(0, 6).map(attemptView).filter(Boolean);
    const certificates = attempts.filter((attempt) => attempt.passed && findQuiz(attempt.quizId)?.quiz.kind === 'module').map((attempt, index) => {
      const context = findQuiz(attempt.quizId);
      return { id: `DJG-${context.course.id.replace('course-', '').toUpperCase()}-${index + 1}`, courseTitle: context.course.title, courseSlug: context.course.slug, accent: context.course.accent, issuedAt: attempt.createdAt };
    });
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
    const user = requireUser();
    return { attempts: getAttempts(user.id).map(attemptView).filter(Boolean) };
  }
  if (path === '/users/profile') return { user: publicUser(requireUser()) };
  if (path === '/admin/courses') {
    requireAdmin();
    return { courses: state().courses.map((course) => ({ ...courseSummary(course), chapterCount: course.chapters.length, quizCount: course.chapters.filter((chapter) => chapter.questions?.length).length + (course.final?.length ? 1 : 0) })) };
  }

  const courseMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseMatch) {
    const course = state().courses.find((item) => item.slug === decodeURIComponent(courseMatch[1]) && item.published !== false);
    if (!course) fail(404, 'Module introuvable.');
    const user = courseUser();
    const progress = userProgress(user.id);
    const attempts = getAttempts(user.id);
    const chapters = course.chapters.map((chapter) => {
      const quiz = chapterQuiz(course, chapter);
      const bestAttempt = quiz ? attempts.filter((attempt) => attempt.quizId === quiz.id).sort((a, b) => b.score - a.score)[0] : null;
      return { ...chapter, durationMinutes: chapter.duration, completed: Boolean(progress[chapter.id]), quiz: quiz ? { ...quiz, bestAttempt: bestAttempt ? { id: bestAttempt.id, score: bestAttempt.score, total: bestAttempt.total, passed: bestAttempt.passed, createdAt: bestAttempt.createdAt } : null } : null };
    });
    const completed = chapters.filter((chapter) => chapter.completed).length;
    const final = finalQuiz(course);
    const bestFinal = final ? attempts.filter((attempt) => attempt.quizId === final.id).sort((a, b) => b.score - a.score)[0] : null;
    return { course: { ...courseSummary(course, user?.id), totalChapters: chapters.length, completedChapters: completed, finalQuiz: final ? { ...final, bestAttempt: bestFinal ? { id: bestFinal.id, score: bestFinal.score, total: bestFinal.total, passed: bestFinal.passed, createdAt: bestFinal.createdAt } : null } : null }, chapters };
  }

  const quizMatch = path.match(/^\/quizzes\/([^/]+)$/);
  if (quizMatch) {
    const user = requireCourseUser();
    const context = findQuiz(decodeURIComponent(quizMatch[1]));
    if (!context) fail(404, 'Quiz introuvable.');
    const questions = context.chapter ? context.chapter.questions : context.course.final;
    const history = getAttempts(user.id).filter((attempt) => attempt.quizId === context.quiz.id).slice(0, 5);
    return { quiz: { ...context.quiz, chapterId: context.chapter?.id || null, courseId: context.course.id, courseTitle: context.course.title, courseSlug: context.course.slug, accent: context.course.accent, chapterTitle: context.chapter?.title || null, questions: questions.map((question) => ({ id: question.id, type: question.type, prompt: question.prompt, options: question.options, orderIndex: question.orderIndex })), history: history.map((attempt) => ({ id: attempt.id, score: attempt.score, total: attempt.total, passed: attempt.passed, createdAt: attempt.createdAt })) } };
  }

  fail(404, 'Point de terminaison introuvable.');
}

async function routePost(path, body = {}) {
  await ensureState();
  if (path === '/auth/register') {
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (name.length < 2 || name.length > 80) fail(400, 'Le nom doit contenir entre 2 et 80 caractères.', 'name');
    if (!/^\S+@\S+\.\S+$/.test(email)) fail(400, 'Saisissez une adresse e-mail valide.', 'email');
    validatePassword(password);
    const current = state();
    if (current.users.some((user) => user.email === email)) fail(409, 'Un compte utilise déjà cette adresse e-mail.', 'email');
    const user = { id: id('user'), name, email, passwordHash: await hashPassword(password), role: 'student', avatar: null, bio: '', createdAt: now() };
    saveState({ ...current, users: [...current.users, user] });
    mergeGuestData(user.id);
    write(STORAGE.session, user.id);
    return { user: publicUser(user) };
  }
  if (path === '/auth/login') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = state().users.find((item) => item.email === email);
    if (!user || await hashPassword(password) !== user.passwordHash) fail(401, 'Adresse e-mail ou mot de passe incorrect.');
    mergeGuestData(user.id);
    write(STORAGE.session, user.id);
    return { user: publicUser(user) };
  }
  if (path === '/auth/logout') {
    try { window.localStorage.removeItem(STORAGE.session); } catch { /* memory fallback */ }
    memory.delete(STORAGE.session);
    return null;
  }
  const attemptMatch = path.match(/^\/quizzes\/([^/]+)\/attempts$/);
  if (attemptMatch) {
    const user = requireCourseUser();
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
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= context.quiz.passScore;
    const attempt = { id: id('attempt'), userId: user.id, quizId: context.quiz.id, score, total: questions.length, passed, answers, createdAt: now() };
    const current = state();
    saveState({ ...current, attempts: [...current.attempts, attempt] });
    let certificate = null;
    if (passed && context.quiz.kind === 'module') certificate = { id: `DJG-${context.course.id.replace('course-', '').toUpperCase()}-${user.id.slice(-6).toUpperCase()}`, courseTitle: context.course.title, courseSlug: context.course.slug, accent: context.course.accent, issuedAt: attempt.createdAt };
    return { attempt: { id: attempt.id, quizId: attempt.quizId, quizTitle: context.quiz.title, score, total: questions.length, correctCount, passed, passScore: context.quiz.passScore, createdAt: attempt.createdAt, results }, certificate };
  }

  if (path === '/admin/courses') {
    requireAdmin();
    const current = state();
    const payload = {
      slug: slugify(body.slug || body.title),
      technology: String(body.technology || '').trim(),
      title: String(body.title || '').trim(),
      shortDescription: String(body.shortDescription || '').trim(),
      description: String(body.description || '').trim(),
      level: String(body.level || 'Débutant'),
      duration: Number(body.durationMinutes || 120),
      icon: String(body.icon || 'code-2'),
      accent: String(body.accent || '#00ff9d'),
      published: body.published !== false,
    };
    if (!payload.title || !payload.technology || !payload.shortDescription || !payload.description) fail(400, 'Les informations essentielles du module sont obligatoires.');
    if (current.courses.some((course) => course.slug === payload.slug)) payload.slug = `${payload.slug}-${Date.now().toString(36).slice(-5)}`;
    const course = { id: id('course'), orderIndex: current.courses.length + 1, chapters: [], final: [], ...payload };
    saveState({ ...current, courses: [...current.courses, course] });
    return { course, message: 'Module créé.' };
  }

  fail(404, 'Point de terminaison introuvable.');
}

async function routePatch(path, body = {}) {
  await ensureState();
  const progressMatch = path.match(/^\/courses\/([^/]+)\/chapters\/([^/]+)\/progress$/);
  if (progressMatch) {
    const user = requireCourseUser();
    const course = findCourseById(progressMatch[1]);
    const chapter = course?.chapters.find((item) => item.id === progressMatch[2]);
    if (!course || !chapter) fail(404, 'Chapitre introuvable.');
    const current = state();
    const nextProgress = { ...(current.progress || {}) };
    nextProgress[user.id] = { ...(nextProgress[user.id] || {}), [chapter.id]: Boolean(body.completed) };
    saveState({ ...current, progress: nextProgress });
    return { completed: Boolean(body.completed), courseProgress: courseSummary(course, user.id).progress };
  }
  if (path === '/users/password') {
    const user = requireUser();
    const current = state();
    const currentUserRecord = current.users.find((item) => item.id === user.id);
    if (await hashPassword(String(body.currentPassword || '')) !== currentUserRecord.passwordHash) fail(400, 'Le mot de passe actuel est incorrect.', 'currentPassword');
    validatePassword(String(body.newPassword || ''));
    const newPasswordHash = await hashPassword(body.newPassword);
    saveState({ ...current, users: current.users.map((item) => item.id === user.id ? { ...item, passwordHash: newPasswordHash } : item) });
    return { message: 'Mot de passe mis à jour.' };
  }
  const profileMatch = path.match(/^\/users\/profile$/);
  if (profileMatch) {
    const user = requireUser();
    const name = String(body.name ?? user.name).trim();
    const bio = String(body.bio ?? user.bio ?? '').trim();
    const avatar = body.avatar === null ? null : String(body.avatar ?? user.avatar ?? '').trim() || null;
    if (name.length < 2 || name.length > 80) fail(400, 'Le nom doit contenir entre 2 et 80 caractères.', 'name');
    if (bio.length > 240) fail(400, 'La bio ne peut pas dépasser 240 caractères.', 'bio');
    if (avatar && (!/^data:image\/(png|jpeg|webp);base64,/.test(avatar) || avatar.length > 600000)) fail(400, 'L’avatar doit être une image PNG, JPEG ou WebP de moins de 450 Ko.', 'avatar');
    const current = state();
    const updated = { ...current, users: current.users.map((item) => item.id === user.id ? { ...item, name, bio, avatar } : item) };
    saveState(updated);
    return { user: publicUser(updated.users.find((item) => item.id === user.id)), message: 'Profil mis à jour.' };
  }

  const courseMatch = path.match(/^\/admin\/courses\/([^/]+)$/);
  if (courseMatch) {
    requireAdmin();
    const current = state();
    const existing = current.courses.find((course) => course.id === courseMatch[1]);
    if (!existing) fail(404, 'Module introuvable.');
    const updated = { ...existing, ...body, id: existing.id, slug: slugify(body.slug || body.title || existing.slug), duration: Number(body.durationMinutes ?? existing.duration), shortDescription: body.shortDescription ?? existing.shortDescription, published: body.published ?? existing.published };
    saveState({ ...current, courses: current.courses.map((course) => course.id === existing.id ? updated : course) });
    return { course: updated, message: 'Module mis à jour.' };
  }

  const chapterMatch = path.match(/^\/admin\/chapters\/([^/]+)$/);
  if (chapterMatch) {
    requireAdmin();
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
  requireAdmin();
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

async function routePostAdminChapter(path, body) {
  await ensureState();
  requireAdmin();
  const courseMatch = path.match(/^\/admin\/courses\/([^/]+)\/chapters$/);
  if (!courseMatch) fail(404, 'Point de terminaison introuvable.');
  const current = state();
  const course = current.courses.find((item) => item.id === courseMatch[1]);
  if (!course) fail(404, 'Module introuvable.');
  if (!String(body.title || '').trim() || !String(body.summary || '').trim() || !String(body.content || '').trim()) fail(400, 'Le titre, le résumé et le contenu sont obligatoires.');
  const chapter = { id: id('chapter'), slug: slugify(body.slug || body.title), title: String(body.title).trim(), summary: String(body.summary).trim(), content: String(body.content).trim(), code: String(body.code || ''), language: String(body.language || 'text').toLowerCase(), duration: Number(body.durationMinutes || 30), questions: [] };
  const updated = { ...course, chapters: [...course.chapters, chapter] };
  saveState({ ...current, courses: current.courses.map((item) => item.id === course.id ? updated : item) });
  return { chapter, message: 'Chapitre créé.' };
}

export const api = {
  async get(path) { return routeGet(path); },
  async post(path, body) {
    if (/^\/admin\/courses\/[^/]+\/chapters$/.test(path)) return routePostAdminChapter(path, body);
    return routePost(path, body);
  },
  async patch(path, body) { return routePatch(path, body); },
  async delete(path) { return routeDelete(path); },
};

export function resetLocalData() {
  try {
    [...Object.values(STORAGE), 'djangue.state.v1'].forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore unavailable storage.
  }
  memory.clear();
  memory.delete('djangue.state.v1');
  initialization = undefined;
}
