import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useInterval } from 'react-use';
import { Detector } from 'react-detect-offline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi } from '@fortawesome/free-solid-svg-icons';

const HeaderContainer = styled.div`
  margin-right: 1rem;
`;

const DetectorContainer = styled.div`
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
        <HeaderContainer>
          <Typography variant="h6">Piec</Typography>
        </HeaderContainer>
        <DetectorContainer>
          <Detector
            render={({ online }) => (
              <FontAwesomeIcon
                color={online ? 'green' : 'red'}
                icon={faWifi}
                size="lg"
              />
            )}
          />
        </DetectorContainer>
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
