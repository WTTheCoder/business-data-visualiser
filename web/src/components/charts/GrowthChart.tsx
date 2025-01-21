import { FC, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import { GrowthData } from "../../utils/mockData";
import type { EChartsOption, TooltipComponentOption, ECharts } from "echarts";
import { useTheme } from "@mui/material";

interface GrowthChartProps {
  data: GrowthData[];
  onChartReady?: (instance: ECharts) => void;
}

interface ChartParams {
  axisValue: string;
  value: number;
  seriesName: string;
}

const GrowthChart: FC<GrowthChartProps> = ({ data, onChartReady }) => {
  const theme = useTheme();
  const chartRef = useRef<ReactEcharts>(null);

  const getChartOptions = (): EChartsOption => {
    const tooltipFormatter: TooltipComponentOption["formatter"] = (
      params: unknown
    ) => {
      const typedParams = params as ChartParams[];

      if (Array.isArray(typedParams)) {
        const actualGrowth = typedParams.find(
          (p) => p.seriesName === "Actual Growth"
        );
        const target = typedParams.find((p) => p.seriesName === "Target");
        return `
          <div style="padding: 10px;">
            <div style="margin-bottom: 6px; font-weight: bold; color: ${
              theme.palette.text.primary
            }">
              ${typedParams[0].axisValue}
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="margin-right: 16px;">Actual Growth:</span>
              <span style="color: ${
                theme.palette.primary.main
              }; font-weight: bold">
                ${actualGrowth?.value.toFixed(1)}%
              </span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="margin-right: 16px;">Target:</span>
              <span style="color: ${
                theme.palette.secondary.main
              }; font-weight: bold">
                ${target?.value.toFixed(1)}%
              </span>
            </div>
          </div>
        `;
      }
      return "";
    };

    return {
      title: {
        text: "Growth Trends",
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
          height: 15,
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
        bottom: 90,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((item) => item.year),
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
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: "value",
        name: "Growth Rate (%)",
        min: 0,
        max: "dataMax",
        axisLine: {
          show: true,
          lineStyle: {
            color: theme.palette.primary.main,
          },
        },
        axisLabel: {
          color: theme.palette.text.secondary,
          formatter: "{value}%",
        },
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: theme.palette.divider,
          },
        },
      },
      series: [
        {
          name: "Actual Growth",
          type: "line",
          data: data.map((item) => item.value),
          smooth: true,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: theme.palette.primary.main,
          },
          itemStyle: {
            color: theme.palette.primary.main,
            borderColor: theme.palette.background.paper,
            borderWidth: 2,
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
        },
        {
          name: "Target",
          type: "line",
          data: data.map((item) => item.target),
          smooth: true,
          showSymbol: true,
          symbol: "circle",
          symbolSize: 8,
          lineStyle: {
            width: 2,
            type: "dashed",
            color: theme.palette.secondary.main,
          },
          itemStyle: {
            color: theme.palette.secondary.main,
            borderColor: theme.palette.background.paper,
            borderWidth: 2,
          },
          emphasis: {
            focus: "series",
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

export default GrowthChart;
