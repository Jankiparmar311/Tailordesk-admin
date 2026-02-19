"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Cookies from "js-cookie";
import { clearUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ConfirmationModal from "../common/ConfirmationModal";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchChange(search);
    }, 400); // wait 400ms

    return () => clearTimeout(timer);
  }, [search]);

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    Cookies.remove("authToken");
    dispatch(clearUser());
    setLoading(false);
    router.push("/login");
    setIsDeleteModal(false);
  };

  const handleSearchChange = async (value) => {
    if (!value) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // Fetch orders
      const orderSnap = await getDocs(
        query(collection(db, "orders"), limit(5)),
      );

      const orders = orderSnap.docs
        .map((doc) => ({ id: doc.id, type: "order", ...doc.data() }))
        .filter((o) =>
          o.customerName?.toLowerCase().includes(value.toLowerCase()),
        );

      // Fetch customers
      const customerSnap = await getDocs(
        query(collection(db, "customers"), limit(5)),
      );

      const customers = customerSnap.docs
        .map((doc) => ({ id: doc.id, type: "customer", ...doc.data() }))
        .filter((c) => c.name?.toLowerCase().includes(value.toLowerCase()));

      setResults([...orders, ...customers]);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <header className="h-18 bg-white border-b border-gray-200 px-6 flex justify-between items-center">
      {/* Search */}
      <div className="hidden md:flex items-center w-full max-w-md bg-slate-100 rounded-lg px-3 py-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
        <input
          placeholder="Search orders, customers..."
          className="bg-transparent w-full outline-none text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          // onKeyDown={handleSearchChange}
        />
        {search && (
          <div className="absolute mt-16 w-full max-w-md bg-white shadow rounded-lg border border-gray-200 z-50">
            {loading && (
              <p className="p-3 text-sm text-gray-500">Searching...</p>
            )}

            {!loading && results.length === 0 && (
              <p className="p-3 text-sm text-gray-500">No results found</p>
            )}

            {results.map((item) => (
              <div
                key={item.id}
                className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => {
                  if (item.type === "order") {
                    router.push(`/orders/${item.id}`);
                  } else {
                    router.push(`/customers/${item.id}`);
                  }
                  setSearch("");
                  setResults([]);
                }}
              >
                <p className="font-medium">
                  {item.type === "order" ? item.customerName : item.name}
                </p>

                <p className="text-gray-500 text-xs">
                  {item.type.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <BellIcon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>

            <span className="text-sm font-medium hidden sm:block text-gray-700">
              {user?.email}
            </span>

            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
              {/* User Info */}
              <div className="px-5 py-4 border-b border-gray-200">
                <p className="font-semibold text-gray-800">
                  {user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-3 px-5 py-2 cursor-pointer text-sm hover:bg-gray-100"
                >
                  <UserCircleIcon className="w-5 h-5 text-gray-500" />
                  Edit profile
                </button>

                {/* <button
                  onClick={() => router.push("/settings")}
                  className="w-full flex items-center gap-3 px-5 py-2 text-sm cursor-pointer hover:bg-gray-100"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-gray-500" />
                  Account settings
                </button> */}

                <button className="w-full flex items-center gap-3 px-5 py-2 text-sm cursor-pointer hover:bg-gray-100">
                  <InformationCircleIcon className="w-5 h-5 text-gray-500" />
                  Support
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => setIsDeleteModal(true)}
                  className="w-full flex items-center gap-3 px-5 py-2 text-sm cursor-pointer text-red-600 hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isDeleteModal}
        onClose={() => setIsDeleteModal(false)}
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmText="Sign out"
        onConfirm={handleLogout}
        loading={loading}
      />
    </header>
  );
}
