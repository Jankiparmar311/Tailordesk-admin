"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/input";

import { Country, State, City } from "country-state-city";

export default function EditCustomer() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchCustomer = async () => {
      const snap = await getDoc(doc(db, "customers", params?.id));

      if (snap.exists()) {
        const data = snap.data();

        setValue("name", data.name);
        setValue("phone", data.phone);
        setValue("address", data.address);

        setValue("chest", data.lastMeasurements?.chest);
        setValue("waist", data.lastMeasurements?.waist);
        setValue("shoulder", data.lastMeasurements?.shoulder);
        setValue("sleeve", data.lastMeasurements?.sleeve);
        setValue("length", data.lastMeasurements?.length);

        setValue("notes", data.notes);

        // Location
        setValue("country", data.country);
        setValue("state", data.state);
        setValue("city", data.city);

        // Load dependent dropdowns
        const country = countries.find((c) => c.name === data.country);
        if (country) {
          setCountryCode(country.isoCode);

          const statesData = State.getStatesOfCountry(country.isoCode);
          setStates(statesData);

          const stateObj = statesData.find((s) => s.name === data.state);
          if (stateObj) {
            setStateCode(stateObj.isoCode);

            const citiesData = City.getCitiesOfState(
              country.isoCode,
              stateObj.isoCode,
            );
            setCities(citiesData);
          }
        }
      }

      setLoading(false);
    };

    fetchCustomer();
  }, [params?.id, setValue, countries]);

  const onSubmit = async (data) => {
    await updateDoc(doc(db, "customers", params?.id), {
      name: data.name,
      phone: data.phone,
      address: data.address,

      country: data.country,
      state: data.state,
      city: data.city,

      lastMeasurements: {
        chest: data.chest,
        waist: data.waist,
        shoulder: data.shoulder,
        sleeve: data.sleeve,
        length: data.length,
      },

      notes: data.notes,
    });

    router.push("/customers");
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-8">Edit Customer</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Customer Info */}
          <div className="space-y-4">
            <h2 className="font-medium text-gray-700">Customer Information</h2>

            <Input
              label="Customer Name"
              name="name"
              register={register}
              registerOptions={{ required: "Name required" }}
              error={errors.name}
            />

            <Input
              label="Phone"
              name="phone"
              register={register}
              registerOptions={{ required: "Phone required" }}
              error={errors.phone}
            />

            <Input label="Address" name="address" register={register} />

            {/* Country */}
            <label className="text-sm font-medium text-gray-700">Country</label>
            <select
              {...register("country")}
              className="border border-gray-200 p-3 rounded-md w-full"
              onChange={(e) => {
                const selected = countries.find(
                  (c) => c.name === e.target.value,
                );
                setCountryCode(selected?.isoCode || "");
                setStates(State.getStatesOfCountry(selected?.isoCode || ""));
                setCities([]);
                setValue("state", "");
                setValue("city", "");
              }}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode}>{c.name}</option>
              ))}
            </select>

            {/* State */}
            <label className="text-sm font-medium text-gray-700">State</label>

            <select
              {...register("state")}
              className="border p-3 border-gray-200 rounded-md w-full"
              onChange={(e) => {
                const selected = states.find((s) => s.name === e.target.value);
                setStateCode(selected?.isoCode || "");
                setCities(
                  City.getCitiesOfState(countryCode, selected?.isoCode || ""),
                );
                setValue("city", "");
              }}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.isoCode}>{s.name}</option>
              ))}
            </select>

            {/* City */}
            <label className="text-sm font-medium text-gray-700">City</label>

            <select
              {...register("city")}
              className="border border-gray-200 p-3 rounded-md w-full"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.name}>{city.name}</option>
              ))}
            </select>
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

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition">
            Update Customer
          </button>
        </form>
      </div>
    </div>
  );
}
