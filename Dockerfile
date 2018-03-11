FROM keymetrics/pm2:8-stretch

# Bundle APP files
RUN mkdir -p app
WORKDIR /app
COPY src src/
COPY package.json .
COPY pm2.json .
COPY package-lock.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

EXPOSE 1789
CMD [ "pm2-runtime", "start", "pm2.json" ]