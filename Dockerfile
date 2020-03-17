FROM dutchoven/express AS build

COPY package*.json /app/
RUN npm ci

FROM dutchoven/express

RUN apk update && apk upgrade && apk add jq

# this is dangerous for larger apps due to the chances of collision
COPY --from=build /app/node_modules ./node_modules
COPY config.json /app/
COPY index.js /app/src/resources/

CMD ./bin/www $(jq -c . < config.json)