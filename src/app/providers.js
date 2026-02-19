"use client";

import { store } from "@/store";
import { Provider } from "react-redux";
import useAuthListener from "@/hooks/useAuthListener";

function AuthWrapper({ children }) {
  useAuthListener();
  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthWrapper>{children}</AuthWrapper>
    </Provider>
  );
}
