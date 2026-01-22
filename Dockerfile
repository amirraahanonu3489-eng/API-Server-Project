FROM node:18-alpine

# ---------- METADATA ----------
LABEL maintainer="Amirra Ahanonu"
LABEL description="Node.js Card API Server"
LABEL cohort="Cohort-26"
LABEL animal="Wolf"

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY server.js .
COPY cards.json .
COPY users.json .
COPY .env .

EXPOSE 3000/tcp

CMD ["node", "server.js"]

