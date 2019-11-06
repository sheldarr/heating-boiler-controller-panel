import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import styled from 'styled-components';
import blue from '@material-ui/core/colors/blue';

import NavBar from '../components/NavBar';

const StyledPaper = styled(Paper)`
  margin-bottom: 2rem;
  margin-top: 2rem;
  padding: 2rem;
`;

const OutputTemperature = styled(Typography)`
  color: ${blue[500]};
`;

const FAN_MODES = {
  FORCED_FAN_OFF: 'FORCED_FAN_OFF',
  FORCED_FAN_ON: 'FORCED_FAN_ON',
  NORMAL: 'NORMAL',
};

interface Props {
  initialInputTemperature: number;
  initialOutputTemperature: number;
  initialSetpoint: number;
}

const Home = ({
  initialInputTemperature,
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
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const websocket = new WebSocket(
      `${process.env.WS_PROTOCOL}://${process.env.HOSTNAME}/websocket`
    );

    websocket.onmessage = (event) => {
      const { inputTemperature, outputTemperature, setpoint } = JSON.parse(
        event.data
      );

      setLastSync(new Date());
      setInputTemperature(inputTemperature);
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
        console.log('Success');
      })
      .catch((error) => {
        console.log(error.toString());
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
          <Typography gutterBottom color="error" variant="h2">
            {outputTemperature.toFixed(3)} °C
          </Typography>
          <OutputTemperature gutterBottom variant="h4">
            {inputTemperature.toFixed(3)} °C
          </OutputTemperature>
        </StyledPaper>
        <StyledPaper>
          {' '}
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
        </StyledPaper>
      </Container>
    </div>
  );
};

Home.getInitialProps = async () => {
  const baseUrl = process.browser
    ? `/api`
    : `${process.env.PROTOCOL}://${process.env.HOSTNAME}/api`;

  const { data: settings } = await axios.get(`${baseUrl}/settings`);

  const { data: temperatures } = await axios.get(`${baseUrl}/temperatures`);

  return {
    initialInputTemperature: temperatures.input,
    initialOutputTemperature: temperatures.output,
    initialSetpoint: settings.setpoint,
  };
};

export default Home;
