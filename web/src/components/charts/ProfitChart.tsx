import { FC, useRef, useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type {
  EChartsOption,
  ECharts,
  BarSeriesOption,
  LineSeriesOption,
  ToolboxComponentOption,
  DataZoomComponentOption,
} from "echarts";
import { useTheme } from "@mui/material";
import { Box, CircularProgress } from "@mui/material";

interface ProfitChartProps {
  dataChunks: DailyData[][];
  onChartReady?: (instance: ECharts) => void;
}

interface ProfitDataPoint {
  month: string;
  profit: number;
  margin: number;
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

const ProfitChart: FC<ProfitChartProps> = ({ dataChunks, onChartReady }) => {
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
    (
      processedData: ProfitDataPoint[],
      barSeries: BarSeriesOption,
      lineSeries: LineSeriesOption
    ): EChartsOption => {
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
            yAxisIndex: [0, 1], // Include both y-axes for profit and margin
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
          text: "Profit Analysis",
          left: "center",
          top: 10,
          textStyle: {
            color: theme.palette.text.primary,
            fontSize: 16,
            fontWeight: "normal",
          },
          subtext: "Monthly profit and profit margin trends",
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
              axisValue: string;
            }>;
            if (!Array.isArray(typedParams)) return "";

            const profit = typedParams.find((p) => p.seriesName === "Profit");
            const margin = typedParams.find(
              (p) => p.seriesName === "Profit Margin"
            );

            return `
              <div style="padding: 10px;">
                <div style="margin-bottom: 6px; font-weight: bold; color: ${
                  theme.palette.text.primary
                }">
                  ${typedParams[0].axisValue}
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="margin-right: 16px;">Profit (USD):</span>
                  <span style="color: ${
                    theme.palette.primary.main
                  }; font-weight: bold">
                    ${
                      profit
                        ? new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(profit.value)
                        : "N/A"
                    }
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="margin-right: 16px;">Profit Margin:</span>
                  <span style="color: ${
                    theme.palette.secondary.main
                  }; font-weight: bold">
                    ${margin ? `${margin.value.toFixed(1)}%` : "N/A"}
                  </span>
                </div>
              </div>
            `;
          },
        },
        toolbox: toolboxConfig,
        legend: {
          show: true,
          data: ["Profit", "Profit Margin"],
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
            yAxisIndex: [0, 1],
          },
          {
            show: true,
            type: "slider",
            bottom: 10,
            start: chartStateRef.current.dataZoom?.[1]?.start ?? 0,
            end: chartStateRef.current.dataZoom?.[1]?.end ?? 100,
            height: 30,
            xAxisIndex: [0],
            yAxisIndex: [0, 1],
          },
        ],
        xAxis: {
          type: "category",
          data: processedData.map((item) => item.month),
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
        yAxis: [
          {
            type: "value",
            name: "Profit (USD)",
            position: "left",
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
          {
            type: "value",
            name: "Profit Margin (%)",
            position: "right",
            alignTicks: true,
            axisLine: {
              show: true,
              lineStyle: {
                color: theme.palette.secondary.main,
              },
            },
            axisLabel: {
              color: theme.palette.text.secondary,
              formatter: "{value}%",
            },
            splitLine: {
              show: false,
            },
          },
        ],
        series: [barSeries, lineSeries],
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
      const monthlyData = new Map<string, { profit: number; sales: number }>();

      dataChunks.forEach((chunk) => {
        chunk.forEach((item) => {
          const month = item.date.substring(0, 7);
          const current = monthlyData.get(month) || { profit: 0, sales: 0 };
          monthlyData.set(month, {
            profit: current.profit + item.profit,
            sales: current.sales + item.sales,
          });
        });
      });

      const processedData: ProfitDataPoint[] = Array.from(monthlyData.entries())
        .map(([month, data]) => ({
          month,
          profit: data.profit,
          margin: (data.profit / data.sales) * 100,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      const barSeries: BarSeriesOption = {
        name: "Profit",
        type: "bar",
        data: processedData.map((item) => item.profit),
        barWidth: "25%",
        itemStyle: {
          color: theme.palette.primary.main,
          opacity: 0.9,
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
          },
        },
      };

      const lineSeries: LineSeriesOption = {
        name: "Profit Margin",
        type: "line",
        yAxisIndex: 1,
        data: processedData.map((item) => item.margin),
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: theme.palette.secondary.main,
        },
        itemStyle: {
          color: theme.palette.secondary.main,
        },
        emphasis: {
          focus: "series",
          itemStyle: {
            borderWidth: 2,
          },
        },
      };

      saveChartState();
      const options = createChartOptions(processedData, barSeries, lineSeries);
      setChartOption(options);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating profit chart options:", error);
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
        yAxis: [
          {
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
          {
            axisLine: {
              lineStyle: {
                color: theme.palette.secondary.main,
              },
            },
            axisLabel: {
              color: theme.palette.text.secondary,
            },
          },
        ],
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
          yAxisIndex: [0, 1],
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

export default ProfitChart;
