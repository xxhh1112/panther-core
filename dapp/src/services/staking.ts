import type {TypedDataDomain} from '@ethersproject/abstract-signer';
import type {BytesLike} from '@ethersproject/bytes';
import {JsonRpcSigner} from '@ethersproject/providers';
import type {TransactionResponse} from '@ethersproject/providers';
import CoinGecko from 'coingecko-api';
import {fromRpcSig} from 'ethereumjs-util';
import {BigNumber, constants, utils} from 'ethers';
import type {ContractTransaction} from 'ethers';

import {MessageWithTx} from '../components/Common/MessageWithTx';
import {Staking, IStakingTypes} from '../types/contracts/Staking';
import {CONFIRMATIONS_NUM} from '../utils/constants';
import {parseTxErrorMessage} from '../utils/errors';
import {getEventFromReceipt} from '../utils/transactions';

import {
    ContractName,
    chainHasStakesReporter,
    getContractAddress,
    getRewardMasterContract,
    getStakesReporterContract,
    getStakingContract,
    getTokenContract,
    getSignableContract,
} from './contracts';
import {env} from './env';
import {openNotification, removeNotification} from './notification';

const CoinGeckoClient = new CoinGecko();

export function toBytes32(data: BytesLike): string {
    return utils.hexZeroPad(data, 32);
}

const EIP712_TYPES = {
    Permit: [
        {name: 'owner', type: 'address'},
        {name: 'spender', type: 'address'},
        {name: 'value', type: 'uint256'},
        {name: 'nonce', type: 'uint256'},
        {name: 'deadline', type: 'uint256'},
    ],
};

export async function generatePermitSignature(
    library: any,
    chainId: number,
    account: string,
    signer: JsonRpcSigner,
    amount: BigNumber,
    deadline: number,
) {
    const stakingContract = getStakingContract(library, chainId);
    const tokenContract = getTokenContract(library, chainId);
    const nonce = await tokenContract.nonces(account);
    const permitParams = {
        owner: account,
        spender: stakingContract.address,
        value: amount,
        nonce,
        deadline,
    };
    const domain: TypedDataDomain = {
        name: await tokenContract.name(),
        version: '1',
        chainId,
        verifyingContract: tokenContract.address,
    };

    const signature = await signer._signTypedData(
        domain,
        EIP712_TYPES,
        permitParams,
    );

    if (
        utils.verifyTypedData(domain, EIP712_TYPES, permitParams, signature) !=
        account
    ) {
        console.error(
            `Failed to verify typed data as signed by ${account}`,
            domain,
            EIP712_TYPES,
            permitParams,
            signature,
        );
    }

    return signature;
}

function txError(msg: string, diagnostics: any): Error {
    console.error(msg, diagnostics);
    openNotification('Transaction error', msg, 'danger', 60000);
    return new Error(msg);
}

export async function stake(
    library: any,
    chainId: number,
    account: string,
    amount: BigNumber, // assumes already validated as <= tokenBalance
    stakeType: string,
    data?: any,
): Promise<BigNumber | Error> {
    const {signer, contract} = getSignableContract(
        library,
        chainId,
        account,
        getStakingContract,
    );

    let tx: any;
    try {
        tx = await initiateStakingTransaction(
            library,
            account,
            chainId,
            signer,
            contract,
            amount,
            stakeType,
            data,
        );
    } catch (err) {
        return txError(parseTxErrorMessage(err), err);
    }

    const inProgress = openNotification(
        'Transaction in progress',
        'Your staking transaction is currently in progress. Please wait for confirmation!',
        'info',
    );

    const receipt = await tx.wait(CONFIRMATIONS_NUM);
    removeNotification(inProgress);

    const event = await getEventFromReceipt(receipt, 'StakeCreated');
    if (event instanceof Error) {
        return event;
    }

    openNotification(
        'Stake completed successfully',
        'Congratulations! Your staking transaction was processed!',
        'info',
        15000,
    );

    return event?.args?.stakeID;
}

