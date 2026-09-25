import './config.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { getDatabasePath } from './db.js';
import { seedDatabase } from './seed.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import courseRoutes from './routes/courses.routes.js';
import quizRoutes from './routes/quizzes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

seedDatabase();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = Array.from(new Set([
  ...String(process.env.WEB_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
]));

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      workerSrc: ["'self'", 'blob:'],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? undefined : false,
}));
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin = process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) return callback(null, true);
    callback(new Error('Origine non autorisée.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '700kb' }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'djangue-api', database: path.basename(getDatabasePath()) });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Point de terminaison API introuvable.' });
});

const webDist = fileURLToPath(new URL('../../web/dist/', import.meta.url));
if (isProduction && fs.existsSync(webDist)) {
  app.use(express.static(webDist, { index: false, maxAge: '1d' }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.message === 'Origine non autorisée.') {
    return res.status(403).json({ message: error.message });
  }
  res.status(500).json({ message: 'Une erreur interne est survenue.' });
});

app.listen(port, () => {
  console.log(`Djangue API active sur http://localhost:${port}`);
  console.log(`Base de données : ${getDatabasePath()}`);
});
