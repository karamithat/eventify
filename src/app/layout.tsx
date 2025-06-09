"use client";

import "./globals.css";
import AuthSessionProvider from "./components/ui/SessionProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

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
