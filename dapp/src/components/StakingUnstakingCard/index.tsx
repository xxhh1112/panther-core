import {useState} from 'react';
import * as React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {BigNumber} from 'ethers';

import StakeTab from '../../components/StakeTab';
import UnstakingTab from '../../components/UnstakeTab';

import './styles.scss';

export default function StakingUnstakingCard(props: {
    tokenBalance: BigNumber | null;
    fetchData: () => Promise<void>;
    onConnect: any;
    networkLogo?: string;
    switchNetwork: any;
}) {
    const [toggle, setToggle] = useState('stake');

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newState: string,
    ) => {
        if (newState !== null) {
            setToggle(newState);
        }
    };

    const children = [
        <ToggleButton value="stake" key="1">
            Stake ZKP
        </ToggleButton>,
        <ToggleButton value="unstake" key="2">
            Unstake
        </ToggleButton>,
    ];

    const control = {
        value: toggle,
        onChange: handleChange,
        exclusive: true,
    };

    return (
        <Box className="balance-card-holder">
            <Card className="balance-card">
                <Box>
                    <ToggleButtonGroup size="large" {...control}>
                        {children}
                    </ToggleButtonGroup>
                </Box>

                <CardContent>
                    {toggle == 'stake' || toggle == null ? (
                        <StakeTab
                            tokenBalance={props.tokenBalance}
                            fetchData={props.fetchData}
                            onConnect={props.onConnect}
                            networkLogo={props.networkLogo}
                            switchNetwork={props.switchNetwork}
                        />
                    ) : (
                        <UnstakingTab fetchData={props.fetchData} />
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
