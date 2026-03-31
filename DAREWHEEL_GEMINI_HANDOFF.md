# DareWheel — Full Project Handoff

## Project Overview
**DareWheel** is a full-stack Truth or Dare web app with:
- 6 game modes
- 1,500 questions
- Real-time multiplayer
- 11-language support

---

## Tech Stack
| Layer | Technology |
|---|---|
| Backend | Python Django + Django REST Framework |
| WebSockets | Django Channels |
| Database | PostgreSQL |
| Cache / Channel Layer | Redis |
| Frontend | React Vite |
| Environment | Windows / PowerShell |

---

## Project Structure
```
D:\zentry_hub_projects\darewheel\
├── .venv\
├── backend\
│   └── core\                        ← Django project root (manage.py is HERE)
│       ├── manage.py
│       ├── core\                    ← Django settings/urls
│       │   ├── settings.py
│       │   ├── urls.py
│       │   ├── asgi.py
│       │   └── wsgi.py
│       └── game\                    ← Main Django app
│           ├── models.py
│           ├── serializers.py
│           ├── views.py
│           ├── urls.py
│           ├── consumers.py
│           ├── admin.py
│           └── management\
│               ├── __init__.py
│               └── commands\
│                   ├── __init__.py
│                   └── load_questions.py
```

---

## Django Settings (core/settings.py) — Key Parts

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'channels',
    'corsheaders',
    'game',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... default middleware
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'darewheel_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

ASGI_APPLICATION = 'core.asgi.application'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}

CORS_ALLOW_ALL_ORIGINS = True  # Dev only
```

---

## ASGI Config (core/asgi.py)

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from game import routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(routing.websocket_urlpatterns)
    ),
})
```

---

## Models (game/models.py)

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    avatar = models.URLField(blank=True, null=True)
    language = models.CharField(max_length=10, default='en')
    total_games = models.IntegerField(default=0)
    total_wins = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'


class Question(models.Model):
    TYPE_CHOICES = [('truth', 'Truth'), ('dare', 'Dare')]
    DIFFICULTY_CHOICES = [('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    LANGUAGE_CHOICES = [
        ('en', 'English'), ('es', 'Spanish'), ('fr', 'French'),
        ('de', 'German'), ('it', 'Italian'), ('pt', 'Portuguese'),
        ('ja', 'Japanese'), ('ko', 'Korean'), ('zh', 'Chinese'),
        ('ar', 'Arabic'), ('hi', 'Hindi'),
    ]
    GAME_MODE_CHOICES = [
        ('classic', 'Classic'), ('hot_seat', 'Hot Seat'),
        ('couples', 'Couples'), ('party', 'Party'),
        ('kids', 'Kids'), ('extreme', 'Extreme'),
    ]

    text = models.TextField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.CharField(max_length=50, default='general')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    game_mode = models.CharField(max_length=20, choices=GAME_MODE_CHOICES, default='classic')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'questions'

    def __str__(self):
        return f"[{self.type}] {self.text[:50]}"


class GameRoom(models.Model):
    STATUS_CHOICES = [('waiting', 'Waiting'), ('active', 'Active'), ('finished', 'Finished')]

    room_code = models.CharField(max_length=8, unique=True)
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hosted_rooms')
    game_mode = models.CharField(max_length=20, default='classic')
    language = models.CharField(max_length=10, default='en')
    max_players = models.IntegerField(default=8)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='waiting')
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'game_rooms'

    def __str__(self):
        return f"Room {self.room_code} ({self.status})"


class GameSession(models.Model):
    room = models.ForeignKey(GameRoom, on_delete=models.CASCADE, related_name='sessions')
    players = models.ManyToManyField(User, related_name='sessions')
    current_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='current_sessions')
    current_question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True)
    round_number = models.IntegerField(default=1)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'game_sessions'


class GameAnswer(models.Model):
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='answers')
    player = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    skipped = models.BooleanField(default=False)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'game_answers'


class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    truths_answered = models.IntegerField(default=0)
    dares_completed = models.IntegerField(default=0)
    dares_skipped = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)

    class Meta:
        db_table = 'user_stats'


