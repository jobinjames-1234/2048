# Deploy Django Backend to Render (PostgreSQL + Auto Deploy)

This guide deploys the `backend/` Django app to Render with a managed PostgreSQL database and automated GitHub-based deploys.

## 1) Prepare backend for production

Already done in code:
- `DATABASE_URL` is supported in `core/settings.py`.
- Production security flags are env-driven.
- Firebase Admin credentials can come from `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`.
- `gunicorn` and `psycopg2-binary` are included in `requirements.txt`.

## 2) Create PostgreSQL database on Render

1. Open [Render Dashboard](https://dashboard.render.com/).
2. Click **New** -> **PostgreSQL**.
3. Choose name, region, and plan.
4. Create DB and wait until status is available.
5. Copy the **Internal Database URL** (or External URL if needed).

## 3) Create backend web service on Render

1. Click **New** -> **Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate --noinput`
   - **Start Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
4. Set **Auto-Deploy** to **Yes**.

## 4) Set required environment variables in Render

In your backend web service -> **Environment**:

- `SECRET_KEY` = strong random string
- `DEBUG` = `False`
- `ALLOWED_HOSTS` = `<your-render-service>.onrender.com`
- `DATABASE_URL` = value from Render PostgreSQL
- `CORS_ALLOWED_ORIGINS` = `https://<your-firebase-hosting-domain>`
- `SECURE_SSL_REDIRECT` = `True`
- `SESSION_COOKIE_SECURE` = `True`
- `CSRF_COOKIE_SECURE` = `True`
- `FIREBASE_SERVICE_ACCOUNT_KEY_JSON` = full Firebase service-account JSON as one line

Optional:
- `CORS_ALLOWED_ORIGIN_REGEXES` for preview domains.

## 5) Configure Firebase Hosting frontend to call Render backend

In frontend env:
- `VITE_DJANGO_API_URL=https://<your-render-service>.onrender.com`

Rebuild/redeploy frontend after changing env.

## 6) Automatic CI/CD from GitHub pushes

You now have `.github/workflows/backend-render-deploy.yml`:
- Runs backend Django checks on `main` pushes that affect `backend/**`.
- If checks pass, triggers Render deploy hook.

To finish setup:
1. In Render web service -> **Settings** -> **Deploy Hook** -> create/copy hook URL.
2. In GitHub repo -> **Settings** -> **Secrets and variables** -> **Actions**:
   - Add secret: `RENDER_DEPLOY_HOOK_URL` with that URL.

After this, every push to `main` touching backend files:
- runs CI
- then deploys backend live automatically.

## 7) Verify deployment

1. Open `https://<your-render-service>.onrender.com/api/leaderboard/` and ensure JSON response.
2. From frontend, play a game while signed in and confirm `POST /api/scores/` returns `201`.
3. Check Render logs for migration/startup errors.
