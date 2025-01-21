import { FC, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import { RevenueData } from "../../utils/mockData";
import type { EChartsOption, TooltipComponentOption } from "echarts";
import { useTheme } from "@mui/material";

interface RevenueChartProps {
  data: RevenueData[];
  onChartReady?: (instance: echarts.ECharts) => void;
}

interface EChartParams {
  seriesName: string;
  value: number;
  axisValue: string;
}

const RevenueChart: FC<RevenueChartProps> = ({ data, onChartReady }) => {
  const theme = useTheme();
  const chartRef = useRef<ReactEcharts>(null);

  const getChartOptions = (): EChartsOption => {
    const tooltipFormatter: TooltipComponentOption["formatter"] = (
      params: unknown
    ) => {
      const typedParams = params as EChartParams[];

      if (Array.isArray(typedParams)) {
        const revenue = typedParams.find((p) => p.seriesName === "Revenue");
        const growth = typedParams.find((p) => p.seriesName === "Growth Rate");
        return `
          <div style="padding: 10px;">
            <div style="margin-bottom: 6px; font-weight: bold; color: ${
              theme.palette.text.primary
            }">
              ${typedParams[0].axisValue}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="margin-right: 16px;">Revenue:</span>
              <span style="color: ${
                theme.palette.primary.main
              }; font-weight: bold">
                ${
                  revenue && typeof revenue.value === "number"
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(revenue.value)
                    : "N/A"
                }
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="margin-right: 16px;">Growth Rate:</span>
              <span style="color: ${
                theme.palette.secondary.main
              }; font-weight: bold">
                ${
                  growth && typeof growth.value === "number"
                    ? `${growth.value.toFixed(1)}%`
                    : "N/A"
                }
              </span>
            </div>
          </div>
        `;
      }
      return "";
    };

    return {
      title: {
        text: "Revenue Analysis",
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
          height: 15, // 减小滑动条高度
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
        left: 80, // 增加左侧宽度
        right: 80, // 增加右侧宽度
        bottom: 90,
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
        data: data.map((item) => item.period),
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
          rotate: 0,
          margin: 15,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: [
        {
          type: "value",
          name: "Revenue",
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
          name: "Growth Rate",
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
          name: "Revenue",
          type: "bar",
          data: data.map((item) => item.revenue),
          barWidth: "25%", // 减小柱状图宽度
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
          name: "Growth Rate",
          type: "line",
          yAxisIndex: 1,
          data: data.map((item) => item.growth),
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

export default RevenueChart;
