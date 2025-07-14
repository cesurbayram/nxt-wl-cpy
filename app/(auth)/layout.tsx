import Hero from "@/components/sign-in/hero";
import { Inter } from "next/font/google";
import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WatchLog - Sign In",
  description: "Sign in to WatchLog",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          <div className="flex-grow w-full flex justify-center items-center bg-[#6950e8]">
            <Hero />
          </div>
          <div className="w-full flex-grow">{children}</div>
        </div>
      </body>
    </html>
  );
}
