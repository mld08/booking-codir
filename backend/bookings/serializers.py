from rest_framework import serializers
from .models import Region, Booking
from accounts.serializers import UserSerializer
from django.db import transaction
from django.core.exceptions import ValidationError


class RegionSerializer(serializers.ModelSerializer):
    """Serializer pour Region."""
    
    class Meta:
        model = Region
        fields = ['id', 'name']
        read_only_fields = ['id']


class BookingSerializer(serializers.ModelSerializer):
    """Serializer pour Booking."""
    region_name = serializers.CharField(source='region.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'user', 'user_email', 'region', 'region_name', 'year', 'week', 'created_at']
        read_only_fields = ['id', 'user', 'user_email', 'created_at']
    
    def validate_week(self, value):
        """Validation de la semaine ISO."""
        if value < 1 or value > 53:
            raise serializers.ValidationError("La semaine ISO doit être entre 1 et 53.")
        return value
    
    def validate_year(self, value):
        """Validation de l'année."""
        if value < 2000 or value > 2100:
            raise serializers.ValidationError("L'année doit être entre 2000 et 2100.")
        return value
    
    def validate(self, attrs):
        """
        Validation globale pour vérifier la disponibilité.
        S'applique à la création et à la mise à jour.
        """
        region = attrs.get('region')
        year = attrs.get('year')
        week = attrs.get('week')
        
        # En cas de mise à jour partielle, récupérer les valeurs existantes si non fournies
        if self.instance and not region:
            region = self.instance.region
        if self.instance and not year:
            year = self.instance.year
        if self.instance and not week:
            week = self.instance.week
            
        # Requête pour vérifier les conflits
        queryset = Booking.objects.filter(
            region=region,
            year=year,
            week=week
        )
        
        # Si c'est une mise à jour, exclure l'instance actuelle de la vérification
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
            
        if queryset.exists():
            raise serializers.ValidationError({
                'non_field_errors': [
                    f"L'axe ({region.name}) est déjà réservé pour la semaine existante ISO {week} de l'année {year}."
                ]
            })
            
        return attrs


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour les listes de réservations."""
    region_name = serializers.CharField(source='region.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'user_email', 'region_name', 'year', 'week', 'created_at']


class CoverageSerializer(serializers.Serializer):
    """Serializer pour le taux de couverture."""
    user_email = serializers.EmailField()
    distinct_regions_count = serializers.IntegerField()
    total_regions = serializers.IntegerField()
    coverage_rate = serializers.FloatField()


class AvailabilitySerializer(serializers.Serializer):
    """Serializer pour la disponibilité des semaines."""
    region_id = serializers.IntegerField()
    region_name = serializers.CharField()
    year = serializers.IntegerField()
    week = serializers.IntegerField()
    is_available = serializers.BooleanField()
    booked_by = serializers.EmailField(allow_null=True, required=False)

