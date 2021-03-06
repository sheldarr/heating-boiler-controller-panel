import axios from 'axios';
import React from 'react';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { PageTransition } from 'next-page-transitions';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

axios.defaults.timeout = 5000;

const CustomApp: NextPage<AppProps> = ({ Component, pageProps, router }) => {
  const theme = createMuiTheme({
    palette: {
      primary: { main: '#3f51b5' },
    },
  });

  return (
    <>
      <CssBaseline />
      <Head>
        <title>Piec</title>
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <div id="navbar" />
          <PageTransition
            classNames="page-transition"
            key={router.route}
            timeout={300}
          >
            <Component {...pageProps} />
          </PageTransition>
        </SnackbarProvider>
      </ThemeProvider>
      <style global jsx>{`
        .page-transition-enter {
          opacity: 0;
          transform: translate3d(0, 20px, 0);
        }
        .page-transition-enter-active {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity 300ms, transform 300ms;
        }
        .page-transition-exit {
          opacity: 1;
        }
        .page-transition-exit-active {
          opacity: 0;
          transition: opacity 300ms;
        }
      `}</style>
    </>
  );
};

export default CustomApp;
