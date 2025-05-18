import "./globals.css";
import AuthSessionProvider from "./components/ui/SessionProvider";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Eventify",
  description: "Find events near you",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
