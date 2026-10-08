"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, Mail, Shield, Sparkles, ExternalLink, GraduationCap } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const counsellorPhone = process.env.COUNSELLOR_PHONE || "+919876543210";

  if (pathname?.startsWith("/editor")) {
    return null;
  }

  return (
    <footer className="bg-lt-blue-dark text-white pt-16 pb-12 border-t-4 border-lt-yellow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="inline-flex items-center gap-3 bg-white p-2.5 rounded-2xl shadow-md">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="Learners Track"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col pr-2">
                <span className="font-heading font-extrabold text-sm text-lt-blue tracking-tight leading-tight">
                  LEARNERS TRACK
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  EdTech Career Hub
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering students, freshers, and professionals across India with AI-powered resume intelligence, industry-aligned tech courses, and placement guidance.
            </p>
            <div className="flex items-center gap-3 text-xs text-lt-yellow font-medium">
              <Sparkles className="w-4 h-4 text-lt-yellow" />
              <span>Calibrated for Indian Recruiters & ATS</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-base text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-lt-yellow" />
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-300 hover:text-lt-yellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/check" className="text-slate-300 hover:text-lt-yellow transition-colors font-medium">
                  Free Resume Review
                </Link>
              </li>
              <li>
                <Link href="/improve" className="text-slate-300 hover:text-lt-yellow transition-colors">
                  Bullet Point Improver
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-slate-300 hover:text-lt-yellow transition-colors">
                  Resume & ATS Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-lt-yellow transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Programs */}
          <div>
            <h4 className="font-heading font-bold text-base text-white uppercase tracking-wider mb-4">
              Career Programs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>Full Stack Web Development</li>
              <li>Data Analytics & Power BI</li>
              <li>Python & Backend Systems</li>
              <li>Digital Marketing & Growth</li>
              <li>Software Testing & QA</li>
              <li>Resume & Interview Masterclass</li>
            </ul>
          </div>

          {/* Student Support & Counsellor */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-base text-white uppercase tracking-wider">
              Need Career Guidance?
            </h4>
            <p className="text-slate-300 text-sm">
              Speak to our senior career counselors to build an unbeatable career trajectory.
            </p>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${counsellorPhone.replace(/[^0-9]/g, "")}?text=Hi%20Learners%20Track,%20I%20would%20like%20guidance%20on%20my%20resume%20and%20career.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-lt-yellow hover:bg-lt-yellow-hover text-lt-blue-dark font-heading font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow w-full justify-center"
              >
                <Phone className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-300 justify-center pt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Free Career Counselling</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Learners Track. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <span className="text-slate-400">Immediate Resume Text Deletion Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
