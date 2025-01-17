import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useState, useMemo } from "react";
import * as React from "react";
import { store } from "./store";
import { router } from "./routes";
import { createAppTheme } from "./styles/theme";
import { createBrowserRouter, RouteObject } from "react-router-dom";

function App() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Type-safe route manipulation
  const routes: RouteObject[] = [...router.routes];
  if (routes[0] && "element" in routes[0] && routes[0].element) {
    const layout = React.cloneElement(routes[0].element as React.ReactElement, {
      toggleColorMode,
    });
    routes[0] = {
      ...routes[0],
      element: layout,
    };
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={createBrowserRouter(routes)} />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
