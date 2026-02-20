"use client";

import { useEffect, useRef, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Input from "@/components/input";
import { uploadImages } from "@/lib/cloudinary";

export default function EditOrder() {
  const params = useParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", params?.orderId));

      if (snap.exists()) {
        const data = snap.data();
        reset(data);

        setExistingImages(data.images || []);
        setPreviews(data.images || []);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [params?.orderId, reset]);

  const handleFiles = (files) => {
    const arr = Array.from(files);

    setImages(arr);

    const urls = arr.map((file) => URL.createObjectURL(file));

    setPreviews((prev) => [...prev, ...urls]);
  };

  const onSubmit = async (data) => {
    let uploadedUrls = [];

    if (images.length) {
      setUploading(true);
      setProgress(0);
      uploadedUrls = await uploadImages(images, setProgress);
      setUploading(false);
    }

    await updateDoc(doc(db, "orders", params?.orderId), {
      ...data,
      images: [...existingImages, ...uploadedUrls],
      updatedAt: serverTimestamp(),
    });

    router.push(`/orders/${params?.orderId}`);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-xl font-semibold">Edit Order</h1>
        <p className="text-gray-500 text-sm">Update order information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Info */}
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Order Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Cloth Type"
              name="clothType"
              register={register}
              error={errors.clothType}
              registerOptions={{
                required: "Please enter cloth type.",
                setValueAs: (value) => value.trim(),
              }}
            />

            <Input
              label="Delivery Date"
              name="deliveryDate"
              type="date"
              register={register}
              error={errors.deliveryDate}
              registerOptions={{
                required: "Please select delivery date.",
                setValueAs: (value) => value.trim(),
              }}
            />

            <Input
              label="Price"
              name="price"
              type="number"
              register={register}
              error={errors.price}
              registerOptions={{
                required: "Please enter price.",
                setValueAs: (value) => value.trim(),
              }}
            />

            <Input
              label="Advance Paid"
              name="advancePaid"
              type="number"
              register={register}
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>

            <select
              {...register("status")}
              className="border border-gray-300 p-3 w-full rounded-md
                         focus:ring-2 focus:ring-indigo-500
                         focus:border-indigo-500 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6 space-y-3">
          <label className="text-sm font-medium">Cloth Images</label>

          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFiles(e.dataTransfer.files);
            }}
            className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:bg-gray-50"
          >
            Drag & drop images here or click to upload
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-3">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} className="w-full h-28 object-cover rounded" />

                <button
                  type="button"
                  onClick={() => {
                    const updatedPrev = previews.filter((_, idx) => idx !== i);
                    setPreviews(updatedPrev);

                    const updatedExisting = existingImages.filter(
                      (_, idx) => idx !== i,
                    );
                    setExistingImages(updatedExisting);
                  }}
                  className="absolute top-1 right-1 bg-black text-white px-2 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 rounded h-2">
              <div
                className="bg-indigo-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-4 py-2 rounded-md w-full hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full hover:bg-indigo-700"
            disabled={uploading}
          >
            {uploading ? "Updating..." : "Update Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
