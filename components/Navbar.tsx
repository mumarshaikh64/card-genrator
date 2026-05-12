'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Users, LogOut } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';

function NavbarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  
  // Check if we are on a profile page (QR scan target)
  const isProfilePage = pathname.startsWith('/employee/');


  useEffect(() => {
    setSearch(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/employees?q=${encodeURIComponent(search)}`);
    } else {
      router.push(`/employees`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <nav className={`bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center ${isProfilePage ? 'justify-center' : 'justify-between'} sticky top-0 z-50 shadow-sm print:hidden gap-3`}>
      {/* Left: Logo */}
      <Link href="/" className={`flex items-center gap-2 shrink-0 hover:no-underline ${isProfilePage ? 'py-1' : ''}`}>
        <img 
          src="/logo.jpg" 
          alt="Company Logo" 
          className={`${isProfilePage ? 'h-16 sm:h-20' : 'h-12 sm:h-14'} object-contain transition-all duration-300`} 
        />
      </Link>

      {/* Middle: Search Bar - Hidden on profile page */}
      {!isProfilePage && (
        <div className="order-3 sm:order-2 w-full sm:flex-1 sm:max-w-md lg:max-w-xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="block w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </form>
        </div>
      )}

      {/* Right: View All Employees Button & Logout - Hidden on profile page */}
      {!isProfilePage && (
        <div className="order-2 sm:order-3 flex items-center gap-2">
          <Link 
            href="/employees"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-blue-200 whitespace-nowrap"
          >
            <Users className="w-4 h-4" />
            <span className="hidden xs:inline">Employees</span>
            <span className="inline xs:hidden">All</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border border-slate-200 hover:border-red-100"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b print:hidden"></div>}>
      <NavbarInner />
    </Suspense>
  );
}
