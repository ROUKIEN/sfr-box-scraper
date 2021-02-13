FROM node:15-alpine

WORKDIR /app

COPY ./bin/ /app/bin
COPY ./src/ /app/src

COPY ./package*.json /app/

RUN npm ci

RUN ln -s /app/bin/sfr-box-scraper /usr/local/bin/sfr-box-scraper

CMD ["sfr-box-scraper", "-h"]
