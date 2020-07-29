FROM node:14.6.0-buster-slim
USER node
WORKDIR /home/node/
COPY yarn.lock package.json .snyk ./
RUN yarn
COPY . ./
CMD ["yarn", "start"]