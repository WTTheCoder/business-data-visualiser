import { FC } from "react";
import ReactEcharts from "echarts-for-react";
import { SalesData } from "../../utils/mockData";

interface SalesChartProps {
  data: SalesData[];
}

const SalesChart: FC<SalesChartProps> = ({ data }) => {
  const getChartOptions = () => ({
    title: {
      text: "Sales Overview",
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
      data: [...new Set(data.map((item) => item.date))],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Sales",
        type: "line",
        smooth: true,
        data: data.map((item) => item.amount),
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

export default SalesChart;
