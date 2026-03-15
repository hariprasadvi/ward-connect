# FROM node:20

# WORKDIR /app

# COPY package*.json ./
# RUN npm install -g @angular/cli
# RUN npm install

# COPY . .

# # Expose the Angular dev port
# EXPOSE 4200
# CMD ["ng", "serve", "--host", "0.0.0.0"]



# Build Angular
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build -- --configuration=production

# Serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist/angular-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80