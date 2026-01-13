"""
Utilitaires pour la génération de fichiers .ics et calculs métier.
"""
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from icalendar import Calendar, Event
from django.conf import settings


def get_week_date_range(year, week):
    """
    Retourne les dates de début (lundi) et fin (dimanche) d'une semaine ISO.
    
    Args:
        year: Année
        week: Semaine ISO (1-53)
    
    Returns:
        tuple: (date_debut (lundi), date_fin (dimanche))
    """
    # Premier jour de l'année
    jan1 = datetime(year, 1, 1)
    
    # Ajuster pour que le lundi soit le premier jour
    # ISO week: semaine 1 contient le premier jeudi de l'année
    thursday_offset = (3 - jan1.weekday()) % 7
    first_thursday = jan1 + timedelta(days=thursday_offset)
    
    # Calculer le lundi de la semaine ISO 1
    first_monday = first_thursday - timedelta(days=3)
    
    # Calculer le lundi de la semaine demandée
    week_start = first_monday + timedelta(weeks=week - 1)
    
    # Le dimanche est 6 jours après le lundi
    week_end = week_start + timedelta(days=6)
    
    return week_start, week_end


def generate_ics_file(booking, user_email):
    """
    Génère un fichier .ics pour une réservation.
    
    Args:
        booking: Instance de Booking
        user_email: Email de l'utilisateur
    
    Returns:
        str: Contenu du fichier .ics
    """
    week_start, week_end = get_week_date_range(booking.year, booking.week)
    
    # Créer le calendrier
    cal = Calendar()
    cal.add('prodid', '-//Booking System//Senegal Regions//FR')
    cal.add('version', '2.0')
    
    # Créer l'événement
    event = Event()
    event.add('summary', f'Réservation - {booking.region.name}')
    event.add('description', 
              f'Réservation de la région {booking.region.name} pour la semaine ISO {booking.week} de {booking.year}')
    event.add('dtstart', week_start.date())
    event.add('dtend', (week_end + timedelta(days=1)).date())  # Exclure le dernier jour
    event.add('dtstamp', datetime.now())
    event.add('uid', f'booking-{booking.id}@booking-system')
    event.add('location', booking.region.name)
    event.add('organizer', user_email)
    
    cal.add_component(event)
    
    return cal.to_ical()


def calculate_coverage_rate(user):
    """
    Calcule le taux de couverture d'un utilisateur.
    
    Le taux correspond au nombre de régions distinctes réservées / 14 * 100
    
    Optimisé : utilise l'index sur user pour une requête rapide.
    
    Args:
        user: Instance de User
    
    Returns:
        float: Taux de couverture (0-100)
    """
    from bookings.models import Booking
    
    # Utilise l'index sur user pour optimiser la requête
    distinct_regions = Booking.objects.filter(user=user).values_list('region', flat=True).distinct().count()
    total_regions = getattr(settings, 'TOTAL_REGIONS', 7)
    
    if total_regions == 0:
        return 0.0
    
    return round((distinct_regions / total_regions) * 100, 2)

