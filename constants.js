const CONFIRMATION_NUMBER = 4;
const ALGO_NODE = process.env.ALGO_NODE || 'https://mainnet-algorand.api.purestake.io/ps2'
const PS_PORT = process.env.PS_PORT || ''
const PS_TOKEN = process.env.PS_TOKEN || ''
const ALGORAND_QUEUE_INTERVAL_CAP = 20
const ALGORAND_QUEUE_INTERVAL = 1100
const ALGORAND_PARAMS_TTL = 4.5
const DEFAULT_MNEMONICS = ""

module.exports = {
    CONFIRMATION_NUMBER,
    ALGO_NODE,
    PS_PORT,
    PS_TOKEN,
    ALGORAND_QUEUE_INTERVAL_CAP,
    ALGORAND_QUEUE_INTERVAL,
    ALGORAND_PARAMS_TTL,
    DEFAULT_MNEMONICS
}
