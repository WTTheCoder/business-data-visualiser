import { FC, useRef, useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type {
  EChartsOption,
  ECharts,
  BarSeriesOption,
  ScatterSeriesOption,
} from "echarts";
import { useTheme } from "@mui/material";
import { Box, CircularProgress } from "@mui/material";

interface SalesChartProps {
  dataChunks: DailyData[][];
  onChartReady?: (instance: ECharts) => void;
}

interface SalesDataPoint {
  date: string;
  sales: number;
}

interface ChartParams {
  axisValue: string;
  value: number;
  seriesName: string;
}

interface ZoomState {
  start: number;
  end: number;
}

const SalesChart: FC<SalesChartProps> = ({ dataChunks, onChartReady }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [chartOption, setChartOption] = useState<EChartsOption>({});
  const chartRef = useRef<ReactEcharts>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const zoomStateRef = useRef<{ dataZoom?: ZoomState[] }>({});

  // Save current zoom state
  const saveZoomState = useCallback(() => {
    if (chartInstance.current) {
      const currentOption = chartInstance.current.getOption();
      if (Array.isArray(currentOption.dataZoom)) {
        zoomStateRef.current.dataZoom = currentOption.dataZoom.map((zoom) => ({
          start: zoom.start as number,
          end: zoom.end as number,
        }));
      }
    }
  }, []);

  // Create chart options with stored zoom state
  const createChartOptions = useCallback(
    (
      allData: SalesDataPoint[],
      monthlyPeaks: Map<string, number>,
      barSeries: BarSeriesOption,
      scatterSeries: ScatterSeriesOption
    ): EChartsOption => {
      return {
        title: {
          text: "Sales Overview",
          left: "center",
          top: 10,
          textStyle: {
            color: theme.palette.text.primary,
            fontSize: 16,
            fontWeight: "normal",
          },
          subtext: "Daily sales data and monthly peak values",
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
            lineStyle: {
              type: "dashed",
            },
          },
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          borderWidth: 1,
          textStyle: {
            color: theme.palette.text.primary,
          },
          formatter: (params: unknown) => {
            const typedParams = params as ChartParams[];
            if (Array.isArray(typedParams)) {
              const dailySales = typedParams.find(
                (p) => p.seriesName === "Daily Sales"
              );
              const monthlyPeak = typedParams.find(
                (p) => p.seriesName === "Monthly Peaks"
              );

              const date = new Date(typedParams[0].axisValue);
              const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`;
              const currentMonthPeak = monthlyPeaks.get(monthKey);

              const formattedDate = date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              const formatCurrency = (value: number) => {
                return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value);
              };

              let content = `
                <div style="padding: 10px;">
                  <div style="margin-bottom: 6px; font-weight: bold; color: ${theme.palette.text.primary}">
                    ${formattedDate}
                  </div>`;

              if (dailySales && typeof dailySales.value === "number") {
                content += `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span style="margin-right: 16px;">Sales (USD):</span>
                    <span style="color: ${
                      theme.palette.primary.main
                    }; font-weight: bold">
                      ${formatCurrency(dailySales.value)}
                    </span>
                  </div>`;
              }

              const peakValue = monthlyPeak?.value ?? currentMonthPeak;
              if (typeof peakValue === "number") {
                content += `
                  <div style="display: flex; justify-content: space-between; color: ${
                    theme.palette.text.secondary
                  };">
                    <span style="margin-right: 16px;">Monthly Peak:</span>
                    <span style="color: ${
                      theme.palette.secondary.main
                    }; font-weight: bold">
                      ${formatCurrency(peakValue)}
                    </span>
                  </div>`;
              }

              content += `</div>`;
              return content;
            }
            return "";
          },
        },
        toolbox: {
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
          data: ["Daily Sales", "Monthly Peaks"],
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
            start: zoomStateRef.current.dataZoom?.[0]?.start ?? 0,
            end: zoomStateRef.current.dataZoom?.[0]?.end ?? 100,
          },
          {
            show: true,
            type: "slider",
            bottom: 10,
            start: zoomStateRef.current.dataZoom?.[1]?.start ?? 0,
            end: zoomStateRef.current.dataZoom?.[1]?.end ?? 100,
            height: 30,
          },
        ],
        xAxis: {
          type: "category",
          data: allData.map((item) => item.date),
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
              if (date.getDate() === 1) {
                return date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              }
              return "";
            },
            interval: 0,
          },
        },
        yAxis: {
          type: "value",
          name: "Sales Amount (USD)",
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
        series: [barSeries, scatterSeries],
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
      const dailyTotalMap = new Map<string, number>();

      dataChunks.forEach((chunk) => {
        chunk.forEach((item) => {
          const dateKey = item.date;
          const currentTotal = dailyTotalMap.get(dateKey) || 0;
          dailyTotalMap.set(dateKey, currentTotal + item.sales);
        });
      });

      const allData: SalesDataPoint[] = Array.from(dailyTotalMap.entries())
        .map(([date, sales]) => ({
          date,
          sales,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const monthlyPeaks = new Map<string, number>();

      allData.forEach((data) => {
        const monthKey = data.date.substring(0, 7);
        const currentPeak = monthlyPeaks.get(monthKey) || 0;
        if (data.sales > currentPeak) {
          monthlyPeaks.set(monthKey, data.sales);
        }
      });

      const peakPoints = Array.from(monthlyPeaks.entries())
        .map(([month, sales]) => ({
          date: `${month}-01`,
          sales,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const barSeries: BarSeriesOption = {
        name: "Daily Sales",
        type: "bar",
        data: allData.map((item) => item.sales),
        barWidth: 6,
        itemStyle: {
          color: theme.palette.primary.main,
          opacity: 0.8,
        },
        emphasis: {
          itemStyle: {
            color: theme.palette.primary.dark,
            opacity: 1,
          },
        },
      };

      const scatterSeries: ScatterSeriesOption = {
        name: "Monthly Peaks",
        type: "scatter",
        data: peakPoints.map((item) => [item.date, item.sales]),
        symbolSize: 12,
        itemStyle: {
          color: theme.palette.background.paper,
          borderColor: theme.palette.secondary.main,
          borderWidth: 2,
        },
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3,
          },
        },
      };

      saveZoomState();
      const options = createChartOptions(
        allData,
        monthlyPeaks,
        barSeries,
        scatterSeries
      );
      setChartOption(options);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating sales chart options:", error);
      setIsLoading(false);
    }
  }, [dataChunks, theme, createChartOptions, saveZoomState]);

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

export default SalesChart;
