// components/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#fb923c",       // Orange
      contrastText: "#fff",
    },
    info: {
      main: "#e5e7eb",       // Light gray
      contrastText: "#000",
    },
    secondary: {
      main: "#6366f1",       // Light gray
      contrastText: "#000",
    },
    success: {
      main: "#28a745",       // Light gray
      contrastText: "#000",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
  shape: {
    borderRadius: 50, // fully rounded buttons
  },
});

export default theme;
