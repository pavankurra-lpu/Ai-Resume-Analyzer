"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, FileText, CheckCircle2 } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Check Resume", href: "/check" },
    { name: "Improve a Bullet", href: "/improve" },
    { name: "Resume Guide", href: "/guide" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (pathname?.startsWith("/editor")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-lt-yellow shadow-sm flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="Learners Track Logo"
                fill
                sizes="48px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg sm:text-xl text-lt-blue tracking-tight leading-tight group-hover:text-lt-blue-dark transition-colors">
                LEARNERS <span className="text-lt-blue">TRACK</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                AI Resume Checker
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors duration-150 relative py-1 ${
                  isActive(link.href)
                    ? "text-lt-blue font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-lt-blue after:rounded-full"
                    : "text-slate-600 hover:text-lt-blue"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/check"
              className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-bold text-sm px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-lt-blue" />
              <span>Check my resume</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-lt-blue hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-lt-blue"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive(link.href)
                    ? "bg-lt-bg-soft text-lt-blue font-bold"
                    : "text-slate-700 hover:bg-slate-50 hover:text-lt-blue"
                }`}
              >
                {link.name === "Home" && <CheckCircle2 className="w-5 h-5 text-lt-blue" />}
                {link.name === "Check Resume" && <FileText className="w-5 h-5 text-lt-blue" />}
                {link.name === "Improve a Bullet" && <Sparkles className="w-5 h-5 text-lt-yellow" />}
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/check"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-bold text-base px-6 py-3.5 rounded-xl shadow-md transition-all"
              >
                <Sparkles className="w-5 h-5 text-lt-blue" />
                <span>Check my resume free</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
