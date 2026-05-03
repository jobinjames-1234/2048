import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import os
import json

from api.models import User

# Initialise the Firebase Admin SDK once when Django starts up
if not firebase_admin._apps:
    firebase_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_JSON', '').strip()
    if firebase_json:
        try:
            cred = credentials.Certificate(json.loads(firebase_json))
            firebase_admin.initialize_app(cred)
        except Exception:
            # Invalid JSON credential payload; keep app uninitialized.
            pass
    else:
        cred_path = os.path.join(settings.BASE_DIR, settings.FIREBASE_CREDENTIALS_PATH)
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # In development without the service account file, skip initialisation.
            # Token verification will fail gracefully.
            pass


class FirebaseAuthentication(BaseAuthentication):
    """
    DRF authentication backend.
    Expects: Authorization: Bearer <firebase-id-token>
    1. Verifies the token with Firebase Admin SDK.
    2. Gets-or-creates a Django User mapped to the Firebase UID.
    3. Returns (user, token) so DRF treats the request as authenticated.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return None  # Let other authenticators try

        id_token = auth_header.split('Bearer ')[1].strip()

        try:
            decoded = auth.verify_id_token(id_token)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid Firebase token: {e}')

        uid = decoded.get('uid')
        email = decoded.get('email', '')
        name = decoded.get('name', '')

        # Get or create the Django user record linked to this Firebase UID
        user, created = User.objects.get_or_create(
            firebase_uid=uid,
            defaults={
                'username': uid,          # username must be unique
                'email': email,
                'first_name': name.split(' ')[0] if name else '',
                'last_name': ' '.join(name.split(' ')[1:]) if name else '',
            }
        )

        # Keep email in sync if it changes on the Firebase side
        if not created and user.email != email:
            user.email = email
            user.save(update_fields=['email'])

        return (user, id_token)
