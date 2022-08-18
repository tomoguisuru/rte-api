FROM node:16 as base

COPY package*.json ./

RUN npm install -g typescript
RUN npm install -g sequelize-cli

RUN npm i

COPY . .

FROM base as production

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

