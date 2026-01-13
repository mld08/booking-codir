from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Permission pour les administrateurs uniquement."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsDG(permissions.BasePermission):
    """Permission pour les Directeurs Généraux (non-admin)."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and not request.user.is_admin


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission : admin peut tout faire, autres en lecture seule."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin

