import { FC, useRef, useEffect, useState, useCallback } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type {
  EChartsOption,
  ECharts,
  LineSeriesOption,
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

const SalesChart: FC<SalesChartProps> = ({ dataChunks, onChartReady }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [chartOption, setChartOption] = useState<EChartsOption>({});
  const chartRef = useRef<ReactEcharts>(null);
  const chartInstance = useRef<ECharts | null>(null);

  // 初始化图表选项
  useEffect(() => {
    if (dataChunks.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const allData: SalesDataPoint[] = [];
      const peakPointsMap = new Map<string, number>();

      // 处理所有数据块
      dataChunks.forEach((chunk) => {
        chunk.forEach((item) => {
          const monthKey = item.date.substring(0, 7);
          allData.push({
            date: item.date,
            sales: item.sales,
          });

          const currentPeak = peakPointsMap.get(monthKey) || 0;
          if (item.sales > currentPeak) {
            peakPointsMap.set(monthKey, item.sales);
          }
        });
      });

      // 按时间排序
      allData.sort((a, b) => a.date.localeCompare(b.date));

      // 转换峰值点数据
      const peakPoints = Array.from(peakPointsMap.entries()).map(
        ([month, sales]) => ({
          date: `${month}-15`,
          sales,
        })
      );

      const lineSeries: LineSeriesOption = {
        name: "Sales",
        type: "line",
        data: allData.map((item) => item.sales),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: theme.palette.primary.main,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: theme.palette.primary.main + "40",
              },
              {
                offset: 1,
                color: theme.palette.primary.main + "00",
              },
            ],
          },
        },
        emphasis: {
          focus: "series",
        },
      };

      const scatterSeries: ScatterSeriesOption = {
        name: "Monthly Peaks",
        type: "scatter",
        data: peakPoints.map((item) => [item.date, item.sales]),
        symbolSize: 8,
        itemStyle: {
          color: theme.palette.background.paper,
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
        emphasis: {
          scale: true,
          itemStyle: {
            borderWidth: 3,
          },
        },
      };

      const option: EChartsOption = {
        title: {
          text: "Sales Overview",
          left: "center",
          top: 10,
          textStyle: {
            color: theme.palette.text.primary,
            fontSize: 16,
            fontWeight: "normal",
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
              const sales = typedParams[0];
              return `
                <div style="padding: 10px;">
                  <div style="margin-bottom: 6px; font-weight: bold; color: ${
                    theme.palette.text.primary
                  }">
                    ${sales.axisValue}
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="margin-right: 16px;">Sales (USD):</span>
                    <span style="color: ${
                      theme.palette.primary.main
                    }; font-weight: bold">
                      ${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(sales.value)}
                    </span>
                  </div>
                </div>
              `;
            }
            return "";
          },
        },
        toolbox: {
          show: true,
          itemSize: 20,
          itemGap: 15,
          right: 20,
          top: 10,
          feature: {
            dataZoom: {
              show: true,
              title: {
                zoom: "Zoom",
                back: "Reset Zoom",
              },
            },
            restore: {
              show: true,
              title: "Reset",
            },
            saveAsImage: {
              show: true,
              title: "Save as Image",
              type: "png",
              excludeComponents: ["toolbox"],
            },
          },
        },
        legend: {
          show: true,
          data: ["Sales", "Monthly Peaks"],
          bottom: 60,
          textStyle: {
            color: theme.palette.text.primary,
          },
        },
        grid: {
          top: 70,
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
          data: allData.map((item) => item.date),
          boundaryGap: false,
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
                day: "numeric",
              });
            },
          },
        },
        yAxis: {
          type: "value",
          name: "Sales Amount (USD)",
          nameTextStyle: {
            color: theme.palette.text.secondary,
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
        series: [lineSeries, scatterSeries],
      };

      setChartOption(option);
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating chart options:", error);
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

export default SalesChart;
