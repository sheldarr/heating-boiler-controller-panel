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
  NORMAL: 'NORMAL',
  FORCED_FAN_ON: 'FORCED_FAN_ON',
  FORCED_FAN_OFF: 'FORCED_FAN_OFF',
};

const Home = ({
  initialInputTemperature,
  initialOutputTemperature,
  initialSetpoint,
}) => {
  const [inputTemperature, setInputTemperature] = useState(
    initialInputTemperature
  );
  const [outputTemperature, setOutputTemperature] = useState(
    initialOutputTemperature
  );
  const [setpoint, setSetpoint] = useState(initialSetpoint);

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3000/websocket');

    websocket.onmessage = (event) => {
      const { inputTemperature, outputTemperature, setpoint } = JSON.parse(
        event.data
      );

      setInputTemperature(inputTemperature);
      setOutputTemperature(outputTemperature);
      setSetpoint(setpoint);
    };
  }, []);

  const updateSettings = async (setpoint) => {
    axios
      .post('/api/settings', {
        setpoint,
        hysteresis: 2.0,
        power: 50.0,
        mode: FAN_MODES.NORMAL,
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
        <title>heating-boiler-controller-panel</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <NavBar />
      <Container>
        <StyledPaper>
          <Typography gutterBottom color="error" variant="h2">
            {inputTemperature.toFixed(3)} °C
          </Typography>
          <OutputTemperature gutterBottom variant="h4">
            {outputTemperature.toFixed(3)} °C
          </OutputTemperature>
        </StyledPaper>
        <StyledPaper>
          {' '}
          <Slider
            defaultValue={setpoint}
            key={setpoint}
            marks={[
              {
                value: 30,
                label: '30°C',
              },
              {
                value: 40,
                label: '40°C',
              },
              {
                value: 50,
                label: '50°C',
              },
              {
                value: 60,
                label: '60°C',
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
  const { data: settings } = await axios.get(
    'http://0.0.0.0:3000/api/settings'
  );

  const { data: temperatures } = await axios.get(
    'http://0.0.0.0:3000/api/temperatures'
  );

  console.log(temperatures);

  return {
    initialInputTemperature: temperatures.input,
    initialOutputTemperature: temperatures.output,
    initialSetpoint: settings.setpoint,
  };
};

export default Home;
