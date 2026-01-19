import { Inter } from "next/font/google";
import "./globals.css"; // <--- INI WAJIB ADA! Kalau dihapus, Tailwind mati.

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "FOLKSHOOT | Capture Your Soul",
  description: "Private Photobooth Session",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}