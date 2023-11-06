# syntax=docker/dockerfile:1.4

FROM node:alpine

WORKDIR /usr/src/app
EXPOSE 5173

COPY ./package.json /usr/src/app/package.json

RUN yarn install
CMD ["yarn", "dev", "--host"]