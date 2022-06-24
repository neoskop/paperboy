FROM node:18.4.0-buster AS build
RUN apt-get update && \
    apt-get install -y build-essential
WORKDIR /home/node/app
COPY package*.json ./
RUN npm i
COPY --chown=node . ./

FROM node:18.4.0-buster as development
USER node
WORKDIR /home/node/app
COPY --from=build --chown=node /home/node/app ./
CMD npm run start:dev

FROM node:18.4.0-buster as production
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --from=build --chown=node /home/node/app/*.json ./
RUN npm i && \
    npm cache clean --force >/dev/null 2>&1
COPY src ./src
RUN npm run build
CMD ["node", "dist/main.js"]