import { createTheme } from '@mui/material/styles'

// NOTE: See also https://mui.com/material-ui/customization/theme-components/

export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
})
