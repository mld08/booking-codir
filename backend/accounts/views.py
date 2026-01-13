from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import LoginSerializer, UserSerializer, UserCreateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from core.permissions import IsAdmin

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint de connexion standard (Email + Mot de passe).
    POST /api/auth/login/
    Body: {"email": "user@example.com", "password": "password123"}
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Génération JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        user_serializer = UserSerializer(user)
        
        # Logique de redirection spécifique
        # "nafissa.fall1@orange-sonatel.com" -> Admin -> vers interface admin
        # Autres -> DG -> vers interface DG
        
        # Vérification stricte de l'email admin comme demandé ou baser sur is_admin
        # Le prompt dit : si l'email est "nafissa.fall1@orange-sonatel.com" il redirige vers l'administrateur
        
        is_platform_admin = user.email.lower() == "nafissa.fall1@orange-sonatel.com" or user.is_admin
        
        user_type = 'admin' if is_platform_admin else 'dg'
        redirect_to = '/admin' if is_platform_admin else '/dashboard'
        
        # Mise à jour de is_admin si c'est l'email spécifique (au cas où il ne le serait pas en base)
        if user.email.lower() == "nafissa.fall1@orange-sonatel.com" and not user.is_admin:
            user.is_admin = True
            user.save()

        # Session pour Admin (via Django Auth) si nécessaire pour l'admin panel Django classique
        if user.is_admin:
            from django.contrib.auth import login
            login(request, user)
        
        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'user': user_serializer.data,
            'user_type': user_type,
            'redirect_to': redirect_to,
            'message': 'Connexion réussie.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def logout(request):
    """
    Endpoint pour se déconnecter (blacklist du refresh token).
    POST /api/auth/logout/
    Body: {"refresh": "refresh-token"}
    """
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({
            'message': 'Déconnexion réussie.'
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({
            'error': 'Erreur lors de la déconnexion.'
        }, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """
    Gestion des utilisateurs (DG) par l'administrateur.
    Permet d'ajouter, modifier, supprimer des DG.
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdmin]  # Seul l'admin peut gérer les users
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateSerializer
        return UserSerializer
    
    def perform_create(self, serializer):
        # Création d'un DG par défaut
        serializer.save(is_admin=False)
        
    def perform_destroy(self, instance):
        # Empêcher de supprimer l'admin principal
        if instance.email.lower() == "nafissa.fall1@orange-sonatel.com":
             return Response(
                {'error': 'Impossible de supprimer l\'administrateur principal.'},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()
