FROM node:lts-slim

WORKDIR /opt/app

COPY server.js .
COPY index.html .

EXPOSE 8080

CMD ["node", "/opt/app/server.js"]
