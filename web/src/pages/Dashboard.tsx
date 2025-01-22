console.log("Mock data length:", mockData.length);
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
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // 初始数据分块大小调整
  const CHUNK_SIZE = 20;

  // Memoize filtered data
  const filteredData = useMemo(() => {
    console.log("Filtering data..."); // 调试日志
    let filtered = mockData;

    if (filterCriteria.region && filterCriteria.region !== "all") {
      filtered = filtered.filter((item) =>
        filterCriteria.region.startsWith("AU-")
          ? item.subRegion === filterCriteria.region
          : item.region === filterCriteria.region
      );
    }

    if (filterCriteria.startDate && filterCriteria.endDate) {
      const start = filterCriteria.startDate.getTime();
      const end = filterCriteria.endDate.getTime();

      filtered = filtered.filter((item) => {
        const itemTime = new Date(item.date).getTime();
        return itemTime >= start && itemTime <= end;
      });
    }

    console.log("Filtered data length:", filtered.length); // 调试日志
    return filtered;
  }, [filterCriteria]);

  // Pre-calculate data chunks for each chart
  const chartData = useMemo(() => {
    console.log("Generating chunks..."); // 调试日志
    const dataLength = filteredData.length;
    const chunks = [];

    for (let i = 0; i < dataLength; i += CHUNK_SIZE) {
      chunks.push(filteredData.slice(i, i + CHUNK_SIZE));
    }

    console.log("Number of chunks:", chunks.length); // 调试日志
    return chunks;
  }, [filteredData]);

  const handleDataFiltering = useCallback(
    (region: string, startDate: Date | null, endDate: Date | null) => {
      setFilterCriteria({ region, startDate, endDate });
    },
    []
  );

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
