import "./globals.css";

export const metadata = {
  title: "Eventify",
  description: "Discover and create events worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
