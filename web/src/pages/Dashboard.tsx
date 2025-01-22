import { FC, useState } from "react";
import { Box, Grid } from "@mui/material";
import SalesChart from "../components/charts/SalesChart";
import ProfitChart from "../components/charts/ProfitChart";
import CostChart from "../components/charts/CostChart";
import DataFilters from "../components/filters/DataFilters";
import { mockData } from "../utils/mockData";

const Dashboard: FC = () => {
  const [filteredData, setFilteredData] = useState(mockData);

  const handleDataFiltering = (
    region: string,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    let filtered = mockData;

    if (region && region !== "all") {
      filtered = filtered.filter((item) =>
        region.startsWith("AU-")
          ? item.subRegion === region
          : item.region === region
      );
    }

    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(filtered);
  };

  return (
    <Box sx={{ p: 3 }}>
      <h1>Dashboard Overview</h1>
      <DataFilters onFilterChange={handleDataFiltering} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <SalesChart data={filteredData} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <ProfitChart data={filteredData} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: "background.paper",
              p: 2,
              borderRadius: 1,
              boxShadow: 1,
            }}
          >
            <CostChart data={filteredData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
