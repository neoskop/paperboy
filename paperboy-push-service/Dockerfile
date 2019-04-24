FROM node:10.15.3-alpine AS node-with-yarn
RUN apk add yarn tzdata --no-cache

FROM node-with-yarn AS build
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make
WORKDIR /home/node/app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./

FROM node-with-yarn as development
USER node
WORKDIR /home/node/app
COPY --from=build --chown=node /home/node/app ./
CMD yarn start:dev

FROM node-with-yarn as production
USER node
WORKDIR /home/node/app
COPY --from=build --chown=node /home/node/app/package*.json ./
RUN yarn --only=production && \
    yarn cache clean --force >/dev/null 2>&1
COPY --from=build --chown=node /home/node/app/dist ./dist
CMD yarn start:prod