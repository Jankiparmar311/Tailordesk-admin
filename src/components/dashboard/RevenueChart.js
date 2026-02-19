"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Skeleton from "react-loading-skeleton";

export default function RevenueChart({ loading }) {
  const user = useSelector((s) => s.auth.user);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user?.shopId) return;

    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("shopId", "==", user.shopId),
      );

      const snap = await getDocs(q);

      const monthly = {};

      snap.docs.forEach((doc) => {
        const o = doc.data();
        if (!o.createdAt?.seconds) return;

        const date = new Date(o.createdAt.seconds * 1000);
        const key = date.toLocaleString("default", { month: "short" });

        monthly[key] = (monthly[key] || 0) + (o.price || 0);
      });

      const chartData = Object.keys(monthly).map((m) => ({
        month: m,
        revenue: monthly[m],
      }));

      setData(chartData);
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="font-semibold mb-6 text-gray-900">Monthly Revenue</h2>

      {loading ? (
        <Skeleton height={265} width="100%" />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
