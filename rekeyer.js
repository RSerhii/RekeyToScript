const algosdk = require('algosdk');
const PQueue = require('p-queue');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const {
    CONFIRMATION_NUMBER,
    ALGO_NODE,
    PS_PORT,
    PS_TOKEN,
    ALGORAND_QUEUE_INTERVAL_CAP,
    ALGORAND_QUEUE_INTERVAL,
    DEFAULT_MNEMONICS
} = require('./constants');

const sections = [
    {
        header: 'Script',
        content:
            'Interacts with Algorand network and makes rekeyto operation',
    },
    {
        header: 'Options',
        optionList: [
            {
                name: 'token',
                typeLabel: '{underline = token}',
                description: 'asks to create token',
            },
            {
                name: 'account',
                typeLabel: '{underline = rekey}',
                description: 'delegates funds management to rekey account',
            },
            {
                name: 'rekey',
                typeLabel: '{underline = rekey}',
                description: 'delegates funds management to rekey account',
            },
            {
                name: 'rekeyAddr',
                typeLabel: '{underline = rekeyAddr}',
                description: 'address of a rekey account',
            },
            {
                name: 'pk',
                typeLabel: '{underline = pk}',
                description: 'private key of the source',
            },
            {
                name: 'sourceAddr',
                typeLabel: '{underline = amount}',
                description: 'burns TPRT on account',
            }
        ],
    },
];

const optionDefinitions = [
   { name: 'token', type: String },
   { name: 'account', type: String },
   { name: 'rekey', type: String },
   { name: 'ra', type: String }, // rekey addr
   { name: 'mn', type: String }, // mnemonics
   { name: 'sa', type: String } // source addr
];

const configureAlgorandService = (mnemonics) => {
    return new AlgorandService(mnemonics);
};

class AlgorandService {
    constructor(mnemonics) {
      try {
        this.token = { 'X-API-Key': PS_TOKEN };
        this.key = algosdk.mnemonicToSecretKey(mnemonics).sk;
        this.algodclient = new algosdk.Algodv2(this.token, ALGO_NODE, PS_PORT);
        this.queue = new PQueue({
          intervalCap: ALGORAND_QUEUE_INTERVAL_CAP,
          interval: ALGORAND_QUEUE_INTERVAL,
          carryoverConcurrencyCount: true,
        });
      } catch (ex) {
        throw new Error(
          'Failed to set admin private key or/and client for algorand service. ' +
            'Make sure you have set valid mnemomic, PS_TOKEN, ALGO_NODE and PS_PORT ' +
            'environment variables\n' +
            `Original error: ${ex.message}`
        );
      }
    }

    async getParams() {
        const params = await this.queue.add(async () =>
            this.algodclient.getTransactionParams().do()
        );
        return params;
    }

    async sign(txn, key) {
        const rawSignedTxn = txn.signTxn(key);
        const tx = await this.queue.add(async () =>
          this.algodclient.sendRawTransaction(rawSignedTxn).do()
        );
        const confirmedTxn = await this.queue.add(async () =>
          algosdk.waitForConfirmation(
            this.algodclient,
            tx.txId,
            CONFIRMATION_NUMBER
          )
        );
        return { ct: confirmedTxn, t: tx };
    }

    async getAccount(address) {
        const accountInfo = await this.queue.add(async () =>
          this.algodclient.accountInformation(address).do()
        );
        return accountInfo;
    }

    async rekey(from, rekeyAddr) {
        const params = await this.getParams();
        const txn = algosdk.makePaymentTxnWithSuggestedParams(
          from,
          from,
          0,
          undefined,
          undefined,
          params,
          rekeyAddr
        )
        return await this.sign(txn, this.key); // signed by source account
    }

    async closeTo(from, to) {
        const params = await this.getParams();
        console.log(from)
        console.log(to)
        const txn = algosdk.makePaymentTxnWithSuggestedParams(
          from, // rekey
          to,
          0,
          to,
          undefined,
          params
        )
        console.log(txn)
        return await this.sign(txn, this.key); // signed by source account
    }
}


const main = async () => {
    const usage = commandLineUsage(sections);

    try {
        const options = commandLineArgs(optionDefinitions);
        if ('rekey' in options) {
            if (!options.sa || !options.ra || !options.mn) {
                console.log(usage);
            }
            alsoSvc = configureAlgorandService(options.mn);
            console.log(await alsoSvc.rekey(options.sa, options.ra))
        } else if ('account' in options) {
            alsoSvc = configureAlgorandService(options.mn || DEFAULT_MNEMONICS);
            console.log(await alsoSvc.getAccount(options.account))
        } else if ('token' in options) {
            alsoSvc = configureAlgorandService(options.mn || DEFAULT_MNEMONICS);
            console.log(await alsoSvc.createAsaToken(options.account))
        }
    } catch (e) {
        console.log(e);
        console.log(usage);
    }
    return 0;
};

main()
    .then()
    .catch((e) => {
        console.log(e);
    });
