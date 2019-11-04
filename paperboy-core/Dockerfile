FROM node:12.13.0-buster-slim
USER node
WORKDIR /home/node/
COPY yarn.lock package.json ./
RUN yarn
COPY . ./
CMD ["yarn", "start"]