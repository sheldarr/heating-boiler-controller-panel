import React from 'react';
import App from 'next/app';
import CssBaseline from '@material-ui/core/CssBaseline';

class CustomApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <CssBaseline />
        <Component {...pageProps} />;
      </>
    );
  }
}

export default CustomApp;
