```
docker build -t factom-testnet-prometheus .
docker run --rm --name=factom-testnet-prometheus -d -p 1789:1789 factom-testnet-prometheus
```