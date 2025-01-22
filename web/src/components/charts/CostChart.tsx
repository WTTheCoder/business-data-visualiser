import { FC, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import { DailyData } from "../../utils/mockData";
import type { EChartsOption, TooltipComponentOption, ECharts } from "echarts";
import { useTheme } from "@mui/material";

interface CostChartProps {
  data: DailyData[];
  onChartReady?: (instance: ECharts) => void;
}

interface ChartParams {
  axisValue: string;
  value: number;
  seriesName: string;
  color: string;
}

const CostChart: FC<CostChartProps> = ({ data, onChartReady }) => {
  const theme = useTheme();
  const chartRef = useRef<ReactEcharts>(null);

  const getChartOptions = (): EChartsOption => {
    // Calculate monthly aggregated cost data
    const monthlyCosts = data.reduce((acc, item) => {
      const month = item.date.substring(0, 7); // Get YYYY-MM
      if (!acc[month]) {
        acc[month] = {
          total: 0,
          breakdown: {
            tax: 0,
            salary: 0,
            benefits: 0,
            rent: 0,
            utilities: 0,
            marketing: 0,
            others: 0,
          },
        };
      }
      acc[month].total += item.costs.total;
      Object.entries(item.costs.breakdown).forEach(([key, value]) => {
        acc[month].breakdown[key] += value;
      });
      return acc;
    }, {} as { [key: string]: { total: number; breakdown: { [key: string]: number } } });

    const months = Object.keys(monthlyCosts).sort();
    const costCategories = Object.keys(monthlyCosts[months[0]].breakdown);

    const seriesData = costCategories.map((category) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      type: "bar" as const,
      stack: "total",
      emphasis: { focus: "series" } as const,
      data: months.map((month) => monthlyCosts[month].breakdown[category]),
    }));

    const tooltipFormatter: TooltipComponentOption["formatter"] = (
      params: unknown
    ) => {
      const typedParams = params as ChartParams[];

      if (Array.isArray(typedParams)) {
        let totalCost = 0;
        const costBreakdown = typedParams
          .map((param) => {
            totalCost += param.value;
            return `
            <div style="display: flex; justify-content: space-between; margin: 3px 0;">
              <span style="margin-right: 16px;">${param.seriesName}:</span>
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
                <span style="margin-right: 16px;">Total Costs (USD):</span>
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
      }
      return "";
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
        formatter: tooltipFormatter,
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
      legend: {
        bottom: 100,
        itemGap: 15,
        textStyle: {
          color: theme.palette.text.secondary,
        },
      },
      grid: {
        top: 70,
        left: 80,
        right: 80,
        bottom: 120,
        containLabel: true,
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
      yAxis: {
        type: "value",
        name: "Cost Amount (USD)",
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
      series: seriesData,
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

export default CostChart;
