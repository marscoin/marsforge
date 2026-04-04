'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/pool', label: 'Pool Stats' },
    { href: '/blocks', label: 'Blocks' },
    { href: '/miners', label: 'Miners' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e]/95 backdrop-blur border-b border-[#2d3a5c]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <img src="/images/mars-coin.webp" alt="MARS" className="w-8 h-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-[#e77d11] to-[#ff6b35] bg-clip-text text-transparent">
              MarsForge
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`transition ${isActive(l.href) ? 'text-[#e77d11]' : 'text-[#f4e3d7] hover:text-[#e77d11]'}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/start" className="btn-primary text-sm">
              Start Mining
            </Link>
          </div>

          {/* Hamburger button */}
          <button
            className="md:hidden p-2 text-[#f4e3d7] hover:text-[#e77d11] transition"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#2d3a5c] bg-[#1a1a2e]/98 backdrop-blur">
          <div className="px-4 py-3 space-y-2">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`block py-2 px-3 rounded-lg transition ${
                  isActive(l.href)
                    ? 'text-[#e77d11] bg-[#1e2746]'
                    : 'text-[#f4e3d7] hover:text-[#e77d11] hover:bg-[#1e2746]'
                }`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/start"
              className="block py-2 px-3 rounded-lg btn-primary text-center text-sm mt-2"
              onClick={() => setOpen(false)}
            >
              Start Mining
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
