"use client";

import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Input from "@/components/input";
import Cookies from "js-cookie";
import Link from "next/link";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

export default function SignupPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const uid = userCred.user.uid;
      const user = userCred.user;
      const token = await user.getIdToken();

      Cookies.set("authToken", token, { expires: 7 });

      const shopRef = await addDoc(collection(db, "shops"), {
        shopName: data.shopName,
        ownerName: data.ownerName,
        phone: data.phone,
        createdAt: serverTimestamp(),
      });

      const shopId = shopRef.id;

      await setDoc(doc(db, "users", uid), {
        name: data.ownerName,
        email: data.email,
        shopId,
        role: "owner",
        createdAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left branding side */}
      <div className="hidden md:flex flex-col justify-center items-center bg-indigo-600 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">TailorDesk</h1>
        <p className="text-lg text-center max-w-sm opacity-90">
          Manage orders, customers, and measurements effortlessly.
        </p>
      </div>

      {/* Form side */}
      <div className="flex justify-center items-center bg-gray-100 px-4 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-10 shadow-xl rounded-xl w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">
            Create Shop Account
          </h2>

          <Input
            label="Owner Name"
            name="ownerName"
            register={register}
            error={errors.ownerName}
            registerOptions={{ required: "Please enter owner name." }}
          />

          <Input
            label="Shop Name"
            name="shopName"
            register={register}
            error={errors.shopName}
            registerOptions={{ required: "Please enter shop name." }}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            registerOptions={{ required: "Please enter email." }}
          />

          <Input
            label="Phone"
            name="phone"
            register={register}
            error={errors.phone}
            registerOptions={{ required: "Please enter phone number." }}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            registerOptions={{
              required: "Please enter password.",
              minLength: {
                value: 6,
                message: "Min 6 characters.",
              },
            }}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register}
            error={errors.confirmPassword}
            registerOptions={{
              required: "Please enter confirm password.",
              validate: (value) =>
                value === password || "Passwords do not match.",
            }}
          />

          <button
            className="bg-linear-to-r from-indigo-600 to-purple-600
text-white w-full py-3 rounded-md font-medium
hover:opacity-95 transition"
          >
            Create Account
          </button>

          {/* <button
            type="button"
            onClick={handleGoogleSignup}
            className="border w-full py-3 rounded-md hover:bg-gray-50 transition"
          >
            Continue with Google
          </button> */}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
