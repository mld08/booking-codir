from django.db import models
from django.core.exceptions import ValidationError
from accounts.models import User


class Region(models.Model):
    """Axes (ex-Régions) du Sénégal."""
    name = models.CharField(max_length=100, unique=True, verbose_name="Nom de l'axe")
    
    class Meta:
        verbose_name = "Axe"
        verbose_name_plural = "Axes"
        ordering = ['name']
        indexes = [
            models.Index(fields=['name'], name='region_name_idx'),
        ]
    
    def __str__(self):
        return self.name


class Booking(models.Model):
    """Réservation d'une région pour une semaine ISO."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name="Utilisateur"
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.CASCADE,
        related_name='bookings',
        verbose_name="Région"
    )
    year = models.IntegerField(verbose_name="Année")
    week = models.IntegerField(verbose_name="Semaine ISO")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    
    class Meta:
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"
        ordering = ['-created_at']
        # Contrainte d'unicité au niveau base de données
        constraints = [
            models.UniqueConstraint(
                fields=['region', 'year', 'week'],
                name='unique_region_year_week',
                violation_error_message="Cette région est déjà réservée pour cette semaine et cette année."
            )
        ]
        indexes = [
            # Index composé pour la recherche de disponibilité (requête la plus fréquente)
            models.Index(fields=['region', 'year', 'week'], name='booking_region_year_week_idx'),
            # Index pour les réservations par utilisateur
            models.Index(fields=['user', 'year'], name='booking_user_year_idx'),
            # Index pour les statistiques par utilisateur
            models.Index(fields=['user'], name='booking_user_idx'),
            # Index pour les requêtes par année
            models.Index(fields=['year', 'week'], name='booking_year_week_idx'),
            # Index pour le tri par date de création (descendant)
            models.Index(fields=['created_at'], name='booking_created_at_idx'),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.region.name} - {self.year}-W{self.week:02d}"
    
    def clean(self):
        """Validation métier."""
        # Vérification que la semaine ISO est valide (1-53)
        if self.week < 1 or self.week > 53:
            raise ValidationError({'week': 'La semaine ISO doit être entre 1 et 53.'})
        
        # Vérification que l'année est valide
        if self.year < 2000 or self.year > 2100:
            raise ValidationError({'year': 'L\'année doit être entre 2000 et 2100.'})
    
    def save(self, *args, **kwargs):
        """Surcharge pour valider avant sauvegarde."""
        self.full_clean()
        super().save(*args, **kwargs)
