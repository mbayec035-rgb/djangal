import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { notFound } from '../utils.js';

const router = Router();

router.get('/attempts', requireAuth, (req, res) => {
  const attempts = db.prepare(`
    SELECT a.id, a.score, a.total, a.passed, a.created_at AS createdAt,
           q.id AS quizId, q.title, q.kind,
           c.title AS courseTitle, c.slug AS courseSlug, c.accent,
           COALESCE(ch.title, 'Évaluation finale') AS chapterTitle
    FROM quiz_attempts a
    JOIN quizzes q ON q.id = a.quiz_id
    LEFT JOIN chapters ch ON ch.id = q.chapter_id
    LEFT JOIN courses c ON c.id = q.course_id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
    LIMIT 50
  `).all(req.user.id).map((attempt) => ({ ...attempt, passed: Boolean(attempt.passed) }));

  res.json({ attempts });
});

router.get('/:quizId', requireAuth, (req, res) => {
  const quiz = db.prepare(`
    SELECT q.id, q.title, q.description, q.kind, q.pass_score AS passScore,
           q.chapter_id AS chapterId, q.course_id AS courseId,
           c.title AS courseTitle, c.slug AS courseSlug, c.accent,
           ch.title AS chapterTitle
    FROM quizzes q
    LEFT JOIN courses c ON c.id = q.course_id
    LEFT JOIN chapters ch ON ch.id = q.chapter_id
    WHERE q.id = ?
  `).get(req.params.quizId);

  if (!quiz) return notFound(res, 'Quiz');

  const questions = db.prepare(`
    SELECT id, type, prompt, options, order_index AS orderIndex
    FROM questions
    WHERE quiz_id = ?
    ORDER BY order_index ASC
  `).all(quiz.id).map((question) => ({
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: JSON.parse(question.options),
    orderIndex: question.orderIndex,
  }));

  const history = db.prepare(`
    SELECT id, score, total, passed, created_at AS createdAt
    FROM quiz_attempts
    WHERE user_id = ? AND quiz_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(req.user.id, quiz.id).map((attempt) => ({ ...attempt, passed: Boolean(attempt.passed) }));

  res.json({ quiz: { ...quiz, questions, history } });
});

router.post('/:quizId/attempts', requireAuth, (req, res) => {
  const quiz = db.prepare(`
    SELECT id, title, kind, pass_score AS passScore, chapter_id AS chapterId, course_id AS courseId
    FROM quizzes
    WHERE id = ?
  `).get(req.params.quizId);

  if (!quiz) return notFound(res, 'Quiz');

  const questions = db.prepare(`
    SELECT id, correct_index AS correctIndex, explanation
    FROM questions
    WHERE quiz_id = ?
    ORDER BY order_index ASC
  `).all(quiz.id);

  if (!questions.length) {
    return res.status(409).json({ message: 'Ce quiz ne contient aucune question.' });
  }

  const answers = req.body.answers && typeof req.body.answers === 'object' ? req.body.answers : {};
  let correctCount = 0;
  const results = questions.map((question) => {
    const selectedIndex = Number(answers[question.id]);
    const hasAnswer = Number.isInteger(selectedIndex) && selectedIndex >= 0;
    const isCorrect = hasAnswer && selectedIndex === question.correctIndex;
    if (isCorrect) correctCount += 1;
    return {
      questionId: question.id,
      selectedIndex: hasAnswer ? selectedIndex : null,
      correctIndex: question.correctIndex,
      correct: isCorrect,
      explanation: question.explanation,
    };
  });

  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= quiz.passScore;
  const attemptId = randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO quiz_attempts (id, user_id, quiz_id, score, total, passed, answers, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(attemptId, req.user.id, quiz.id, score, questions.length, passed ? 1 : 0, JSON.stringify(answers), createdAt);

  let certificate = null;
  if (passed && quiz.kind === 'module' && quiz.courseId) {
    const course = db.prepare('SELECT title, slug, accent FROM courses WHERE id = ?').get(quiz.courseId);
    if (course) {
      certificate = {
        id: `DJG-${quiz.courseId.replace('course-', '').toUpperCase()}-${req.user.id.slice(0, 6).toUpperCase()}`,
        courseTitle: course.title,
        courseSlug: course.slug,
        accent: course.accent,
        issuedAt: createdAt,
      };
    }
  }

  res.status(201).json({
    attempt: {
      id: attemptId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: questions.length,
      correctCount,
      passed,
      passScore: quiz.passScore,
      createdAt,
      results,
    },
    certificate,
  });
});

export default router;
