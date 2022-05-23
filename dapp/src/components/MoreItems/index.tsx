import * as React from 'react';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';

import './styles.scss';

export const MoreItems = () => {
    return (
        <Box className="sidebar-more-items">
            <InputLabel id="more-items-button-label">
                <MoreHorizIcon />
            </InputLabel>
        </Box>
    );
};