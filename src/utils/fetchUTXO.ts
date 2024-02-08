export interface UTXO {
    txid: string;
    vout: number;
    status: {
        confirmed: boolean;
        block_height?: number;
        block_hash?: string;
        block_time?: number;
    };
    value: number;
}

/**
 * Fetches UTXOs from the mempool.space API for a specified address.
 *
 * @param {string} address The Bitcoin address to fetch UTXOs for.
 * @returns {Promise<UTXO[]>} A promise that resolves with an array of UTXOs for the given address.
 * @throws {Error} If the request to the mempool.space API fails. Most likely due to not found (no balance) or invalid address.
 */
export const fetchUTXO = async (address: string): Promise<UTXO[]> => {
    const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);
    if (!response.ok) {
        throw new Error('Error fetching UTXO from mempool.space API.');
    }
    return response.json();
};
