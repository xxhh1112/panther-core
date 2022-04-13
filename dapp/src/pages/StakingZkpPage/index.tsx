import React, {useCallback, useEffect, useState} from 'react';

import {BigNumber} from '@ethersproject/bignumber';
import {Container} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import {Box} from '@mui/system';
import {useWeb3React} from '@web3-react/core';
import {constants} from 'ethers';

import AdvancedStakingComingSoon from '../../components/AdvancedStakingComingSoon';
import BalanceCard from '../../components/BalanceCard';
import CurrentStakeAPY from '../../components/CurrentStakeAPY';
import {Footer} from '../../components/Footer';
import Header from '../../components/Header';
import StakingUnstakingCard from '../../components/StakingUnstakingCard';
import {useEagerConnect, useInactiveListener} from '../../hooks/web3';
import background from '../../images/background.png';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {blurSelector} from '../../redux/slices/blur';
import {getTotalStaked} from '../../redux/slices/totalStaked';
import {
    getZKPTokenMarketPrice,
    marketPriceSelector,
} from '../../redux/slices/zkpMarketPrice';
import {
    getZkpStakedBalance,
    resetZkpStakedBalance,
} from '../../redux/slices/zkpStakedBalance';
import * as accountService from '../../services/account';
import {formatAccountAddress} from '../../services/account';
import {injected, supportedNetworks, Network} from '../../services/connectors';
import {chainHasStakesReporter} from '../../services/contracts';
import * as stakingService from '../../services/staking';
import {switchNetwork} from '../../services/wallet';
import {fiatPrice, formatCurrency, formatEther} from '../../utils/helpers';

import './styles.scss';

function StakingZkpPage() {
    const context = useWeb3React();
    const dispatch = useAppDispatch();
    const price: BigNumber | null = useAppSelector(marketPriceSelector);
    const {
        connector,
        chainId,
        activate,
        deactivate,
        active,
        account,
        library,
        error,
    } = context;

    // Logic to recognize the connector currently being activated
    const [activatingConnector, setActivatingConnector] = useState<any>();
    const [, setChainError] = useState('');
    const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null);
    const [tokenBalanceUSD, setTokenBalanceUSD] = useState<BigNumber | null>(
        null,
    );
    const [rewardsBalance, setRewardsBalance] = useState<BigNumber | null>(
        null,
    );
    const accountAddress = formatAccountAddress(account);

    // Handle logic to eagerly connect to the injected ethereum provider, if it
    // exists and has granted access already
    const triedEager = useEagerConnect();

    useEffect(() => {
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined);
        }
    }, [activatingConnector, connector]);

    // Set up listeners for events on the injected ethereum provider, if it exists
    // and is not in the process of activating.
    const suppressInactiveListeners =
        !triedEager || activatingConnector || error;
    useInactiveListener(suppressInactiveListeners);

    const currentNetwork: Network | null =
        context && context.chainId ? supportedNetworks[context.chainId] : null;

    const onConnect = useCallback(async () => {
        console.debug('onConnect: error', error, '/ chainId', chainId);
        if (!chainId) {
            console.debug(
                'Connecting to the network; injected connector:',
                injected,
            );
            setActivatingConnector(injected);
            await activate(injected);
        } else {
            deactivate();
        }
    }, [error, chainId, activate, deactivate]);

    const disconnect = useCallback(async () => {
        if (active && chainId) {
            deactivate();
            setTokenBalance(null);
            dispatch(resetZkpStakedBalance());
            setRewardsBalance(null);
        }
    }, [active, chainId, deactivate, dispatch]);

    const fetchZkpTokenBalance = useCallback(
        async (price: BigNumber | null) => {
            if (!library || !chainId || !account) return;
            const balance = await accountService.getTokenBalance(
                library,
                chainId,
                account,
            );
            setTokenBalance(balance);

            let tokenBalanceUSD: BigNumber | null = null;
            if (price && balance && balance.gte(constants.Zero)) {
                tokenBalanceUSD = fiatPrice(balance, price);
                setTokenBalanceUSD(tokenBalanceUSD);
            }
            console.debug(
                'tokenBalance:',
                formatEther(balance),
                `(USD \$${formatCurrency(tokenBalanceUSD)})`,
            );
        },
        [library, chainId, account],
    );

    const getUnclaimedRewardsBalance = useCallback(
        async (price: BigNumber | null) => {
            if (!library || !chainId || !account) {
                setRewardsBalance(null);
                return;
            }
            if (chainHasStakesReporter(chainId)) {
                if (chainId === 137) {
                    console.debug('Using StakesReporter on Polygon');
                } else {
                    console.debug('Using StakesReporter on chain', chainId);
                }
            } else {
                console.debug('Not using StakesReporter; chainId', chainId);
            }

            const rewardsBalance = await stakingService.getRewardsBalance(
                library,
                chainId,
                account,
            );
            setRewardsBalance(rewardsBalance);
            console.debug(
                'rewardsBalance:',
                formatCurrency(rewardsBalance),
                `(USD \$${formatCurrency(fiatPrice(rewardsBalance, price))})`,
            );
        },
        [library, chainId, account],
    );

    const fetchData = useCallback(async (): Promise<void> => {
        if (!library || !account) {
            setRewardsBalance(null);
            return;
        }

        await fetchZkpTokenBalance(price);
        await getUnclaimedRewardsBalance(price);
    }, [
        library,
        account,
        price,
        fetchZkpTokenBalance,
        getUnclaimedRewardsBalance,
    ]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        dispatch(getTotalStaked(context));
        dispatch(getZKPTokenMarketPrice());
        dispatch(getZkpStakedBalance(context));
    }, [context, dispatch]);

    const isBlur = useAppSelector(blurSelector);

    return (
        <Box
            className={`main-app ${isBlur && 'isBlur'}`}
            sx={{
                backgroundImage: `url(${background})`,
            }}
        >
            <CssBaseline />

            <Header
                onConnect={() => {
                    onConnect();
                }}
                switchNetwork={(chainId: number) => {
                    switchNetwork(chainId, setChainError);
                }}
                disconnect={() => {
                    disconnect();
                }}
                networkName={currentNetwork?.name}
                networkSymbol={currentNetwork?.symbol}
                networkLogo={currentNetwork?.logo}
            />

            <Box className="main-box-holder">
                <Container className="main-container">
                    <Grid container>
                        <Grid item md={1} xs={12} />
                        <Grid item container spacing={2} md={10} xs={12}>
                            <Grid item xs={12} md={5}>
                                <Box width={'100%'}>
                                    <BalanceCard
                                        tokenBalance={tokenBalance}
                                        tokenBalanceUSD={tokenBalanceUSD}
                                        rewardsBalance={rewardsBalance}
                                        accountAddress={accountAddress}
                                        networkLogo={currentNetwork?.logo}
                                    />
                                    <AdvancedStakingComingSoon />
                                </Box>
                                <Footer />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                md={7}
                                className="apy-staking-right-panel"
                            >
                                <Box width={'100%'}>
                                    <CurrentStakeAPY
                                        networkName={currentNetwork?.name}
                                    />
                                    <StakingUnstakingCard
                                        tokenBalance={tokenBalance}
                                        rewardsBalance={rewardsBalance}
                                        fetchData={fetchData}
                                        networkLogo={currentNetwork?.logo}
                                        onConnect={() => {
                                            onConnect();
                                        }}
                                        switchNetwork={(chainId: number) => {
                                            switchNetwork(
                                                chainId,
                                                setChainError,
                                            );
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid item md={1} xs={12} />
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default StakingZkpPage;
