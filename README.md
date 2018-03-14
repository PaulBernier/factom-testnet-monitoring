
# Factom Testnet Monitoring

## Build and run factom-testnet-prometheus container

```bash
# Build the container responsible for computing and exposing locally testnet metrics
docker build -t factom-testnet-prometheus github.com/PaulBernier/factom-testnet-monitoring
# Start this container and connect it to the network of the communitytestnet containers
docker run --rm --name=factom-testnet-prometheus --network=communitytestnet_factomd -d -p 1789:1789 factom-testnet-prometheus
# Verify the metrics are available
curl 127.0.0.1:1789/metrics
```

## Configure Prometheus

You need to add an addition target to Prometheus config. In your `communitytestnet` folder edit the file `prometheus/config/prometheus.yml` and add under targets: `- 'factom-testnet-prometheus:1789'`. You need to rebuild and restart the prometheus container for changes to take effect (or just do a full `docker-compose down`/`docker-compose up -d`)

To have persisting metrics you need the latest version of the communitytestnet code (that contains this commit: https://github.com/FactomProject/communitytestnet/commit/72ad7be4b1ba7685c3b83584223052a0a593cb08)

## Configure Grafana

The JSON of the dashbord is in folder `grafana templates` so you can import it in your Grafana.

If you want to have public dashboards (accessible without a login) you will need to:
* Create a new Grafana organization (for instance Testnet)
* Modify the file at `grafana/config/grafana.ini` and uncomment and edit the section `[auth.anonymous]`
* Rebuild and restart grafana container