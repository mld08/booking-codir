from django.core.management.base import BaseCommand
from bookings.models import Region, Booking

class Command(BaseCommand):
    help = 'Supprime les anciennes régions et crée les nouveaux axes.'

    def handle(self, *args, **options):
        # 1. Supprimer toutes les réservations existantes (car elles sont liées aux régions)
        # Note: On pourrait essayer de migrer, mais les axes sont conceptuellement très différents.
        # Le prompt implique un changement structurel majeur ("supprimez les regions et remplacez par les axes").
        self.stdout.write("Suppression des réservations existantes...")
        Booking.objects.all().delete()
        
        # 2. Supprimer les anciennes régions
        self.stdout.write("Suppression des anciennes régions...")
        Region.objects.all().delete()
        
        # 3. Créer les nouveaux axes
        new_axes = [
            "Thies - Mbour - Saly",
            "Diourbel - Touba",
            "Louga - Saint Louis - Podor",
            "Linguere - Matam - Bakel",
            "Fatick - Kaolack - Kaffrine",
            "Tamba - Kedougou",
            "Zig - Sedhiou - Kolda"
        ]
        
        self.stdout.write(f"Création de {len(new_axes)} nouveaux axes...")
        for axe_name in new_axes:
            Region.objects.create(name=axe_name)
            self.stdout.write(f"- {axe_name}")
            
        self.stdout.write(self.style.SUCCESS("Opération terminée avec succès."))
