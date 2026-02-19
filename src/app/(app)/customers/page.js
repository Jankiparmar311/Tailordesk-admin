"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function CustomersPage() {
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteData, setDeleteData] = useState({
    isOpen: false,
    loading: false,
    customerId: null,
  });

  const fetchCustomers = async () => {
    const q = query(
      collection(db, "customers"),
      where("shopId", "==", user.shopId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.shopId) return;
    fetchCustomers();
  }, [user]);

  const handleDelete = async () => {
    setDeleteData({
      ...deleteData,
      loading: true,
    });
    await deleteDoc(doc(db, "customers", deleteData?.customerId));
    setDeleteData({
      ...deleteData,
      loading: false,
      isOpen: false,
    });
    fetchCustomers();
  };

  const filteredCustomers = customers.filter((c) => {
    const text = search.toLowerCase().trim();

    return c.name?.toLowerCase().includes(text) || c.phone?.includes(text);
  });

  if (loading) return <p className="p-6 text-gray-500">Loading customers...</p>;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-gray-500 text-sm">Total Customers</p>
          <h2 className="text-3xl font-bold mt-2">{customers.length}</h2>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center bg-slate-100 border border-gray-200 rounded-lg px-3 py-2 w-full md:w-72">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            placeholder="Search customers..."
            className="bg-transparent outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={() => router.push("/customers/add")}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          + Add Customer
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Phone</th>
                <th className="p-4 text-left font-medium">Address</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers?.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    {search ? "No customer found" : "No customers yet"}
                  </td>
                </tr>
              )}

              {filteredCustomers?.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => router.push(`/customers/${c.id}`)}
                    >
                      {/* Avatar */}
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold">
                        {c.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* Name + Email */}
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">{c.phone}</td>
                  <td className="p-4">{c.address || "-"}</td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.push(`/customers/${c.id}/edit`)}
                        className="p-2 rounded-lg cursor-pointer hover:bg-indigo-50 text-indigo-600"
                      >
                        <PencilSquareIcon className="h-5 w-5 " />
                      </button>

                      <button
                        onClick={() => {
                          setDeleteData({
                            ...deleteData,
                            customerId: c.id,
                            isOpen: true,
                          });
                        }}
                        className="p-2 rounded-lg cursor-pointer hover:bg-red-50 text-red-600"
                      >
                        <TrashIcon className="h-5 w-5 " />
                      </button>
                    </div>
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
        title="Delete Customer"
        message="Are you sure you want to delete this customer?"
        confirmText="Delete"
        onConfirm={handleDelete}
        loading={deleteData?.loading}
      />
    </div>
  );
}

{
  /* <td className="p-4">
  <span
    className={`px-3 py-1 text-xs rounded-full font-medium ${
      c.status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-gray-200 text-gray-600"
    }`}
  >
    {c.status}
  </span>
</td> */
}
