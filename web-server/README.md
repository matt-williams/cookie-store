# Web Server

## Build

```
docker build -t web-server .
```

## Run

```
docker kill web-server
docker run --rm -d -p 80:8080 --name web-server web-server
```
