import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type AnalyticsGraphProps = {
    data: any;
    period: string;
};

const AnalyticsGraph: React.FC<AnalyticsGraphProps> = ({ data, period }) => {
  // Format the date labels based on the period
  const formatLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    switch (period) {
      case "daily":
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "weekly":
        // e.g. Mon, Tue, etc.
        return d.toLocaleDateString([], { weekday: 'short' });
      case "monthly":
        // e.g. Apr 2 or Apr 02
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case "yearly":
        return d.getFullYear().toString();
      default:
        return d.toLocaleDateString();
    }
  };

  const chartData = {
    labels: data.map((item: any) => formatLabel(item.date)),
    datasets: [
      {
        label: "Follows",
        data: data.map((item: any) => item.follows),
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Unfollows",
        data: data.map((item: any) => item.unfollows),
        borderColor: "red",
        fill: false,
      },
      {
        label: "New Posts",
        data: data.map((item: any) => item.newPosts),
        borderColor: "green",
        fill: false,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default AnalyticsGraph;