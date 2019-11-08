import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useInterval } from 'react-use';

const StyledHeader = styled(Typography)`
  flex-grow: 1;
`;

interface Props {
  lastSync: Date;
}

const NavBar = ({ lastSync }: Props) => {
  const [relativeDistance, setRelativeDistance] = useState(new Date());

  useInterval(() => {
    setRelativeDistance(new Date());
  }, 1000);

  return (
    <AppBar position="static">
      <Toolbar>
        <StyledHeader variant="h6">Piec</StyledHeader>
        <span>
          {format(lastSync, 'HH:mm:ss')} (
          {formatDistance(lastSync, relativeDistance, {
            includeSeconds: true,
            locale: pl,
          })}{' '}
          temu)
        </span>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
