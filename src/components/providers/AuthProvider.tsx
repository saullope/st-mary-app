'use client';

import { Provider } from "react-redux";
import { store } from "@/store";

type Props = {
  children: React.ReactNode;
}

export const AuthProvider = ({children}: Props) => {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}