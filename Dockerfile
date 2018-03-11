FROM keymetrics/pm2:8-stretch

# Bundle APP files
COPY src src/
COPY package.json .
COPY package-lock.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

EXPOSE 1789
CMD [ "pm2-runtime", "start", "src/index.js" ] 