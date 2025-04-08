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

export type FollowTrendData = {
  date: string;
  follows: number;
  unfollows: number;
};

export type FollowTrendGraphProps = {
  data: FollowTrendData[];
  period?: string;
};

const FollowTrendGraph: React.FC<FollowTrendGraphProps> = ({ data, period }) => {
  // Sort data chronologically
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedData.map(item => new Date(item.date)),
    datasets: [
      {
        label: "Follows",
        data: sortedData.map(item => item.follows),
        fill: false,
        borderColor: "blue",
        tension: 0.1,
      },
      {
        label: "Unfollows",
        data: sortedData.map(item => item.unfollows),
        fill: false,
        borderColor: "red",
        tension: 0.1,
      },
    ],
  };

  // Determine the time unit based on period
  const timeUnit: "hour" | "day" | "week" | "month" =
    period === "daily"
      ? "hour"
      : period === "weekly"
      ? "day"
      : period === "monthly"
      ? "week"
      : "month"; // Default for "yearly" or others

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

export default FollowTrendGraph;