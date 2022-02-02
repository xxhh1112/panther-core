import * as React from 'react';
import {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {UnsupportedChainIdError, useWeb3React} from '@web3-react/core';
import {NoEthereumProviderError} from '@web3-react/injected-connector';
import logo from '../../images/panther-logo.svg';
import * as stakingService from '../../services/staking';
import {formatCurrency} from '../../utils';
import {onWrongNetwork} from '../../services/connectors';
import {ConnectButton} from '../ConnectButton';
import {Store} from 'react-notifications-component';
import './styles.scss';
import {openNotification} from '../../services/notification';

export default function StakeTab(props: {
    rewardsBalance: string | null;
    tokenBalance: string | null;
    stakedBalance: string | null;
    setZkpTokenBalance: any;
    getStakedZkpBalance: any;
    onConnect: any;
    switchNetwork: any;
}) {
    const context = useWeb3React();
    const {account, library, active, error} = context;
    const isNoEthereumProviderError = error instanceof NoEthereumProviderError;
    const [wrongNetwork, setWrongNetwork] = useState(false);
    const [amountToStake, setAmountToStake] = useState<string | null>();
    const [, setStakedId] = useState<number | null>(null);

    const stake = async (amount: string) => {
        const stakingContract = await stakingService.getStakingContract(
            library,
        );
        if (!stakingContract || !account || !props.tokenBalance) {
            return;
        }
        const stakeType = '0x4ab0941a';
        const signer = library.getSigner(account).connectUnchecked();
        const stakingResponse = await stakingService.stake(
            library,
            account,
            stakingContract,
            props.tokenBalance,
            amount,
            stakeType,
            signer,
        );

        if (stakingResponse instanceof Error) {
            console.error(stakingResponse);
            openNotification(
                'Transaction error',
                'Your staking transaction encountered an error. Please try again!',
                'danger',
            );
        }
        setStakedId(Number(stakingResponse));
        setAmountToStake('');
        props.setZkpTokenBalance();
        props.getStakedZkpBalance();
        Store.removeAllNotifications();
    };

    useEffect((): any => {
        const wrongNetwork =
            onWrongNetwork(context) || error instanceof UnsupportedChainIdError;
        setWrongNetwork(wrongNetwork);
        console.debug(
            'header: wrongNetwork',
            wrongNetwork,
            '/ active',
            active,
            '/ error',
            error,
        );
        if (wrongNetwork) {
            return;
        }

        if (account && library) {
            let stale = false;

            library.getBalance(account).then(() => {
                if (!stale) {
                    setWrongNetwork(onWrongNetwork(context));
                }
            });

            return () => {
                stale = true;
            };
        }
    }, [context, active, account, library, error]);

    return (
        <Box width={'100%'}>
            <StakingInput
                tokenBalance={props.tokenBalance}
                setAmountToStake={setAmountToStake}
                amountToStake={amountToStake}
            />
            <Card variant="outlined" className="staking-info-card">
                <CardContent>
                    <StakingInfoMSG />
                    {/* <Box display={'flex'} justifyContent={'center'}> */}
                    <StakingMethod />
                    {/* </Box> */}
                </CardContent>
            </Card>

            {wrongNetwork && (
                <div className="buttons-holder">
                    <ConnectButton
                        text={'Switch network'}
                        onClick={() => {
                            props.switchNetwork();
                        }}
                    />
                </div>
            )}

            {!active && !wrongNetwork && (
                <div className="buttons-holder">
                    <ConnectButton
                        text={
                            isNoEthereumProviderError
                                ? 'Install MetaMask'
                                : 'Connect Wallet'
                        }
                        onClick={() => {
                            if (isNoEthereumProviderError) {
                                window.open('https://metamask.io');
                            } else {
                                props.onConnect();
                            }
                        }}
                    />
                </div>
            )}

            {active && !wrongNetwork && (
                <StakingBtn
                    amountToStake={amountToStake}
                    tokenBalance={props.tokenBalance}
                    stake={stake}
                />
            )}
        </Box>
    );
}

const getButtonText = (
    amountToStake: string | undefined,
    tokenBalance: number,
): [string, boolean] => {
    if (!amountToStake) {
        return ['Enter amount to stake above', false];
    }
    if (Number(amountToStake) > tokenBalance) {
        return ['Insufficient balance', false];
    }
    if (Number(amountToStake) >= 100) {
        return [`STAKE ${amountToStake} ZKP`, true];
    }
    return ['Stake amount must be above 100', false];
};

const StakingBtn = ({amountToStake, tokenBalance, stake}) => {
    const [buttonText, ready] = getButtonText(amountToStake, tokenBalance);
    const activeClass = ready ? 'active' : '';
    return (
        <Box className={`buttons-holder ${activeClass}`}>
            <Button
                className="staking-button"
                onClick={() => {
                    if (ready) {
                        stake(amountToStake);
                    }
                }}
            >
                {buttonText}
            </Button>
        </Box>
    );
};

const StakingInput = props => {
    const context = useWeb3React();
    const {account} = context;
    const {tokenBalance, setAmountToStake, amountToStake} = props;
    const changeHandler = e => {
        const inputTextLength = e.target.value.length;
        if (inputTextLength > 10) {
            return;
        }

        const regex = /^\d*\.?\d*$/; // matches floating points numbers
        if (
            tokenBalance &&
            Number(tokenBalance) &&
            Number(e.target.value) > Number(tokenBalance) &&
            regex.test(e.target.value)
        ) {
            return null;
        } else if (regex.test(e.target.value)) {
            setAmountToStake(e.target.value.toString() || '');
        } else {
            setAmountToStake('');
        }
    };
    return (
        <>
            <Box className="staking-input-header">
                <Typography
                    className="amount-to-stake-caption"
                    variant="subtitle2"
                    component="span"
                >
                    Amount to stake
                </Typography>
                <span>
                    <Typography
                        className="available-to-stake-caption"
                        variant="subtitle2"
                        component="span"
                    >
                        Available to stake:
                    </Typography>
                    <Typography
                        className="token-balance"
                        variant="subtitle2"
                        component="span"
                    >
                        {formatCurrency(tokenBalance)}
                    </Typography>
                    <Typography
                        className="token-balance"
                        variant="subtitle2"
                        component="span"
                    >
                        ZKP
                    </Typography>
                </span>
            </Box>
            <Box className="staking-input-container">
                <Box className="staking-input-box">
                    <Box>
                        <img src={logo} height={'40px'} width={'40px'} />
                    </Box>

                    <Input
                        className="staking-input"
                        value={amountToStake}
                        onChange={changeHandler}
                        autoComplete="off"
                        autoFocus={true}
                        placeholder={amountToStake ? amountToStake : '0'}
                        disableUnderline={true}
                        disabled={!account}
                        endAdornment={
                            <InputAdornment
                                position="end"
                                className="staking-input-symbol"
                            >
                                <span>ZKP</span>
                            </InputAdornment>
                        }
                        aria-describedby="staking-value-helper-text"
                    />
                </Box>

                <Typography
                    variant="caption"
                    component="span"
                    className="staking-input-max"
                    onClick={() => {
                        setAmountToStake(tokenBalance);
                    }}
                >
                    MAX
                </Typography>
            </Box>
        </>
    );
};

const StakingMethod = () => (
    <Box className="staking-method-container">
        <Box
            display="flex"
            justifyContent={'space-between'}
            alignItems={'center'}
        >
            <Typography className="staking-method-title">
                Staking Method:
            </Typography>
            <Select
                labelId="staking-method-select-label"
                id="staking-method-selectd"
                variant="standard"
                value={'Standard'}
                className="staking-method-select"
            >
                <MenuItem selected value={'Standard'}>
                    Standard
                </MenuItem>
                <MenuItem value={'Advanced'} disabled={true}>
                    Advanced
                </MenuItem>
            </Select>
        </Box>
        <Box display="flex" justifyContent={'space-between'}>
            <Typography className="staking-method-title">
                Estimated Gas Fee:
            </Typography>
            <Typography className="staking-method-estimated-gas-fee">
                0.0001 ETH
            </Typography>
        </Box>
    </Box>
);

const StakingInfoMSG = () => (
    <Box className="staking-info-container">
        <Typography variant="subtitle2" className="staking-info-title">
            Staking will lock your tokens for a minimum of 7 days
        </Typography>
        <Typography className="staking-info-text">
            You will need to unstake to collect your rewards and for your staked
            tokens to be unlocked again. Unstaking is available after 7 days.
        </Typography>
    </Box>
);
