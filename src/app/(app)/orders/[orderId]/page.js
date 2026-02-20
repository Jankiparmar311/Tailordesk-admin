"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";

export default function OrderView() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState(null);

  useEffect(() => {
    const loadOrder = async () => {
      const snap = await getDoc(doc(db, "orders", orderId));

      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    };

    loadOrder();
  }, [orderId]);

  if (!order) return <p className="p-6">Loading...</p>;

  const remaining = (order.price || 0) - (order.advancePaid || 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{order.clothType} Order</h1>
          <p className="text-gray-500 text-sm">
            Delivery: {order.deliveryDate}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/orders/${order.id}/edit`)}
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
          >
            Edit
          </button>

          <span className="capitalize bg-indigo-100 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium">
            {order.status}
          </span>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Price</p>
          <p className="text-xl font-semibold">₹{order.price}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Advance Paid</p>
          <p className="text-xl font-semibold">₹{order.advancePaid || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Remaining</p>
          <p className="text-xl font-semibold text-red-600">₹{remaining}</p>
        </div>
      </div>

      {/* Measurements */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="font-semibold">Measurements</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <Measure label="Chest" value={order.measurements?.chest} />
          <Measure label="Waist" value={order.measurements?.waist} />
          <Measure label="Shoulder" value={order.measurements?.shoulder} />
          <Measure label="Sleeve" value={order.measurements?.sleeve} />
          <Measure label="Length" value={order.measurements?.length} />
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-2">Notes</h2>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Images */}
      {order.images && order.images.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="font-semibold">Cloth Images</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {order.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Cloth"
                onClick={() => window.open(img, "_blank")}
                className="w-full h-40 object-cover rounded-md cursor-pointer hover:opacity-90"
              />
            ))}
          </div>

          <p className="text-xs text-gray-500">Click image to view full size</p>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
      >
        ← Back to Orders
      </button>
    </div>
  );
}

function Measure({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-md p-3">
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
