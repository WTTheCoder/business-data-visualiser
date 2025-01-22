import { FC, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type { EChartsOption, TooltipComponentOption } from "echarts";
import { useTheme } from "@mui/material";

interface ProfitChartProps {
  data: DailyData[];
  onChartReady?: (instance: echarts.ECharts) => void;
}

interface ChartParams {
  seriesName: string;
  value: number;
  axisValue: string;
}

const ProfitChart: FC<ProfitChartProps> = ({ data, onChartReady }) => {
  const theme = useTheme();
  const chartRef = useRef<ReactEcharts>(null);

  const getChartOptions = (): EChartsOption => {
    const tooltipFormatter: TooltipComponentOption["formatter"] = (
      params: unknown
    ) => {
      const typedParams = params as ChartParams[];

      if (Array.isArray(typedParams)) {
        const profit = typedParams.find((p) => p.seriesName === "Profit");
        const profitMargin = typedParams.find(
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
                  profit && typeof profit.value === "number"
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
                ${
                  profitMargin && typeof profitMargin.value === "number"
                    ? `${profitMargin.value.toFixed(1)}%`
                    : "N/A"
                }
              </span>
            </div>
          </div>
        `;
      }
      return "";
    };

    // Calculate monthly aggregated data
    const monthlyData = data.reduce((acc, item) => {
      const month = item.date.substring(0, 7); // Get YYYY-MM
      if (!acc[month]) {
        acc[month] = { profit: 0, sales: 0 };
      }
      acc[month].profit += item.profit;
      acc[month].sales += item.sales;
      return acc;
    }, {} as { [key: string]: { profit: number; sales: number } });

    const months = Object.keys(monthlyData).sort();
    const profitData = months.map((month) => monthlyData[month].profit);
    const marginData = months.map(
      (month) => (monthlyData[month].profit / monthlyData[month].sales) * 100
    );

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
        formatter: tooltipFormatter,
        extraCssText: "z-index: 1001;",
      },
      toolbox: {
        show: true,
        itemSize: 20,
        itemGap: 15,
        right: 20,
        top: 10,
        showTitle: false,
        tooltip: {
          show: true,
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          textStyle: {
            color: theme.palette.text.primary,
          },
          extraCssText: "z-index: 1001; padding: 8px 12px;",
        },
        feature: {
          dataZoom: {
            show: true,
            title: {
              zoom: "Zoom: Select area to zoom in",
              back: "Reset zoom",
            },
          },
          restore: {
            show: true,
            title: "Reset chart",
          },
          saveAsImage: {
            show: true,
            title: "Save as image",
            type: "png",
            excludeComponents: ["toolbox"],
          },
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
          zoomLock: false,
        },
        {
          show: true,
          type: "slider",
          bottom: 50,
          start: 0,
          end: 100,
          height: 30,
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
          fillerColor: theme.palette.action.hover,
          handleSize: 20,
          handleStyle: {
            color: theme.palette.primary.main,
            borderColor: theme.palette.primary.main,
          },
        },
      ],
      grid: {
        top: 70,
        left: 80,
        right: 80,
        bottom: 120,
        containLabel: true,
      },
      legend: {
        bottom: 10,
        itemGap: 30,
        textStyle: {
          color: theme.palette.text.secondary,
        },
      },
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
        splitLine: {
          show: false,
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
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                notation: "compact",
                compactDisplay: "short",
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
      series: [
        {
          name: "Profit",
          type: "bar",
          data: profitData,
          barWidth: "25%",
          itemStyle: {
            color: theme.palette.primary.main,
            opacity: 0.9,
          },
          emphasis: {
            focus: "series",
            itemStyle: {
              opacity: 1,
            },
          },
        },
        {
          name: "Profit Margin",
          type: "line",
          yAxisIndex: 1,
          data: marginData,
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: theme.palette.secondary.main,
          },
          itemStyle: {
            color: theme.palette.secondary.main,
          },
          emphasis: {
            focus: "series",
            lineStyle: {
              width: 3,
            },
          },
        },
      ],
    };
  };

  return (
    <ReactEcharts
      ref={chartRef}
      option={getChartOptions()}
      style={{ height: "450px", width: "100%" }}
      onChartReady={onChartReady}
      notMerge={true}
      opts={{ renderer: "canvas" }}
    />
  );
};

export default ProfitChart;
