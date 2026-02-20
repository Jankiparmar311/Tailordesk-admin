"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import useAuthListener from "@/hooks/useAuthListener";
import { ToastContainer } from "react-toastify";

function AuthWrapper({ children }) {
  useAuthListener();
  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <ToastContainer />

      <AuthWrapper>{children}</AuthWrapper>
    </Provider>
  );
}
