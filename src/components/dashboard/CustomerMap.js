"use client";

import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";
import EmptyState from "@/components/ui/EmptyState";
import { UsersIcon } from "@heroicons/react/24/outline";
import Skeleton from "react-loading-skeleton";

export default function CustomerMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null); // NEW
  const user = useSelector((s) => s.auth.user);
  const [countryStats, setCountryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.shopId) return;

    const loadMap = async () => {
      setLoading(true);

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
      setLoading(false);

      // If no data → STOP HERE
      if (stats.length === 0) return;

      // Wait for DOM to render map container
      setTimeout(async () => {
        if (!mapRef.current) return;

        const jsVectorMap = (await import("jsvectormap")).default;
        await import("jsvectormap/dist/maps/world.js");

        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const regionValues = {};
        stats.forEach((c) => {
          if (c.code) {
            regionValues[c.code.toUpperCase()] = c.count;
          }
        });

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
        });
      }, 0);
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [user?.shopId]);

  return (
    <div className="flex flex-col">
      {loading ? (
        <Skeleton height={300} />
      ) : countryStats.length === 0 ? (
        <div className="h-64 flex items-center justify-center  rounded-xl">
          <EmptyState
            icon={UsersIcon}
            title="No customer data yet"
            description="Customer demographics will appear once you add customers."
          />
        </div>
      ) : (
        <>
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

                <div className="flex items-center gap-3 w-full sm:w-1/2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {c.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
