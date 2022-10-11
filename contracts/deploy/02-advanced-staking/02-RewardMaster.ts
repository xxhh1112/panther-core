import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {
    reuseEnvAddress,
    getContractAddress,
    getContractEnvAddress,
} from '../../lib/deploymentHelpers';
import {isPolygonOrMumbai} from '../../lib/checkNetwork';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts} = hre;
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    console.log(`Deploying RewardMaster on ${hre.network.name}...`);
    if (reuseEnvAddress(hre, 'REWARD_MASTER')) return;

    let pool: string;

    if (isPolygonOrMumbai(hre)) {
        pool = await getContractAddress(
            hre,
            'MaticRewardPool',
            'MATIC_REWARD_POOL',
        );
    } else {
        pool = await getContractAddress(hre, 'RewardPool', 'REWARD_POOL');
    }

    const zkpToken = getContractEnvAddress(hre, 'ZKP_TOKEN');

    await deploy('RewardMaster', {
        from: deployer,
        args: [zkpToken, pool, deployer],
        log: true,
        autoMine: true,
    });
};
export default func;

func.tags = ['advanced-staking', 'classic-staking', 'reward-master'];
func.dependencies = ['reward-pool'];
