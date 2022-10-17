import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {
        deployments: {deploy},
        getNamedAccounts,
    } = hre;
    const {deployer} = await getNamedAccounts();
    const multisig =
        process.env.DAO_MULTISIG_ADDRESS ||
        (await getNamedAccounts()).multisig ||
        deployer;

    const pantherPool = await hre.ethers.getContract('PantherPoolV0');

    await deploy('PrpGrantor_Implementation', {
        contract: 'PrpGrantor',
        from: deployer,
        args: [
            multisig, // owner
            pantherPool.address, // grantProcessor
        ],
        log: true,
        autoMine: true,
    });
};
export default func;

func.tags = ['grantor-impl', 'protocol'];
func.dependencies = ['check-params', 'pool'];