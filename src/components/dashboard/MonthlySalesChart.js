"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import EmptyState from "../ui/EmptyState";
import { ChartBarIcon } from "@heroicons/react/24/outline";

export default function MonthlySalesChart({ loading }) {
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
        const month = date.toLocaleString("default", { month: "short" });

        monthly[month] = (monthly[month] || 0) + (o.price || 0);
      });

      const chartData = Object.keys(monthly).map((m) => ({
        month: m,
        sales: monthly[m],
      }));

      setData(chartData);
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="font-semibold mb-4">Monthly Sales</h2>

      {loading ? (
        <Skeleton height={265} width="100%" />
      ) : data.length === 0 ? (
        <div className="h-75 flex items-center justify-center">
          <EmptyState
            icon={ChartBarIcon}
            title="No sales data yet"
            description="Monthly sales will appear once you start receiving orders."
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
