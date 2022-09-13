import {AdvancedStakeRewardController} from './../../types/contracts/AdvancedStakeRewardController';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {task, types} from 'hardhat/config';
import {
    updateZkpAndPrpRewardsLimit,
    setNftRewardLimit,
} from '../../lib/staking';

const TASK_REWARDS_LIMIT_ADD = 'rewards:limit:add';

task(
    TASK_REWARDS_LIMIT_ADD,
    'Adds ZKP rewards limit for the AdvancedStakeRewardsController contract',
)
    .addOptionalParam(
        'nftLimit',
        'The maximum NFT that can be minted by the controller as reward',
        undefined,
        types.int,
    )
    .addOptionalParam(
        'zkpPrpLimits',
        'Whether task updates the ZKP and PRP rewards limit',
        true,
        types.boolean,
    )
    .setAction(async (_taskArgs, hre: HardhatRuntimeEnvironment) => {
        const controller = (await hre.ethers.getContract(
            'AdvancedStakeRewardController',
        )) as AdvancedStakeRewardController;

        if (_taskArgs.zkpPrpLimits)
            await updateZkpAndPrpRewardsLimit(controller);

        if (_taskArgs.nftLimit)
            await setNftRewardLimit(controller, _taskArgs.nftLimit);
    });