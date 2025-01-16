import { createTheme } from '@mui/material'

/*
 Здесь кастомизация компонентов и прочего
*/
export const theme = createTheme({
  typography: {
    fontFamily: ['Alegreya', 'Roboto', 'sans-serif'].join(','),
  },
  palette: {
    background: {
      default: '#004264',
    },
  },
})
