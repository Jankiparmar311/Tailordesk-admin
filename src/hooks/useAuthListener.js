"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

async function waitForUserDoc(uid, retries = 10, delay = 300) {
  const ref = doc(db, "users", uid);

  for (let i = 0; i < retries; i++) {
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data();

    await new Promise((res) => setTimeout(res, delay));
  }

  return null;
}

export default function useAuthListener() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // wait until firestore user exists
        const data = await waitForUserDoc(user.uid);

        if (!data) {
          console.error("User doc not found after signup");
          return;
        }

        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            shopId: data.shopId,
            role: data.role,
            name: data.name,
            photoURL: data?.photoURL || "",
            state: data?.state,
            city: data?.city,
            country: data?.country,
            address: data?.address,
          }),
        );
      } else {
        dispatch(clearUser());
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [dispatch, router]);
}
