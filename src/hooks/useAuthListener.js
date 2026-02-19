"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function useAuthListener() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch Firestore user doc
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();

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
        }
      } else {
        dispatch(clearUser());
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [dispatch]);
}