async function initiateStakingTransaction(
    library: any,
    account: string,
    chainId: number,
    signer: JsonRpcSigner,
    contract: Staking,
    amount: BigNumber,
    stakeType: string,
    data: any = '0x00',
): Promise<ContractTransaction> {
    const allowance = await getAllowance(library, chainId, account);
    if (!allowance) {
    }
    console.debug(`Got allowance ${allowance} for ${account}`);
    const allowanceSufficient = amount.lte(allowance);
    if (allowanceSufficient) {
        console.debug(
            `Allowance ${utils.formatEther(
                allowance,
            )} >= ${amount}; using regular stake()`,
        );
        return await normalStake(contract, amount, stakeType, data);
    } else {
        console.debug(
            `Allowance ${utils.formatEther(
                allowance,
            )} < ${amount}; using permitAndStake()`,
        );
        return await permitAndStake(
            library,
            chainId,
            account,
            signer,
            contract,
            amount,
            stakeType,
            data,
        );
    }
}

async function getAllowance(
    library: any,
    chainId: number,
    account: string,
): Promise<BigNumber> {
    const stakingContract = getContractAddress(ContractName.STAKING, chainId);
    const tokenContract = getTokenContract(library, chainId);
    console.debug(`Getting allowance for ${account} on ${stakingContract}`);
    return await tokenContract.allowance(account, stakingContract);
}

async function normalStake(
    contract: Staking,
    amount: BigNumber,
    stakeType: string,
    data: any,
) {
    return await contract.stake(amount, stakeType, data, {
        gasLimit: 320000,
    });
}

async function permitAndStake(
    library: any,
    chainId: number,
    account: string,
    signer: JsonRpcSigner,
    contract: Staking,
    amount: BigNumber,
    stakeType: string,
    data: any,
): Promise<TransactionResponse> {
    const now = Math.floor(new Date().getTime() / 1000);
    const deadline = now + 600; // within 10 minutes

    const permitSig = await generatePermitSignature(
        library,
        chainId,
        account,
        signer,
        amount,
        deadline,
    );
    const {v, r, s} = fromRpcSig(permitSig);

    return await contract.permitAndStake(
        account,
        amount,
        deadline,
        v,
        r,
        s,
        stakeType,
        data,
        {
            gasLimit: 400000,
        },
    );
}

export async function unstake(
    library: any,
    chainId: number,
    account: string,
    stakeID: BigNumber,
    data?: string,
    isForced = false,
): Promise<Error | undefined> {
    const {contract} = getSignableContract(
        library,
        chainId,
        account,
        getStakingContract,
    );

    let tx: any;
    try {
        tx = await contract.unstake(stakeID, data ? data : '0x00', isForced, {
            gasLimit: 350_000,
        });
    } catch (e: any) {
        openNotification(
            'Transaction error',
            MessageWithTx({
                message: parseTxErrorMessage(e),
                txHash: tx?.hash,
            }),
            'danger',
        );
        return e as Error;
    }

    const inProgress = openNotification(
        'Transaction in progress',
        'Your unstaking transaction is currently in progress. Please wait for confirmation!',
        'info',
    );

    const receipt = await tx.wait(CONFIRMATIONS_NUM);
    removeNotification(inProgress);

    const event = await getEventFromReceipt(receipt, 'StakeClaimed');
    if (event instanceof Error) {
        return event;
    }

    openNotification(
        'Unstaking completed successfully',
        'Congratulations! Your unstaking transaction was processed!',
        'info',
        15000,
    );
}

export async function getAccountStakes(
    library: any,
    chainId: number,
    account: string,
): Promise<IStakingTypes.StakeStructOutput[]> {
    const contract = getStakingContract(library, chainId);
    return await contract.accountStakes(account);
}

function getActiveStakeAmount(
    stake: IStakingTypes.StakeStructOutput,
): BigNumber {
    return stake.claimedAt ? constants.Zero : stake.amount;
}

export function sumActiveAccountStakes(
    stakes: IStakingTypes.StakeStructOutput[],
): BigNumber {
    return stakes.reduce(
        (acc, stake) => acc.add(getActiveStakeAmount(stake)),
        constants.Zero,
    );
}

