"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import {
  UsersIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";

import RevenueChart from "@/components/dashboard/RevenueChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import MonthlySalesChart from "@/components/dashboard/MonthlySalesChart";
import CustomerMap from "@/components/dashboard/CustomerMap";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    pendingOrders: 0,
    pendingPayment: 0,
    statusData: [],
  });

  const totalOrders = stats.statusData.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  useEffect(() => {
    if (!user?.shopId) return;

    const loadStats = async () => {
      setLoading(true);

      let statusCount = {
        pending: 0,
        in_progress: 0,
        ready: 0,
        delivered: 0,
      };

      const customersSnap = await getDocs(
        query(collection(db, "customers"), where("shopId", "==", user.shopId)),
      );

      const ordersSnap = await getDocs(
        query(collection(db, "orders"), where("shopId", "==", user.shopId)),
      );

      let pendingOrders = 0;
      let pendingPayment = 0;

      ordersSnap.docs.forEach((doc) => {
        const o = doc.data();

        if (o.status !== "delivered") pendingOrders++;

        pendingPayment += (o.price || 0) - (o.advancePaid || 0);

        if (statusCount[o.status] !== undefined) {
          statusCount[o.status]++;
        }
      });

      setStats({
        customers: customersSnap.size,
        orders: ordersSnap.size,
        pendingOrders,
        pendingPayment,
        statusData: [
          { name: "Pending", value: statusCount.pending },
          { name: "In Progress", value: statusCount.in_progress },
          { name: "Ready", value: statusCount.ready },
          { name: "Delivered", value: statusCount.delivered },
        ],
      });

      setLoading(false);
    };

    loadStats();
  }, [user]);

  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Customers"
            value={stats.customers}
            icon={<UsersIcon className="w-6 h-6" />}
            loading={loading}
          />

          <StatCard
            title="Orders"
            value={stats.orders}
            icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
            loading={loading}
          />

          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<ClockIcon className="w-6 h-6" />}
            loading={loading}
          />

          <StatCard
            title="Pending Payment"
            value={`₹${stats.pendingPayment}`}
            icon={<CurrencyRupeeIcon className="w-6 h-6" />}
            loading={loading}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="font-semibold mb-6 text-gray-900">
              Orders by Status
            </h2>

            <div className="flex flex-col md:flex-row items-center">
              {loading ? (
                <Skeleton height={260} width={380} />
              ) : totalOrders === 0 ? (
                <div className="h-65 flex p-5 flex-col items-center justify-center text-center">
                  <ClockIcon className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Orders will appear here once created.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={1}
                    >
                      {stats.statusData.map((entry, index) => {
                        const colors = [
                          "#f59e0b",
                          "#3b82f6",
                          "#10b981",
                          "#6b7280",
                        ];
                        return <Cell key={index} fill={colors[index]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Legend */}
              <div className="mt-6 md:mt-0 md:ml-8 space-y-3">
                {loading
                  ? Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} height={20} width={100} />
                      ))
                  : stats.statusData.map((item, idx) => {
                      const colors = [
                        "bg-amber-500",
                        "bg-blue-500",
                        "bg-emerald-500",
                        "bg-gray-500",
                      ];

                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <span
                            className={`w-3 h-3 rounded-full ${colors[idx]}`}
                          />
                          <span className="text-sm text-gray-700">
                            {item.name}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>
          <MonthlySalesChart loading={loading} />
        </div>
        <RevenueChart loading={loading} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="font-semibold text-lg">Customers Demographic</h2>

            <p className="text-sm text-gray-500 mb-4">
              Number of customer based on country
            </p>

            <CustomerMap />
          </div>
          <RecentOrders shopId={user?.shopId} loading={loading} />
        </div>
      </div>
    </SkeletonTheme>
  );
}

function StatCard({ title, value, icon, trend, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          {loading ? (
            <>
              <Skeleton width={100} height={14} />
              <Skeleton width={80} height={32} className="mt-3" />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">{title}</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">{value}</h2>
              {trend && <p className="text-xs text-green-600 mt-2">{trend}</p>}
            </>
          )}
        </div>

        <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          {loading ? <Skeleton circle width={24} height={24} /> : icon}
        </div>
      </div>
    </div>
  );
}
