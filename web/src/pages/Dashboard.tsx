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
    console.log("Starting data filtering with criteria:", {
      region: filterCriteria.region,
      startDate: filterCriteria.startDate?.toISOString(),
      endDate: filterCriteria.endDate?.toISOString(),
    });

    console.log("Initial data length:", mockData.length);
    let filtered = [...mockData];

    // Apply date filter first
    if (filterCriteria.startDate && filterCriteria.endDate) {
      const start = filterCriteria.startDate.getTime();
      const end = filterCriteria.endDate.getTime();

      filtered = filtered.filter((item) => {
        const itemTime = new Date(item.date).getTime();
        return itemTime >= start && itemTime <= end;
      });
      console.log("After date filtering:", filtered.length);
    }

    // Apply region filter
    if (filterCriteria.region !== "all") {
      console.log("Applying region filter for:", filterCriteria.region);

      if (filterCriteria.region === "AU") {
        // For all of Australia, include all Australian states and territories
        filtered = filtered.filter((item) => item.region === "AU");
      } else if (filterCriteria.region.startsWith("AU-")) {
        // Handle specific Australian states
        const state = filterCriteria.region.split("-")[1];
        console.log("Filtering for AU state:", state);
        filtered = filtered.filter(
          (item) => item.region === "AU" && item.subRegion === state
        );
      } else {
        // Handle other countries
        filtered = filtered.filter(
          (item) => item.region === filterCriteria.region
        );
      }

      console.log("After region filtering:", {
        filterRegion: filterCriteria.region,
        resultCount: filtered.length,
        sampleData: filtered[0]
          ? {
              date: filtered[0].date,
              region: filtered[0].region,
              subRegion: filtered[0].subRegion,
              sales: filtered[0].sales,
            }
          : "No data",
      });
    }

    return filtered;
  }, [filterCriteria]);

  // Calculate chunk size based on data volume
  const CHUNK_SIZE = Math.max(20, Math.ceil(filteredData.length / 400));

  // Pre-calculate data chunks for each chart
  const chartData = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < filteredData.length; i += CHUNK_SIZE) {
      chunks.push(filteredData.slice(i, i + CHUNK_SIZE));
    }
    console.log("Generated chunks:", {
      totalData: filteredData.length,
      chunkSize: CHUNK_SIZE,
      numberOfChunks: chunks.length,
    });
    return chunks;
  }, [filteredData, CHUNK_SIZE]);

  const handleDataFiltering = useCallback(
    (region: string, startDate: Date | null, endDate: Date | null) => {
      console.log("Filter change triggered:", {
        region,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });

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
