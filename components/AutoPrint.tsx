'use client';

import { useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AutoPrint({ title, backUrl = '/employees' }: { title: string; backUrl?: string }) {
  const router = useRouter();

  useEffect(() => {
    // Delay slightly to ensure fonts and layout have settled before opening the print dialog
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-slate-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 print:hidden shadow-lg mb-8 rounded-2xl">
      <div className="flex items-center gap-3">
        <Link 
          href={backUrl} 
          className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="font-bold text-sm sm:text-base leading-tight">{title}</h2>
          <p className="text-xs text-slate-400">Print dialog triggered automatically. Adjust settings and print.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md"
        >
          <Printer className="w-4 h-4" />
          Print Again
        </button>
      </div>
    </div>
  );
}
