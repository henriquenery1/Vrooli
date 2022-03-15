/**
 * Handles wallet integration
 * See CIP-0030 for more info: https://github.com/cardano-foundation/CIPs/pull/148
 */
import { walletComplete_walletComplete as WalletCompleteResult } from 'graphql/generated/walletComplete';
import { walletInitMutation, walletCompleteMutation } from 'graphql/mutation';
import { errorToSnack } from 'graphql/utils/errorToSnack';
import { initializeApollo } from 'graphql/utils/initialize';
import { Session } from 'types';
import { Pubs } from 'utils';

export enum WalletProvider {
    CCVault,
    Nami,
    // Yoroi, // Doesn't work yet
}

/**
 * [Enum, window.cardano key, Label, Download extension URL]
 */
const walletProviderInfoMap: { [x: string]: [WalletProvider, string, string, string] } = {
    [WalletProvider.CCVault]: [WalletProvider.CCVault, 'ccvault', 'CCVault.io', 'https://chrome.google.com/webstore/detail/ccvaultio/kmhcihpebfmpgmihbkipmjlmmioameka'],
    [WalletProvider.Nami]: [WalletProvider.Nami, 'nami', 'Nami', 'https://chrome.google.com/webstore/detail/nami/lpfcbjknijpeeillifnkikgncikgfhdo'],
    // [WalletProvider.Yoroi]: [WalletProvider.Yoroi, 'yoroi', 'Yoroi', 'https://chrome.google.com/webstore/detail/yoroi/ffnbelfdoeiohenkjibnmadjiehjhajb'],
}

export const walletProviderInfo = Object.values(walletProviderInfoMap).map(o => ({
    enum: o[0],
    key: o[1],
    label: o[2],
    extensionUrl: o[3],
}))



/**
 * Maps network names to their ids
 */
const Network = {
    Mainnet: 1,
    Testnet: 0
}

export const hasWalletExtension = (provider: WalletProvider) => Boolean(window.cardano && window.cardano[walletProviderInfo[provider].key]);

/**
 * Connects to wallet provider
 * @param provider The wallet provider to connect to
 * @returns Object containing methods to interact with the wallet provider
 */
const connectWallet = async (provider: WalletProvider): Promise<any> => {
    if (!hasWalletExtension(provider)) return false;
    return await window.cardano[walletProviderInfo[provider].key].enable();
}

// Initiate handshake to verify wallet with backend
// Returns hex string of payload, to be signed by wallet
const walletInit = async (publicAddress: string): Promise<any> => {
    let result: any = null;
    try {
        PubSub.publish(Pubs.Loading, 500);
        const client = initializeApollo();
        const data = await client.mutate({
            mutation: walletInitMutation,
            variables: { input: { publicAddress } }
        });
        result = data.data.walletInit;
    } catch (exception) {
        PubSub.publish(Pubs.Snack, { message: errorToSnack(exception), severity: 'error', data: exception });
    } finally {
        PubSub.publish(Pubs.Loading, false);
        return result;
    }
}

/**
 * Completes handshake to verify wallet with backend
 * @param publicAddress Wallet's public address
 * @param signedPayload Message signed by wallet
 * @returns Session object if successful, null if not
 */
const walletComplete = async (publicAddress: string, signedPayload: string): Promise<WalletCompleteResult | null> => {
    let result: any = null;
    try {
        PubSub.publish(Pubs.Loading, 500);
        const client = initializeApollo();
        const data = await client.mutate({
            mutation: walletCompleteMutation,
            variables: { input: { publicAddress, signedPayload } }
        });
        result = data.data.walletComplete;
    } catch (exception) {
        PubSub.publish(Pubs.Snack, { message: errorToSnack(exception), severity: 'error', data: exception });
    } finally {
        PubSub.publish(Pubs.Loading, false);
        return result;
    }
}

// Signs payload received from walletInit
const signPayload = async (provider: WalletProvider, walletActions: any, publicAddress: string, payload: string): Promise<any> => {
    if (!hasWalletExtension(provider)) return null;
    // As of 2022-02-05, new Nami endpoint is not fully working. So the old method is used for now
    if (provider === WalletProvider.Nami)
        return await window.cardano.signData(publicAddress, payload);
    // For all other providers, we use the new method
    return await walletActions.signData(publicAddress, payload);
}

/**
 * Establish trust between a user's wallet and the backend
 * @returns WalletCompleteResult or null
 */
export const validateWallet = async (provider: WalletProvider): Promise<WalletCompleteResult | null> => {
    let result: WalletCompleteResult | null = null;
    try {
        // Connect to wallet extension
        const walletActions = await connectWallet(provider);
        if (!walletActions) return null;
        console.log('walletActions', walletActions);
        // Check if wallet is mainnet or testnet
        const network = await walletActions.getNetworkId();
        if (network !== Network.Mainnet) throw new Error('Wallet is not on mainnet');
        // Find wallet address
        const rewardAddresses = await walletActions.getRewardAddresses();
        if (!rewardAddresses || rewardAddresses.length === 0) throw new Error('Could not find reward address');
        console.log('rewardAddress', rewardAddresses[0]);
        // Request payload from backend
        const payload = await walletInit(rewardAddresses[0]);
        if (!payload) return null;
        // Sign payload with wallet
        const signedPayload = await signPayload(provider, walletActions, rewardAddresses[0], payload);
        console.log('signed payload', signedPayload);
        if (!signedPayload) return null;
        // Send signed payload to backend for verification
        result = (await walletComplete(rewardAddresses[0], signedPayload));
    } catch (error: any) {
        console.error('Caught error completing wallet validation', error);
        PubSub.publish(Pubs.AlertDialog, {
            message: 'Unknown error occurred. Please check that the extension you chose is connected to a DApp-enabled wallet',
            buttons: [{ text: 'OK' }]
        });
    } finally {
        return result;
    }
}