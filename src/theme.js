import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#1DB954',
        light: '#1ed760',
        dark: '#1aa34a',
      },
      secondary: {
        main: '#FFFFFF',
      },
      background: {
        default: '#000000',
        paper: '#1a1a1a',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#a0a0a0',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      h1: {
        fontWeight: 900,
        letterSpacing: '-0.04em',
      },
      h2: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
      },
    },
    shape: {
      borderRadius: 8,
    },
    overrides: {
      MuiPaper: {
        root: {
          backgroundColor: '#000000',
        },
      },
      MuiTab: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '0.875rem',
        },
      },
      MuiButton: {
        root: {
          textTransform: 'none',
          borderRadius: 500,
          fontWeight: 700,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  });

export default theme;
