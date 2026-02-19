"use client";

import { useForm } from "react-hook-form";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/components/input";

import { Country, State, City } from "country-state-city";

export default function AddCustomer() {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const countries = Country.getAllCountries();
  const states = State.getStatesOfCountry(countryCode);
  const cities = City.getCitiesOfState(countryCode, stateCode);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await addDoc(collection(db, "customers"), {
        shopId: user.shopId,
        name: data.name,
        phone: data.phone,
        address: data.address || "",

        country: data.country,
        countryCode: data.countryCode, // ✅ added
        state: data.state,
        city: data.city,

        lastMeasurements: {
          chest: data.chest || "",
          waist: data.waist || "",
          shoulder: data.shoulder || "",
          sleeve: data.sleeve || "",
          length: data.length || "",
        },

        notes: data.notes || "",
        createdAt: serverTimestamp(),
      });

      router.push("/customers");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-8">Add Customer</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="font-medium text-gray-700">Customer Information</h2>

            <Input
              label="Customer Name"
              name="name"
              register={register}
              registerOptions={{ required: "Name is required" }}
              error={errors.name}
            />

            <Input
              label="Phone"
              name="phone"
              register={register}
              registerOptions={{ required: "Phone is required" }}
              error={errors.phone}
            />

            <Input
              label="Address"
              name="address"
              register={register}
              error={errors.address}
            />

            {/* Country */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Country
              </label>

              <select
                value={countryCode || ""}
                onChange={(e) => {
                  const code = e.target.value;
                  const selected = Country.getCountryByCode(code);

                  setCountryCode(code);

                  // store values in form
                  setValue("country", selected?.name || "");
                  setValue("countryCode", code);

                  // reset dependent fields
                  setValue("state", "");
                  setValue("city", "");
                }}
                className="border border-gray-200 rounded-md p-3 w-full mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input type="hidden" {...register("country")} />
              <input type="hidden" {...register("countryCode")} />
            </div>

            {/* State */}
            <div>
              <label className="text-sm font-medium text-gray-700">State</label>

              <select
                {...register("state")}
                onChange={(e) => {
                  const selected = states.find(
                    (s) => s.name === e.target.value,
                  );
                  setStateCode(selected?.isoCode || "");
                  setValue("city", "");
                }}
                className="border border-gray-200 rounded-md p-3 w-full mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="text-sm font-medium text-gray-700">City</label>

              <select
                {...register("city")}
                className="border border-gray-200 rounded-md p-3 w-full mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select City</option>
                {cities.map((c, i) => (
                  <option key={i}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Measurements */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h2 className="font-medium text-gray-700">Measurements</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Input label="Chest" name="chest" register={register} />
              <Input label="Waist" name="waist" register={register} />
              <Input label="Shoulder" name="shoulder" register={register} />
              <Input label="Sleeve" name="sleeve" register={register} />
              <Input label="Length" name="length" register={register} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="border border-gray-200 rounded-md p-3 w-full mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={4}
              {...register("notes")}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition"
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </form>
      </div>
    </div>
  );
}
