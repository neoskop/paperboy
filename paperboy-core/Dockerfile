FROM node:18.12.1-buster-slim
USER node
WORKDIR /home/node/
COPY --chown=node package*.json ./
RUN npm i
COPY . ./
CMD ["npm", "start"]