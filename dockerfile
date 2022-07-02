FROM node:14-slim
WORKDIR /
COPY . /
COPY package.json /
RUN npm i
EXPOSE 8030