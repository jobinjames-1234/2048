from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from api.models import GameSession
from api.serializers import UserSerializer, GameSessionSerializer, SubmitScoreSerializer


class MeView(APIView):
    """GET /api/me/ — returns the currently authenticated user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SubmitScoreView(APIView):
    """POST /api/scores/ — saves a completed game session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubmitScoreSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        score = serializer.validated_data['score']
        max_tile = serializer.validated_data['max_tile']

        # Save the game session
        session = GameSession.objects.create(
            user=request.user,
            score=score,
            max_tile=max_tile,
        )

        # Update the user's personal best if beaten
        user = request.user
        if score > user.highest_score:
            user.highest_score = score
            user.save(update_fields=['highest_score'])

        # Increment games played
        user.games_played = user.games_played + 1
        user.save(update_fields=['games_played'])

        return Response(
            {'message': 'Score saved!', 'session_id': session.id},
            status=status.HTTP_201_CREATED
        )


class LeaderboardView(APIView):
    """GET /api/leaderboard/ — returns the top 50 all-time scores (public)."""
    permission_classes = [AllowAny]

    def get(self, request):
        top_sessions = GameSession.objects.select_related('user')[:50]
        serializer = GameSessionSerializer(top_sessions, many=True)
        return Response(serializer.data)
