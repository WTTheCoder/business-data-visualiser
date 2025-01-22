// Basic interface definitions
export interface RegionData {
  code: string;
  name: string;
  flag: string;
  subRegions?: RegionData[];
}

export interface DailyData {
  date: string;
  sales: number;
  profit: number;
  costs: {
    total: number;
    breakdown: {
      tax: number;
      salary: number;
      benefits: number;
      rent: number;
      utilities: number;
      marketing: number;
      others: number;
    };
  };
  region: string;
  subRegion?: string;
}

// Region definitions - only keeping AU, SG, and NZ
export const regions: RegionData[] = [
  {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    subRegions: [
      { code: "ALL", name: "All Australia", flag: "🇦🇺" },
      { code: "NSW", name: "New South Wales", flag: "NSW" },
      { code: "QLD", name: "Queensland", flag: "QLD" },
      { code: "SA", name: "South Australia", flag: "SA" },
      { code: "TAS", name: "Tasmania", flag: "TAS" },
      { code: "VIC", name: "Victoria", flag: "VIC" },
      { code: "WA", name: "Western Australia", flag: "WA" },
      { code: "ACT", name: "Australian Capital Territory", flag: "ACT" },
      { code: "NT", name: "Northern Territory", flag: "NT" },
    ],
  },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
];

// Helper functions for data generation
const generateBaseMetrics = (region: string): number => {
  // Set base metrics according to regional economic indicators
  const baseMetrics: { [key: string]: number } = {
    AU: 170000, // Australia - Developed economy
    SG: 160000, // Singapore - High GDP, financial hub
    NZ: 130000, // New Zealand - Developed economy
  };

  return baseMetrics[region] || 100000;
};

const generateDailyFluctuation = (baseAmount: number): number => {
  // Generate daily fluctuation between -10% to +10%
  const fluctuation = Math.random() * 0.2 - 0.1;
  return baseAmount * (1 + fluctuation);
};

const calculateSeasonalEffect = (date: Date): number => {
  // Calculate seasonal effects based on month
  const month = date.getMonth();
  // Q4 typically shows higher sales, Q1 lower due to seasonal patterns
  const seasonalFactors = [
    0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.0, 0.95, 1.0, 1.2, 1.25, 1.3,
  ];
  return seasonalFactors[month];
};

export const generateMockData = () => {
  const data: DailyData[] = [];
  const startDate = new Date(2024, 0, 1); // Jan 1, 2024
  const endDate = new Date(2025, 0, 31); // Jan 31, 2025

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    regions.forEach((region) => {
      const baseMetrics = generateBaseMetrics(region.code);
      const seasonalFactor = calculateSeasonalEffect(date);
      const dailySales = generateDailyFluctuation(baseMetrics) * seasonalFactor;

      // Generate cost structure
      const costs = {
        tax: dailySales * 0.15, // 15% tax rate
        salary: baseMetrics * 0.25, // 25% on salaries
        benefits: baseMetrics * 0.1, // 10% on employee benefits
        rent: baseMetrics * 0.08, // 8% on rent
        utilities: baseMetrics * 0.05, // 5% on utilities
        marketing: dailySales * 0.1, // 10% on marketing
        others: baseMetrics * 0.07, // 7% on other expenses
      };

      const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
      const profit = dailySales - totalCosts;

      const dailyData: DailyData = {
        date: date.toISOString().split("T")[0],
        sales: dailySales,
        profit: profit,
        costs: {
          total: totalCosts,
          breakdown: costs,
        },
        region: region.code,
      };

      data.push(dailyData);

      // Generate sub-region data for Australia
      if (region.code === "AU" && region.subRegions) {
        // Skip 'ALL' in subregion data generation
        const actualSubRegions = region.subRegions.filter(
          (sr) => sr.code !== "ALL"
        );

        // Distribution ratios based on economic scale of Australian states/territories
        const stateDistribution: { [key: string]: number } = {
          NSW: 0.32, // New South Wales - largest economy
          VIC: 0.28, // Victoria - second largest
          QLD: 0.19, // Queensland
          WA: 0.14, // Western Australia
          SA: 0.06, // South Australia
          TAS: 0.02, // Tasmania
          ACT: 0.02, // Australian Capital Territory
          NT: 0.01, // Northern Territory
        };

        actualSubRegions.forEach((subRegion) => {
          const ratio = stateDistribution[subRegion.code] || 0.1;
          const subRegionData: DailyData = {
            ...dailyData,
            sales: dailySales * ratio,
            profit: profit * ratio,
            costs: {
              total: totalCosts * ratio,
              breakdown: Object.entries(costs).reduce(
                (acc, [key, value]) => ({
                  ...acc,
                  [key]: value * ratio,
                }),
                {} as typeof costs
              ),
            },
            region: region.code,
            subRegion: subRegion.code,
          };
          data.push(subRegionData);
        });
      }
    });
  }

  return data;
};

// Generate and export mock data
export const mockData = generateMockData();
