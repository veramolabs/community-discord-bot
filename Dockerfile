FROM node:16
WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
ADD config config
RUN yarn
RUN yarn register
CMD ["yarn", "start"]