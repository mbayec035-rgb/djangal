import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireRole } from '../auth.js';
import { asNumber, notFound, parseBoolean, slugify } from '../utils.js';

const router = Router();

router.use(requireRole('admin'));

function coursePayload(body, current = {}) {
  return {
    slug: slugify(body.slug || body.title || current.slug || ''),
    technology: String(body.technology ?? current.technology ?? '').trim(),
    title: String(body.title ?? current.title ?? '').trim(),
    shortDescription: String(body.shortDescription ?? current.short_description ?? '').trim(),
    description: String(body.description ?? current.description ?? '').trim(),
    level: String(body.level ?? current.level ?? 'Débutant').trim(),
    durationMinutes: asNumber(body.durationMinutes ?? current.duration_minutes, 0),
    icon: String(body.icon ?? current.icon ?? 'code-2').trim(),
    accent: String(body.accent ?? current.accent ?? '#00ff9d').trim(),
    published: parseBoolean(body.published ?? current.published ?? true) ? 1 : 0,
  };
}

function validateCourse(course) {
  if (!course.slug) return 'Le titre doit produire un identifiant valide.';
  if (!course.technology || !course.title || !course.shortDescription || !course.description) {
    return 'Les informations essentielles du module sont obligatoires.';
  }
  if (course.shortDescription.length > 180) return 'La description courte ne peut pas dépasser 180 caractères.';
  if (!/^#[0-9a-f]{6}$/i.test(course.accent)) return 'La couleur d’accent doit être un code hexadécimal valide.';
  if (course.durationMinutes < 0 || course.durationMinutes > 10000) return 'La durée est invalide.';
  return null;
}

router.get('/courses', (_req, res) => {
  const courses = db.prepare(`
    SELECT c.id, c.slug, c.technology, c.title, c.short_description AS shortDescription,
           c.description, c.level, c.duration_minutes AS durationMinutes, c.icon, c.accent,
           c.published, c.order_index AS orderIndex, c.updated_at AS updatedAt,
           COUNT(DISTINCT ch.id) AS chapterCount,
           COUNT(DISTINCT q.id) AS quizCount
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN quizzes q ON q.course_id = c.id OR q.chapter_id = ch.id
    GROUP BY c.id
    ORDER BY c.order_index ASC
  `).all().map((course) => ({ ...course, published: Boolean(course.published) }));

  res.json({ courses });
});

router.post('/courses', (req, res) => {
  const course = coursePayload(req.body);
  const validationError = validateCourse(course);
  if (validationError) return res.status(400).json({ message: validationError });

  const duplicate = db.prepare('SELECT id FROM courses WHERE slug = ?').get(course.slug);
  if (duplicate) course.slug = `${course.slug}-${Date.now().toString().slice(-5)}`;

  const id = randomUUID();
  const now = new Date().toISOString();
  const nextOrder = db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 AS value FROM courses').get().value;

  db.prepare(`
    INSERT INTO courses (
      id, slug, technology, title, short_description, description, level,
      duration_minutes, icon, accent, order_index, published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, course.slug, course.technology, course.title, course.shortDescription, course.description, course.level, course.durationMinutes, course.icon, course.accent, nextOrder, course.published, now, now);

  res.status(201).json({
    course: db.prepare('SELECT id, slug, technology, title, short_description AS shortDescription, description, level, duration_minutes AS durationMinutes, icon, accent, published, order_index AS orderIndex FROM courses WHERE id = ?').get(id),
    message: 'Module créé.',
  });
});

router.patch('/courses/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!current) return notFound(res, 'Module');

  const course = coursePayload(req.body, current);
  const validationError = validateCourse(course);
  if (validationError) return res.status(400).json({ message: validationError });

  db.prepare(`
    UPDATE courses SET slug = ?, technology = ?, title = ?, short_description = ?, description = ?,
                       level = ?, duration_minutes = ?, icon = ?, accent = ?, published = ?, updated_at = ?
    WHERE id = ?
  `).run(course.slug, course.technology, course.title, course.shortDescription, course.description, course.level, course.durationMinutes, course.icon, course.accent, course.published, new Date().toISOString(), req.params.id);

  res.json({
    course: db.prepare('SELECT id, slug, technology, title, short_description AS shortDescription, description, level, duration_minutes AS durationMinutes, icon, accent, published, order_index AS orderIndex FROM courses WHERE id = ?').get(req.params.id),
    message: 'Module mis à jour.',
  });
});

router.delete('/courses/:id', (req, res) => {
  const result = db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  if (!result.changes) return notFound(res, 'Module');
  res.status(204).end();
});

function chapterPayload(body, current = {}) {
  return {
    slug: slugify(body.slug || body.title || current.slug || ''),
    title: String(body.title ?? current.title ?? '').trim(),
    summary: String(body.summary ?? current.summary ?? '').trim(),
    content: String(body.content ?? current.content ?? '').trim(),
    code: String(body.code ?? current.code ?? '').trim(),
    language: String(body.language ?? current.language ?? 'text').trim().toLowerCase(),
    durationMinutes: asNumber(body.durationMinutes ?? current.duration_minutes, 0),
  };
}

function validateChapter(chapter) {
  if (!chapter.slug || !chapter.title || !chapter.summary || !chapter.content) return 'Le titre, le résumé et le contenu sont obligatoires.';
  if (chapter.durationMinutes < 0 || chapter.durationMinutes > 10000) return 'La durée est invalide.';
  return null;
}

router.post('/courses/:courseId/chapters', (req, res) => {
  const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(req.params.courseId);
  if (!course) return notFound(res, 'Module');

  const chapter = chapterPayload(req.body);
  const validationError = validateChapter(chapter);
  if (validationError) return res.status(400).json({ message: validationError });

  let slug = chapter.slug;
  if (db.prepare('SELECT id FROM chapters WHERE course_id = ? AND slug = ?').get(course.id, slug)) {
    slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const nextOrder = db.prepare('SELECT COALESCE(MAX(order_index), 0) + 1 AS value FROM chapters WHERE course_id = ?').get(course.id).value;

  db.prepare(`
    INSERT INTO chapters (id, course_id, slug, title, summary, content, code, language, duration_minutes, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, course.id, slug, chapter.title, chapter.summary, chapter.content, chapter.code, chapter.language, chapter.durationMinutes, nextOrder, now, now);

  res.status(201).json({ chapter: { id, ...chapter, slug, courseId: course.id, orderIndex: nextOrder }, message: 'Chapitre créé.' });
});

router.patch('/chapters/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id);
  if (!current) return notFound(res, 'Chapitre');

  const chapter = chapterPayload(req.body, current);
  const validationError = validateChapter(chapter);
  if (validationError) return res.status(400).json({ message: validationError });

  db.prepare(`
    UPDATE chapters SET slug = ?, title = ?, summary = ?, content = ?, code = ?, language = ?,
                        duration_minutes = ?, updated_at = ?
    WHERE id = ?
  `).run(chapter.slug, chapter.title, chapter.summary, chapter.content, chapter.code, chapter.language, chapter.durationMinutes, new Date().toISOString(), current.id);

  res.json({ chapter: { id: current.id, ...chapter }, message: 'Chapitre mis à jour.' });
});

router.delete('/chapters/:id', (req, res) => {
  const result = db.prepare('DELETE FROM chapters WHERE id = ?').run(req.params.id);
  if (!result.changes) return notFound(res, 'Chapitre');
  res.status(204).end();
});

export default router;
