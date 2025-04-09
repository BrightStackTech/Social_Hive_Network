import React from "react";
import "chartjs-adapter-date-fns";
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
declare const InteractionGraph: React.FC<InteractionGraphProps>;
export default InteractionGraph;
