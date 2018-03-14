const { Gauge } = require('prom-client');

const factoidTransactionsGauge = new Gauge({
    name: 'factoid_transactions_nb',
    help: 'Number of factoid transactions in the last block'
});

exports.computeMetrics = async function(cli, head) {
    const fb = await cli.getFactoidBlock(head.getFactoidBlockKeymr());
    factoidTransactionsGauge.set(fb.transactions.length);
};