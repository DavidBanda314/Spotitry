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
        default: '#121212',
        paper: '#181818',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B3B3B3',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    },
    shape: {
      borderRadius: 8,
    },
    overrides: {
      MuiPaper: {
        root: {
          backgroundColor: '#121212',
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
