const { Gauge } = require('prom-client');

const factoidTransactionsGauge = new Gauge({
    name: 'factoid_transactions_nb',
    help: 'Number of factoid transactions in the last block'
});
const totalFactoshisTransferedGauge = new Gauge({
    name: 'factoshis_transfered',
    help: 'Number of factoshis transfered in the last block'
});
const totalFactoshisUsedToBuyECGauge = new Gauge({
    name: 'factoshis_buy_ec',
    help: 'Number of factoshis used to buy ECs in the last block'
});
const totalECsBoughtGauge = new Gauge({
    name: 'ec_bought_nb',
    help: 'Number of ECs bought in the last block'
});
const totalFeesPaidGauge = new Gauge({
    name: 'fees_paid',
    help: 'Number of factoshis paid as transaction fees in the last block'
});

exports.computeMetrics = async function(cli, head) {
    const fb = await cli.getFactoidBlock(head.factoidBlockRef);
    const ecRate = fb.entryCreditRate;

    let totalFactoshisTransfered = 0,
        totalFactoshisSpentOnEc = 0,
        totalFeesPaid = 0;
    for (const transaction of fb.transactions) {
        totalFactoshisTransfered += transaction.totalFactoidOutputs;
        totalFactoshisSpentOnEc += transaction.totalEntryCreditOutputs;
        totalFeesPaid += transaction.feesPaid;
    }

    return {
        numberOfTransactions: fb.transactions.length,
        totalFactoshisTransfered,
        totalFactoshisSpentOnEc,
        totalFeesPaid,
        totalECsBought: ecRate ? totalFactoshisSpentOnEc / ecRate : 0
    };
};

exports.exportMetrics = async function(cli, head) {
    const {
        numberOfTransactions,
        totalFactoshisTransfered,
        totalFactoshisSpentOnEc,
        totalFeesPaid,
        totalECsBought
    } = await exports.computeMetrics(cli, head);

    factoidTransactionsGauge.set(numberOfTransactions);
    totalFactoshisTransferedGauge.set(totalFactoshisTransfered);
    totalFactoshisUsedToBuyECGauge.set(totalFactoshisSpentOnEc);
    totalFeesPaidGauge.set(totalFeesPaid);
    totalECsBoughtGauge.set(totalECsBought);
};