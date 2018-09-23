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
cleos wallet create_key # ... and save public key to ~/.token-public-key
cleos create account eosio eosio.token $(cat ~/.token-public-key)
cleos set contract eosio.token /contracts/eosio.token -p eosio.token
cleos push action eosio.token create '{"issuer": "eosio", "maximum_supply": "1000000000.0000 SYS"}' -p eosio.token
cleos wallet create_key # ... and save public key to ~/.public-key
cleos create account eosio cookie.store $(cat ~/.public-key)
cleos set account permission cookie.store active '{"threshold": 1, "keys": [{"key": "'$(cat ~/.public-key)'", "weight": 1}], "accounts": [{"permission": {"actor":"cookie.store", "permission":"eosio.code"}, "weight": 1}]}' owner -p cookie.store
cleos wallet create_key # ... and save public key to ~/.client-public-key
cleos create account eosio client $(cat ~/.client-public-key)
cleos wallet create_key # ... and save public key to ~/.server1-public-key
cleos create account eosio acmesuper $(cat ~/.server1-public-key)
cleos wallet create_key # ... and save public key to ~/.server2-public-key
cleos create account eosio weddingsrus $(cat ~/.server2-public-key)
cleos push action eosio.token issue '["acmesuper", "1000.0000 SYS", ""]' -p eosio
cleos push action eosio.token issue '["weddingsrus", "1000.0000 SYS", ""]' -p eosio
```

## Environement

```
. ./env
```

## Unlocking wallet

```
cleos wallet unlock --password $(cat ~/.password)
```

## Creating directory entries

```
cleos push action cookie.store dircreate '{"advertiser": "acmesuper", "public_key": "'$(cat ~/.server1-public-key)'"}' -p acmesuper
cleos push action cookie.store dircreate '{"advertiser": "weddingsrus", "public_key": "'$(cat ~/.server2-public-key)'"}' -p weddingsrus
```

## Creating bids

```
cleos push action cookie.store bidscreate '{"bidder": "acmesuper", "desired_link": "weddingsrus", "bounty": "100.0000 SYS", "price_per": "1.0000 SYS"}' -p acmesuper
cleos push action eosio.token transfer '["acmesuper", "cookie.store", "100.0000 SYS", ""]' -p acmesuper
```

## Satisfying bids

```
cleos push action cookie.store bidsupdate '{"uuid": 0, "browser": "client", "signed_cookie": "", "cookie": "123456789abcdef", "other_signed_cookie": "", "other_cookie": ""}' -p client
```

## Removing bids

```
cleos push action cookie.store bidsremove '{"uuid": 0}' -p client
```

## Reset (demo purposes only)

```
cleos push action cookie.store reset '{}' -p client
cleos get table cookie.store cookie.store bids
cleos get table cookie.store cookie.store used
cleos push action cookie.store bidscreate '{"bidder": "acmesuper", "desired_link": "weddingsrus", "bounty": "100.0000 SYS", "price_per": "1.0000 SYS"}' -p acmesuper
cleos push action eosio.token transfer '["acmesuper", "cookie.store", "100.0000 SYS", ""]' -p acmesuper
```
