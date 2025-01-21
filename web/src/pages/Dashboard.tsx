// import { useEffect } from "react";
// import { Box, Typography } from "@mui/material";
// import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
// import { setRawData } from "../store/slices/dataSlice";
// import SalesChart from "../components/charts/SalesChart";
// import RevenueChart from "../components/charts/RevenueChart";
// import GrowthChart from "../components/charts/GrowthChart";
// import DataFilters from "../components/filters/DataFilters";
// import { generateMockData } from "../utils/mockData";

import { FC } from "react";
import { Box, Grid } from "@mui/material";
import SalesChart from "../components/charts/SalesChart";
import RevenueChart from "../components/charts/RevenueChart";
import GrowthChart from "../components/charts/GrowthChart";
import DataFilters from "../components/filters/DataFilters";
import { salesData, revenueData, growthData } from "../utils/mockData";
// import SalesChart from '../charts/SalesChart';
// import RevenueChart from '../charts/RevenueChart';
// import GrowthChart from '../charts/GrowthChart';
// import DataFilters from '../filters/DataFilters';
// import { salesData, revenueData, growthData } from '../../utils/mockData';

const Dashboard: FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <h1>Dashboard Overview</h1>
      <DataFilters />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{ backgroundColor: "background.paper", p: 2, borderRadius: 1 }}
          >
            <SalesChart data={salesData} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{ backgroundColor: "background.paper", p: 2, borderRadius: 1 }}
          >
            <RevenueChart data={revenueData} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{ backgroundColor: "background.paper", p: 2, borderRadius: 1 }}
          >
            <GrowthChart data={growthData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
