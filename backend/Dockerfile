# Utiliser une image Python officielle légère comme base
FROM python:3.12-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    netcat-openbsd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root AVANT copie
RUN adduser --disabled-password --gecos '' appuser

# Copier le fichier des dépendances
COPY requirements.txt /app/

# Installer les dépendances Python
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copier le reste du code source
COPY . /app/

# Changer le propriétaire des fichiers
RUN chown -R appuser:appuser /app

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port Django
EXPOSE 8000

# Lancer Gunicorn (config prod minimale)
CMD [
  "gunicorn",
  "config.wsgi:application",
  "--bind", "0.0.0.0:8000",
  "--workers", "3",
  "--timeout", "60",
  "--log-level", "info",
  "--access-logfile", "-",
  "--error-logfile", "-",
  "--forwarded-allow-ips", "*"
]
