import * as _ from 'lodash';
import {utils} from 'ethers';
import {RewardMaster} from '../types/contracts/RewardMaster';
import {Staking, IStakingTypes} from '../types/contracts/Staking';
import {StakeRewardController} from '../types/contracts/StakeRewardController';
import {
    classicActionHash,
    advancedActionHash,
    STAKE,
    UNSTAKE,
    hash4bytes,
} from './hash';
import {toDate} from './units-shortcuts';

export type StakeType = 'classic' | 'advanced';

export async function showStake(
    staking: Staking,
    addr: string,
    stakeId: number,
) {
    const stake = await staking.stakes(addr, stakeId);
    return [
        utils.formatEther(stake.amount),
        toDate(stake.stakedAt),
        toDate(stake.claimedAt),
    ];
}

export async function addRewardAdviser(
    rewardMaster: RewardMaster,
    stakingAddress: string,
    newAdviserAddress: string,
    config = {isClassic: true, replace: false},
) {
    const transactions = [];
    const receipts = [];
    for (const action of [STAKE, UNSTAKE]) {
        const actionHash = config.isClassic
            ? classicActionHash(action)
            : advancedActionHash(action);

        if (config.replace) {
            const txToRemove = await rewardMaster.removeRewardAdviser(
                stakingAddress,
                actionHash,
            );
            transactions.push(txToRemove);
            receipts.push(await txToRemove.wait());
        }

        const txToAdd = await rewardMaster.addRewardAdviser(
            stakingAddress,
            actionHash,
            newAdviserAddress,
        );
        transactions.push(txToAdd);
        receipts.push(await txToAdd.wait());
    }
    return {transactions, receipts};
}

export async function addTerms(
    staking: Staking,
    terms: IStakingTypes.TermsStruct,
    stakeType: StakeType,
) {
    console.log(`Adding terms for ${stakeType} staking:`, terms);

    const tx = await staking.addTerms(hash4bytes(stakeType), terms);
    const receipt = await tx.wait();

    console.log(`Transaction submitted: ${receipt.transactionHash}`);
}

interface HistoricalDatapoint {
    amount: string;
    timestamp: number;
}

export async function saveHistoricalData(
    controller: StakeRewardController,
    data: HistoricalDatapoint[],
) {
    const chunks = _.chunk(data, 500);
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const historyEnd =
            i < chunks.length - 1 ? 0 : chunk[chunk.length - 1].timestamp + 100;
        console.log(
            `Submitting ${chunk.length} historical stakes, end ${historyEnd} ...`,
        );
        const tx = await controller.saveHistoricalData(
            chunk.map(e => e.amount),
            chunk.map(e => e.timestamp),
            historyEnd,
        );
        await tx.wait();
        console.log(`   ... saved.`);
    }
    if (!(await controller.isInitialized())) {
        throw `Controller was not initialized after saving historical data`;
    }
}
