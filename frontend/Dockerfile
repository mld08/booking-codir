# Étape 1 : build du frontend
FROM node:lts-bullseye-slim AS build


# Mettre à jour les paquets système
RUN apt-get update && apt-get upgrade -y && apt-get clean

# Créer le dossier
WORKDIR /app

# Copier uniquement les fichiers nécessaires à l'installation
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier tout le reste du projet
COPY . .

# Donner les permissions d'exécution à vite (important)
RUN chmod +x node_modules/.bin/vite

# Construire le build de production
RUN npm run build

RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]

# Étape 2 : serveur nginx
# FROM nginx:mainline-alpine

# # Copier le build généré vers nginx
# COPY --from=build /app/dist /usr/share/nginx/html
#COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
#EXPOSE 80

# Lancer nginx
#CMD ["nginx", "-g", "daemon off;"]
