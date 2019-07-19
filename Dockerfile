FROM alpine:latest

EXPOSE 80/tcp
EXPOSE 3000/tcp

RUN apk update && \
    apk add --no-cache \
    nodejs \
    npm \
    yarn \
    bash && \
    apk upgrade

COPY ./src /data/src
COPY ./.babelrc /data/.babelrc
COPY ./.eslintignore /data/.eslintignore
COPY ./.eslintrc.json /data/.eslintrc.json
COPY ./.yarnclean /data/.yarnclean
COPY ./package.json /data/package.json
COPY ./yarn.lock /data/yarn.lock
COPY ./public /data/public
COPY ./views /data/views

WORKDIR /data

RUN yarn install && \
    yarn autoclean --force

ENTRYPOINT ["yarn", "start"]
