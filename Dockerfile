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

COPY ./public /data/public
COPY ./src /data/src
COPY ./types /data/types
COPY ./views /data/views
COPY ./.babelrc /data/.babelrc
COPY ./.prettierrc.json /data/.prettierrc.json
COPY ./.yarnclean /data/.yarnclean
COPY ./package.json /data/package.json
COPY ./tsconfig.json /data/tsconfig.json
COPY ./tslint.json /data/tslint.json
COPY ./yarn.lock /data/yarn.lock

WORKDIR /data

RUN yarn install && \
    yarn autoclean --force && \
    yarn build

ENTRYPOINT ["yarn", "server"]
