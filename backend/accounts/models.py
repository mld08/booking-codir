from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Manager pour le modèle User personnalisé."""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crée et retourne un utilisateur avec email."""
        if not email:
            raise ValueError('L\'email doit être fourni')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crée et retourne un superutilisateur avec mot de passe."""
        extra_fields.setdefault('is_admin', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_admin') is not True:
            raise ValueError('Superuser doit avoir is_admin=True')
        
        if not password:
            raise ValueError('Le mot de passe est requis pour créer un superutilisateur')
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    """Modèle User personnalisé avec email comme identifiant."""
    email = models.EmailField(unique=True, verbose_name="Email")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    is_admin = models.BooleanField(default=False, verbose_name="Administrateur")
    date_joined = models.DateTimeField(default=timezone.now, verbose_name="Date d'inscription")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = UserManager()
    
    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email'], name='user_email_idx'),
            models.Index(fields=['is_active', 'is_admin'], name='user_status_idx'),
        ]
    
    def __str__(self):
        return self.email
    
    def has_perm(self, perm, obj=None):
        """Retourne True si l'utilisateur a la permission spécifiée."""
        return self.is_admin
    
    def has_module_perms(self, app_label):
        """Retourne True si l'utilisateur a les permissions pour l'app."""
        return self.is_admin
    
    @property
    def is_staff(self):
        """Retourne True si l'utilisateur est admin (pour Django Admin)."""
        return self.is_admin


class AllowedEmail(models.Model):
    """Emails autorisés pour l'authentification."""
    email = models.EmailField(unique=True, verbose_name="Email autorisé")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    
    class Meta:
        verbose_name = "Email autorisé"
        verbose_name_plural = "Emails autorisés"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'is_active'], name='allowed_email_lookup_idx'),
            models.Index(fields=['is_active'], name='allowed_email_active_idx'),
        ]
    
    def __str__(self):
        return self.email


class LoginToken(models.Model):
    """Token temporaire pour magic link authentication."""
    email = models.EmailField(verbose_name="Email")
    token = models.CharField(max_length=64, unique=True, verbose_name="Token")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    expires_at = models.DateTimeField(verbose_name="Date d'expiration")
    used = models.BooleanField(default=False, verbose_name="Utilisé")
    
    class Meta:
        verbose_name = "Token de connexion"
        verbose_name_plural = "Tokens de connexion"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token', 'used']),
            models.Index(fields=['email', 'used']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.token[:8]}..."
    
    def is_valid(self):
        """Vérifie si le token est valide (non utilisé et non expiré)."""
        return not self.used and timezone.now() < self.expires_at
