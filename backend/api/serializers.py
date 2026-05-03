from rest_framework import serializers
from api.models import User, GameSession


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'highest_score', 'games_played']
        read_only_fields = fields


class GameSessionSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = GameSession
        fields = ['id', 'score', 'max_tile', 'created_at', 'username']
        read_only_fields = ['id', 'created_at', 'username']

    def get_username(self, obj):
        if obj.user:
            return obj.user.first_name or obj.user.email or 'Anonymous'
        return 'Anonymous'


class SubmitScoreSerializer(serializers.Serializer):
    score = serializers.IntegerField(min_value=0)
    max_tile = serializers.IntegerField(min_value=2)
