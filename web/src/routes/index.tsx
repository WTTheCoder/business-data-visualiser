import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout.tsx";
import Dashboard from "../pages/Dashboard.tsx";

// Update the router configuration to accept toggleColorMode prop
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout toggleColorMode={() => {}} />, // Will update this function in App.tsx
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
    ],
  },
]);
