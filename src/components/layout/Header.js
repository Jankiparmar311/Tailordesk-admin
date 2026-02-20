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
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Header({ onMenuClick }) {
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
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex justify-between items-center relative">
      {/* Left Side - Mobile Search Icon */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>

        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Desktop Search */}
        {/* <div className="hidden md:flex items-center w-full max-w-md bg-slate-100 rounded-lg px-3 py-2 relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            placeholder="Search orders, customers..."
            className="bg-transparent w-full outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white shadow rounded-lg border border-gray-200 z-50">
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
                  <p className="font-medium truncate">
                    {item.type === "order" ? item.customerName : item.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {item.type.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div> */}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification */}
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
        </button>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.email?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            <span className="text-sm font-medium hidden md:block text-gray-700 truncate max-w-[120px]">
              {user?.name}
            </span>

            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-60 sm:w-64 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="px-4 sm:px-5 py-4 border-b border-gray-200">
                <p className="font-semibold text-gray-800">
                  {user?.name || "User"}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>

              <div className="py-2">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-2 text-sm hover:bg-gray-100"
                >
                  <UserCircleIcon className="w-5 h-5 text-gray-500" />
                  Edit profile
                </button>

                <button className="w-full flex items-center gap-3 px-4 sm:px-5 py-2 text-sm hover:bg-gray-100">
                  <InformationCircleIcon className="w-5 h-5 text-gray-500" />
                  Support
                </button>

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => setIsDeleteModal(true)}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-2 text-sm text-red-600 hover:bg-red-50"
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
