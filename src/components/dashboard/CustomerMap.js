"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";

export default function CustomerMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // NEW
  const user = useSelector((s) => s.auth.user);
  const [countryStats, setCountryStats] = useState([]);

  useEffect(() => {
    if (!user?.shopId || !mapRef.current) return;

    const loadMap = async () => {
      const jsVectorMap = (await import("jsvectormap")).default;
      await import("jsvectormap/dist/maps/world.js");

      // DESTROY OLD MAP (VERY IMPORTANT)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }

      const snap = await getDocs(
        query(collection(db, "customers"), where("shopId", "==", user.shopId)),
      );

      const countryCount = {};
      let total = 0;

      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.country || !data.countryCode) return;

        total++;

        countryCount[data.country] = countryCount[data.country] || {
          count: 0,
          code: data.countryCode,
        };

        countryCount[data.country].count++;
      });

      const stats = Object.entries(countryCount)
        .map(([country, data]) => ({
          country,
          count: data.count,
          code: data.code,
          percent: Math.round((data.count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      setCountryStats(stats);

      const regionValues = {};
      stats.forEach((c) => {
        if (c.code) {
          regionValues[c.code.toUpperCase()] = c.count;
        }
      });

      // CREATE MAP ONCE
      mapInstanceRef.current = new jsVectorMap({
        selector: mapRef.current,
        map: "world",
        zoomButtons: false,

        regionStyle: {
          initial: { fill: "#E5E7EB" },
          hover: { fill: "#6366F1" },
        },

        series: {
          regions: [
            {
              values: regionValues,
              scale: ["#C7D2FE", "#4F46E5"],
              normalizeFunction: "polynomial",
            },
          ],
        },

        onRegionTooltipShow(event, tooltip, code) {
          const count = regionValues[code] || 0;
          tooltip.text(
            `${tooltip.text()} — ${count} ${
              count === 1 ? "Customer" : "Customers"
            }`,
          );
        },
      });
    };

    loadMap();

    // CLEANUP ON UNMOUNT
    return () => {
      if (mapInstanceRef?.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [user?.shopId]); // stable dependency

  return (
    <div className="flex flex-col">
      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-48 sm:h-56 lg:h-64 border border-gray-200 rounded-xl"
      />

      {/* Country List */}
      <div className="space-y-3 mt-4 overflow-y-auto max-h-72 pr-1">
        {countryStats.map((c) => (
          <div
            key={c.country}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            {/* Left Section */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={`https://flagcdn.com/w40/${c.code?.toLowerCase()}.png`}
                className="w-8 h-6 rounded shrink-0"
                alt={c.country}
              />

              <div className="min-w-0">
                <p className="font-medium truncate">{c.country}</p>
                <p className="text-sm text-gray-500">
                  {c.count} {c.count === 1 ? "Customer" : "Customers"}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 w-full sm:w-1/2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${c.percent}%` }}
                />
              </div>
              <span className="text-sm font-medium shrink-0">{c.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
