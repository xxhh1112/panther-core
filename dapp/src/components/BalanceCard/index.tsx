import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import refreshIcon from '../../images/refresh-icon.svg';
import infoIcon from '../../images/info-icon.svg';
import {IconButton, Tooltip} from '@mui/material';
import Address from '../Address';
import accountAvatar from '../../images/wallet-icon.svg';
import './styles.scss';
import {useWeb3React} from '@web3-react/core';
import {Web3Provider} from '@ethersproject/providers';

const BalanceCard = (props: {
    rewardsBalance: string | null;
    tokenBalance: string | null;
    stakedBalance: string | null;
    tokenUSDValue: string | null;
    accountAddress: string | null;
}) => {
    return (
        <>
            <Card
                sx={{
                    marginBottom: '20px',
                    border: '1px solid #485267',
                    backgroundColor: '#2B334140',
                    borderRadius: '8px',
                }}
            >
                {props.accountAddress && (
                    <AddressWithSetting
                        accountAvatar={accountAvatar}
                        accountAddress={props.accountAddress}
                    />
                )}

                <TotalBalance
                    title={'Total Balance'}
                    tokenBalance={props.tokenBalance}
                    tokenMarketPrice={props.tokenUSDValue}
                />

                <AddressBalances
                    title={'Staked Balance'}
                    balance={props.stakedBalance}
                    amountUSD={props.tokenUSDValue}
                />

                <AddressBalances
                    title={'Unclaimed Reward Balance'}
                    balance={props.rewardsBalance}
                    amountUSD={props.tokenUSDValue}
                />
            </Card>
        </>
    );
};

const AddressWithSetting = (props: {
    accountAvatar: string;
    accountAddress: string | null;
}) => {
    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            marginBottom={'10px'}
        >
            <Box
                width={'50%'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                className="address-container"
            >
                <Address
                    accountAvatar={props.accountAvatar}
                    accountAddress={props.accountAddress}
                />
            </Box>
        </Box>
    );
};

const TotalBalance = ({title, tokenBalance, tokenMarketPrice}) => {
    const context = useWeb3React<Web3Provider>();
    const {account} = context;

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <Box
            sx={{
                background: '#63728835',
                borderRadius: '8px',
                padding: '0 15px',
                mixBlendMode: 'normal',
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontStyle: 'normal',
                        fontSize: '18px',
                        lineHeight: '42px',
                        alignItems: 'left',
                    }}
                >
                    {title}
                </Typography>
                <Tooltip title={title} placement="top">
                    <IconButton
                        onClick={refreshPage}
                        sx={{
                            opacity: 0.6,
                        }}
                    >
                        <img src={refreshIcon} />
                    </IconButton>
                </Tooltip>
            </Box>

            {account && (
                <>
                    <Box display="flex" alignItems="baseline">
                        <Typography
                            component="div"
                            sx={{
                                fontWeight: 800,
                                fontStyle: 'bold',
                                fontSize: '32px',
                                lineHeight: '42px',
                                marginBottom: '-10px',
                            }}
                        >
                            {tokenBalance}
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontStyle: 'normal',
                                fontSize: '12px',
                                lineHeight: '42px',
                                marginLeft: '8px',
                            }}
                        >
                            ZKP
                        </Typography>
                    </Box>
                    {tokenMarketPrice && (
                        <Box display="flex" alignItems="baseline">
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    fontStyle: 'normal',
                                    fontSize: '14px',
                                    lineHeight: '42px',
                                    opacity: 0.6,
                                }}
                            >
                                ~${tokenMarketPrice} USD
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

const AddressBalances = props => {
    const {title, amountUSD, balance} = props;
    const context = useWeb3React<Web3Provider>();
    const {account} = context;

    return (
        <>
            <Box display="flex" alignItems="baseline">
                <Typography className="address-balance">{title}</Typography>
                <Typography>
                    <Tooltip title={title} placement="top">
                        <IconButton
                            sx={{
                                opacity: 0.6,
                            }}
                        >
                            <img src={infoIcon} />
                        </IconButton>
                    </Tooltip>
                </Typography>
            </Box>
            {account && (
                <Box display="flex" justifyContent={'space-between'}>
                    <Box display="flex" justifyContent={'center'}>
                        <Typography
                            component="div"
                            sx={{
                                fontWeight: 800,
                                fontStyle: 'bold',
                                fontSize: '22px',
                                lineHeight: '42px',
                            }}
                        >
                            {balance}
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontStyle: 'normal',
                                fontSize: '12px',
                                lineHeight: '42px',
                                marginLeft: '8px',
                            }}
                        >
                            ZKP
                        </Typography>
                    </Box>
                    {amountUSD && (
                        <Typography
                            sx={{
                                fontWeight: 600,
                                fontStyle: 'normal',
                                fontSize: '12px',
                                lineHeight: '42px',
                                marginLeft: '8px',
                            }}
                        >
                            ~${amountUSD} USD
                        </Typography>
                    )}
                </Box>
            )}
        </>
    );
};

export default BalanceCard;
