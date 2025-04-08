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

export type InteractionData = {
  date: string;
  value: number;
};

export type InteractionGraphProps = {
  title: string;
  value: number;
  data: InteractionData[];
  period?: string;
};

const InteractionGraph: React.FC<InteractionGraphProps> = ({ title, value, data, period }) => {
  // Sort the data by date
  const sortedData = [...data].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedData.map((item) => new Date(item.date)),
    datasets: [
      {
        label: title,
        data: sortedData.map((item) => item.value),
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
      },
    ],
  };

  // Define the time unit using a union type literal.
  const timeUnit: "hour" | "day" | "week" | "month" =
    period === "daily"
      ? "hour"
      : period === "weekly"
      ? "day"
      : period === "monthly"
      ? "week"
      : "month"; // default for "yearly" or any other value

  const options = {
    scales: {
      x: {
        type: "time" as const, // explicitly set as a literal type
        time: {
          unit: timeUnit as "hour" | "day" | "week" | "month", // explicitly assert the type
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div>
      <div className="text-center mb-2 font-semibold">
        {title}: {value.toFixed(2)}
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default InteractionGraph;