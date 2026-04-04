import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarsForge - Marscoin Mining Pool",
  description: "Mine MARS to support the Martian Republic and Mars colonization efforts. Anonymous mining, automatic payouts, real-time statistics.",
  keywords: "marscoin, mining pool, cryptocurrency, scrypt, mars, blockchain",
};

function Footer() {
  return (
    <footer className="bg-[#1a1a2e] border-t border-[#2d3a5c] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#e77d11] font-semibold mb-3">MarsForge Pool</h3>
            <p className="text-gray-400 text-sm">
              Supporting the Martian Republic through decentralized mining.
            </p>
          </div>
          <div>
            <h3 className="text-[#e77d11] font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://marscoin.org" className="text-gray-400 hover:text-[#e77d11]">Marscoin.org</a></li>
              <li><a href="https://explore.marscoin.org" className="text-gray-400 hover:text-[#e77d11]">Block Explorer</a></li>
              <li><a href="https://github.com/marscoin" className="text-gray-400 hover:text-[#e77d11]">GitHub</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[#e77d11] font-semibold mb-3">Connect</h3>
            <p className="text-gray-400 text-sm">
              Stratum: mining-mars.com:3433
            </p>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-[#2d3a5c] text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} MarsForge - Open Source Mining Pool
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
