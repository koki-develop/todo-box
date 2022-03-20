import { createTheme, responsiveFontSizes } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    google: Palette["primary"];
    black: Palette["primary"];
  }
  interface PaletteOptions {
    google?: PaletteOptions["primary"];
    black?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    google: true;
    black: true;
  }
}

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      google: {
        main: "#4285F4",
        light: "#679df6",
        dark: "#2e5daa",
        contrastText: "#ffffff",
      },
      black: {
        main: "#3f3f3f",
        light: "#656565",
        dark: "#2c2c2c",
        contrastText: "#ffffff",
      },
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true,
        },
        styleOverrides: {
          root: {
            fontWeight: "bold",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: "bold",
            textTransform: "none",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          a: {
            textDecoration: "none",
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 38,
          },
        },
      },
    },
  })
);
