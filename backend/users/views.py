# backend/users/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Trip
from .serializers import TripSerializer

# MÁGICA: Classe que desativa a verificação CSRF para a API
from rest_framework.authentication import SessionAuthentication
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return # Pula a checagem de segurança

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    name = request.data.get('name')
    email = request.data.get('email')
    password = request.data.get('password')
    if not name or not email or not password:
        return Response({'error': 'Preencha todos os campos.'}, status=400)
    if User.objects.filter(username=email).exists():
        return Response({'error': 'Email já cadastrado.'}, status=400)
    try:
        user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
        return Response({'message': 'Sucesso!'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=email, password=password)
    if user is not None:
        login(request, user)
        return Response({
            "message": "Login realizado",
            "user": {"id": user.id, "username": user.username, "name": user.first_name}
        })
    return Response({"error": "Credenciais inválidas"}, status=400)

class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    # AQUI: Usa a autenticação mágica sem CSRF
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)