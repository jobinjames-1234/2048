/**
 * Django REST API service
 * -----------------------
 * This service sends authenticated requests to the Django backend.
 * The Firebase ID token is attached to every request so Django can
 * verify the user's identity and persist data in PostgreSQL (SQLite in dev).
 *
 * Base URL: set VITE_DJANGO_API_URL in your .env file.
 *   Dev:  http://localhost:8000
 *   Prod: https://your-backend.com
 */

import { auth } from '../lib/firebase';

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';

/** Returns the current user's Firebase ID token, or null if not logged in. */
async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/** Generic authenticated fetch wrapper. */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getIdToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${DJANGO_API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Django API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DjangoUserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  highest_score: number;
  games_played: number;
}

export interface DjangoLeaderboardEntry {
  id: number;
  score: number;
  max_tile: number;
  created_at: string;
  username: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * GET /api/me/
 * Returns the authenticated user's profile from the Django database.
 */
export const getDjangoProfile = (): Promise<DjangoUserProfile> =>
  apiFetch<DjangoUserProfile>('/api/me/');

/**
 * POST /api/scores/
 * Saves a completed game to Django / SQLite (will be PostgreSQL in production).
 */
export const submitScoreToDjango = (score: number, maxTile: number): Promise<{ message: string; session_id: number }> =>
  apiFetch('/api/scores/', {
    method: 'POST',
    body: JSON.stringify({ score, max_tile: maxTile }),
  });

/**
 * GET /api/leaderboard/
 * Public endpoint — no auth required. Returns top 50 scores from Django.
 */
export const getDjangoLeaderboard = (): Promise<DjangoLeaderboardEntry[]> =>
  apiFetch<DjangoLeaderboardEntry[]>('/api/leaderboard/');