class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievements'


class Leaderboard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game_mode = models.CharField(max_length=20)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    period = models.CharField(max_length=20, default='all_time')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboard'
```

---

## Serializers (game/serializers.py)

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Question, GameRoom, GameSession, GameAnswer, UserStats, Achievement, Leaderboard

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'language', 'total_games', 'total_wins', 'created_at']
        read_only_fields = ['id', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserStats.objects.create(user=user)
        return user

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class GameRoomSerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)

    class Meta:
        model = GameRoom
        fields = '__all__'
        read_only_fields = ['room_code', 'created_at']

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = '__all__'

class GameAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAnswer
        fields = '__all__'

class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = '__all__'

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = '__all__'

class LeaderboardSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Leaderboard
        fields = '__all__'
```

---

## Views (game/views.py)

```python
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
import random
import string
from .models import Question, GameRoom, GameSession, GameAnswer, UserStats, Achievement, Leaderboard
from .serializers import *

User = get_user_model()

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data}, status=201)

class LoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': UserSerializer(user).data})
        return Response({'error': 'Invalid credentials'}, status=400)

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.filter(is_active=True)
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        game_mode = self.request.query_params.get('game_mode')
        language = self.request.query_params.get('language')
        q_type = self.request.query_params.get('type')
        difficulty = self.request.query_params.get('difficulty')
        if game_mode:
            qs = qs.filter(game_mode=game_mode)
        if language:
            qs = qs.filter(language=language)
        if q_type:
            qs = qs.filter(type=q_type)
        if difficulty:
            qs = qs.filter(difficulty=difficulty)
        return qs

    @action(detail=False, methods=['get'])
    def random(self, request):
        qs = self.get_queryset()
        if not qs.exists():
            return Response({'error': 'No questions found'}, status=404)
        question = random.choice(qs)
        return Response(QuestionSerializer(question).data)

class GameRoomViewSet(viewsets.ModelViewSet):
    queryset = GameRoom.objects.all()
    serializer_class = GameRoomSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        code = generate_room_code()
        while GameRoom.objects.filter(room_code=code).exists():
            code = generate_room_code()
        serializer.save(host=self.request.user, room_code=code)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        room = self.get_object()
        if room.status != 'waiting':
            return Response({'error': 'Room is not available'}, status=400)
        session = room.sessions.filter(ended_at=None).first()
        if session:
            session.players.add(request.user)
        return Response({'message': 'Joined successfully', 'room': GameRoomSerializer(room).data})

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        room = self.get_object()
        if room.host != request.user:
            return Response({'error': 'Only host can start'}, status=403)
        room.status = 'active'
        room.save()
        session = GameSession.objects.create(room=room, current_player=request.user)
        session.players.add(request.user)
        return Response({'message': 'Game started', 'session_id': session.id})

class UserStatsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserStats.objects.filter(user=self.request.user)

class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Leaderboard.objects.all().order_by('-score')
    serializer_class = LeaderboardSerializer
```

---

## URL Routing (game/urls.py)

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('questions', views.QuestionViewSet)
router.register('rooms', views.GameRoomViewSet)
router.register('stats', views.UserStatsViewSet, basename='stats')
router.register('leaderboard', views.LeaderboardViewSet)

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.LoginView.as_view()),
    path('', include(router.urls)),
]
```

---

## Main URLs (core/urls.py)

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('game.urls')),
]
```

---

## WebSocket Consumer (game/consumers.py)

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import GameRoom, GameSession, Question
import random

class GameConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'game_{self.room_code}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'player_joined',
            'message': f'A player joined room {self.room_code}'
        })

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'spin_wheel':
            question = await self.get_random_question(data.get('game_mode', 'classic'), data.get('language', 'en'))
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'question_assigned',
                'question': question
            })
        elif action == 'answer_complete':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'next_turn',
                'player_id': data.get('player_id')
            })
        elif action == 'skip':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'next_turn',
                'skipped': True,
                'player_id': data.get('player_id')
            })

    @database_sync_to_async
    def get_random_question(self, game_mode, language):
        questions = list(Question.objects.filter(
            game_mode=game_mode, language=language, is_active=True
        ))
        if not questions:
            return None
        q = random.choice(questions)
        return {'id': q.id, 'text': q.text, 'type': q.type, 'difficulty': q.difficulty}

    async def player_joined(self, event):
        await self.send(text_data=json.dumps({'type': 'player_joined', 'message': event['message']}))

    async def question_assigned(self, event):
        await self.send(text_data=json.dumps({'type': 'question_assigned', 'question': event['question']}))

    async def next_turn(self, event):
        await self.send(text_data=json.dumps({'type': 'next_turn', 'data': event}))
```

---

## WebSocket Routing (game/routing.py)

```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_code>\w+)/$', consumers.GameConsumer.as_asgi()),
]
```

---

## Management Command (game/management/commands/load_questions.py)

```python
import json
import os
from django.core.management.base import BaseCommand
from game.models import Question

class Command(BaseCommand):
    help = 'Load questions from JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str)

    def handle(self, *args, **options):
        json_file = options['json_file']
        if not os.path.exists(json_file):
            self.stdout.write(self.style.ERROR(f'File not found: {json_file}'))
            return

        with open(json_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)

        created, skipped = 0, 0
        for q in questions:
            obj, created_flag = Question.objects.get_or_create(
                text=q['text'],
                defaults={
                    'type': q.get('type', 'truth'),
                    'category': q.get('category', 'general'),
                    'difficulty': q.get('difficulty', 'medium'),
                    'language': q.get('language', 'en'),
                    'game_mode': q.get('game_mode', 'classic'),
                    'is_active': q.get('is_active', True),
                }
            )
            if created_flag:
                created += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(f'Done! Created: {created}, Skipped: {skipped}'))
```

---

## Admin (game/admin.py)

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Question, GameRoom, GameSession, GameAnswer, UserStats, Achievement, Leaderboard

admin.site.register(User, UserAdmin)
admin.site.register(Question)
admin.site.register(GameRoom)
admin.site.register(GameSession)
admin.site.register(GameAnswer)
admin.site.register(UserStats)
admin.site.register(Achievement)
admin.site.register(Leaderboard)
```

---

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login, get token |
| GET | `/api/questions/` | List questions (filterable) |
| GET | `/api/questions/random/` | Get random question |
| POST | `/api/rooms/` | Create game room |
| POST | `/api/rooms/{id}/join/` | Join a room |
| POST | `/api/rooms/{id}/start/` | Start game (host only) |
| GET | `/api/stats/` | Current user stats |
| GET | `/api/leaderboard/` | Global leaderboard |

---

## WebSocket Events

| Action (client → server) | Event (server → client) |
|---|---|
| `spin_wheel` | `question_assigned` |
| `answer_complete` | `next_turn` |
| `skip` | `next_turn` (skipped=true) |
| connect | `player_joined` |

**WS URL:** `ws://localhost:8000/ws/game/{room_code}/`

---

## What's Done ✅
- Django project created and configured
- PostgreSQL + Redis + Django Channels set up in settings
- All 8 models defined and migrated
- Serializers, ViewSets, Auth views complete
- WebSocket consumer with spin/answer/skip logic
- Management command to bulk-load 1,500 questions from JSON
- Admin panel registered
- `makemigrations` + `migrate` completed

## What's Next 🔜
1. Start Django dev server: `python manage.py runserver`
2. Create superuser: `python manage.py createsuperuser`
3. Load questions: `python manage.py load_questions questions.json`
4. Build React Vite frontend
5. Connect frontend to REST API + WebSocket

---

## Important Notes for Windows / PowerShell
- Use `New-Item` instead of `touch`
- Use backslashes `\` in paths
- `manage.py` lives at `D:\zentry_hub_projects\darewheel\backend\core\`
- Always activate venv: `.\.venv\Scripts\activate` from project root
- AUTH_USER_MODEL must be set to `'game.User'` in settings.py
