"""
Backend d'authentification personnalisé pour Django Admin.
Permet la connexion via email avec mot de passe.
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Backend d'authentification qui utilise l'email comme identifiant.
    Compatible avec les mots de passe pour Django Admin.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Django Admin passe l'email dans le champ "username"
        email = username or kwargs.get('email')
        
        if email is None or password is None:
            return None
        
        # Normaliser l'email (lowercase, strip)
        email = User.objects.normalize_email(email)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Retourner None au lieu de lever une exception pour ne pas exposer l'email
            return None
        
        # Vérifier le mot de passe et l'état actif
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
    
    def user_can_authenticate(self, user):
        """Vérifie si l'utilisateur peut s'authentifier."""
        is_active = getattr(user, 'is_active', None)
        return is_active is True

