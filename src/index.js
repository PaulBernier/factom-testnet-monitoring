const express = require('express'),
    app = express(),
    { register } = require('prom-client'),
    { MetricsPopulator } = require('./metrics-populator');

const POLL_INTERVAL = 5000;

const metricsPopulator = new MetricsPopulator(POLL_INTERVAL);
metricsPopulator.startPopulating();

app.get('/metrics', (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
});

app.listen(1789, () => console.log('Listening to port 1789'));