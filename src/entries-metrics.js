const Promise = require('bluebird'),
    { Gauge } = require('prom-client');

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

exports.computeMetrics = async function(cli, head) {
    const ebs = await Promise.map(
        head.entryBlockRefs,
        ref => cli.getEntryBlock(ref.keyMR));

    let entriesRevealed = 0,
        entriesSize = 0,
        maxEntrySize = 0;

    for (let eb of ebs) {
        entriesRevealed += eb.entryRefs.length;
        const entries = await Promise.map(eb.entryRefs, ref => cli.getEntry(ref.entryHash));
        for (let entry of entries) {
            const size = entry.size();
            entriesSize += size;
            if (size > maxEntrySize) {
                maxEntrySize = size;
            }
        }
    }

    return {
        entriesRevealed,
        entriesSize,
        maxEntrySize,
        averageEntrySize: entriesRevealed ? entriesSize / entriesRevealed : 0
    };
};

exports.exportMetrics = async function(cli, head) {

    const {
        entriesRevealed,
        entriesSize,
        maxEntrySize,
        averageEntrySize
    } = await exports.computeMetrics(cli, head);

    const previous = await cli.getDirectoryBlock(head.previousBlockKeyMR);
    const duration = head.timestamp - previous.timestamp;

    // Populate gauges
    entriesRevealedGauge.set(entriesRevealed);
    entriesRevealedPerSecondGauge.set(duration ? entriesRevealed / duration : 0);
    entriesSizeGauge.set(entriesSize);
    entryAverageSizeGauge.set(averageEntrySize);
    entryMaxSizeGauge.set(maxEntrySize);
};