from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user model that stores the Firebase UID alongside Django's auth."""
    firebase_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    highest_score = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)

    def __str__(self):
        return self.email or self.username


class GameSession(models.Model):
    """Records a single completed game for a user."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='games',
        null=True,
        blank=True,
    )
    score = models.IntegerField()
    max_tile = models.IntegerField()  # e.g. 512, 1024, 2048, 4096
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.user} — {self.score} (max tile: {self.max_tile})"
