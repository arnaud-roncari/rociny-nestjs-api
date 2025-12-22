# syntax=docker/dockerfile:1
FROM node:23-alpine3.20
WORKDIR /code
COPY package*.json ./
RUN npm install
EXPOSE ${NEST_PORT}
COPY . .
CMD [ "npm", "run", "start:dev" ]