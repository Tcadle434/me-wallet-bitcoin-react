/**
 * Fetches the scriptPubKey for a given UTXO transactionId from the mempool.space API.
 * This is necessary for creating a PSBT for a segwit transaction.
 *
 * @param {string} txId The transaction ID of the UTXO.
 * @param {number} vout The vout index of the UTXO.
 * @returns {Promise<string>} A promise that resolves with the hex representation of the scriptPubKey.
 * @throws {Error} If the request to the mempool.space API fails, or if the scriptPubKey is not found for the given vout.
 */
export const fetchScriptPubKey = async (txId: string, vout: number): Promise<string> => {
    const response = await fetch(`https://mempool.space/api/tx/${txId}`);
    if (!response.ok) {
        throw new Error('Error fetching transaction details from mempool.space API.');
    }
    const transaction = await response.json();
    if (transaction.vout && transaction.vout.length > vout && transaction.vout[vout].scriptpubkey) {
        return transaction.vout[vout].scriptpubkey;
    } else {
        throw new Error('scriptPubKey not found for the given vout.');
    }
};
