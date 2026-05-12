'use client';

import { getAllEmployees, deleteEmployee, Employee } from "@/app/actions";
import Link from "next/link";
import { ArrowLeft, UserX, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function EmployeesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || "";
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/login');
    }
    fetchEmployees();
  }, [query, router]);

  const fetchEmployees = async () => {
    setLoading(true);
    const result = await getAllEmployees(query);
    if (result.success) {
      setEmployees(result.data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}'s profile?`)) {
      setDeletingId(id);
      const result = await deleteEmployee(id);
      if (result.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
      } else {
        alert("Failed to delete: " + result.error);
      }
      setDeletingId(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = employees.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Generator
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Employee Database</h1>
          {query && <p className="text-sm text-slate-500 mt-1">Search results for: <span className="font-semibold">"{query}"</span></p>}
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <p className="text-blue-700 text-sm font-semibold">Total Employees: {employees.length}</p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <UserX className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No employees found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            {query ? "We couldn't find any employees matching your search query." : "You haven't generated any ID cards yet. Generate one from the home page to see it here."}
          </p>
          <Link href="/" className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Create First Profile
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="p-5">Employee</th>
                    <th className="p-5">Code / Dept</th>
                    <th className="p-5">Issue Date</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {emp.image ? (
                              <img src={emp.image} alt={emp.name} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-sm">
                                {emp.name.charAt(0)}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-none mb-1">{emp.name}</p>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{emp.jobTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="space-y-1">
                          <p className="text-sm font-mono font-bold text-slate-700">{emp.empCode}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-tighter border border-blue-100">
                            {emp.department}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-sm text-slate-600 font-medium">{emp.issueDate}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Verified</p>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/employee/${emp.id}`}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => router.push(`/?edit=${emp.id}`)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit Profile"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(emp.id, emp.name)}
                            disabled={deletingId === emp.id}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            title="Delete Profile"
                          >
                            {deletingId === emp.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-800 font-bold">{startIndex + 1}</span> to <span className="text-slate-800 font-bold">{Math.min(startIndex + itemsPerPage, employees.length)}</span> of <span className="text-slate-800 font-bold">{employees.length}</span> employees
              </p>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-12">
      <Suspense fallback={
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading Database...</p>
        </div>
      }>
        <EmployeesList />
      </Suspense>
    </div>
  );
}
