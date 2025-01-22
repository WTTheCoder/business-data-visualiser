import { FC, useRef, useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type { EChartsOption, ECharts, BarSeriesOption } from "echarts";
import { useTheme } from "@mui/material";
import { Box, CircularProgress } from "@mui/material";

interface CostChartProps {
  dataChunks: DailyData[][];
  onChartReady?: (instance: ECharts) => void;
}

const COST_CATEGORIES = [
  "Tax",
  "Salary",
  "Benefits",
  "Rent",
  "Utilities",
  "Marketing",
  "Others",
] as const;

const CostChart: FC<CostChartProps> = ({ dataChunks, onChartReady }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [chartOption, setChartOption] = useState<EChartsOption>({});
  const chartRef = useRef<ReactEcharts>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    console.log("Processing cost data chunks:", dataChunks.length);

    if (dataChunks.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const monthlyData = new Map<string, { [key: string]: number }>();

      // Aggregate data by month
      dataChunks.forEach((chunk) => {
        chunk.forEach((item) => {
          const month = item.date.substring(0, 7);
          if (!monthlyData.has(month)) {
            monthlyData.set(month, {});
          }
          const monthData = monthlyData.get(month)!;

          Object.entries(item.costs.breakdown).forEach(([category, value]) => {
            monthData[category] = (monthData[category] || 0) + value;
          });
        });
      });

      // Get sorted months
      const months = Array.from(monthlyData.keys()).sort();

      const colors = [
        theme.palette.info.main, // Tax
        theme.palette.success.main, // Salary
        theme.palette.warning.main, // Benefits
        theme.palette.error.main, // Rent
        theme.palette.primary.main, // Utilities
        theme.palette.secondary.main, // Marketing
        theme.palette.grey[500], // Others
      ];

      // Generate series data for each cost category
      const series: BarSeriesOption[] = COST_CATEGORIES.map(
        (category, index) => ({
          name: category,
          type: "bar",
          stack: "total",
          emphasis: { focus: "series" },
          itemStyle: {
            color: colors[index],
          },
          data: months.map(
            (month) => monthlyData.get(month)![category.toLowerCase()] || 0
          ),
        })
      );

      const option: EChartsOption = {
        title: {
          text: "Cost Analysis",
          left: "center",
          top: 10,
          textStyle: {
            color: theme.palette.text.primary,
            fontSize: 16,
            fontWeight: "normal",
          },
          subtext: "Monthly cost breakdown by category",
          subtextStyle: {
            color: theme.palette.text.secondary,
            fontSize: 12,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: theme.palette.divider,
            },
          },
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          textStyle: {
            color: theme.palette.text.primary,
          },
          formatter: (params: unknown) => {
            const typedParams = params as Array<{
              seriesName: string;
              value: number;
              color: string;
              axisValue: string;
            }>;
            if (!Array.isArray(typedParams)) return "";

            let totalCost = 0;
            const costBreakdown = typedParams
              .map((param) => {
                totalCost += param.value;
                return `
                  <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                    <span style="margin-right: 16px;">${
                      param.seriesName
                    }:</span>
                    <span style="color: ${param.color}; font-weight: bold">
                      ${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(param.value)}
                    </span>
                  </div>
                `;
              })
              .join("");

            return `
              <div style="padding: 10px;">
                <div style="margin-bottom: 8px; font-weight: bold; color: ${
                  theme.palette.text.primary
                }">
                  ${typedParams[0].axisValue}
                </div>
                <div style="margin-bottom: 8px; border-bottom: 1px solid ${
                  theme.palette.divider
                };">
                  <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                    <span style="margin-right: 16px;">Total Costs:</span>
                    <span style="font-weight: bold">
                      ${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(totalCost)}
                    </span>
                  </div>
                </div>
                ${costBreakdown}
              </div>
            `;
          },
        },
        toolbox: {
          show: true,
          itemSize: 20,
          itemGap: 20,
          right: 20,
          top: 10,
          feature: {
            dataZoom: {
              show: true,
              title: {
                zoom: "Zoom Selection",
                back: "Reset Zoom",
              },
            },
            restore: {
              show: true,
              title: "Reset All",
            },
            saveAsImage: {
              show: true,
              title: "Save Image",
              type: "png",
              excludeComponents: ["toolbox"],
            },
          },
          tooltip: {
            show: true,
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            textStyle: {
              color: theme.palette.text.primary,
            },
            extraCssText:
              "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); padding: 8px;",
          },
        },
        legend: {
          show: true,
          type: "scroll",
          bottom: 60,
          itemGap: 30,
          textStyle: {
            color: theme.palette.text.primary,
          },
          padding: [5, 10],
        },
        grid: {
          top: 100,
          left: 80,
          right: 80,
          bottom: 120,
          containLabel: true,
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: 100,
          },
          {
            show: true,
            type: "slider",
            bottom: 10,
            start: 0,
            end: 100,
            height: 30,
          },
        ],
        xAxis: {
          type: "category",
          data: months,
          axisLine: {
            lineStyle: {
              color: theme.palette.divider,
            },
          },
          axisTick: {
            alignWithLabel: true,
          },
          axisLabel: {
            color: theme.palette.text.secondary,
            formatter: (value: string) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              });
            },
          },
        },
        yAxis: {
          type: "value",
          name: "Cost Amount (USD)",
          nameLocation: "middle",
          nameGap: 50,
          nameTextStyle: {
            color: theme.palette.text.secondary,
            padding: [0, 0, 15, 0],
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: theme.palette.primary.main,
            },
          },
          axisLabel: {
            color: theme.palette.text.secondary,
            formatter: (value: number) => {
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value);
            },
          },
          splitLine: {
            lineStyle: {
              type: "dashed",
              color: theme.palette.divider,
            },
          },
        },
        series,
      };

      setChartOption(option);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating cost chart options:", error);
      setIsLoading(false);
    }
  }, [dataChunks, theme]);

  const handleChartReady = useCallback(
    (instance: ECharts) => {
      chartInstance.current = instance;
      onChartReady?.(instance);
    },
    [onChartReady]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          height: 450,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
          borderRadius: 1,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ReactEcharts
      ref={chartRef}
      option={chartOption}
      style={{ height: "450px", width: "100%" }}
      onChartReady={handleChartReady}
      notMerge={true}
      opts={{ renderer: "canvas" }}
    />
  );
};

export default CostChart;
