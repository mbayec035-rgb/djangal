import jwt from "jsonwebtoken";
import { db } from "./db.js";

const COOKIE_NAME = "djangue_session";
const DEFAULT_SECRET = "djangue-development-secret-change-before-production";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_SECRET;
const TOKEN_TTL = "7d";

if (process.env.NODE_ENV === "production" && JWT_SECRET === DEFAULT_SECRET) {
  throw new Error(
    "JWT_SECRET doit être défini avec une valeur unique en production.",
  );
}

export function publicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    bio: user.bio || "",
    createdAt: user.created_at,
  };
}

export function signSession(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
  });
}

export function setSessionCookie(res, user, req = null) {
  res.cookie(COOKIE_NAME, signSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: req ? req.secure : process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res, req = null) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: req ? req.secure : process.env.NODE_ENV === "production",
    path: "/",
  });
}

function readToken(req) {
  return req.cookies?.[COOKIE_NAME] || null;
}

export function resolveUser(req) {
  const token = readToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return (
      db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub) || null
    );
  } catch {
    return null;
  }
}

export function optionalAuth(req, _res, next) {
  req.user = resolveUser(req);
  next();
}

export function requireAuth(req, res, next) {
  const user = resolveUser(req);
  if (!user) {
    return res.status(401).json({ message: "Authentification requise." });
  }

  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.user || resolveUser(req);
    if (!user) {
      return res.status(401).json({ message: "Authentification requise." });
    }
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Accès réservé aux administrateurs." });
    }
    req.user = user;
    next();
  };
}
