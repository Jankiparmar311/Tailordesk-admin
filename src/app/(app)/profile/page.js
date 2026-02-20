"use client";

import EditProfileModal from "@/components/profile/EditProfileModal";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user?.uid) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "profile-images");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!data.secure_url) throw new Error("Upload failed");

      // Save image URL in Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: data.secure_url,
      });

      // Update local UI
      setProfile((prev) => ({
        ...prev,
        photoURL: data.secure_url,
      }));
      toast.success("Image upload successfully.");
    } catch (err) {
      toast.error("Image upload failed");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setProfile(snap.data());
      }
    };

    loadProfile();
  }, [user]);

  const fullAddress = [
    profile?.address,
    profile?.city,
    profile?.state,
    profile?.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (!profile) {
    return (
      <div className="p-6 space-y-4 max-w-6xl animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex gap-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="space-y-3 flex-1">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="text-2xl font-semibold">User Profile</h1>

      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div
            className={`relative group w-20 h-20 rounded-full overflow-hidden border cursor-pointer ${
              dragActive ? "ring-2 ring-indigo-500" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleAvatarUpload}
          >
            {/* Avatar image */}
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <label className="cursor-pointer text-white">
                <PhotoIcon className="w-6 h-6" />

                <input type="file" hidden onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {profile?.name || "User"}
            </h2>
            <p className="text-gray-500 capitalize">
              {profile?.role || "Owner"}
            </p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
        >
          Edit
        </button>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between mb-5">
          <h3 className="font-semibold text-lg">Personal Information</h3>

          <button
            onClick={() => setOpenModal(true)}
            className="text-sm border border-gray-200 px-3 py-1 rounded hover:bg-gray-100"
          >
            Edit
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <InfoItem label="Email" value={user?.email} />
          <InfoItem label="Role" value={profile?.role || "Owner"} />
          <InfoItem label="Phone" value={profile?.phone} />
        </div>
      </div>

      {/* Address */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between mb-5">
          <h3 className="font-semibold text-lg">Address</h3>

          <button
            onClick={() => setOpenModal(true)}
            className="text-sm border border-gray-200 px-3 py-1 rounded hover:bg-gray-100"
          >
            Edit
          </button>
        </div>

        <p className="text-gray-700">
          {fullAddress || "No address added yet. Click edit to update."}
        </p>
      </div>

      <EditProfileModal
        open={openModal}
        user={user}
        profile={profile}
        onClose={() => setOpenModal(false)}
        onSaved={(data) => setProfile((prev) => ({ ...prev, ...data }))}
      />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
