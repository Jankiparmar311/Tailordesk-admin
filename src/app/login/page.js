"use client";

import { useForm } from "react-hook-form";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Input from "@/components/input";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      }
    });

    return () => unsub();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const token = await userCred.user.getIdToken();
      Cookies.set("authToken", token, { expires: 7 });
      toast.success("Login successfully.");
      router.push("/dashboard");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("User not found");
      } else if (error.code === "auth/wrong-password") {
        toast.error("Incorrect password");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
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
      <div className="flex justify-center items-center bg-gray-100 px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-10 shadow-xl rounded-xl w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center">
            Login to TailorDesk
          </h2>

          <Input
            label="Email"
            name="email"
            type="email"
            register={register}
            error={errors.email}
            registerOptions={{ required: "Please enter email address." }}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            register={register}
            error={errors.password}
            registerOptions={{ required: "Please enter password." }}
          />

          <button
            className="bg-linear-to-r from-indigo-600 to-purple-600
text-white w-full py-3 rounded-md font-medium
hover:opacity-95 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Footer Links */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              Don’t have an account?{" "}
              <Link
                href="/signup"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>

            <p>
              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
