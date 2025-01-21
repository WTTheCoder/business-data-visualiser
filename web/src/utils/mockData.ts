// src/utils/mockData.ts

export interface SalesData {
  date: string;
  amount: number;
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

// 生成测试数据
export const generateMockData = () => {
  // 生成24个月的销售数据
  const salesData: SalesData[] = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(2024, 0, 1);
    date.setMonth(date.getMonth() + i);
    return {
      date: date.toISOString().slice(0, 7),
      amount: 10000 + Math.random() * 8000 + Math.sin(i / 3) * 3000,
    };
  });

  // 季度收入数据
  const revenueData: RevenueData[] = [
    { period: "Q1", revenue: 150000, growth: 15.2 },
    { period: "Q2", revenue: 175000, growth: 16.7 },
    { period: "Q3", revenue: 190000, growth: 18.3 },
    { period: "Q4", revenue: 220000, growth: 19.5 },
  ];

  // 年度增长数据
  const growthData: GrowthData[] = [
    { year: "2020", value: 85, target: 80 },
    { year: "2021", value: 93, target: 90 },
    { year: "2022", value: 98, target: 95 },
    { year: "2023", value: 105, target: 100 },
    { year: "2024", value: 112, target: 110 },
  ];

  return {
    salesData,
    revenueData,
    growthData,
  };
};

// 导出固定的测试数据
const mockData = generateMockData();
export const salesData = mockData.salesData;
export const revenueData = mockData.revenueData;
export const growthData = mockData.growthData;
