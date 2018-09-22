# Contracts

## Building

```
docker run --rm -v $(pwd):/work eosio/eos-dev:v1.2.5 eosiocpp -o /work/cookie_store.wasm /work/cookie_store.cpp
docker run --rm -v $(pwd):/work eosio/eos-dev:v1.2.5 eosiocpp -g /work/cookie_store.abi /work/cookie_store.cpp
```

## Installing

```
docker run --rm -v $(pwd):/work --network eosdev eosio/eos-dev:v1.2.5 cleos \
  --url http://$(docker network inspect eosdev --format='{{range .Containers}}{{if eq .Name "nodeos"}}{{.IPv4Address}}{{end}}{{end}}' | sed -e 's/\/.*//g'):8888 \
  --wallet-url http://$(docker network inspect eosdev --format='{{range .Containers}}{{if eq .Name "keosd"}}{{.IPv4Address}}{{end}}{{end}}' | sed -e 's/\/.*//g'):9876 \
  set contract cookie.store /work/ cookie_store.wasm cookie_store.abi
```
