import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { publicUser, requireAuth } from '../auth.js';

const router = Router();

router.use(requireAuth);

router.get('/profile', (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch('/profile', (req, res) => {
  const name = String(req.body.name ?? req.user.name).trim();
  const bio = String(req.body.bio ?? req.user.bio ?? '').trim();
  const avatar = req.body.avatar === null ? null : String(req.body.avatar ?? req.user.avatar ?? '').trim() || null;

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ message: 'Le nom doit contenir entre 2 et 80 caractères.', field: 'name' });
  }
  if (bio.length > 240) {
    return res.status(400).json({ message: 'La bio ne peut pas dépasser 240 caractères.', field: 'bio' });
  }
  if (avatar && (!/^data:image\/(png|jpeg|webp);base64,/.test(avatar) || avatar.length > 600_000)) {
    return res.status(400).json({ message: 'L’avatar doit être une image PNG, JPEG ou WebP de moins de 450 Ko.', field: 'avatar' });
  }

  db.prepare('UPDATE users SET name = ?, bio = ?, avatar = ?, updated_at = ? WHERE id = ?')
    .run(name, bio, avatar, new Date().toISOString(), req.user.id);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: publicUser(user), message: 'Profil mis à jour.' });
});

router.patch('/password', async (req, res, next) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!(await bcrypt.compare(currentPassword, req.user.password_hash))) {
      return res.status(400).json({ message: 'Le mot de passe actuel est incorrect.', field: 'currentPassword' });
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre.', field: 'newPassword' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
      .run(passwordHash, new Date().toISOString(), req.user.id);

    res.json({ message: 'Mot de passe mis à jour.' });
  } catch (error) {
    next(error);
  }
});

export default router;
