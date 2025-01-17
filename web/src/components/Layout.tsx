import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

interface LayoutProps {
  toggleColorMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ toggleColorMode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100vw",
      }}
    >
      <Navbar toggleDarkMode={toggleColorMode} />
      <Container
        component="main"
        maxWidth={false} // This makes the container full-width
        sx={{
          flexGrow: 1,
          py: 3,
          px: 3, // Add horizontal padding
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;
