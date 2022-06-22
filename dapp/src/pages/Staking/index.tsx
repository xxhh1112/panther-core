import React, {useEffect} from 'react';

import {Container} from '@mui/material';
import Grid from '@mui/material/Grid';
import {Box} from '@mui/system';
import {useWeb3React} from '@web3-react/core';

import AdvancedStakingRewards from '../../components/AdvancedStakingRewards';
import BalanceCard from '../../components/BalanceCard';
import CurrentStakeAPY from '../../components/CurrentStakeAPY';
import {MainPageWrapper} from '../../components/MainPageWrapper';
import StakingUnstakingCard from '../../components/StakingUnstakingCard';
import Welcome from '../../components/Welcome';
import background from '../../images/background-adv.png';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {getAdvancedStakesRewards} from '../../redux/slices/advancedStakesRewards';
import {firstVisitSelector} from '../../redux/slices/isFirstVisit';
import {getStakeTerms} from '../../redux/slices/stakeTerms';
import {getTotalStaked} from '../../redux/slices/totalStaked';
import {getTotalUnclaimedClassicRewards} from '../../redux/slices/totalUnclaimedClassicRewards';
import {getZKPTokenMarketPrice} from '../../redux/slices/zkpMarketPrice';
import {getZkpStakedBalance} from '../../redux/slices/zkpStakedBalance';
import {getZkpTokenBalance} from '../../redux/slices/zkpTokenBalance';
import {chainHasAdvancedStaking} from '../../services/contracts';

import './styles.scss';

const Staking = (): React.ReactElement => {
    const context = useWeb3React();
    const dispatch = useAppDispatch();
    const {chainId} = context;

    useEffect(() => {
        dispatch(getZKPTokenMarketPrice);
        dispatch(getTotalStaked, context);
        dispatch(getZkpTokenBalance, context);
        dispatch(getZkpStakedBalance, context);
        dispatch(getTotalUnclaimedClassicRewards, context);
        dispatch(getAdvancedStakesRewards, context);
        dispatch(getStakeTerms, context);
    }, [context, dispatch]);

    const firstVisit = useAppSelector(firstVisitSelector);

    return (
        <MainPageWrapper background={background}>
            <Container className="staking-container">
                {firstVisit ? (
                    <Grid container>
                        <Grid item xs={12} md={2}></Grid>

                        <Grid
                            container
                            justifyContent="center"
                            alignItems="center"
                            item
                            md={8}
                            xs={12}
                        >
                            <Grid item xs={12} sm={12} md={12}>
                                <Welcome />
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={2}></Grid>
                    </Grid>
                ) : (
                    <Grid container>
                        <Grid item md={1} xs={12} />
                        <Grid item container spacing={2} md={10} xs={12}>
                            <Grid item xs={12} md={5}>
                                <Box width={'100%'}>
                                    <BalanceCard />
                                </Box>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                md={7}
                                className="apy-staking-right-panel"
                            >
                                <Box width={'100%'}>
                                    {chainHasAdvancedStaking(chainId) ? (
                                        <AdvancedStakingRewards />
                                    ) : (
                                        <CurrentStakeAPY />
                                    )}
                                    <StakingUnstakingCard />
                                </Box>

                                <Grid item xs={12} md={3}></Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={1} xs={12} />
                    </Grid>
                )}
            </Container>
        </MainPageWrapper>
    );
};

export default Staking;
