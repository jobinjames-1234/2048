from django.urls import path
from api.views import MeView, SubmitScoreView, LeaderboardView

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('scores/', SubmitScoreView.as_view(), name='submit-score'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]
