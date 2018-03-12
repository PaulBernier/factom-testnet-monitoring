```
docker build -t factom-testnet-prometheus github.com/PaulBernier/factom-testnet-prometheus
docker run --rm --name=factom-testnet-prometheus --network=communitytestnet_factomd -d -p 1789:1789 factom-testnet-prometheus
```