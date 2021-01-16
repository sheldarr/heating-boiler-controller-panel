import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { format, formatDistance } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useInterval } from 'react-use';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFan } from '@fortawesome/free-solid-svg-icons';

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
  fanOn?: boolean;
  lastSync?: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selector?: any;
}

const NavBar = ({ fanOn, lastSync }: Props) => {
  const ref = useRef();
  const [relativeDistance, setRelativeDistance] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useInterval(() => {
    setRelativeDistance(new Date());
  }, 1000);

  useEffect(() => {
    ref.current = document.querySelector('#navbar');
    setMounted(true);
  }, []);

  return mounted
    ? createPortal(
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
            <Space />
            {lastSync && (
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
            )}
          </Toolbar>
        </AppBar>,
        ref.current,
      )
    : null;
};

export default NavBar;
