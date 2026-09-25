import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { clearSessionCookie, publicUser, requireAuth, setSessionCookie } from '../auth.js';
import { isEmail, isUniqueConstraint } from '../utils.js';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ message: 'Le nom doit contenir entre 2 et 80 caractères.', field: 'name' });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Saisissez une adresse e-mail valide.', field: 'email' });
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.', field: 'password' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ message: 'Un compte utilise déjà cette adresse e-mail.', field: 'email' });
    }

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      name,
      email,
      password_hash: await bcrypt.hash(password, 12),
      role: 'student',
      avatar: null,
      bio: '',
      created_at: now,
      updated_at: now,
    };

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, user.name, user.email, user.password_hash, user.role, user.avatar, user.bio, user.created_at, user.updated_at);

    setSessionCookie(res, user, req);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (isUniqueConstraint(error)) {
      return res.status(409).json({ message: 'Un compte utilise déjà cette adresse e-mail.', field: 'email' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!isEmail(email) || !password) {
      return res.status(400).json({ message: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    setSessionCookie(res, user, req);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res, req);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
