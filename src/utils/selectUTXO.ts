import { UTXO } from './fetchUTXO';

/**
 * Selects a UTXO from an array of UTXOs that meets or exceeds the specified amount.
 * For a real-world application, you would want to implement a more sophisticated UTXO selection algorithm.
 *
 * @param {number} amount The amount in BTC to send. We will select a UTXO that meets or exceeds this amount.
 * @param {UTXO[]} utxos An array of UTXOs to select from.
 * @returns {Promise<UTXO | undefined>} A promise that resolves with the selected UTXO, or undefined if no UTXO meets or exceeds the amount.
 */
export const selectUTXO = async (amount: number, utxos: UTXO[]): Promise<UTXO | undefined> => {
    for (let i = 0; i < utxos.length; i++) {
        let utxo = utxos[i];
        if (utxo?.value! * 100000000 >= amount * 100000000) {
            return utxo; // Return the first UTXO that meets or exceeds the amount
        }
    }
    return undefined;
};
