import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import {isLocal} from '../../lib/checkNetwork';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {getNamedAccounts, network} = hre;

    console.log(`Deploying on ${network.name}...`);

    const {deployer} = await getNamedAccounts();
    if (!deployer) throw 'Err: deployer undefined';

    if (!isLocal(hre)) {
        if (!process.env.DAO_MULTISIG_ADDRESS)
            throw 'Undefined DAO_MULTISIG_ADDRESS';
        if (!process.env.POOL_EXIT_TIME) throw 'Undefined POOL_EXIT_TIME';
    } else {
        if (
            process.env.POOL_EXIT_TIME &&
            +process.env.POOL_EXIT_TIME > Math.ceil(Date.now() / 1000)
        ) {
            throw 'POOL_EXIT_TIME is less than current time';
        }
    }
};

export default func;

func.tags = ['check-params'];