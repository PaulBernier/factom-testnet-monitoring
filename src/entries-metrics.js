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
        head.getRegularEntryBlockRefs(),
        eb => cli.getEntryBlock(eb.keymr));

    let entriesRevealed = 0,
        entriesSize = 0,
        maxEntrySize = 0;

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

    const previous = await cli.getDirectoryBlock(head.previousBlockKeymr);
    const duration = head.timestamp - previous.timestamp;

    // Populate gauges
    entriesRevealedGauge.set(entriesRevealed);
    entriesRevealedPerSecondGauge.set(duration ? entriesRevealed / duration : 0);
    entriesSizeGauge.set(entriesSize);
    entryAverageSizeGauge.set(entriesRevealed ? entriesSize / entriesRevealed : 0);
    entryMaxSizeGauge.set(maxEntrySize);
};