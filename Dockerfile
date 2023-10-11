FROM node:20-slim

WORKDIR /backend/

COPY . /backend/

COPY ./package.json .

COPY ./wait-for-it.sh .

COPY ./src/.env .

RUN  chmod +x ./wait-for-it.sh

# RUN ["./wait-for-it.zsh","5432", "--", "yarn", "run", "dev"]
# COPY ./entrypoint.sh /entrypoint.sh

# RUN chmod +x /entrypoint.sh

# RUN  apt-get update

# RUN apt-get install postgis -y

RUN yarn

# ENTRYPOINT ["./wait-for-it.sh","db:5432", "--", "yarn", "run", "dev"]
ENTRYPOINT [ "yarn", "run", "start" ]