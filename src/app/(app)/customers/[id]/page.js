"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  getDoc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function CustomerView() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deleteData, setDeleteData] = useState({
    isOpen: false,
    loading: false,
    orderId: null,
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      const snap = await getDoc(doc(db, "customers", id));

      if (snap.exists()) {
        setCustomer(snap.data());
      }
    };

    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("customerId", "==", id),
        orderBy("createdAt", "desc"),
      );

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    };

    fetchCustomer();
    fetchOrders();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleteData({
        ...deleteData,
        loading: true,
      });

      await deleteDoc(doc(db, "orders", deleteData?.orderId));

      // refresh local list
      setOrders((prev) => prev.filter((o) => o.id !== deleteData?.orderId));
      setDeleteData({
        ...deleteData,
        loading: false,
        isOpen: false,
      });
    } catch (err) {
      if (err) {
        setDeleteData({
          ...deleteData,
          loading: false,
        });
      }
    }
  };

  if (!customer) return <p className="p-6">Please create customer first.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-semibold">{customer.name}</h1>

          <button
            onClick={() => router.push(`/customers/${id}/edit`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Edit Customer
          </button>
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <h2 className="font-medium text-gray-700">Customer Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="mt-1 font-medium">{customer.phone || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500">Address</p>
              <p className="mt-1 font-medium">{customer.address || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <p className="text-gray-500">Notes</p>
              <p className="mt-1 font-medium">{customer.notes || "-"}</p>
            </div>
          </div>
        </div>

        {/* Measurements */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
          <h2 className="font-medium text-gray-700">Measurements</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <p>Chest: {customer.lastMeasurements?.chest || "-"}</p>
            <p>Waist: {customer.lastMeasurements?.waist || "-"}</p>
            <p>Shoulder: {customer.lastMeasurements?.shoulder || "-"}</p>
            <p>Sleeve: {customer.lastMeasurements?.sleeve || "-"}</p>
            <p>Length: {customer.lastMeasurements?.length || "-"}</p>
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-700">Orders</h2>

            <button
              onClick={() => router.push(`/customers/${id}/orders/new`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              + New Order
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => router.push(`/orders/${order.id}`)}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium">{order.clothType || "Order"}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Delivery: {order.deliveryDate || "-"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full capitalize
        ${
          order.status === "completed"
            ? "bg-green-100 text-green-700"
            : order.status === "in progress"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
        }`}
                    >
                      {order.status || "pending"}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteData({
                          ...deleteData,
                          orderId: order.id,
                          isOpen: true,
                        });
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back */}
        <div>
          <button
            onClick={() => router.push("/customers")}
            className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md text-sm"
          >
            ← Back to Customers
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={deleteData?.isOpen}
        onClose={() =>
          setDeleteData({
            ...deleteData,
            isOpen: false,
          })
        }
        title="Delete Order"
        message="Are you sure you want to delete this order?"
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteData?.loading}
      />
    </div>
  );
}
