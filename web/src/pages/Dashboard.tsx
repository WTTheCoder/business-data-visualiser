import { FC, useState, useMemo, useCallback } from "react";
import { Box, Grid } from "@mui/material";
import SalesChart from "../components/charts/SalesChart";
import ProfitChart from "../components/charts/ProfitChart";
import CostChart from "../components/charts/CostChart";
import DataFilters from "../components/filters/DataFilters";
import { mockData } from "../utils/mockData";

const Dashboard: FC = () => {
  const [filterCriteria, setFilterCriteria] = useState({
    region: "all",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2025, 0, 31),
  });

  // Memoize filtered data
  const filteredData = useMemo(() => {
    console.log("Filtering data with criteria:", filterCriteria);
    let filtered = mockData;

    // Apply date filter
    if (filterCriteria.startDate && filterCriteria.endDate) {
      const start = filterCriteria.startDate.getTime();
      const end = filterCriteria.endDate.getTime();

      filtered = filtered.filter((item) => {
        const itemTime = new Date(item.date).getTime();
        return itemTime >= start && itemTime <= end;
      });
    }

    // Apply region filter
    if (filterCriteria.region !== "all") {
      filtered = filtered.filter((item) =>
        filterCriteria.region.startsWith("AU-")
          ? item.subRegion === filterCriteria.region.split("-")[1]
          : item.region === filterCriteria.region
      );
    }

    console.log("Filtered data length:", filtered.length);
    return filtered;
  }, [filterCriteria]);

  // Calculate chunk size based on data volume
  const CHUNK_SIZE = useMemo(
    () => Math.max(20, Math.ceil(filteredData.length / 400)),
    [filteredData.length]
  );

  // Pre-calculate data chunks for each chart
  const chartData = useMemo(() => {
    console.log("Generating chunks with size:", CHUNK_SIZE);
    const dataLength = filteredData.length;
    const chunks = [];

    for (let i = 0; i < dataLength; i += CHUNK_SIZE) {
      chunks.push(filteredData.slice(i, i + CHUNK_SIZE));
    }

    return chunks;
  }, [filteredData, CHUNK_SIZE]);

  const handleDataFiltering = useCallback(
    (region: string, startDate: Date | null, endDate: Date | null) => {
      console.log("Updating filters:", { region, startDate, endDate });
      setFilterCriteria({
        region,
        startDate: startDate || new Date(2024, 0, 1),
        endDate: endDate || new Date(2025, 0, 31),
      });
    },
    []
  );

  return (
    <Box sx={{ p: 3 }}>
      <h1>Dashboard Overview</h1>
      <DataFilters
        onFilterChange={handleDataFiltering}
        defaultRegion={filterCriteria.region}
      />
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
            <SalesChart dataChunks={chartData} />
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
            <ProfitChart dataChunks={chartData} />
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
            <CostChart dataChunks={chartData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