export async function getTotalStakedForAccount(
    library: any,
    chainId: number,
    account: string,
): Promise<BigNumber | null> {
    const stakes = await getAccountStakes(library, chainId, account);
    return sumActiveAccountStakes(stakes);
}

export async function getRewardsBalance(
    library: any,
    chainId: number,
    account: string,
): Promise<BigNumber | null> {
    try {
        if (chainHasStakesReporter(chainId)) {
            return await getRewardsBalanceFromReporter(
                library,
                chainId,
                account,
            );
        } else {
            const rewardMaster = getRewardMasterContract(library, chainId);
            return await rewardMaster.entitled(account);
        }
    } catch (err: any) {
        console.warn(`Failed to fetch rewards entitled for ${account}:`, err);
        return err;
    }
}

export interface StakeRow {
    id: number;
    stakedAt: number;
    amount: BigNumber;
    reward: BigNumber;
    lockedTill: number;
    unstakable?: boolean;
    claimedAt: number;
}

export async function getStakesAndRewards(
    library: any,
    chainId: number,
    account: string,
): Promise<[totalStaked: BigNumber, rows: StakeRow[]]> {
    if (chainHasStakesReporter(chainId)) {
        const stakes = await getStakesInfoFromReporter(
            library,
            chainId,
            account,
        );
        const totalStaked = sumActiveAccountStakes(stakes[0]);
        const rewards = stakes[1];
        return [
            totalStaked,
            stakes[0].map(
                (stake: IStakingTypes.StakeStructOutput, i: number) => {
                    return {
                        ...stake,
                        reward: rewards[i],
                    };
                },
            ),
        ];
    }

    // If we don't have StakesReporter, we have to calculate rewards per stake
    // proportionally based on total reward balance.
    const stakes = await getAccountStakes(library, chainId, account);
    const totalStaked = sumActiveAccountStakes(stakes);
    const rewardsBalance = await getRewardsBalance(library, chainId, account);
    if (!rewardsBalance) return [totalStaked, []];
    return [
        totalStaked,
        stakes.map(stake => {
            return {
                ...stake,
                reward: rewardsBalance.mul(stake.amount).div(totalStaked),
            };
        }),
    ];
}

export async function getStakesInfoFromReporter(
    library: any,
    chainId: number,
    account: string,
): Promise<[IStakingTypes.StakeStructOutput[], BigNumber[]]> {
    const stakesReporterContract = getStakesReporterContract(library, chainId);
    return await stakesReporterContract.getStakesInfo(account);
}

async function getRewardsBalanceFromReporter(
    library: any,
    chainId: number,
    account: string,
): Promise<BigNumber> {
    const stakesInfo = await getStakesInfoFromReporter(
        library,
        chainId,
        account,
    );
    const totalRewards = stakesInfo[1].reduce(
        (acc, reward) => acc.add(reward),
        constants.Zero,
    );
    return totalRewards;
}

export async function getTotalStaked(
    library: any,
    chainId: number,
): Promise<BigNumber> {
    const contract = getStakingContract(library, chainId);
    try {
        return await contract.totalStaked();
    } catch (err: any) {
        console.warn('Failed to fetch totalStaked from Staking contract:', err);
        return err;
    }
}

export async function getZKPMarketPrice(): Promise<BigNumber | null> {
    const symbol = env.TOKEN_SYMBOL;
    if (!symbol || symbol === 'none') {
        return null;
    }

    let priceData: any;
    try {
        priceData = await CoinGeckoClient.simple.price({
            ids: [symbol],
            vs_currencies: ['usd'],
        });
    } catch (err: any) {
        console.warn(`Failed to fetch ${symbol} from coingecko`, err);
        return null;
    }

    if (!priceData.data) {
        console.warn('Coingecko price response was missing data');
        return null;
    }

    if (!priceData.data[symbol]) {
        console.warn(`Coingecko price response was missing ${symbol}`);
        return null;
    }
    const price = utils.parseUnits(String(priceData.data[symbol]['usd']), 18);
    return price;
}
