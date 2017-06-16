FROM node:6

RUN apt-get update \
    && apt-get install -qq libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

RUN apt-get install -y --force-yes --no-install-recommends \
        fonts-wqy-microhei ttf-wqy-zenhei
# Create app directory
RUN mkdir -p /usr/src/app
ADD . /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

EXPOSE 8080
CMD [ "npm", "start" ]
