import { useState } from "react";
import { Paper, Box, Typography } from "@mui/material";
import SalesChart from "../components/charts/SalesChart";
import RevenueChart from "../components/charts/RevenueChart";
import GrowthChart from "../components/charts/GrowthChart";
import { generateMockData } from "../utils/mockData";

const Dashboard = () => {
  const [data] = useState(generateMockData());

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>
      <Box display="flex" gap={3} flexWrap="wrap">
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: 400,
            flex: 1,
            minWidth: 300,
          }}
        >
          <SalesChart data={data.salesData} />
        </Paper>
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: 400,
            flex: 1,
            minWidth: 300,
          }}
        >
          <RevenueChart data={data.revenueData} />
        </Paper>
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: 400,
            flex: 1,
            minWidth: 300,
          }}
        >
          <GrowthChart data={data.growthData} />
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
