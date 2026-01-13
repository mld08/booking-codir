from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'bookings'

router = DefaultRouter()
router.register(r'regions', views.RegionViewSet, basename='region')
router.register(r'bookings', views.BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
    path('coverage/my/', views.my_coverage, name='my-coverage'),
    path('weeks/availability/', views.weeks_availability, name='weeks-availability'),
    path('bookings/all-slots/', views.all_slots_availability, name='all-slots-availability'),
    path('admin/bookings/', views.admin_bookings, name='admin-bookings'),
    path('admin/coverage/', views.admin_coverage, name='admin-coverage'),
    path('admin/regions/availability/', views.admin_regions_availability, name='admin-regions-availability'),
]

