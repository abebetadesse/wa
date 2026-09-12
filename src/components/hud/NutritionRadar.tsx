"use client";

import ReactECharts from "echarts-for-react";

type NutritionRadarProps = {
  data?: number[];
};

const defaultData = [72, 85, 91, 68, 76, 82];

export default function NutritionRadar({ data = defaultData }: NutritionRadarProps) {
  return (
    <ReactECharts
      option={{
        backgroundColor: "transparent",
        tooltip: {},
        radar: {
          indicator: [
            { name: "Protein", max: 100 },
            { name: "Iron", max: 100 },
            { name: "Zinc", max: 100 },
            { name: "Calcium", max: 100 },
            { name: "Vit A", max: 100 },
            { name: "Vit C", max: 100 },
          ],
          splitLine: { lineStyle: { color: "rgba(0,240,255,0.18)" } },
          axisLine: { lineStyle: { color: "rgba(0,240,255,0.22)" } },
          shape: "circle",
        },
        series: [{
          type: "radar",
          data: [{
            value: data,
            name: "Food profile",
            areaStyle: { opacity: 0.3 },
            lineStyle: { width: 2, color: "#00f0ff" },
            itemStyle: { color: "#00f0ff" },
          }],
        }],
      }}
      style={{ height: 220, width: "100%" }}
      notMerge
      lazyUpdate
    />
  );
}
