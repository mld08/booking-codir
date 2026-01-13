"""
Script utilitaire pour créer un superutilisateur admin avec mot de passe.
Usage: python create_admin.py email@example.com password
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User, AllowedEmail


def create_admin(email, password=None):
    """Crée un superutilisateur admin avec mot de passe."""
    email = email.lower().strip()
    
    # Vérifier si l'utilisateur existe déjà
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        user.is_admin = True
        user.is_active = True
        if password:
            user.set_password(password)
            print(f"✅ Mot de passe défini pour {email}.")
        user.save()
        print(f"✅ Utilisateur {email} mis à jour comme admin.")
    else:
        if password:
            user = User.objects.create_superuser(
                email=email,
                password=password
            )
            print(f"✅ Admin créé: {email} avec mot de passe.")
        else:
            user = User.objects.create_user(
                email=email,
                is_admin=True,
                is_active=True
            )
            print(f"✅ Admin créé: {email} (sans mot de passe).")
            print("⚠️  Utilisez 'python manage.py changepassword' pour définir un mot de passe.")
    
    # S'assurer que l'email est dans AllowedEmail
    if not AllowedEmail.objects.filter(email=email).exists():
        AllowedEmail.objects.create(
            email=email,
            is_active=True
        )
        print(f"✅ Email ajouté à la liste des emails autorisés.")
    else:
        allowed = AllowedEmail.objects.get(email=email)
        allowed.is_active = True
        allowed.save()
        print(f"✅ Email déjà autorisé et activé.")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python create_admin.py email@example.com [password]")
        print("       ou utilisez: python manage.py createsuperuser")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2] if len(sys.argv) > 2 else None
    create_admin(email, password)

