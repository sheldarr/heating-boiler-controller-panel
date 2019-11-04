import React, { useState, useEffect } from 'react';
import Head from 'next/head';

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
      <h1>heating-boiler-controller-panel</h1>
      <div>{JSON.stringify(measurement)}</div>
    </div>
  );
};

export default Home;
