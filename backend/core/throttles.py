"""
Throttling personnalisé pour la protection anti-DDoS.
"""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Limite les tentatives de connexion à 5/minute par IP.
    Protège contre les attaques par force brute sur l'authentification.
    """
    scope = 'login'


class BurstRateThrottle(AnonRateThrottle):
    """
    Protection contre les rafales de requêtes (burst).
    Limite stricte pour détecter les attaques DDoS.
    """
    scope = 'burst'


class SustainedRateThrottle(UserRateThrottle):
    """
    Limite de requêtes soutenues pour les utilisateurs authentifiés.
    """
    scope = 'sustained'
