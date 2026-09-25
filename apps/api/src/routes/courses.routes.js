import { Router } from 'express';
import { db } from '../db.js';
import { optionalAuth, requireAuth } from '../auth.js';
import { notFound, parseBoolean } from '../utils.js';

const router = Router();

router.get('/', optionalAuth, (req, res) => {
  const userId = req.user?.id || '__anonymous__';
  const courses = db.prepare(`
    SELECT
      c.id,
      c.slug,
      c.technology,
      c.title,
      c.short_description AS shortDescription,
      c.description,
      c.level,
      c.duration_minutes AS durationMinutes,
      c.icon,
      c.accent,
      c.order_index AS orderIndex,
      COUNT(ch.id) AS totalChapters,
      COALESCE(SUM(CASE WHEN lp.completed = 1 THEN 1 ELSE 0 END), 0) AS completedChapters
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lesson_progress lp ON lp.chapter_id = ch.id AND lp.user_id = ?
    WHERE c.published = 1
    GROUP BY c.id
    ORDER BY c.order_index ASC
  `).all(userId).map((course) => ({
    ...course,
    progress: course.totalChapters ? Math.round((course.completedChapters / course.totalChapters) * 100) : 0,
  }));

  res.json({ courses });
});

router.get('/:slug', optionalAuth, (req, res) => {
  const course = db.prepare(`
    SELECT id, slug, technology, title, short_description AS shortDescription, description,
           level, duration_minutes AS durationMinutes, icon, accent, order_index AS orderIndex
    FROM courses
    WHERE slug = ? AND published = 1
  `).get(req.params.slug);

  if (!course) return notFound(res, 'Module');

  const userId = req.user?.id || '__anonymous__';
  const chapters = db.prepare(`
    SELECT ch.id, ch.slug, ch.title, ch.summary, ch.content, ch.code, ch.language,
           ch.duration_minutes AS durationMinutes, ch.order_index AS orderIndex,
           COALESCE(lp.completed, 0) AS completed
    FROM chapters ch
    LEFT JOIN lesson_progress lp ON lp.chapter_id = ch.id AND lp.user_id = ?
    WHERE ch.course_id = ?
    ORDER BY ch.order_index ASC
  `).all(userId, course.id).map((chapter) => {
    const quiz = db.prepare(`
      SELECT q.id, q.title, q.description, q.kind, q.pass_score AS passScore
      FROM quizzes q
      WHERE q.chapter_id = ?
      LIMIT 1
    `).get(chapter.id);

    let bestAttempt = null;
    if (req.user && quiz) {
      bestAttempt = db.prepare(`
        SELECT id, score, total, passed, created_at AS createdAt
        FROM quiz_attempts
        WHERE user_id = ? AND quiz_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(req.user.id, quiz.id) || null;
    }

    return {
      ...chapter,
      completed: Boolean(chapter.completed),
      quiz: quiz ? { ...quiz, bestAttempt } : null,
    };
  });

  const finalQuiz = db.prepare(`
    SELECT id, title, description, kind, pass_score AS passScore
    FROM quizzes
    WHERE course_id = ?
    LIMIT 1
  `).get(course.id) || null;

  let bestFinalAttempt = null;
  if (req.user && finalQuiz) {
    bestFinalAttempt = db.prepare(`
      SELECT id, score, total, passed, created_at AS createdAt
      FROM quiz_attempts
      WHERE user_id = ? AND quiz_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(req.user.id, finalQuiz.id) || null;
  }

  const completedChapters = chapters.filter((chapter) => chapter.completed).length;
  const progress = chapters.length ? Math.round((completedChapters / chapters.length) * 100) : 0;

  res.json({
    course: {
      ...course,
      totalChapters: chapters.length,
      completedChapters,
      progress,
      finalQuiz: finalQuiz ? { ...finalQuiz, bestAttempt: bestFinalAttempt } : null,
    },
    chapters,
  });
});

router.patch('/:courseId/chapters/:chapterId/progress', requireAuth, (req, res) => {
  const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(req.params.courseId);
  if (!course) return notFound(res, 'Module');

  const chapter = db.prepare('SELECT id FROM chapters WHERE id = ? AND course_id = ?').get(req.params.chapterId, req.params.courseId);
  if (!chapter) return notFound(res, 'Chapitre');

  const completed = parseBoolean(req.body.completed) ? 1 : 0;
  db.prepare(`
    INSERT INTO lesson_progress (user_id, chapter_id, completed, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, chapter_id)
    DO UPDATE SET completed = excluded.completed, updated_at = excluded.updated_at
  `).run(req.user.id, chapter.id, completed, new Date().toISOString());

  const stats = db.prepare(`
    SELECT COUNT(*) AS total, COALESCE(SUM(completed), 0) AS completed
    FROM chapters
    LEFT JOIN lesson_progress ON lesson_progress.chapter_id = chapters.id AND lesson_progress.user_id = ?
    WHERE chapters.course_id = ?
  `).get(req.user.id, course.id);

  res.json({
    completed: Boolean(completed),
    courseProgress: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0,
  });
});

export default router;
