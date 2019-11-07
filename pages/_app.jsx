import axios from 'axios';
import React from 'react';
import App from 'next/app';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider } from 'notistack';

axios.defaults.timeout = 5000;

class CustomApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <CssBaseline />
        <SnackbarProvider maxSnack={3}>
          <Component {...pageProps} />;
        </SnackbarProvider>
        ;
      </>
    );
  }
}

export default CustomApp;
