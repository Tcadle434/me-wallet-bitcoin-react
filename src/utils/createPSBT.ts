import { UTXO } from './fetchUTXO';
import { Psbt, networks } from 'bitcoinjs-lib';

interface SegwitProps {
    utxo: UTXO;
    recipientAddress: string;
    changeAddress: string;
    amountToSend: number;
    scriptPubKey?: string;
    senderPubKey?: string;
}

/**
 * A basic implementation of creating a PSBT for a segwit transaction. This consists of
 * sending btc from one address to another, returning the leftover balance from the UTXO to the sender.
 * For a real-world application, you would want to implement more checks and error handling.
 *
 * @param {SegwitProps} props The properties needed to create a PSBT.
 * @returns {Promise<string>} A promise that resolves with the base64 representation of the PSBT.
 */
export const createPSBT = async ({
    utxo,
    recipientAddress,
    changeAddress,
    amountToSend,
    scriptPubKey,
}: SegwitProps) => {
    const psbt = new Psbt({ network: networks.bitcoin });

    // change to return to sender minus the amount to send and the transaction fee (500 sats for this example)
    const changeValue = utxo.value! - amountToSend - 500;

    psbt.addInput({
        hash: utxo?.txid!,
        index: utxo?.vout!,
        witnessUtxo: {
            script: Buffer.from(scriptPubKey!, 'hex'),
            value: utxo.value!,
        },
    });

    psbt.addOutput({
        address: recipientAddress,
        value: amountToSend,
    });

    // change from the UTXO needs to be returned to the sender
    psbt.addOutput({
        address: changeAddress,
        value: changeValue,
    });

    return psbt.toBase64();
};
