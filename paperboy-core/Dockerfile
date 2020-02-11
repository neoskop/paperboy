FROM node:12.15.0-buster-slim
USER node
WORKDIR /home/node/
COPY yarn.lock package.json .snyk ./
RUN yarn
COPY . ./
CMD ["yarn", "start"]