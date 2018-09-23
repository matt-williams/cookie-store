# Frontend

## Build

```
docker build -t frontend .
```

## Run

```
docker kill frontend
docker run --rm -d -p 8080:3000 --name frontend frontend
```
