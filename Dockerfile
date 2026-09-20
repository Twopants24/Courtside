FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY index.html style.css game.js online.js ./
COPY stages ./stages
COPY server ./server
ENV PORT=8124
EXPOSE 8124
USER node
CMD ["npm", "start"]
