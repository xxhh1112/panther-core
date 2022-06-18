import * as React from 'react';
import {useCallback} from 'react';

import {Box, Typography} from '@mui/material';
import {useWeb3React} from '@web3-react/core';
import {BigNumber, utils} from 'ethers';

import {formatCurrency, formatUSD} from '../../../lib/format';
import {fiatPrice} from '../../../lib/tokenPrice';
import {useAppDispatch, useAppSelector} from '../../../redux/hooks';
import {
    refreshUTXOsStatuses,
    totalSelector,
} from '../../../redux/slices/advancedStakesRewards';
import {marketPriceSelector} from '../../../redux/slices/zkpMarketPrice';
import {StakingRewardTokenID} from '../../../types/staking';

import './styles.scss';

export default function PrivateBalance() {
    const context = useWeb3React();
    const {account} = context;
    const zkpPrice = useAppSelector(marketPriceSelector);
    const unclaimedZZKP = useAppSelector(
        totalSelector(account, StakingRewardTokenID.zZKP),
    );
    const totalPrice = zkpPrice
        ? fiatPrice(unclaimedZZKP, BigNumber.from(zkpPrice))
        : 0;

    const unclaimedPRP = useAppSelector(
        totalSelector(account, StakingRewardTokenID.PRP),
    );

    const dispatch = useAppDispatch();

    // TODO: this check needs to be removed when new button will be added below
    // eslint-disable-next-line
    const refresh = useCallback(async () => {
        dispatch(refreshUTXOsStatuses, context);
    }, [context, dispatch]);

    return (
        <Box className="private-zAssets-balance-container">
            <Box className="private-zAssets-balance">
                <Typography className="title">
                    Private zAsset Balance
                </Typography>
                <Typography className="amount">
                    {totalPrice ? formatUSD(totalPrice, {decimals: 2}) : '-'}
                </Typography>
                <Typography className="zkp-rewards">
                    {unclaimedPRP
                        ? formatCurrency(
                              utils.parseEther(unclaimedPRP.toString()),
                          )
                        : '-'}{' '}
                    Total Privacy Reward Points (PRP)
                </Typography>
            </Box>
            <Box>
                {/* <Button
                    variant="contained"
                    className="deposit-button"
                    onClick={refresh}
                >
                    <span>Refresh Assets (replace me)</span>
                </Button> */}
            </Box>
        </Box>
    );
}
