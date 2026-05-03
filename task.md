# Task List: 2048 Production Deployment & Backend Setup

## Phase 1: Frontend Restructuring for Vercel
- [x] Move React frontend files into a `frontend/` directory to create a clean monorepo structure.
- [x] Ensure `frontend/package.json` has standard build scripts.
- [x] Create a `vercel.json` or `README.md` instructions for deploying the `frontend` directory to Vercel.
- [x] Ensure `.gitignore` is properly configured for the frontend.

## Phase 2: Firebase Setup Assistance
- [x] Provide clear, step-by-step instructions for creating a Firebase Project and getting the Web Config keys.

## Phase 3: Django Backend Setup (SQLite)
- [x] Create `backend/` directory.
- [x] Initialize Python virtual environment inside `backend/` and install Django, DRF, etc.
- [x] Create Django project and `api` app.
- [x] Define `User` and `GameSession` models in `backend/api/models.py` (no anti-cheat, just score and max tile).
- [x] Set up Firebase authentication verification middleware.

## Phase 4: Connecting React to Django
- [x] Update frontend to send authenticated requests to Django when a game finishes.
