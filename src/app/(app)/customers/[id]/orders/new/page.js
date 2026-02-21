"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Input from "@/components/input";
import { uploadImages } from "@/lib/cloudinary";

export default function NewOrder() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id;
  const fileInputRef = useRef(null);

  const user = useSelector((state) => state.auth.user);

  const [customer, setCustomer] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  // Load customer
  useEffect(() => {
    const loadCustomer = async () => {
      const snap = await getDoc(doc(db, "customers", customerId));

      if (snap.exists()) {
        const data = snap.data();
        setCustomer(data);

        const m = data.lastMeasurements || {};

        setValue("chest", m.chest);
        setValue("waist", m.waist);
        setValue("shoulder", m.shoulder);
        setValue("sleeve", m.sleeve);
        setValue("length", m.length);
      }
    };

    loadCustomer();
  }, [customerId, setValue]);

  const onSubmit = async (data) => {
    let imageUrls = [];

    setUploading(true);
    setProgress(0);
    if (images.length) {
      imageUrls = await uploadImages(images, setProgress);
    }
    setUploading(false);

    await addDoc(collection(db, "orders"), {
      shopId: user.shopId,
      customerId,
      customerName: customer.name,
      clothType: data.clothType,
      price: Number(data.price),
      advancePaid: Number(data.advancePaid || 0),
      deliveryDate: data.deliveryDate,
      status: "pending",

      measurements: {
        chest: data.chest,
        waist: data.waist,
        shoulder: data.shoulder,
        sleeve: data.sleeve,
        length: data.length,
      },

      images: imageUrls,
      notes: data.notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    router.push(`/customers/${customerId}`);
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files);

    setImages((prev) => [...prev, ...newFiles]);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  if (!customer) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-xl font-semibold">New Order — {customer.name}</h1>
        <p className="text-gray-500 text-sm">
          Create stitching order for customer
        </p>
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
              registerOptions={{
                required: "Please enter cloth type.",
                setValueAs: (value) => value.trim(),
              }}
              error={errors.clothType}
            />

            <Input
              label="Delivery Date"
              name="deliveryDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              register={register}
              registerOptions={{
                required: "Please select delivery date.",
                setValueAs: (value) => value.trim(),
              }}
              error={errors.deliveryDate}
            />

            <Input
              label="Price"
              name="price"
              type="number"
              register={register}
              registerOptions={{
                required: "Please enter price.",
                setValueAs: (value) => value.trim(),
              }}
              error={errors.price}
            />

            <Input
              label="Advance Paid"
              name="advancePaid"
              type="number"
              register={register}
              registerOptions={{
                validate: (value, formValues) => {
                  const price = Number(formValues.price || 0);
                  const advance = Number(value || 0);

                  if (advance > price) {
                    return "Advance paid cannot be greater than price.";
                  }

                  return true;
                },
              }}
              error={errors.advancePaid}
            />
          </div>
        </div>

        {/* Measurements */}
        <div className="bg-white shadow rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Measurements</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Chest" name="chest" register={register} />
            <Input label="Waist" name="waist" register={register} />
            <Input label="Shoulder" name="shoulder" register={register} />
            <Input label="Sleeve" name="sleeve" register={register} />
            <Input label="Length" name="length" register={register} />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white shadow rounded-xl p-6">
          <label className="text-sm font-medium">Notes</label>

          <textarea
            {...register("notes")}
            rows={3}
            className="border border-gray-200 p-3 w-full rounded-md mt-1 outline-none
                       focus:ring-2 focus:ring-indigo-500"
            placeholder="Special instructions..."
          />
        </div>
        <div className="bg-white shadow rounded-xl p-6 space-y-3">
          <label className="text-sm font-medium">Cloth Images</label>

          <div
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer"
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

          <div className="grid grid-cols-3 gap-3 mt-4">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} className="w-full h-28 object-cover rounded" />

                <button
                  type="button"
                  onClick={() => {
                    const newImgs = images.filter((_, idx) => idx !== i);
                    const newPrev = previews.filter((_, idx) => idx !== i);
                    setImages(newImgs);
                    setPreviews(newPrev);
                  }}
                  className="absolute top-1 right-1 bg-black text-white px-2 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {uploading && (
            <div className="w-full bg-gray-200 rounded h-2 mt-2">
              <div
                className="bg-indigo-600 h-2 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="border px-4 py-2 rounded-md w-full hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            className="bg-indigo-600 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md w-full hover:bg-indigo-700"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
