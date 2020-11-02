import axios from 'axios';
import React, { useState } from 'react';
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
import range from 'lodash/range';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

import {
  ControllerStatus,
  ControllerMeasurement,
  setControllerSettings,
  ControllerMode,
} from '../api';
import NavBar from '../components/NavBar';
import useSocket from '../hooks/useSocket';

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
  initialMode: ControllerMode;
  initialOutputTemperature: number;
  initialSetpoint: number;
}

const mapControllerModeToLabel = (mode: ControllerMode): string => {
  switch (mode) {
    case 'FORCED_FAN_OFF':
      return 'STALE WYŁĄCZONY';
    case 'FORCED_FAN_ON':
      return 'STALE WYŁĄCZONY';
    case 'NORMAL':
      return 'TERMOSTAT';
  }
};

const INITIAL_HYSTERESIS = 1.0;

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
    initialInputTemperature,
  );
  const [outputTemperature, setOutputTemperature] = useState(
    initialOutputTemperature,
  );
  const [measurements, setMeasuremenets] = useState(
    initialMeasurements.map((measurement) => ({
      ...measurement,
      time: format(new Date(measurement.time), 'HH:mm:ss'),
    })),
  );
  const [hysteresis] = useState(INITIAL_HYSTERESIS);
  const [setpoint, setSetpoint] = useState(initialSetpoint);
  const [draftSetpoint, setDraftSetpoint] = useState(initialSetpoint);
  const [fanOn, setFanOn] = useState(initialFanOn);
  const [mode, setMode] = useState<ControllerMode>(initialMode);
  const [lastSync, setLastSync] = useState(new Date(initialLastSync));

  useSocket<ControllerStatus>('status', (status) => {
    const {
      fanOn,
      inputTemperature,
      lastSync,
      mode,
      outputTemperature,
      setpoint,
    } = status;

    setFanOn(fanOn);
    setInputTemperature(inputTemperature);
    setLastSync(new Date(lastSync));
    setMode(mode);
    setOutputTemperature(outputTemperature);
    setSetpoint(setpoint);
  });

  useSocket<ControllerMeasurement[]>('measurements', (data) => {
    setMeasuremenets(
      data.map((measurement) => ({
        ...measurement,
        time: format(new Date(measurement.time), 'HH:mm:ss'),
      })),
    );
  });

  const updateSetpoint = async (newSetpoint: number) => {
    setControllerSettings({ hysteresis, mode, setpoint: newSetpoint })
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
          },
        );
      });
  };

  const updateMode = async (newMode: ControllerMode) => {
    setControllerSettings({
      hysteresis,
      mode: newMode,
      setpoint,
    })
      .then(() => {
        setMode(newMode);
        enqueueSnackbar(`Ustawiono tryb ${mapControllerModeToLabel(newMode)}`, {
          variant: 'success',
        });
      })
      .catch(() => {
        enqueueSnackbar(
          `Nie udało się ustawić trybu ${mapControllerModeToLabel(newMode)}`,
          {
            variant: 'error',
          },
        );
      });
  };

  return (
    <div>
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
                    if (value !== null) {
                      updateMode(value);
                    }
                  }}
                  value={mode}
                >
                  <ToggleButton key={1} value="FORCED_FAN_OFF">
                    OFF
                  </ToggleButton>
                  <ToggleButton key={2} value="NORMAL">
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
                    marks={range(30, 61).map((number) => ({
                      label: number % 10 === 0 && `${number}°C`,
                      value: number,
                    }))}
                    max={60}
                    min={30}
                    onChange={(event, value) => {
                      setDraftSetpoint(value as number);
                    }}
                    onChangeCommitted={(event, value) => {
                      updateSetpoint(value as number);
                    }}
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
                    <ReferenceLine
                      stroke="#f44336"
                      strokeDasharray="3 9"
                      y={setpoint}
                    />
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
  } = await axios.get<ControllerStatus>(
    `${process.env.APP_API_URL}/controller/status`,
  );
  const { data: measurements } = await axios.get(
    `${process.env.APP_API_URL}/controller/measurements`,
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
