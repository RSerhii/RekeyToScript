# RekeyToScript
Script to perform rekey operation on Algorand wallet


## Installation

To run the script it is important to have an environment with Node 14+ version and npm 8+ versions. 

Before running the script setup `constants.js`:

- `ALGO_NODE` - Algorand network node. Recommended to use Purestake `https://algorand.api.purestake.io/ps2` for mainnet operations
- `PS_TOKEN` - Algorand API key. Register one at https://www.purestake.com/

Install dependencies using the following command in terminal (while in the project folder):

`npm i`

## Usage

Use the following command to perform rekey operation:

```bash
node rekeyer.js --rekey --sa=<source_account> --ra=<rekey_account> --mn="<mnemonic>"
```

where,
sa - source account that need to pass signing rights to another account
ra - authorized account that will receive signing rights
mn - seed phrase of source account
