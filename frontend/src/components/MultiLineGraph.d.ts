import React from "react";
import "chartjs-adapter-date-fns";
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
declare const MultiLineGraph: React.FC<MultiLineGraphProps>;
export default MultiLineGraph;
