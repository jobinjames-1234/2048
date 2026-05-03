# Django, PostgreSQL, and Firebase Integration for 2048 Game

This plan outlines the steps to architect the backend models and connect the existing React frontend to a new Django REST Framework API, utilizing PostgreSQL for data storage and Firebase for authentication.

## User Review Required

> [!IMPORTANT]
> **Database Requirement:** This plan assumes you have PostgreSQL installed on your machine (or access to a cloud PostgreSQL instance) to use for development.
> **Firebase Setup:** You will need a Firebase project set up with Authentication enabled (e.g., Google Sign-In or Email/Password) to test the auth flow. 
> 
> Please review the data models below and let me know if you want to track additional statistics (e.g., total time played, number of undos, etc.).

## Open Questions

1. Do you already have PostgreSQL installed locally on your Windows machine, or should we use SQLite temporarily just to get the Django code written and tested before switching to Postgres?
2. Do you have a Firebase project created already, or do you need guidance on setting one up to get the configuration keys?
3. For anti-cheat, do you want to start simple (just submitting the final score) or do you want to build the "move tracking" array from the start?

---

## Proposed Changes

We will separate the project structure cleanly: the existing React code will remain in the root (or be moved to a `frontend/` folder for cleanliness, though we can keep it as is), and we will create a `backend/` folder for the Django project.

### Backend Infrastructure (Django)

We will initialize a new Django project and configure it for a REST API.

#### [NEW] `backend/requirements.txt`
Dependencies for the Django project:
- `django`
- `djangorestframework`
- `psycopg2-binary` (PostgreSQL adapter)
- `django-cors-headers` (to allow React to talk to Django)
- `firebase-admin` (to verify Firebase tokens)
- `django-environ` (for environment variables)

#### [NEW] `backend/core/settings.py` (Modified)
We will configure Django to:
- Use PostgreSQL.
- Enable `corsheaders` to accept requests from `localhost:3000` (React Vite).
- Use `rest_framework`.

---

### Database Models (PostgreSQL via Django ORM)

We will create an `api` app within Django to hold our models.

#### [NEW] `backend/api/models.py`
We will define the following models:

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # We map the Firebase UID to the Django User to link identities
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    
    # Track overall user stats
    highest_score = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)

class GameSession(models.fields):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='games', null=True, blank=True)
    score = models.IntegerField()
    max_tile = models.IntegerField() # e.g., 2048, 4096
    
    # If we want anti-cheat later, we can store the moves
    # moves = models.JSONField(null=True, blank=True) 
    
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-score'] # For leaderboard
```

---

### Authentication Middleware (Firebase -> Django)

#### [NEW] `backend/api/authentication.py`
We will write a custom authentication class for Django REST Framework.
1. It will extract the `Bearer <token>` from the HTTP header.
2. It will use `firebase_admin.auth.verify_id_token(token)` to validate it.
3. It will retrieve the `firebase_uid`.
4. It will get or create the `User` model in PostgreSQL and log them into the Django request.

---

### React Frontend Updates

#### [MODIFY] `src/services/api.ts`
We will create a service file to handle fetching data from Django.

```typescript
import { auth } from './firebase'; // Existing or new firebase setup

export const submitScore = async (score: number, maxTile: number) => {
    // 1. Get current user token from Firebase
    const user = auth.currentUser;
    if (!user) return;
    
    const token = await user.getIdToken();
    
    // 2. Send authenticated request to Django
    await fetch('http://localhost:8000/api/scores/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score, maxTile })
    });
};
```

---

## Verification Plan

### Automated/Local Tests
1. **Database Setup:** Start PostgreSQL and apply Django migrations (`python manage.py migrate`).
2. **Backend Server:** Run `python manage.py runserver 8000`.
3. **Frontend Server:** Run `npm run dev` (Vite usually runs on 3000 or 5173).
4. **Auth Flow:** Log in to the React app using Firebase. Verify the network tab shows a valid Firebase token.
5. **API Connection:** Play a game, trigger "Game Over", and ensure a `POST /api/scores/` request succeeds (returns 201 Created) and the score appears in the Django Admin or PostgreSQL shell.

### Manual Verification
- Ask the user to verify if they want any specific custom fields on the User model.
- Check if CORS errors occur in the browser console.
