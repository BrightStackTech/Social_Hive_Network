import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export type MultiLineData = {
  date: string;
  likes: number;
  comments: number;
  shares: number;
};

export type MultiLineGraphProps = {
  data: MultiLineData[];
  period?: string;
};

const MultiLineGraph: React.FC<MultiLineGraphProps> = ({ data, period }) => {
  // Ensure data is sorted by date.
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedData.map((item) => new Date(item.date)),
    datasets: [
      {
        label: "Likes",
        data: sortedData.map((item) => item.likes),
        fill: false,
        borderColor: "blue",
        tension: 0.1,
      },
      {
        label: "Comments",
        data: sortedData.map((item) => item.comments),
        fill: false,
        borderColor: "green",
        tension: 0.1,
      },
      {
        label: "Shares",
        data: sortedData.map((item) => item.shares),
        fill: false,
        borderColor: "red",
        tension: 0.1,
      },
    ],
  };

  // Determine time unit based on period.
  const timeUnit: "hour" | "day" | "week" | "month" =
    period === "daily"
      ? "hour"
      : period === "weekly"
      ? "day"
      : period === "monthly"
      ? "week"
      : "month"; // default for "yearly" or any other value

  // Updated options with "timeseries" as type.
  const options = {
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeUnit as "hour" | "day" | "week" | "month",
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default MultiLineGraph;