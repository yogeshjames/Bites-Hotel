"use client"; // ✅ Add this to make it a Client Component

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastContainer position="top-right" autoClose={3000} /> 
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
