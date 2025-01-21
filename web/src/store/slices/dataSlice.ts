import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isWithinInterval, parseISO } from "date-fns";

// Interfaces for data types
export interface SalesData {
  date: string;
  amount: number;
  region: string;
}

export interface RevenueData {
  period: string;
  revenue: number;
  growth: number;
}

export interface GrowthData {
  year: string;
  value: number;
  target: number;
}

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DataState {
  rawData: {
    salesData: SalesData[];
    revenueData: RevenueData[];
    growthData: GrowthData[];
  };
  filteredData: {
    salesData: SalesData[];
    revenueData: RevenueData[];
    growthData: GrowthData[];
  };
  filters: {
    dateRange: DateRange;
    region: string;
  };
}

const initialState: DataState = {
  rawData: {
    salesData: [],
    revenueData: [],
    growthData: [],
  },
  filteredData: {
    salesData: [],
    revenueData: [],
    growthData: [],
  },
  filters: {
    dateRange: {
      startDate: null,
      endDate: null,
    },
    region: "all",
  },
};

// Helper function to check if a region is in East Asia
const isEastAsiaRegion = (region: string): boolean => {
  return ["CN", "JP", "KR", "TW", "HK"].includes(region);
};

// Helper function to check if a region is in Southeast Asia
const isSoutheastAsiaRegion = (region: string): boolean => {
  return ["SG", "MY", "ID", "TH", "VN", "PH"].includes(region);
};

const applyFilters = (state: DataState) => {
  const { dateRange, region } = state.filters;
  let filteredSalesData = [...state.rawData.salesData];

  // Apply region filter
  if (region !== "all") {
    if (region.startsWith("AU-")) {
      // Handle Australian states/territories
      if (region === "AU-ALL") {
        filteredSalesData = filteredSalesData.filter(
          (item) => item.region.startsWith("AU-") && item.region !== "AU-ALL"
        );
      } else {
        filteredSalesData = filteredSalesData.filter(
          (item) => item.region === region
        );
      }
    } else {
      // Handle countries and regions
      filteredSalesData = filteredSalesData.filter((item) => {
        switch (region) {
          case "EA":
            return isEastAsiaRegion(item.region);
          case "SEA":
            return isSoutheastAsiaRegion(item.region);
          case "AU":
            return item.region.startsWith("AU-");
          default:
            return item.region === region;
        }
      });
    }
  }

  // Apply date filter if both dates are selected
  if (dateRange.startDate && dateRange.endDate) {
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    filteredSalesData = filteredSalesData.filter((item) => {
      const itemDate = parseISO(item.date);
      try {
        return isWithinInterval(itemDate, {
          start: startDate,
          end: endDate,
        });
      } catch {
        return false;
      }
    });
  }

  // Update filtered data
  state.filteredData = {
    ...state.rawData,
    salesData: filteredSalesData,
  };
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setRawData: (state, action) => {
      state.rawData = action.payload;
      state.filteredData = action.payload;
      applyFilters(state);
    },
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.filters.dateRange = action.payload;
      applyFilters(state);
    },
    setRegion: (state, action: PayloadAction<string>) => {
      state.filters.region = action.payload;
      applyFilters(state);
    },
  },
});

export const { setRawData, setDateRange, setRegion } = dataSlice.actions;
export default dataSlice.reducer;
