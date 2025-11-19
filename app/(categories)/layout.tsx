import type { ReactNode } from 'react';
import Link from 'next/link';

export default function CategoriesSectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-slate-900">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white">
              99
            </span>
            <span>Rupeess</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/categories" className="hover:text-slate-900">
              Categories
            </Link>
            <Link href="/about" className="hover:text-slate-900">
              About
            </Link>
            <Link href="/contact" className="hover:text-slate-900">
              Contact
            </Link>
            <button className="rounded-full bg-slate-900 px-4 py-2 text-white shadow-lg shadow-slate-900/10">
              List your business
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
    </div>
  );
}

