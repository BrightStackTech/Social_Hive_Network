import React from "react";
import { MotionValue } from "framer-motion";
export declare const ContainerScroll: ({ titleComponent, children, }: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const Header: ({ translate, titleComponent }: any) => import("react/jsx-runtime").JSX.Element;
export declare const Card: ({ rotate, scale, children, }: {
    rotate: MotionValue<number>;
    scale: MotionValue<number>;
    translate: MotionValue<number>;
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
