FROM node:12.13.0-buster-slim AS build
RUN apt-get update && \
    apt-get install -y build-essential
WORKDIR /home/node/app
COPY package.json yarn.lock .snyk ./
RUN yarn
COPY --chown=node . ./

FROM node:12.13.0-buster-slim as development
USER node
WORKDIR /home/node/app
COPY --from=build --chown=node /home/node/app ./
CMD yarn start:dev

FROM node:12.13.0-buster-slim as production
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --from=build --chown=node /home/node/app/*.json /home/node/app/yarn.lock ./
RUN yarn --only=production && \
    yarn cache clean --force >/dev/null 2>&1
COPY src ./src
RUN yarn build
CMD ["node", "dist/main.js"]