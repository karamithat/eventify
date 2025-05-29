"use client";

import "./globals.css";
import AuthSessionProvider from "./components/ui/SessionProvider";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 dakika
          },
        },
      })
  );
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AuthSessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
