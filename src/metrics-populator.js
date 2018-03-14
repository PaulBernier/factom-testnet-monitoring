const Promise = require('bluebird'),
    { FactomCli } = require('factom'),
    metrics = [require('./factoid-metrics'), require('./entries-metrics')];

const cli = new FactomCli({
    host: 'factomd_node',
    port: 8088
});

class MetricsPopulator {
    constructor(pollInterval) {
        this.pollInterval = pollInterval || 5000;
        this.lastBlockEvaluated = 0;
    }

    async startPopulating() {
        await this.populate();
        setTimeout(this.startPopulating.bind(this), this.pollInterval);
    }

    async populate() {
        const head = await cli.getDirectoryBlockHead();
        if (head.height !== this.lastBlockEvaluated) {
            console.log(`Extracting metrics from block ${head.height}...`);
            try {
                await Promise.each(metrics, m => m.computeMetrics(cli, head));
                this.lastBlockEvaluated = head.height;
                console.log(`Finished extracting metrics for block ${head.height}`);
            } catch (e) {
                console.log(`Error while extracting metrics for block ${head.height}`);
                console.error(e);
            }
        }
    }
}

module.exports = {
    MetricsPopulator
};