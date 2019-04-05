# Factom Testnet Monitoring

## Build and run factom-testnet-prometheus container

```bash
# Build the container responsible for computing and exposing locally testnet metrics
docker build -t factom-testnet-prometheus github.com/PaulBernier/factom-testnet-monitoring
# Start this container and connect it to the network of the communitytestnet containers
docker run --restart always --name=factom-testnet-prometheus --network host -d factom-testnet-prometheus
# Verify the metrics are available
curl 127.0.0.1:1789/metrics
# You can also check pm2 logs
docker exec factom-testnet-prometheus pm2 logs
```

## Configure Prometheus

Prometheus metrics are exposed on port 1789. You will need to add this endpoint as a target to your Prometheus configuration.

## Configure Grafana

The JSON of the dashbord is in folder `grafana templates` so you can import it in your Grafana.
