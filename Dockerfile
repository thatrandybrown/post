FROM dutchoven/express AS build

COPY package*.json /app/
RUN npm ci

FROM dutchoven/express

# this is dangerous for larger apps due to the chances of collision
COPY --from=build /app/node_modules ./node_modules
COPY index.js /app/src/resources/