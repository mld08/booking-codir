from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
# from . import admin_views

app_name = 'accounts'

# Router pour les endpoints admin
router = DefaultRouter()
# On remplace AllowedEmailViewSet par UserViewSet car AllowedEmail est obsolète/moins pertinent avec le nouveau système
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('', include(router.urls)),
]

