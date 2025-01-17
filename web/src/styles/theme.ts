import { createTheme, ThemeOptions } from "@mui/material/styles";

// Create theme settings for both light and dark modes
const getThemeOptions = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode colors
          primary: {
            main: "#1976d2",
          },
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
        }
      : {
          // Dark mode colors
          primary: {
            main: "#90caf9",
          },
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
        }),
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease-in-out",
        },
      },
    },
  },
});

// Export theme creation function
export const createAppTheme = (mode: "light" | "dark") => {
  return createTheme(getThemeOptions(mode));
};
