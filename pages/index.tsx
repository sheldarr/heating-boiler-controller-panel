import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';

import NavBar from '../components/NavBar';

const StyledPaper = styled(Paper)`
  margin-bottom: 2rem;
  margin-top: 2rem;
  padding: 2rem;
`;

const Home = () => {
  const [measurement, setMeasurement] = useState({});

  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:3000/websocket');

    websocket.onmessage = (event) => {
      const freshMeasurement = JSON.parse(event.data);

      setMeasurement(freshMeasurement);
    };
  }, []);

  return (
    <div>
      <Head>
        <title>heating-boiler-controller-panel</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <Container>
        <StyledPaper>
          <Typography color="error" variant="h2" gutterBottom>
            37.5 °C
          </Typography>
          {JSON.stringify(measurement)}
        </StyledPaper>
      </Container>
    </div>
  );
};

export default Home;
