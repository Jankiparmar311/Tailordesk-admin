"use client";

import { useEffect, useRef } from "react";
import "jsvectormap/dist/css/jsvectormap.min.css";
import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/maps/world.js";

export default function WorldMap({ countryData }) {
  const mapRef = useRef();

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous map if re-rendered
    mapRef.current.innerHTML = "";

    new jsVectorMap({
      selector: mapRef.current,
      map: "world",
      regionStyle: {
        initial: {
          fill: "#E5E7EB",
          "fill-opacity": 0.8,
          stroke: "none",
        },
      },
      series: {
        regions: [
          {
            values: countryData,
            scale: ["#CFE2FF", "#0D6EFD"], // Light → Dark
            normalizeFunction: "polynomial",
          },
        ],
      },
      onRegionTipShow: (e, el, code) => {
        const count = countryData[code] ?? 0;
        if (count) {
          el.innerHTML += `: ${count} Customers`;
        }
      },
    });
  }, [countryData]);

  return <div ref={mapRef} className="w-full h-80"></div>;
}
