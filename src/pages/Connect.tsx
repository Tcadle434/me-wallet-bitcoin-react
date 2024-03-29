import { useWallet, useWallets } from '@wallet-standard/react';
import { getAddress, AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ConnectionStatusContext } from '../context/ConnectionStatus';
import type { FC } from 'react';
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base';
import type { Account } from '../types';

const SatsConnectNamespace = 'sats-connect:';

function isSatsConnectCompatibleWallet(wallet: Wallet) {
    return SatsConnectNamespace in wallet.features;
}

export const Connect: FC = () => {
    const { wallets } = useWallets();
    const { setWallet, wallet } = useWallet();
    const connectionStatus = useContext(ConnectionStatusContext);

    async function connectOrDeselect() {
        try {
            await getAddress({
                getProvider: async () =>
                    (wallet as unknown as WalletWithFeatures<any>).features[SatsConnectNamespace]?.provider,
                payload: {
                    purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
                    message: 'Address for receiving Ordinals and payments',
                    network: {
                        type: BitcoinNetworkType.Mainnet,
                    },
                },
                onFinish: (response) => {
                    connectionStatus?.setAccounts(response.addresses as unknown as Account[]);
                },
                onCancel: () => {
                    alert('Request canceled');
                },
            });
        } catch (err) {
            setWallet(null);
        }
    }

    if (wallet && !connectionStatus?.isConnected) {
        connectOrDeselect();
    }

    if (connectionStatus?.isConnected) {
        return <Navigate to="/" replace={true} />;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[0f0f0f]">
            <h1 className="mb-4 text-lg font-medium uppercase tracking-wide">Connect Wallet</h1>
            <ul className="mb-8 flex flex-col">
                {wallets.filter(isSatsConnectCompatibleWallet).map((wallet, index) => (
                    <li key={wallet.name}>
                        <button
                            className={classNames(
                                'w-full rounded-md bg-[#e93a88] px-2 py-1 text-xs uppercase tracking-wide text-white',
                                {
                                    'mb-2': index !== wallets.length - 1,
                                }
                            )}
                            type="button"
                            onClick={() => setWallet(wallet)}
                        >
                            {wallet.name}
                        </button>
                    </li>
                ))}
            </ul>
            <Link className="text-sm underline" to="/">
                Back
            </Link>
        </div>
    );
};
