import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  Box,
} from "@mui/material";
import { Settings, DarkMode, LightMode } from "@mui/icons-material";

interface NavbarProps {
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDarkMode }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Business Data Visualizer
        </Typography>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              bgcolor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.2)",
              },
              position: "relative",
              width: 40,
              height: 40,
            }}
          >
            {isDark ? (
              <DarkMode sx={{ color: "#FFFFFF", position: "absolute" }} />
            ) : (
              <LightMode sx={{ color: "#FDB813", position: "absolute" }} />
            )}
          </IconButton>
          <IconButton color="inherit" title="Settings">
            <Settings />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
