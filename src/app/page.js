"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";

export default function Home() {
  const { user, loading } = useSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div>
      <Skeleton height="100%" width="100%" />
    </div>
  );
}
