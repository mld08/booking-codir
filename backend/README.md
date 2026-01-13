# Système de Réservation - Backend Django/DRF

Backend pour une application de planification et de réservation hebdomadaire par région au Sénégal.

## 🚀 Installation

### Prérequis

- Python 3.8+
- PostgreSQL
- pip

### Configuration

1. **Cloner et installer les dépendances**

```bash
cd Booking-system
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configurer la base de données PostgreSQL**

Créer une base de données PostgreSQL :
```sql
CREATE DATABASE booking_db;
CREATE USER booking_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE booking_db TO booking_user;
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine :
```env
SECRET_KEY=votre-secret-key
DEBUG=True
DB_NAME=booking_db
DB_USER=booking_user
DB_PASSWORD=votre_mot_de_passe
DB_HOST=localhost
DB_PORT=5432
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-app-password
DEFAULT_FROM_EMAIL=votre-email@gmail.com
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

4. **Appliquer les migrations**

```bash
python manage.py migrate
```

5. **Créer un superutilisateur**

```bash
python manage.py createsuperuser
# Utiliser uniquement un email (pas de mot de passe)
```

6. **Lancer le serveur**

```bash
python manage.py runserver
```

## 📋 Structure du Projet

```
Booking-system/
├── accounts/          # App d'authentification
│   ├── models.py      # User, AllowedEmail, LoginToken
│   ├── views.py       # Endpoints auth (magic link)
│   ├── serializers.py
│   └── admin.py
├── bookings/          # App de réservations
│   ├── models.py      # Region, Booking
│   ├── views.py       # Endpoints métier
│   ├── serializers.py
│   └── admin.py
├── core/              # Utilitaires et permissions
│   ├── permissions.py # IsAdmin, IsDG
│   └── utils.py       # Génération .ics, calcul taux
└── config/            # Configuration Django
```

## 🔐 Authentification (Magic Link)

### 1. Demander un lien de connexion

**POST** `/api/auth/request-login/`

```json
{
  "email": "user@example.com"
}
```

L'email doit être dans `AllowedEmail` (géré via Django Admin).

### 2. Confirmer le lien et obtenir un JWT

**POST** `/api/auth/confirm-login/`

```json
{
  "token": "magic-link-token"
}
```

**Réponse:**
```json
{
  "access": "jwt-access-token",
  "refresh": "jwt-refresh-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_active": true,
    "is_admin": false,
    "date_joined": "2024-01-01T00:00:00Z"
  }
}
```

### 3. Utiliser le token JWT

Ajouter dans les headers :
```
Authorization: Bearer <access-token>
```

### 4. Rafraîchir le token

**POST** `/api/auth/token/refresh/`

```json
{
  "refresh": "refresh-token"
}
```

### 5. Déconnexion

**POST** `/api/auth/logout/`

```json
{
  "refresh": "refresh-token"
}
```

## 📍 Endpoints Métier

### Directeurs Généraux (DG)

#### Créer une réservation

**POST** `/api/bookings/`

Headers: `Authorization: Bearer <token>`

```json
{
  "region": 1,
  "year": 2024,
  "week": 5
}
```

**Contrainte:** Une région ne peut être réservée qu'une fois par semaine/année.

#### Voir ses réservations

**GET** `/api/bookings/my/`

#### Voir son taux de couverture

**GET** `/api/coverage/my/`

**Réponse:**
```json
{
  "user_email": "dg@example.com",
  "distinct_regions_count": 7,
  "total_regions": 14,
  "coverage_rate": 50.0
}
```

#### Voir les semaines disponibles

**GET** `/api/weeks/availability/?region_id=1&year=2024`

**Réponse:**
```json
{
  "region_id": 1,
  "region_name": "Dakar",
  "year": 2024,
  "weeks": [
    {"week": 1, "is_available": true},
    {"week": 2, "is_available": false, "booked_by": null},
    ...
  ]
}
```

#### Lister les régions

**GET** `/api/regions/`

### Administrateur

#### Voir toutes les réservations

**GET** `/api/admin/bookings/`

#### Voir le taux de couverture de tous les DG

**GET** `/api/admin/coverage/`

#### Voir la disponibilité par région

**GET** `/api/admin/regions/availability/?year=2024&week=5`

## 👥 Rôles et Permissions

- **DG (Directeur Général)**: `is_admin=False`
  - Voit uniquement ses réservations
  - Peut créer des réservations
  - Voit son propre taux de couverture

- **Admin**: `is_admin=True`
  - Voit toutes les réservations
  - Gère les emails autorisés
  - Voit le taux de couverture de tous

## 🗄️ Modèles

### User
- `email` (unique)
- `is_active`
- `is_admin`
- `date_joined`

### AllowedEmail
- `email` (unique)
- `is_active`
- `created_at`

### Region
- `name` (unique)
- 14 régions préchargées via migration

### Booking
- `user` (FK User)
- `region` (FK Region)
- `year` (int)
- `week` (int, 1-53)
- `created_at`
- **Contrainte unique:** (region, year, week)

## 📧 Fonctionnalités Email

Après chaque réservation, un email automatique est envoyé avec :
- Confirmation de réservation
- Fichier .ics attaché pour ajouter à l'agenda

## 📅 Génération de fichiers .ics

Les fichiers .ics sont générés automatiquement et incluent :
- Événement couvrant la semaine ISO (lundi → dimanche)
- Compatible Google Calendar, Outlook, Apple Calendar

## 🔧 Administration Django

Accéder à `/admin/` pour :

- **Gérer les emails autorisés** (`AllowedEmail`)
- **Gérer les utilisateurs** (`User`)
- **Gérer les réservations** (`Booking`)
- **Voir les régions** (`Region`)
- **Consulter l'historique global**

## 🗺️ Les 14 Régions du Sénégal

1. Dakar
2. Diourbel
3. Fatick
4. Kaffrine
5. Kaolack
6. Kédougou
7. Kolda
8. Louga
9. Matam
10. Saint-Louis
11. Sédhiou
12. Tambacounda
13. Thiès
14. Ziguinchor

## ⚙️ Configuration PostgreSQL

La contrainte d'unicité `(region, year, week)` est implémentée au niveau base de données via une `UniqueConstraint` Django.

## 🧪 Tests

```bash
python manage.py test
```

## 📝 Notes Importantes

- Aucun mot de passe : authentification uniquement par magic link
- Les emails doivent être autorisés via Django Admin
- Les réservations sont atomiques (transactions)
- Le taux de couverture = (régions distinctes réservées / 14) * 100

