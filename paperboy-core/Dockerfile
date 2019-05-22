FROM node:12.2.0-alpine
USER node
WORKDIR /home/node/
COPY yarn.lock package.json ./
RUN yarn
COPY . ./
CMD ["yarn", "start"]