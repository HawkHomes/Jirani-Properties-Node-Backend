FROM node:18-slim

WORKDIR /backend/

COPY . .

COPY ./package.json .

COPY ./wait-for-it.sh .

RUN  chmod +x ./wait-for-it.sh

# RUN yarn

ENTRYPOINT [ "yarn", "dev" ]