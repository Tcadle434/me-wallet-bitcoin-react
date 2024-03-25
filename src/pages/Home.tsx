import type { FC } from "react";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ConnectionStatusContext } from "../context/ConnectionStatus";
import { condenseAddress } from "../utils/address";
import {
  BitcoinNetworkType,
  signMessage,
  signTransaction,
  sendBtcTransaction,
} from "sats-connect";
import { fetchUTXO } from "../utils/fetchUTXO";
import { selectUTXO } from "../utils/selectUTXO";
import { createPSBT } from "../utils/createPSBT";
import { fetchScriptPubKey } from "../utils/fetchScriptPubKey";
import { Psbt } from "bitcoinjs-lib";

const RECIPIENT_ADDRESS = "bc1qq6x6m9kjj48m8ct2hwy5dl75usray8hp0cpxzu";

const Disconnected: FC = () => {
  return (
    <Link
      className="inline-block rounded-md bg-[#e93a88] px-8 py-3 text-xs uppercase tracking-wide text-white hover:opacity-80"
      to="/connect"
    >
      Connect Wallet
    </Link>
  );
};

const Connected: FC = () => {
  const connectionStatus = useContext(ConnectionStatusContext);
  const nativeSegwitAddress = connectionStatus?.accounts[1]?.address;
  const taprootAddress = connectionStatus?.accounts[0]?.address;

  // Sign a dummy message with the connected wallet
  async function signWalletMessage() {
    try {
      await signMessage({
        payload: {
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
          address: nativeSegwitAddress!,
          message: "Hello World. Welcome to the Magic Eden wallet!",
        },
        onFinish: (response) => {
          alert(`Successfully signed message: ${response}`);
        },
        onCancel: () => {
          alert("Request canceled");
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Sign a psbt with the connected wallet. Tip the author 0.00001 BTC, but don't actually broadcast it.
  async function signWalletTransaction() {
    const utxos = await fetchUTXO(nativeSegwitAddress!);
    if (!utxos) {
      alert("No UTXOs found! Please deposit some funds to your wallet.");
      return;
    }
    const selectedUTXO = await selectUTXO(10000, utxos);
    const scriptPubKey = await fetchScriptPubKey(
      selectedUTXO!.txid,
      selectedUTXO!.vout
    );
    const psbt = await createPSBT({
      utxo: selectedUTXO!,
      recipientAddress: RECIPIENT_ADDRESS,
      changeAddress: nativeSegwitAddress!,
      amountToSend: 1000,
      scriptPubKey,
    });

    try {
      await signTransaction({
        payload: {
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
          psbtBase64: psbt,
          broadcast: true,
          message: "tip the author! Don't worry this will not be broadcasted.",
          inputsToSign: [
            {
              address: nativeSegwitAddress!,
              signingIndexes: [0],
            },
          ],
        },
        onFinish: (response) => {
          console.log("response: ", response);
          const psbResponse = Psbt.fromBase64(response.psbtBase64);
          psbResponse.finalizeAllInputs();
          const signedTx = psbResponse.extractTransaction();
          const txHex = signedTx.toHex();
          console.log("txHex: ", txHex);
          alert(
            `Successfully created your txHash! Here it is if you would like to broadcast it and tip the author $0.50: ${txHex}`
          );
        },
        onCancel: () => {
          alert("Request canceled");
        },
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function sendMyBtcTransaction() {
    const sendBtcOptions = {
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
        recipients: [
          {
            address: taprootAddress!,
            amountSats: BigInt(1500),
          },
        ],
        senderAddress: nativeSegwitAddress!,
      },
      onFinish: (response) => {
        alert(response);
      },
      onCancel: () => alert("Canceled"),
    };

    await sendBtcTransaction(sendBtcOptions);
  }

  return (
    <>
      <h1 className="mb-4 text-lg font-medium uppercase tracking-wide">
        Accounts
      </h1>
      <ul>
        {connectionStatus?.accounts.map((account, index) => (
          <li key={index}>
            <p className="font-mono">
              {account.purpose}: {condenseAddress(account.address)}
            </p>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 rounded-md bg-[#e93a88] px-8 py-3 text-xs uppercase tracking-wide text-neutral-50 hover:opacity-80"
        onClick={signWalletMessage}
      >
        Sign Message
      </button>
      <button
        className="mt-4 rounded-md  bg-[#e93a88] px-8 py-3 text-xs uppercase tracking-wide text-neutral-50 hover:opacity-80"
        onClick={signWalletTransaction}
      >
        Sign Transaction
      </button>
      <button
        className="mt-4 rounded-md bg-[#e93a88] px-8 py-3 text-xs uppercase tracking-wide text-neutral-50 hover:opacity-80"
        onClick={sendMyBtcTransaction}
      >
        Send BTC
      </button>
    </>
  );
};

export const Home: FC = () => {
  const connectionStatus = useContext(ConnectionStatusContext);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {connectionStatus?.isConnected ? <Connected /> : <Disconnected />}
    </div>
  );
};
