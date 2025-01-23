import { FC, useRef, useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type {
  EChartsOption,
  ECharts,
  BarSeriesOption,
  ToolboxComponentOption,
  DataZoomComponentOption,
} from "echarts";
import { useTheme } from "@mui/material";
import { Box, CircularProgress } from "@mui/material";

interface CostChartProps {
  dataChunks: DailyData[][];
  onChartReady?: (instance: ECharts) => void;
}

interface ZoomState {
  start: number;
  end: number;
}

interface ChartState {
  dataZoom?: ZoomState[];
  toolbox?: {
    feature?: {
      dataZoom?: Partial<DataZoomComponentOption>;
    };
  };
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
  const chartStateRef = useRef<ChartState>({});

  const saveChartState = useCallback(() => {
    if (chartInstance.current) {
      const currentOption = chartInstance.current.getOption();

      if (Array.isArray(currentOption.dataZoom)) {
        chartStateRef.current.dataZoom = currentOption.dataZoom.map((zoom) => ({
          start: zoom.start as number,
          end: zoom.end as number,
        }));
      }

      if (currentOption.toolbox && typeof currentOption.toolbox === "object") {
        const toolbox = currentOption.toolbox as ToolboxComponentOption;
        const dataZoom = toolbox.feature
          ?.dataZoom as Partial<DataZoomComponentOption>;
        if (dataZoom) {
          chartStateRef.current.toolbox = {
            feature: {
              dataZoom: {
                start: dataZoom.start,
                end: dataZoom.end,
              },
            },
          };
        }
      }
    }
  }, []);

  const createChartOptions = useCallback(
    (months: string[], series: BarSeriesOption[]): EChartsOption => {
      const colors = [
        theme.palette.info.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.grey[500],
      ];

      const toolboxConfig: ToolboxComponentOption = {
        show: true,
        itemSize: 20,
        itemGap: 20,
        right: 20,
        top: 10,
        showTitle: false,
        feature: {
          dataZoom: {
            show: true,
            title: {
              zoom: "Zoom Selection",
              back: "Reset Zoom",
            },
            xAxisIndex: [0],
            yAxisIndex: [0],
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
          extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); padding: 8px;",
        },
      };
      return {
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
        toolbox: toolboxConfig,
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
            start: chartStateRef.current.dataZoom?.[0]?.start ?? 0,
            end: chartStateRef.current.dataZoom?.[0]?.end ?? 100,
            xAxisIndex: [0],
            yAxisIndex: [0],
          },
          {
            show: true,
            type: "slider",
            bottom: 10,
            start: chartStateRef.current.dataZoom?.[1]?.start ?? 0,
            end: chartStateRef.current.dataZoom?.[1]?.end ?? 100,
            height: 30,
            xAxisIndex: [0],
            yAxisIndex: [0],
          },
        ],
        xAxis: {
          type: "category",
          data: months,
          boundaryGap: true,
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
        series: series.map((s, index) => ({
          ...s,
          itemStyle: {
            ...s.itemStyle,
            color: colors[index],
          },
        })),
      };
    },
    [theme]
  );

  useEffect(() => {
    if (dataChunks.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const monthlyData = new Map<string, { [key: string]: number }>();

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

      const months = Array.from(monthlyData.keys()).sort();

      const series: BarSeriesOption[] = COST_CATEGORIES.map((category) => ({
        name: category,
        type: "bar",
        stack: "total",
        emphasis: { focus: "series" },
        data: months.map(
          (month) => monthlyData.get(month)![category.toLowerCase()] || 0
        ),
      }));

      saveChartState();
      const options = createChartOptions(months, series);
      setChartOption(options);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating cost chart options:", error);
      setIsLoading(false);
    }
  }, [dataChunks, theme, createChartOptions, saveChartState]);

  useEffect(() => {
    if (chartInstance.current) {
      saveChartState();

      // Only update theme-related options
      const themeOptions = {
        title: {
          textStyle: {
            color: theme.palette.text.primary,
          },
          subtextStyle: {
            color: theme.palette.text.secondary,
          },
        },
        legend: {
          textStyle: {
            color: theme.palette.text.primary,
          },
        },
        tooltip: {
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: theme.palette.divider,
            },
          },
          axisLabel: {
            color: theme.palette.text.secondary,
          },
        },
        yAxis: {
          axisLine: {
            lineStyle: {
              color: theme.palette.primary.main,
            },
          },
          splitLine: {
            lineStyle: {
              color: theme.palette.divider,
            },
          },
          axisLabel: {
            color: theme.palette.text.secondary,
          },
        },
      };

      chartInstance.current.setOption(themeOptions);

      const dataZoomState = chartStateRef.current.dataZoom?.[0];
      const toolboxState = chartStateRef.current.toolbox?.feature?.dataZoom;

      if (dataZoomState || toolboxState) {
        chartInstance.current.dispatchAction({
          type: "dataZoom",
          start: dataZoomState?.start ?? toolboxState?.start ?? 0,
          end: dataZoomState?.end ?? toolboxState?.end ?? 100,
          xAxisIndex: [0],
          yAxisIndex: [0],
        });
      }
    }
  }, [theme, saveChartState]);

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
