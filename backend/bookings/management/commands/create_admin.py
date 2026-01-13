from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import AllowedEmail
import os

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_ADMIN_EMAIL")
        password = os.environ.get("DJANGO_ADMIN_PASSWORD")

        if not email or not password:
            self.stdout.write("Admin env vars not set")
            return

        user, created = User.objects.get_or_create(email=email)

        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.set_password(password)
        user.save()

        AllowedEmail.objects.update_or_create(
            email=email,
            defaults={"is_active": True}
        )

        self.stdout.write("Admin ready")
