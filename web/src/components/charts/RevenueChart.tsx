import { FC } from "react";
import ReactEcharts from "echarts-for-react";
import { RevenueData } from "../../utils/mockData";

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: FC<RevenueChartProps> = ({ data }) => {
  const getChartOptions = () => ({
    title: {
      text: "Revenue Analysis",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      bottom: "0",
    },
    xAxis: {
      type: "category",
      data: data.map((item) => item.period),
    },
    yAxis: [
      {
        type: "value",
        name: "Revenue",
        position: "left",
      },
      {
        type: "value",
        name: "Growth",
        position: "right",
        axisLabel: {
          formatter: "{value}%",
        },
      },
    ],
    series: [
      {
        name: "Revenue",
        type: "bar",
        data: data.map((item) => item.revenue),
      },
      {
        name: "Growth Rate",
        type: "line",
        yAxisIndex: 1,
        data: data.map((item) => item.growth),
        lineStyle: {
          width: 2,
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

export default RevenueChart;
