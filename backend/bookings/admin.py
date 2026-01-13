from django.contrib import admin
from django.utils.html import format_html
from .models import Region, Booking


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    """Admin pour Region."""
    list_display = ['id', 'name', 'bookings_count']
    search_fields = ['name']
    ordering = ['name']
    
    def bookings_count(self, obj):
        """Affiche le nombre de réservations pour cette région."""
        count = obj.bookings.count()
        return format_html(
            '<span style="color: {};">{}</span>',
            'green' if count > 0 else 'gray',
            count
        )
    bookings_count.short_description = "Nombre de réservations"


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin pour Booking."""
    list_display = ['id', 'user_email', 'region_name', 'year', 'week', 'created_at']
    list_filter = ['year', 'week', 'region', 'created_at']
    search_fields = ['user__email', 'region__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Réservation', {
            'fields': ('user', 'region', 'year', 'week')
        }),
        ('Dates', {
            'fields': ('created_at',)
        }),
    )
    
    def user_email(self, obj):
        """Affiche l'email de l'utilisateur."""
        return obj.user.email
    user_email.short_description = "Utilisateur"
    user_email.admin_order_field = 'user__email'
    
    def region_name(self, obj):
        """Affiche le nom de la région."""
        return obj.region.name
    region_name.short_description = "Région"
    region_name.admin_order_field = 'region__name'
    
    def get_queryset(self, request):
        """Optimise les requêtes avec select_related."""
        qs = super().get_queryset(request)
        return qs.select_related('user', 'region')
    
    actions = ['export_to_csv']
    
    def export_to_csv(self, request, queryset):
        """Action pour exporter les réservations en CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="reservations.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Email', 'Région', 'Année', 'Semaine ISO', 'Date de création'])
        
        for booking in queryset:
            writer.writerow([
                booking.user.email,
                booking.region.name,
                booking.year,
                booking.week,
                booking.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    export_to_csv.short_description = "Exporter les réservations sélectionnées en CSV"
