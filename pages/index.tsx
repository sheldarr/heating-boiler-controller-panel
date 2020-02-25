import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import styled from 'styled-components';
import blue from '@material-ui/core/colors/blue';
import Grid from '@material-ui/core/Grid';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { differenceInSeconds, format } from 'date-fns';

import NavBar from '../components/NavBar';
import { registerCallback } from '../websocketClient';

const StyledPaper = styled(Paper)`
  margin-bottom: 2rem;
  margin-top: 2rem;
  min-height: calc(100vh - 4rem - 5rem);
  padding: 2rem;
`;

const OutputTemperature = styled(Typography)`
  color: ${blue[500]};
`;

const ChartContainer = styled.div`
  height: 12rem;
  margin-top: 4rem;
`;

const CenterContent = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const SliderContainer = styled.div`
  margin-top: 3rem;
`;

interface Measurement {
  inputTemperature: number;
  outputTemperature: number;
  time: string;
}

interface Props extends WithSnackbarProps {
  initialFanOn: boolean;
  initialInputTemperature: number;
  initialLastSync: string;
  initialMeasurements: Measurement[];
  initialMode: string;
  initialOutputTemperature: number;
  initialSetpoint: number;
}

const modeLabelMap = {
  FORCED_FAN_OFF: 'STALE WYŁĄCZONY',
  FORCED_FAN_ON: 'STALE WŁĄCZONY',
  THERMOSTAT: 'TERMOSTAT',
};

const labelModeMap = {
  FORCED_FAN_OFF: 'FORCED_FAN_OFF',
  FORCED_FAN_ON: 'FORCED_FAN_ON',
  NORMAL: 'THERMOSTAT',
};

const MAX_LAG_IN_SECONDS_BEFORE_RELOAD = 10;

const Home = ({
  enqueueSnackbar,
  initialFanOn,
  initialInputTemperature,
  initialMeasurements,
  initialLastSync,
  initialMode,
  initialOutputTemperature,
  initialSetpoint,
}: Props) => {
  const [inputTemperature, setInputTemperature] = useState(
    initialInputTemperature
  );
  const [outputTemperature, setOutputTemperature] = useState(
    initialOutputTemperature
  );
  const [measurements, setMeasuremenets] = useState(
    initialMeasurements.map((measurement) => ({
      ...measurement,
      time: format(new Date(measurement.time), 'HH:mm:ss'),
    }))
  );
  const [setpoint, setSetpoint] = useState(initialSetpoint);
  const [draftSetpoint, setDraftSetpoint] = useState(initialSetpoint);
  const [fanOn, setFanOn] = useState(initialFanOn);
  const [mode, setMode] = useState(initialMode);
  const [lastSync, setLastSync] = useState(new Date(initialLastSync));

  useEffect(() => {
    registerCallback((event) => {
      const {
        eventName,
        fanOn,
        inputTemperature,
        lastSync,
        measurements,
        mode,
        outputTemperature,
        setpoint: newSetpoint,
      } = JSON.parse(event.data);

      if (
        lastSync &&
        differenceInSeconds(new Date(), new Date(lastSync)) >
          MAX_LAG_IN_SECONDS_BEFORE_RELOAD
      ) {
        location.reload();
      }

      if (eventName === 'status') {
        setFanOn(fanOn);
        setInputTemperature(inputTemperature + 1);
        setLastSync(new Date(lastSync));
        setMode(mode);
        setOutputTemperature(outputTemperature);
        setSetpoint(setpoint);

        if (newSetpoint !== setpoint) {
          setSetpoint(newSetpoint);
          setDraftSetpoint(newSetpoint);
        }
      }
      if (eventName === 'measurements') {
        setMeasuremenets(
          measurements.map((measurement) => ({
            ...measurement,
            time: format(new Date(measurement.time), 'HH:mm:ss'),
          }))
        );
      }
    });
  }, []);

  const updateSetpoint = async (newSetpoint) => {
    axios
      .post('/api/controller/settings', {
        hysteresis: 2.0,
        mode,
        setpoint: newSetpoint,
      })
      .then(() => {
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
      .post('/api/controller/settings', {
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
              <CenterContent>
                <ToggleButtonGroup
                  exclusive
                  onChange={(event, value) => {
                    if (value === null) {
                      return updateMode(labelModeMap[mode]);
                    }

                    updateMode(value);
                  }}
                  value={labelModeMap[mode]}
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
              </CenterContent>
            </Grid>
            {mode === 'NORMAL' && (
              <Grid item xs={12}>
                <SliderContainer>
                  <CenterContent>
                    <Typography color="primary" variant="h4">
                      {setpoint} °C
                    </Typography>
                  </CenterContent>
                  <Slider
                    marks
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
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}°C`}
                  />
                </SliderContainer>
              </Grid>
            )}
            <Grid item xs={12}>
              <ChartContainer>
                <ResponsiveContainer>
                  <LineChart data={measurements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis minTickGap={10} width={20} />
                    <Tooltip />
                    <Line
                      dataKey="outputTemperature"
                      dot={false}
                      name="Temperatura wyjściowa"
                      stroke="#f44336"
                      type="monotone"
                    />
                    <Line
                      dataKey="inputTemperature"
                      dot={false}
                      name="Temperatura wejściowa"
                      stroke="#2196f3"
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Grid>
          </Grid>
        </StyledPaper>
      </Container>
    </div>
  );
};

Home.getInitialProps = async () => {
  const {
    data: {
      fanOn,
      inputTemperature,
      lastSync,
      mode,
      outputTemperature,
      setpoint,
    },
  } = await axios.get(`${process.env.APP_API_URL}/controller/status`);
  const { data: measurements } = await axios.get(
    `${process.env.APP_API_URL}/controller/measurements`
  );

  return {
    initialFanOn: fanOn,
    initialInputTemperature: inputTemperature,
    initialLastSync: lastSync,
    initialMeasurements: measurements,
    initialMode: mode,
    initialOutputTemperature: outputTemperature,
    initialSetpoint: setpoint,
  };
};

// eslint-disable-next-line
//@ts-ignore
export default withSnackbar(Home);
