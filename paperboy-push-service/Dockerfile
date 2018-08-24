FROM node:10.5.0-alpine AS build
WORKDIR /home/node
COPY *.json ./
RUN npm i
COPY . ./
RUN npm run build

FROM node:10.5.0-alpine as development
USER node
WORKDIR /home/node
COPY --from=build --chown=node /home/node ./
CMD npm run dev

FROM node:10.5.0-alpine as production
USER node
WORKDIR /home/node
COPY --from=build --chown=node /home/node/package*.json ./
RUN npm --only=production i && \
    npm cache clean --force >/dev/null 2>&1
COPY --from=build --chown=node /home/node/dist ./dist
CMD npm start