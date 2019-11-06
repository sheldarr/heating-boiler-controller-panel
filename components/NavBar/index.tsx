import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { format } from 'date-fns';

const StyledHeader = styled(Typography)`
  flex-grow: 1;
`;

interface Props {
  lastSync: Date;
}

const NavBar = ({ lastSync }: Props) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <StyledHeader variant="h6">Piec</StyledHeader>
        <span>{format(lastSync, 'HH:mm:ss')}</span>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
