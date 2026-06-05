import { createMuiTheme } from '@material-ui/core/styles';

const MONO = "'Space Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Courier New', monospace";

const theme = createMuiTheme({
    palette: {
      type: 'dark',
      primary: {
        main: '#ffc700',
        light: '#ffd84d',
        dark: '#cca000',
      },
      secondary: {
        main: '#40aaff',
      },
      error: {
        main: '#f00007',
      },
      background: {
        default: '#000000',
        paper: '#000000',
      },
      text: {
        primary: '#ffffff',
        secondary: '#84898e',
      },
    },
    typography: {
      fontFamily: MONO,
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 0,
    },
    overrides: {
      MuiPaper: {
        root: {
          backgroundColor: '#000000',
        },
      },
      MuiTab: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          fontSize: '0.875rem',
          fontFamily: MONO,
        },
      },
      MuiButton: {
        root: {
          textTransform: 'uppercase',
          borderRadius: 0,
          fontWeight: 700,
          fontFamily: MONO,
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
