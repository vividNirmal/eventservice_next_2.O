"use client";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from '@/contexts/ThemeContext';

export function StoreProvider({ children }) {
  return <Provider store={store}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </Provider>;
}
