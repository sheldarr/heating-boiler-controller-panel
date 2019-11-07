import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import styled from 'styled-components';
import blue from '@material-ui/core/colors/blue';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFan } from '@fortawesome/free-solid-svg-icons';
import Grid from '@material-ui/core/Grid';
import { withSnackbar, WithSnackbarProps } from 'notistack';

import NavBar from '../components/NavBar';

const StyledPaper = styled(Paper)`
  margin-bottom: 2rem;
  margin-top: 2rem;
  padding: 2rem;
`;

const OutputTemperature = styled(Typography)`
  color: ${blue[500]};
`;

const FanContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const SliderContainer = styled.div`
  margin-top: 4rem;
`;

const FAN_MODES = {
  FORCED_FAN_OFF: 'FORCED_FAN_OFF',
  FORCED_FAN_ON: 'FORCED_FAN_ON',
  NORMAL: 'NORMAL',
};

interface Props extends WithSnackbarProps {
  initialFanOn: boolean;
  initialInputTemperature: number;
  initialLastSync: string;
  initialOutputTemperature: number;
  initialSetpoint: number;
}

const Home = ({
  enqueueSnackbar,
  initialFanOn,
  initialInputTemperature,
  initialLastSync,
  initialOutputTemperature,
  initialSetpoint,
}: Props) => {
  const [inputTemperature, setInputTemperature] = useState(
    initialInputTemperature
  );
  const [outputTemperature, setOutputTemperature] = useState(
    initialOutputTemperature
  );
  const [setpoint, setSetpoint] = useState(initialSetpoint);
  const [fanOn, setFanOn] = useState(initialFanOn);
  const [lastSync, setLastSync] = useState(new Date(initialLastSync));

  useEffect(() => {
    const websocket = new WebSocket(
      `${process.env.WS_PROTOCOL}://${process.env.HOSTNAME}/websocket`
    );

    websocket.onmessage = (event) => {
      const {
        fanOn,
        inputTemperature,
        lastSync,
        outputTemperature,
        setpoint,
      } = JSON.parse(event.data);

      setFanOn(fanOn);
      setInputTemperature(inputTemperature);
      setLastSync(new Date(lastSync));
      setOutputTemperature(outputTemperature);
      setSetpoint(setpoint);
    };
  }, []);

  const updateSettings = async (setpoint) => {
    axios
      .post('/api/settings', {
        hysteresis: 2.0,
        mode: FAN_MODES.NORMAL,
        power: 50.0,
        setpoint,
      })
      .then(() => {
        enqueueSnackbar(`Ustawiono termostat na ${setpoint}°C`, {
          variant: 'success',
        });
      })
      .catch(() => {
        enqueueSnackbar(`Nie udało się ustawić termostatu na ${setpoint}°C`, {
          variant: 'error',
        });
      });
  };

  return (
    <div>
      <Head>
        <title>Piec</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <NavBar lastSync={lastSync} />
      <Container>
        <StyledPaper>
          <Grid container>
            <Grid item xs={12}>
              <Typography gutterBottom color="error" variant="h2">
                {outputTemperature.toFixed(3)} °C
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <OutputTemperature gutterBottom variant="h4">
                {inputTemperature.toFixed(3)} °C
              </OutputTemperature>
            </Grid>
            <Grid item xs={12}>
              <SliderContainer>
                <Slider
                  defaultValue={setpoint}
                  key={setpoint}
                  marks={[
                    {
                      label: '30°C',
                      value: 30,
                    },
                    {
                      label: '40°C',
                      value: 40,
                    },
                    {
                      label: '50°C',
                      value: 50,
                    },
                    {
                      label: '60°C',
                      value: 60,
                    },
                  ]}
                  max={60}
                  min={30}
                  onChangeCommitted={(event, value) => {
                    updateSettings(value);
                  }}
                  step={1}
                  valueLabelDisplay="on"
                />
              </SliderContainer>
            </Grid>
            <Grid item xs={12}>
              <FanContainer>
                <FontAwesomeIcon
                  color={fanOn ? 'green' : 'red'}
                  icon={faFan}
                  size="4x"
                  spin={fanOn}
                />
              </FanContainer>
            </Grid>
          </Grid>
        </StyledPaper>
      </Container>
    </div>
  );
};

Home.getInitialProps = async () => {
  const baseUrl = process.browser
    ? `/api`
    : `${process.env.PROTOCOL}://${process.env.HOSTNAME}/api`;

  const {
    data: { fanOn, inputTemperature, lastSync, outputTemperature, setpoint },
  } = await axios.get(`${baseUrl}/controller/status`);

  return {
    initialFanOn: fanOn,
    initialInputTemperature: inputTemperature,
    initialLastSync: lastSync,
    initialOutputTemperature: outputTemperature,
    initialSetpoint: setpoint,
  };
};

// eslint-disable-next-line
//@ts-ignore
export default withSnackbar(Home);
