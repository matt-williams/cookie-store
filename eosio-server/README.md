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
cleos wallet create_key # ... and save public key to ~/.client-public-key
cleos create account eosio client $(cat ~/.client-public-key)
cleos wallet create_key # ... and save public key to ~/.server1-public-key
cleos create account eosio server1 $(cat ~/.server1-public-key)
cleos wallet create_key # ... and save public key to ~/.server2-public-key
cleos create account eosio server2 $(cat ~/.server2-public-key)
cleos push action eosio.token issue '["server1", "1000.0000 SYS", ""]' -p eosio
cleos push action eosio.token issue '["server2", "1000.0000 SYS", ""]' -p eosio
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
cleos push action cookie.store dircreate '{"advertiser": "server1", "public_key": "'$(cat ~/.server1-public-key)'"}' -p server1
cleos push action cookie.store dircreate '{"advertiser": "server2", "public_key": "'$(cat ~/.server2-public-key)'"}' -p server2
```

## Creating bids

```
cleos push action cookie.store bidscreate '{"bidder": "server1", "desired_link": "server2", "bounty": "100.0000 SYS", "price_per": "1.0000 SYS"}' -p server1
cleos push action eosio.token transfer '["server1", "cookie.store", "100.0000 SYS", ""]' -p server1
```

## Satisfying bids

```
cleos push action cookie.store bidsupdate '{"uuid": 0, "browser": "client", "signed_cookie": "", "cookie": "123456789abcdef", "other_signed_cookie": "", "other_cookie": ""}' -p client
```
