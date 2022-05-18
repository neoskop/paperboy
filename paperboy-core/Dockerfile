FROM node:16.15.0-buster-slim
USER node
WORKDIR /home/node/
COPY --chown=node package*.json .snyk ./
RUN npm i
COPY . ./
CMD ["npm", "start"]