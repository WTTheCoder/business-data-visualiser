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

// Mock data generator
export const generateMockData = () => {
  return {
    salesData: [
      { date: "2024-01", amount: 12500, region: "North" },
      { date: "2024-01", amount: 15000, region: "South" },
      { date: "2024-02", amount: 13800, region: "North" },
      { date: "2024-02", amount: 16200, region: "South" },
      // Add more data points...
    ],
    revenueData: [
      { period: "Q1", revenue: 150000, growth: 15.5 },
      { period: "Q2", revenue: 175000, growth: 16.7 },
      // Add more data points...
    ],
    growthData: [
      { year: "2023", value: 100, target: 95 },
      { year: "2024", value: 115, target: 110 },
      // Add more data points...
    ],
  };
};
