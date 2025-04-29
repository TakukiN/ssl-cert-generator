import React from 'react';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import CertificateForm from './components/CertificateForm';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <CertificateForm />
      </Container>
    </ThemeProvider>
  );
}

export default App; 