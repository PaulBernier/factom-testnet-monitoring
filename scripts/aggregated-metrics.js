#!/usr/bin/env node

const { FactomCli } = require('factom'),
    ecMetrics = require('../src/entrycredit-metrics'),
    fctMetrics = require('../src/factoid-metrics'),
    entriesMetrics = require('../src/entries-metrics');

const cli = new FactomCli({
    host: 'localhost',
    port: 8088
});

const FACTOSHIS_IN_FACTOID = 100000000;

async function traverseBlockchain(from, to) {
    if (from > to) {
        throw new Error('Start date is after end date');
    }

    let db = await cli.getDirectoryBlockHead();

    const aggregator = new MetricsAggregator();

    let firstBlock, lastBlock;
    while (db.timestamp > from) {
        process.stdout.write('.');
        if (db.timestamp < to) {
            if (!lastBlock) {
                lastBlock = copyInstance(db);
            }
            firstBlock = copyInstance(db);
            await aggregator.aggregate(db);
        }
        db = await cli.getDirectoryBlock(db.previousBlockKeyMR);
    }

    // Print result
    const startDate = new Date(firstBlock.timestamp * 1000);
    const endDate = new Date(lastBlock.timestamp * 1000);
    process.stdout.write('\n');
    console.log(`From block ${firstBlock.height} created at ${startDate}`);
    console.log(`To block ${lastBlock.height} created at ${endDate}`);
    console.log(aggregator);

}

function copyInstance(db) {
    return Object.assign(Object.create(Object.getPrototypeOf(db)), db);
}


class MetricsAggregator {

    constructor() {
        // EC metrics
        this.entryCreditsSpent = 0;
        // FCT metrics
        this.numberOfTransactions = 0;
        this.totalFctTransfered = 0;
        this.totalFctSpentOnEc = 0;
        this.totalFeesPaid = 0;
        this.totalECsBought = 0;
        // Entries metrics
        this.entriesRevealed = 0;
        this.entriesSize = 0;

    }

    async aggregate(db) {
        // EC metrics
        const { ecSpent } = await ecMetrics.computeMetrics(cli, db);
        this.entryCreditsSpent += ecSpent;

        // FCT metrics
        const {
            numberOfTransactions,
            totalFactoshisTransfered,
            totalFactoshisSpentOnEc,
            totalFeesPaid,
            totalECsBought
        } = await fctMetrics.computeMetrics(cli, db);

        this.numberOfTransactions += numberOfTransactions;
        this.totalFctTransfered += totalFactoshisTransfered / FACTOSHIS_IN_FACTOID;
        this.totalFctSpentOnEc += totalFactoshisSpentOnEc / FACTOSHIS_IN_FACTOID;
        this.totalFeesPaid += totalFeesPaid / FACTOSHIS_IN_FACTOID;
        this.totalECsBought += totalECsBought;

        // Entries metrics
        const { entriesRevealed, entriesSize } = await entriesMetrics.computeMetrics(cli, db);
        this.entriesRevealed += entriesRevealed;
        this.entriesSize += entriesSize;
    }

}

const args = process.argv.slice(2);
traverseBlockchain(parseInt(args[0]), parseInt(args[1]));