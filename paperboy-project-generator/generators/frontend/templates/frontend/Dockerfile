FROM node:18.4.0-alpine AS dependencies
WORKDIR /home/node/app
COPY package*.json ./
RUN npm i

FROM node:18.4.0-alpine AS base
RUN apk add --no-cache py-pip supervisor bash sed
RUN mkdir -p /var/log/supervisor
USER node
RUN pip install --upgrade --user awscli
ENV PATH="/home/node/.local/bin:${PATH}" \
    PAPERBOY_STAGE="docker"
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY --from=dependencies --chown=node /home/node/app/node_modules node_modules
COPY --chown=node . ./

ENTRYPOINT ["supervisord", "-c", "supervisord.conf"]
