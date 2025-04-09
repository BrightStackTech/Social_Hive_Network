import React from "react";
import "chartjs-adapter-date-fns";
export type FollowTrendData = {
    date: string;
    follows: number;
    unfollows: number;
};
export type FollowTrendGraphProps = {
    data: FollowTrendData[];
    period?: string;
};
declare const FollowTrendGraph: React.FC<FollowTrendGraphProps>;
export default FollowTrendGraph;
