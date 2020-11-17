FROM node:lts-slim

COPY server.js /server.js

EXPOSE 8080

CMD ["node", "/server.js"]
