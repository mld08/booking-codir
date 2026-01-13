from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import EmailMessage
from django.conf import settings
from django.http import HttpResponse

from .models import Region, Booking
from .serializers import (
    RegionSerializer,
    BookingSerializer,
    BookingListSerializer,
    CoverageSerializer,
    AvailabilitySerializer
)
from core.permissions import IsAdmin, IsDG
from core.utils import calculate_coverage_rate, generate_ics_file
from accounts.models import User


class RegionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet pour les régions (lecture seule)."""
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [IsAuthenticated]


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet pour les réservations."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtre les réservations selon le rôle de l'utilisateur."""
        user = self.request.user
        
        if user.is_admin:
            # Admin voit toutes les réservations
            return Booking.objects.select_related('user', 'region').all()
        else:
            # DG voit seulement ses réservations
            return Booking.objects.filter(user=user).select_related('region')
    
    def get_serializer_class(self):
        """Utilise un serializer différent pour la liste."""
        if self.action == 'list':
            return BookingListSerializer
        return BookingSerializer
    
    def perform_create(self, serializer):
        """Override pour définir l'utilisateur automatiquement."""
        user = self.request.user
        
        # Seuls les DG peuvent créer des réservations (pas les admin via cette vue)
        if user.is_admin:
            return Response(
                {'error': 'Les administrateurs ne peuvent pas créer de réservations via cette endpoint.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        booking = serializer.save(user=user)
        
    @action(detail=True, methods=['get'], url_path='download-ics')
    def download_ics(self, request, pk=None):
        """
        Génère et télécharge le fichier .ics pour une réservation.
        GET /api/bookings/{id}/download-ics/
        """
        booking = self.get_object()
        
        # Générer le contenu ICS
        ics_content = generate_ics_file(booking, booking.user.email)
        
        # Créer la réponse HTTP avec le bon type de contenu
        response = HttpResponse(ics_content, content_type='text/calendar')
        filename = f"reservation_{booking.region.name}_{booking.week}_{booking.year}.ics"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    


    
    @action(detail=False, methods=['get'], permission_classes=[IsDG])
    def my(self, request):
        """
        Endpoint pour récupérer les réservations de l'utilisateur connecté.
        GET /api/bookings/my/
        """
        bookings = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def availability(self, request):
        """
        Endpoint pour vérifier la disponibilité d'une semaine pour une région.
        GET /api/bookings/availability/?region_id=1&year=2024&week=5
        """
        region_id = request.query_params.get('region_id')
        year = request.query_params.get('year')
        week = request.query_params.get('week')
        
        if not all([region_id, year, week]):
            return Response(
                {'error': 'Les paramètres region_id, year et week sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            region = Region.objects.get(pk=region_id)
            year = int(year)
            week = int(week)
        except (Region.DoesNotExist, ValueError):
            return Response(
                {'error': 'Paramètres invalides.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier si la région est déjà réservée
        # Utilise l'index composé (region, year, week) pour une requête optimale
        booking = Booking.objects.filter(
            region=region,
            year=year,
            week=week
        ).select_related('user').only('user__email').first()
        
        is_available = booking is None
        
        data = {
            'region_id': region.id,
            'region_name': region.name,
            'year': year,
            'week': week,
            'is_available': is_available,
        }
        
        # Si admin, montrer qui a réservé
        if request.user.is_admin and booking:
            data['booked_by'] = booking.user.email
        elif not is_available:
            # Pour les DG, juste indiquer que c'est réservé
            data['booked_by'] = None
        
        serializer = AvailabilitySerializer(data)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_coverage(request):
    """
    Endpoint pour récupérer le taux de couverture de l'utilisateur connecté.
    GET /api/coverage/my/
    """
    user = request.user
    
    # Seuls les DG peuvent voir leur taux
    if user.is_admin:
        return Response(
            {'error': 'Les administrateurs ne peuvent pas utiliser cet endpoint.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    distinct_regions_count = Booking.objects.filter(user=user).values_list('region', flat=True).distinct().count()
    total_regions = getattr(settings, 'TOTAL_REGIONS',7)
    coverage_rate = calculate_coverage_rate(user)
    
    data = {
        'user_email': user.email,
        'distinct_regions_count': distinct_regions_count,
        'total_regions': total_regions,
        'coverage_rate': coverage_rate
    }
    
    serializer = CoverageSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weeks_availability(request):
    """
    Endpoint pour voir les semaines disponibles pour une région et une année.
    GET /api/weeks/availability/?region_id=1&year=2024
    
    Retourne toutes les semaines (1-53) avec leur statut :
    - is_available: true (vert) si disponible, false (rouge) si réservé
    - booked_by: null pour les DG, email pour les admins
    """
    region_id = request.query_params.get('region_id')
    year = request.query_params.get('year')
    
    if not all([region_id, year]):
        return Response(
            {'error': 'Les paramètres region_id et year sont requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        region = Region.objects.get(pk=region_id)
        year = int(year)
    except (Region.DoesNotExist, ValueError):
        return Response(
            {'error': 'Paramètres invalides.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Récupérer toutes les semaines réservées pour cette région et cette année
    # Utilise l'index sur (region, year, week) pour une requête optimale
    booked_weeks = set(
        Booking.objects.filter(region=region, year=year)
        .values_list('week', flat=True)
        .order_by('week')  # Utilise l'index
    )
    
    # Si admin, récupérer les emails des réservations en une seule requête
    bookings_dict = {}
    if request.user.is_admin:
        bookings_dict = {
            booking.week: booking.user.email
            for booking in Booking.objects.filter(
                region=region, year=year
            ).select_related('user').only('week', 'user__email')
        }
    
    # Générer toutes les semaines ISO possibles (1-53)
    all_weeks = list(range(1, 54))
    
    # Créer la liste de disponibilité
    availability = []
    for week in all_weeks:
        is_available = week not in booked_weeks
        
        week_data = {
            'week': week,
            'is_available': is_available,  # false = rouge (réservé), true = vert (disponible)
        }
        
        # Si admin, montrer qui a réservé
        if request.user.is_admin and not is_available:
            week_data['booked_by'] = bookings_dict.get(week)
        else:
            # Pour les DG, booked_by est null (confidentialité préservée)
            week_data['booked_by'] = None
        
        availability.append(week_data)
    
    return Response({
        'region_id': region.id,
        'region_name': region.name,
        'year': year,
        'weeks': availability
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_slots_availability(request):
    """
    Endpoint pour voir TOUS les créneaux (toutes les régions × toutes les semaines) pour une année.
    Chaque DG peut voir tous les créneaux réservés (en rouge) et disponibles (en vert).
    
    GET /api/bookings/all-slots/?year=2024
    
    Retourne un tableau de tous les créneaux avec :
    - region_id, region_name
    - year, week
    - is_available: true (vert) si disponible, false (rouge) si réservé
    - booked_by: null pour les DG, email pour les admins
    """
    year = request.query_params.get('year')
    
    if not year:
        return Response(
            {'error': 'Le paramètre year est requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        year = int(year)
    except ValueError:
        return Response(
            {'error': 'L\'année doit être un nombre valide.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Récupérer toutes les régions
    regions = Region.objects.all().only('id', 'name').order_by('name')
    
    # Récupérer toutes les réservations pour cette année en une seule requête optimisée
    # Créer un dictionnaire: (region_id, week) -> user_email
    bookings_dict = {}
    if request.user.is_admin:
        # Pour les admins, récupérer les emails
        for booking in Booking.objects.filter(year=year).select_related('user', 'region').only(
            'region_id', 'week', 'user__email'
        ):
            bookings_dict[(booking.region_id, booking.week)] = booking.user.email
    else:
        # Pour les DG, juste vérifier si réservé (sans email)
        booked_slots = set(
            Booking.objects.filter(year=year).values_list('region_id', 'week')
        )
        bookings_dict = {slot: None for slot in booked_slots}
    
    # Générer toutes les semaines ISO (1-53)
    all_weeks = list(range(1, 54))
    
    # Créer la liste complète de tous les créneaux
    all_slots = []
    for region in regions:
        for week in all_weeks:
            slot_key = (region.id, week)
            is_available = slot_key not in bookings_dict
            
            slot_data = {
                'region_id': region.id,
                'region_name': region.name,
                'year': year,
                'week': week,
                'is_available': is_available,  # false = rouge (réservé), true = vert (disponible)
            }
            
            if request.user.is_admin and not is_available:
                # Admin voit qui a réservé
                slot_data['booked_by'] = bookings_dict.get(slot_key)
            else:
                # DG ne voit pas qui a réservé (confidentialité)
                slot_data['booked_by'] = None
            
            all_slots.append(slot_data)
    
    serializer = AvailabilitySerializer(all_slots, many=True)
    return Response({
        'year': year,
        'total_regions': len(regions),
        'total_weeks': len(all_weeks),
        'total_slots': len(all_slots),
        'slots': serializer.data
    })


# ============ ENDPOINTS ADMIN ============

@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_bookings(request):
    """
    Endpoint admin pour voir toutes les réservations.
    GET /api/admin/bookings/
    """
    # Optimisation : select_related pour éviter N+1 queries
    # Utilise l'index sur created_at pour le tri
    bookings = Booking.objects.select_related('user', 'region').only(
        'id', 'year', 'week', 'created_at',
        'user__email',
        'region__name'
    ).order_by('-created_at')
    serializer = BookingListSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_coverage(request):
    """
    Endpoint admin pour voir le taux de couverture de tous les utilisateurs.
    GET /api/admin/coverage/
    """
    # Optimisation : utiliser une seule requête avec annotation pour éviter N+1
    from django.db.models import Count
    
    # Récupérer tous les utilisateurs non-admin avec le nombre de régions distinctes
    users = User.objects.filter(
        is_admin=False, 
        is_active=True
    ).annotate(
        distinct_regions_count=Count('bookings__region', distinct=True)
    ).only('email')
    
    total_regions = getattr(settings, 'TOTAL_REGIONS', 7)
    
    coverage_data = []
    for user in users:
        coverage_rate = round((user.distinct_regions_count / total_regions) * 100, 2) if total_regions > 0 else 0.0
        
        coverage_data.append({
            'user_email': user.email,
            'distinct_regions_count': user.distinct_regions_count,
            'total_regions': total_regions,
            'coverage_rate': coverage_rate
        })
    
    serializer = CoverageSerializer(coverage_data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_regions_availability(request):
    """
    Endpoint admin pour voir la disponibilité par région.
    GET /api/admin/regions/availability/?year=2024&week=5
    """
    year = request.query_params.get('year')
    week = request.query_params.get('week')
    
    if not all([year, week]):
        return Response(
            {'error': 'Les paramètres year et week sont requis.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        year = int(year)
        week = int(week)
    except ValueError:
        return Response(
            {'error': 'Paramètres invalides.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Récupérer toutes les régions
    regions = Region.objects.all().only('id', 'name')
    
    # Optimisation : récupérer toutes les réservations en une seule requête
    bookings_dict = {
        booking.region_id: booking.user.email
        for booking in Booking.objects.filter(
            year=year,
            week=week
        ).select_related('user').only('region_id', 'user__email')
    }
    
    availability_data = []
    for region in regions:
        is_available = region.id not in bookings_dict
        
        availability_data.append({
            'region_id': region.id,
            'region_name': region.name,
            'year': year,
            'week': week,
            'is_available': is_available,
            'booked_by': bookings_dict.get(region.id) if not is_available else None
        })
    
    serializer = AvailabilitySerializer(availability_data, many=True)
    return Response(serializer.data)
