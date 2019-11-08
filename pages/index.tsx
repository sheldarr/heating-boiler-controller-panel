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
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

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

const ToggleButtonsContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const SliderContainer = styled.div`
  margin-top: 4rem;
`;

interface Props extends WithSnackbarProps {
  initialFanOn: boolean;
  initialInputTemperature: number;
  initialLastSync: string;
  initialOutputTemperature: number;
  initialSetpoint: number;
}

const modeLabelMap = {
  FORCED_FAN_OFF: 'STALE WYŁĄCZONY',
  FORCED_FAN_ON: 'STALE WŁĄCZONY',
  THERMOSTAT: 'TERMOSTAT',
};

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
  const [draftSetpoint, setDraftSetpoint] = useState(initialSetpoint);
  const [fanOn, setFanOn] = useState(initialFanOn);
  const [mode, setMode] = useState('NORMAL');
  const [lastSync, setLastSync] = useState(new Date(initialLastSync));

  useEffect(() => {
    const websocket = new WebSocket(
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${
        location.host
      }/websocket`
    );

    websocket.onmessage = (event) => {
      const {
        fanOn,
        inputTemperature,
        lastSync,
        mode,
        outputTemperature,
        setpoint,
      } = JSON.parse(event.data);

      setFanOn(fanOn);
      setInputTemperature(inputTemperature);
      setLastSync(new Date(lastSync));
      setMode(mode);
      setOutputTemperature(outputTemperature);
      setSetpoint(setpoint);
    };
  }, []);

  const updateSetpoint = async (newSetpoint) => {
    axios
      .post('/api/settings', {
        hysteresis: 2.0,
        mode,
        setpoint: newSetpoint,
      })
      .then(() => {
        setDraftSetpoint(newSetpoint);
        enqueueSnackbar(`Ustawiono termostat na ${newSetpoint}°C`, {
          variant: 'success',
        });
      })
      .catch(() => {
        setDraftSetpoint(setpoint);
        enqueueSnackbar(
          `Nie udało się ustawić termostatu na ${newSetpoint}°C`,
          {
            variant: 'error',
          }
        );
      });
  };

  const updateMode = async (newMode) => {
    axios
      .post('/api/settings', {
        hysteresis: 2.0,
        mode: newMode === 'THERMOSTAT' ? 'NORMAL' : newMode,
        setpoint,
      })
      .then(() => {
        setMode(newMode);
        enqueueSnackbar(`Ustawiono tryb ${modeLabelMap[newMode]}`, {
          variant: 'success',
        });
      })
      .catch(() => {
        enqueueSnackbar(
          `Nie udało się ustawić trybu ${modeLabelMap[newMode]}`,
          {
            variant: 'error',
          }
        );
      });
  };

  return (
    <div>
      <Head>
        <title>Piec</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <NavBar fanOn={fanOn} lastSync={lastSync} />
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
              <ToggleButtonsContainer>
                <ToggleButtonGroup
                  exclusive
                  onChange={(event, value) => {
                    updateMode(value);
                  }}
                  value={mode}
                >
                  <ToggleButton key={1} value="FORCED_FAN_OFF">
                    OFF
                  </ToggleButton>
                  <ToggleButton key={2} value="THERMOSTAT">
                    TERMOSTAT
                  </ToggleButton>
                  <ToggleButton key={3} value="FORCED_FAN_ON">
                    ON
                  </ToggleButton>
                </ToggleButtonGroup>
              </ToggleButtonsContainer>
            </Grid>
            {mode === 'NORMAL' && (
              <Grid item xs={12}>
                <SliderContainer>
                  <Slider
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
                    onChange={(event, value) => {
                      setDraftSetpoint(value as number);
                    }}
                    onChangeCommitted={(event, value) => {
                      updateSetpoint(value);
                    }}
                    step={1}
                    value={draftSetpoint}
                    valueLabelDisplay="on"
                  />
                </SliderContainer>
              </Grid>
            )}
          </Grid>
        </StyledPaper>
      </Container>
    </div>
  );
};

Home.getInitialProps = async () => {
  const {
    data: { fanOn, inputTemperature, lastSync, outputTemperature, setpoint },
  } = await axios.get(`${process.env.APP_API_URL}/controller/status`);

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
