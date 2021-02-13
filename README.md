# sfr box scraper

A cli tool to scrape your SFR box web UI.

## Installation

### NPM package

```shell
npm i -g @ROUKIEN/sfr-box-scraper
```

### Docker image

@todo

## Usage

By default, the scraper will only run once then stop.
You can schedule the execution by adding the `--interval 10m` option to export metrics every 10 minutes.

```shell
sfr-box-scraper  [--once xor --interval 10m]
```

### Configuring the box authentication

Copy the `.env.dist` to `.env` with your custom box settings.

## Configuration

sfr-box-scraper is only able to push metrics to an influxdb 2.x backend for now.
