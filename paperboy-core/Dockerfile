FROM node:20.15.0-buster-slim
USER node
WORKDIR /home/node/
COPY --chown=node package*.json ./
RUN npm i
COPY . ./
CMD ["npm", "start"]