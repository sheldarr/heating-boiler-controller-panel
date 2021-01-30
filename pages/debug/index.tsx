import React from 'react';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import NavBar from '../../components/NavBar';
import useMeasurements from '../../hooks/useMeasurements';
import useSettings from '../../hooks/useSettings';

const ChartContainer = styled.div`
  height: 32rem;
  margin-top: 4rem;
`;

const Debug = () => {
  const { data: settings } = useSettings();
  const { data: measurements } = useMeasurements();

  return (
    <>
      <NavBar fanOn={settings?.fanOn} lastSync={settings?.lastSync} />
      <Box margin={2} marginTop={4}>
        <Container>
          <Grid container>
            <Grid item xs={12}>
              <ChartContainer>
                <ResponsiveContainer>
                  <LineChart data={measurements}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis dataKey="heap" />
                    <Tooltip
                      viewBox={{
                        height: 100,
                        width: 200,
                        x: 0,
                        y: 0,
                      }}
                    />
                    <Line
                      dataKey="heap"
                      dot={false}
                      name="Heap"
                      stroke="#58508d"
                      strokeDasharray="5 5"
                      type="stepAfter"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Debug;
