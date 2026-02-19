"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";

export default function RecentOrders({ shopId, loading }) {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!shopId) return;

    const loadOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("shopId", "==", shopId),
        orderBy("createdAt", "desc"),
        limit(5),
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    };

    loadOrders();
  }, [shopId]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      ready: "bg-green-100 text-green-700",
      delivered: "bg-gray-200 text-gray-700",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="bg-white border p-5 border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center py-4 border-gray-200 border-b">
        <h2 className="font-semibold text-gray-900">Recent Orders</h2>

        <div className="flex gap-2">
          <button className="border border-gray-400 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100">
            Filter
          </button>
          <button
            onClick={() => router.push("/orders")}
            className="border px-3 border-gray-400 py-1.5 rounded-md text-sm hover:bg-gray-100"
          >
            See all
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton width="100%" height={300} />
      ) : orders.length === 0 ? (
        <p className="p-6 text-center text-gray-500">No recent orders</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 ">
              <tr>
                <th className="py-3 text-left font-medium">Order</th>
                <th className="py-3 text-left font-medium">Customer</th>
                <th className="py-3 text-left font-medium">Price</th>
                <th className="py-3 text-left font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const img = order.images?.[0];

                return (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/orders/${order.id}`)}
                    className="border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                  >
                    {/* Order + image */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {img ? (
                          <img
                            src={img}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                            IMG
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-gray-900">
                            {order.clothType}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-gray-600">{order.customerName}</td>

                    <td className="py-4 text-gray-700">₹{order.price}</td>

                    <td className="py-4">{getStatusBadge(order.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
