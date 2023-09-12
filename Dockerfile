FROM node:18-alpine3.18

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN yarn install

CMD [ "yarn", "start" ]