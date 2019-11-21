import React, { useState } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useInterval } from 'react-use';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFan } from '@fortawesome/free-solid-svg-icons';

import websocketClient from '../../websocketClient';

const LastSync = styled.div`
  text-align: center;
`;

const ContainerWithMargin = styled.div`
  margin-right: 1rem;
`;

const Space = styled.div`
  flex-grow: 1;
`;

interface Props {
  fanOn: boolean;
  lastSync: Date;
}

const NavBar = ({ fanOn, lastSync }: Props) => {
  const [relativeDistance, setRelativeDistance] = useState(new Date());

  useInterval(() => {
    setRelativeDistance(new Date());
  }, 1000);

  return (
    <AppBar position="static">
      <Toolbar>
        <ContainerWithMargin>
          <Typography variant="h6">Piec</Typography>
        </ContainerWithMargin>
        <ContainerWithMargin>
          <FontAwesomeIcon
            color={'white'}
            icon={faFan}
            size="2x"
            spin={fanOn}
          />
        </ContainerWithMargin>
        <div>{websocketClient && websocketClient.readyState}</div>
        <Space />
        <div>
          <LastSync>{format(lastSync, 'HH:mm:ss')}</LastSync>
          <div>
            (
            {formatDistance(lastSync, relativeDistance, {
              includeSeconds: true,
              locale: pl,
            })}{' '}
            temu)
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
