import React, {useEffect} from 'react';

import {useWeb3React} from '@web3-react/core';

import {MainPageWrapper} from '../../components/MainPageWrapper';
import PrivateBalance from '../../components/ZAssets/PrivateBalance';
import PrivateZAssetsTable from '../../components/ZAssets/PrivateZAssetsTable';
import background from '../../images/background.png';
import {useAppDispatch} from '../../redux/hooks';
import {getAssets} from '../../redux/slices/assets';
import {Network} from '../../services/connectors';

import './styles.scss';

export default function ZAssets(
    onConnect: () => void,
    currentNetwork: Network | null,
): React.ReactElement {
    const context = useWeb3React();
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(getAssets, context);
    }, [context, dispatch]);

    return (
        <MainPageWrapper {...{onConnect, network: currentNetwork, background}}>
            <div className="assets-holder">
                <div className="assets-container">
                    <PrivateBalance />
                    <PrivateZAssetsTable />
                </div>
            </div>
        </MainPageWrapper>
    );
}