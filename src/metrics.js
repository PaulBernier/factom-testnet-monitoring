const { Gauge } = require('prom-client');
const { FactomCli } = require('factom');
const Promise = require('bluebird');

const POLL_INTERVAL = 5000;
const cli = new FactomCli({
    host: 'factomd_node',
    port: 8088
});

const entriesRevealedGauge = new Gauge({
    name: 'entries_revealed',
    help: 'Number of entries revealed in the last block'
});
const entriesRevealedPerSecondGauge = new Gauge({
    name: 'entries_revealed_per_sec',
    help: 'Average number of entries revealed per second in the last block'
});
const entriesSizeGauge = new Gauge({
    name: 'entries_size',
    help: 'Total size of all entries revealed in the last block'
});
const entryAverageSizeGauge = new Gauge({
    name: 'entry_average_size',
    help: 'Average size of an entry revealed in the last block'
});
const entryMaxSizeGauge = new Gauge({
    name: 'entry_max_size',
    help: 'Max size among entries revealed in the last block'
});
const factoidTransactionsGauge = new Gauge({
    name: 'factoid_transactions_nb',
    help: 'Number of factoid transactions in the last block'
});

let lastBlockEvaluated;
async function evaluateLatestBlock() {
    const head = await cli.getDirectoryBlockHead();
    if (head.height !== lastBlockEvaluated) {
        console.log(`Extracting metrics from block ${head.height}...`);
        try {
            await extractStats(head);
            lastBlockEvaluated = head.height;
        } catch (e) {
            console.error(e);
        }
    }

    setTimeout(evaluateLatestBlock, POLL_INTERVAL);
}

async function extractStats(head) {

    const previous = await cli.getDirectoryBlock(head.previousBlockKeymr);

    const duration = head.timestamp - previous.timestamp;
    const ebs = await Promise.map(
        head.getRegularEntryBlockRefs(),
        eb => cli.getEntryBlock(eb.keymr));

    let entriesRevealed = 0;
    let entriesSize = 0;
    let maxEntrySize = 0;
    for (let eb of ebs) {
        entriesRevealed += eb.entryRefs.length;
        const entries = await Promise.map(eb.entryRefs, ref => cli.getEntry(ref.entryHash));
        for (let entry of entries) {
            entriesSize += entry.size;
            if (entry.size > maxEntrySize) {
                maxEntrySize = entry.size;
            }
        }
    }

    // Entries stats
    entriesRevealedGauge.set(entriesRevealed);
    entriesRevealedPerSecondGauge.set(entriesRevealed / duration);
    entriesSizeGauge.set(entriesSize);
    entryAverageSizeGauge.set(entriesSize / entriesRevealed);
    entryMaxSizeGauge.set(maxEntrySize);

    // Factoid transactions
    const fb = await cli.getFactoidBlock(head.getFactoidBlockKeymr());
    factoidTransactionsGauge.set(fb.transactions.length);

    console.log('Finished extracting metrics');
}

evaluateLatestBlock();