# # Use an official Node runtime
# FROM node:20-slim

# # Install Puppeteer dependencies (needed for the Job Finder scraper)
# RUN apt-get update && apt-get install -y \
#     chromium \
#     fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
#     --no-install-recommends && rm -rf /var/lib/apt/lists/*

# WORKDIR /app

# # Set Puppeteer to use the installed Chromium
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# COPY package*.json ./
# RUN npm install

# COPY . .

# EXPOSE 3000
# CMD ["npm", "start"]


FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]