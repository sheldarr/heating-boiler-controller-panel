import React, { useEffect, useState } from 'react';
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

import { setControllerSettings, ControllerMode } from '../api';
import NavBar from '../components/NavBar';
import useMeasurements from '../hooks/useMeasurements';
import useSettings from '../hooks/useSettings';

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

const Home = ({ enqueueSnackbar }: WithSnackbarProps) => {
  const { data: settings } = useSettings();
  const { data: measurements } = useMeasurements();

  const [hysteresis] = useState(INITIAL_HYSTERESIS);
  const [draftSetpoint, setDraftSetpoint] = useState(0);
  const [isDraftSetpointEdited, setIsDraftSetpointEdited] = useState(false);

  const [lastMeasurement] = measurements?.slice(-1) || [];

  useEffect(() => {
    if (!isDraftSetpointEdited && settings) {
      setDraftSetpoint(settings.setpoint);
    }
  }, [settings]);

  const updateSetpoint = async (newSetpoint: number) => {
    setControllerSettings({
      hysteresis,
      mode: settings?.mode,
      setpoint: newSetpoint,
    })
      .then(() => {
        enqueueSnackbar(`Ustawiono termostat na ${newSetpoint}°C`, {
          variant: 'success',
        });
      })
      .catch(() => {
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
      setpoint: settings?.setpoint,
    })
      .then(() => {
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
      <NavBar fanOn={settings?.fanOn} lastSync={settings?.lastSync} />
      <Container>
        <StyledPaper>
          <Grid container>
            <Grid container item justify="space-between" xs={12}>
              <Grid item>
                <Typography gutterBottom color="error" variant="h2">
                  {lastMeasurement?.outputTemperature.toFixed(3)} °C
                </Typography>
              </Grid>
              <Grid item>
                <Typography gutterBottom color="primary" variant="h2">
                  {settings && `⎎${hysteresis}`}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <OutputTemperature gutterBottom variant="h4">
                {lastMeasurement?.inputTemperature.toFixed(3)} °C
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
                  value={settings?.mode}
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
            {settings?.mode === 'NORMAL' && (
              <Grid item xs={12}>
                <SliderContainer>
                  <CenterContent>
                    <Typography color="primary" variant="h4">
                      {settings?.setpoint} °C
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
                      setIsDraftSetpointEdited(true);
                      setDraftSetpoint(value as number);
                    }}
                    onChangeCommitted={(event, value) => {
                      setIsDraftSetpointEdited(false);
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
                      y={settings?.setpoint}
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

export default withSnackbar(Home);
