import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const userId = req.user.id;

  const totals = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM courses WHERE published = 1) AS totalCourses,
      (SELECT COUNT(*) FROM chapters ch JOIN courses c ON c.id = ch.course_id WHERE c.published = 1) AS totalChapters,
      (SELECT COUNT(*) FROM chapters ch JOIN courses c ON c.id = ch.course_id
        LEFT JOIN lesson_progress lp ON lp.chapter_id = ch.id AND lp.user_id = ?
        WHERE c.published = 1 AND lp.completed = 1) AS completedChapters,
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ? AND passed = 1) AS passedAttempts,
      (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = ?) AS totalAttempts
  `).get(userId, userId, userId);

  const courses = db.prepare(`
    SELECT c.id, c.slug, c.title, c.technology, c.short_description AS shortDescription,
           c.icon, c.accent, c.level, c.duration_minutes AS durationMinutes,
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

  const recentAttempts = db.prepare(`
    SELECT a.id, a.score, a.total, a.passed, a.created_at AS createdAt,
           q.id AS quizId, q.title, q.kind,
           COALESCE(c.title, 'Module Djangue') AS courseTitle, c.slug AS courseSlug, c.accent,
           COALESCE(ch.title, 'Évaluation finale') AS chapterTitle
    FROM quiz_attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    LEFT JOIN courses c ON c.id = q.course_id
    LEFT JOIN chapters ch ON ch.id = q.chapter_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT 6
  `).all(userId).map((attempt) => ({ ...attempt, passed: Boolean(attempt.passed) }));

  const certificates = db.prepare(`
    SELECT a.id AS attemptId, a.created_at AS completedAt, q.course_id AS courseId,
           c.title AS courseTitle, c.slug AS courseSlug, c.accent
    FROM quiz_attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    JOIN courses c ON c.id = q.course_id
    WHERE a.user_id = ? AND q.kind = 'module' AND a.passed = 1
    ORDER BY a.created_at DESC
  `).all(userId).map((certificate, index) => ({
    id: `DJG-${certificate.courseId.replace('course-', '').toUpperCase()}-${index + 1}`,
    courseTitle: certificate.courseTitle,
    courseSlug: certificate.courseSlug,
    accent: certificate.accent,
    issuedAt: certificate.completedAt,
  }));

  const progress = totals.totalChapters ? Math.round((totals.completedChapters / totals.totalChapters) * 100) : 0;
  const continueCourse = courses.find((course) => course.progress > 0 && course.progress < 100) || courses[0] || null;

  res.json({
    summary: {
      ...totals,
      passedAttempts: totals.passedAttempts,
      progress,
    },
    continueCourse,
    courses,
    recentAttempts,
    certificates,
  });
});

export default router;
