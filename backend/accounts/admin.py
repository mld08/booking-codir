from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, AllowedEmail, LoginToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin pour le modèle User personnalisé."""
    list_display = ['email', 'is_active', 'is_admin', 'date_joined']
    list_filter = ['is_active', 'is_admin', 'date_joined']
    search_fields = ['email']
    ordering = ['-date_joined']
    
    # Utiliser les fieldsets par défaut de BaseUserAdmin qui gèrent correctement les mots de passe
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Permissions'), {'fields': ('is_active', 'is_admin')}),
        (_('Important dates'), {'fields': ('date_joined', 'last_login')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_admin'),
        }),
    )
    
    filter_horizontal = []


@admin.register(AllowedEmail)
class AllowedEmailAdmin(admin.ModelAdmin):
    """Admin pour AllowedEmail."""
    list_display = ['email', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['email']
    list_editable = ['is_active']
    ordering = ['-created_at']


@admin.register(LoginToken)
class LoginTokenAdmin(admin.ModelAdmin):
    """Admin pour LoginToken (lecture seule pour debug)."""
    list_display = ['email', 'token_short', 'created_at', 'expires_at', 'used', 'is_valid']
    list_filter = ['used', 'created_at']
    search_fields = ['email', 'token']
    readonly_fields = ['email', 'token', 'created_at', 'expires_at', 'used']
    ordering = ['-created_at']
    
    def token_short(self, obj):
        """Affiche les 8 premiers caractères du token."""
        return f"{obj.token[:8]}..."
    token_short.short_description = "Token"
    
    def is_valid(self, obj):
        """Affiche si le token est valide."""
        return obj.is_valid()
    is_valid.boolean = True
    is_valid.short_description = "Valide"
    
    def has_add_permission(self, request):
        """Désactive la création via admin."""
        return False
