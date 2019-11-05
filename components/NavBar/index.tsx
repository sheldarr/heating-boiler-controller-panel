import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

const StyledHeader = styled(Typography)`
  flex-grow: 1;
`;

const NavBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <StyledHeader variant="h6">Panel</StyledHeader>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
