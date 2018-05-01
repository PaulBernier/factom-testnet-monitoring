const { Gauge } = require('prom-client');

const entryCreditsSpentGauge = new Gauge({
    name: 'entrycredit_spent',
    help: 'Number of Entry Credits spent in the last block'
});

exports.computeMetrics = async function(cli, head) {
    const ecb = await cli.getEntryCreditBlock(head.entryCreditBlockRef);
    const ecSpent = ecb.commits.reduce((acc, value) => acc + value.credits, 0);

    return {
        ecSpent
    };
};

exports.exportMetrics = async function(cli, head) {
    const { ecSpent } = await exports.computeMetrics(cli, head);
    entryCreditsSpentGauge.set(ecSpent);
};