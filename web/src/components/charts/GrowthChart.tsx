import { FC } from "react";
import ReactEcharts from "echarts-for-react";
import { GrowthData } from "../../utils/mockData";

interface GrowthChartProps {
  data: GrowthData[];
}

const GrowthChart: FC<GrowthChartProps> = ({ data }) => {
  const getChartOptions = () => ({
    title: {
      text: "Growth Trends",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      bottom: "0",
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.year),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value}%",
      },
    },
    series: [
      {
        name: "Actual Growth",
        type: "line",
        smooth: true,
        data: data.map((item) => item.value),
        areaStyle: {},
      },
      {
        name: "Target",
        type: "line",
        smooth: true,
        data: data.map((item) => item.target),
        lineStyle: {
          type: "dashed",
        },
      },
    ],
  });

  return (
    <ReactEcharts
      option={getChartOptions()}
      style={{ height: "100%", width: "100%" }}
    />
  );
};

export default GrowthChart;
