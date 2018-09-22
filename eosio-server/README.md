# EOS.IO Server

## Setup

```
docker pull eosio/eos-dev:v1.2.5
docker network create eosdev
docker run --name nodeos -d -p 8888:8888 --network eosdev \
  -v /tmp/eosio/work:/work -v /tmp/eosio/data:/mnt/dev/data \
  -v /tmp/eosio/config:/mnt/dev/config eosio/eos-dev:v1.2.5  \
  /bin/bash -c "nodeos -e -p eosio --plugin eosio::producer_plugin \
  --plugin eosio::history_plugin --plugin eosio::chain_api_plugin \
  --plugin eosio::history_api_plugin \
   --plugin eosio::http_plugin -d /mnt/dev/data \
  --config-dir /mnt/dev/config \
  --http-server-address=0.0.0.0:8888 \
  --access-control-allow-origin=* --contracts-console --http-validate-host=false"
docker run -d --name keosd --network=eosdev \
  -i eosio/eos-dev:v1.2.5 /bin/bash -c "keosd --http-server-address=0.0.0.0:9876"
. ./env
cleos wallet create --to-console # ... and save password to ~/.password
cleos wallet import --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
cleos wallet create_key # ... and save public key to ~/.public-key
cleos create account eosio cookie.store $(cat ~/.public-key)
```

## Environement

```
. ./env
```

## Unlocking wallet

```
cleos wallet unlock --password $(cat ~/.password)
```

