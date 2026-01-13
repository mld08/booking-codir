"""
Script pour tester la connexion d'un utilisateur.
Usage: python test_login.py email@example.com password
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from accounts.backends import EmailBackend


def test_login(email, password):
    """Teste la connexion d'un utilisateur."""
    print(f"\n🔍 Test d'authentification pour: {email}")
    print("-" * 50)
    
    # Normaliser l'email
    normalized_email = User.objects.normalize_email(email)
    print(f"Email normalisé: {normalized_email}")
    
    # Vérifier si l'utilisateur existe
    try:
        user = User.objects.get(email=normalized_email)
        print(f"✅ Utilisateur trouvé dans la base de données")
        print(f"   - Email: {user.email}")
        print(f"   - is_admin: {user.is_admin}")
        print(f"   - is_active: {user.is_active}")
        print(f"   - has_usable_password: {user.has_usable_password()}")
    except User.DoesNotExist:
        print(f"❌ Utilisateur {normalized_email} non trouvé dans la base de données")
        print(f"\nTous les utilisateurs dans la base:")
        for u in User.objects.all():
            print(f"   - {u.email} (admin={u.is_admin}, active={u.is_active})")
        return
    
    # Tester le mot de passe
    if user.check_password(password):
        print(f"✅ Le mot de passe est correct")
    else:
        print(f"❌ Le mot de passe est INCORRECT")
        print(f"\n💡 Solution: Réinitialiser le mot de passe avec:")
        print(f"   python manage.py changepassword {email}")
        return
    
    # Tester le backend d'authentification
    backend = EmailBackend()
    authenticated_user = backend.authenticate(
        request=None,
        username=normalized_email,
        password=password
    )
    
    if authenticated_user:
        print(f"✅ Authentification réussie via le backend")
        print(f"   - Email: {authenticated_user.email}")
        print(f"   - Peut s'authentifier: {backend.user_can_authenticate(authenticated_user)}")
    else:
        print(f"❌ Échec de l'authentification via le backend")
        print(f"   - user.can_authenticate: {backend.user_can_authenticate(user)}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python test_login.py email@example.com password")
        print("\nOu testez sans mot de passe pour voir les utilisateurs:")
        print("   python test_login.py")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else None
    
    if password:
        test_login(email, password)
    else:
        print("\n📋 Liste des utilisateurs:")
        for user in User.objects.all():
            print(f"   - {user.email} (admin={user.is_admin}, active={user.is_active}, has_password={user.has_usable_password()})")
