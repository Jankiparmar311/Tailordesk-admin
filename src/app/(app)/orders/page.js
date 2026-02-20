"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { deleteDoc, doc } from "firebase/firestore";
import { TrashIcon } from "@heroicons/react/24/outline";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function OrdersPage() {
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteData, setDeleteData] = useState({
    isOpen: false,
    loading: false,
    orderId: null,
  });

  const fetchOrders = async () => {
    let q;

    if (statusFilter === "all") {
      q = query(
        collection(db, "orders"),
        where("shopId", "==", user.shopId),
        orderBy("createdAt", "desc"),
      );
    } else {
      q = query(
        collection(db, "orders"),
        where("shopId", "==", user.shopId),
        where("status", "==", statusFilter),
        orderBy("createdAt", "desc"),
      );
    }

    const snap = await getDocs(q);

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.shopId) return;
    fetchOrders();
  }, [user, statusFilter]);

  if (loading) return <p className="p-6 text-gray-500">Loading orders...</p>;

  const handleDelete = async () => {
    try {
      setDeleteData({
        ...deleteData,
        loading: true,
      });

      await deleteDoc(doc(db, "orders", deleteData?.orderId));
      fetchOrders(); // refresh list
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      ready: "bg-green-100 text-green-800",
      delivered: "bg-gray-200 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  const filteredOrders = orders.filter((o) => {
    const text = search.toLowerCase().trim();

    return (
      o.clothType?.toLowerCase().includes(text) ||
      o.customerName?.toLowerCase().includes(text) ||
      o.status?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <h2 className="text-3xl font-bold mt-2">{orders.length}</h2>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center bg-slate-100 border border-gray-200 rounded-lg px-3 py-2 w-full md:w-72">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <button
          onClick={() => router.push("/customers")}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Add Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "in_progress", "ready", "delivered"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg border text-sm capitalize
          ${
            statusFilter === status
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white hover:bg-gray-100"
          }`}
            >
              {status.replace("_", " ")}
            </button>
          ),
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 text-left font-medium">Cloth</th>
                <th className="p-4 text-left font-medium">Customer</th>

                <th className="p-4 text-left font-medium">Price</th>
                <th className="hidden md:table-cell p-4 text-left font-medium">
                  Remaining
                </th>

                <th className="hidden md:table-cell p-4 text-left font-medium">
                  Delivery
                </th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left flex gap-2 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders?.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    {search ? "No orders found" : "No orders yet"}
                  </td>
                </tr>
              )}

              {filteredOrders?.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td
                    className="p-4 whitespace-nowrap cursor-pointer font-medium text-gray-900"
                    onClick={() => router.push(`/orders/${order.id}`)}
                  >
                    {order.clothType}
                  </td>
                  <td
                    className="p-4 whitespace-nowrap cursor-pointer text-gray-900"
                    onClick={() =>
                      router.push(`/customers/${order.customerId}`)
                    }
                  >
                    {order.customerName || "Customer"}
                  </td>

                  <td className="p-4 whitespace-nowrap">₹{order.price}</td>
                  <td className="hidden md:table-cell p-4">
                    ₹{(order.price || 0) - (order.advancePaid || 0)}
                  </td>

                  <td className="hidden md:table-cell p-4">
                    {order.deliveryDate}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <button
                      onClick={() => router.push(`/orders/${order.id}/edit`)}
                      className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteData({
                          ...deleteData,
                          orderId: order.id,
                          isOpen: true,
                        });
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
