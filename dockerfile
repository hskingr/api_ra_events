FROM node:14-slim
WORKDIR /app
COPY . .
COPY package.json package.json
RUN npm i
EXPOSE 80