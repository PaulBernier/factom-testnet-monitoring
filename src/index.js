const express = require('express');
const app = express();
const { register } = require('prom-client');
require('./metrics');

app.get('/metrics', (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics());
});

app.listen(1789, () => console.log('Listening to port 1789!'));