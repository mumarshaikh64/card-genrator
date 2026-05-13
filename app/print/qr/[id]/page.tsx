import { getEmployeeById, getNetworkBaseUrl } from "@/app/actions";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import AutoPrint from "@/components/AutoPrint";
import { User, Building } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrintQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getEmployeeById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const emp = result.data;
  
  // Detect base URL for QR code
  const host = (await headers()).get("host") || "localhost";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const networkIp = await getNetworkBaseUrl();
  const finalHost = host.includes("localhost") ? `${networkIp}:${host.split(":")[1] || "3000"}` : host;
  const profileUrl = `${protocol}://${finalHost}/employee/${id}`;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans flex flex-col items-center print:bg-white print:py-0 print:px-0">
      <div className="w-full max-w-2xl print:hidden">
        <AutoPrint title={`Print QR Code - ${emp.name}`} />
      </div>

      {/* Printable Area */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:max-w-none print:shadow-none print:border-none print:rounded-none flex flex-col items-center p-8 print:p-0 text-center relative print:block">
        {/* Subtle Decorative Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-sky-400 print:hidden"></div>

        {/* Company Logo */}
        <div className="h-16 mb-8 mt-2 flex items-center justify-center print:hidden">
          <img src="/logo.jpg" alt="Company Logo" className="h-full object-contain" />
        </div>

        {/* Main QR Code Container - Only this will show in Print */}
        <div className="relative p-5 bg-white rounded-2xl border-4 border-slate-100 shadow-inner mb-6 print:border-none print:shadow-none print:p-0 print:mb-0 print:w-full print:flex print:justify-center print:items-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(profileUrl)}`}
            alt="QR Code"
            className="w-56 h-56 print:w-96 print:h-96 object-contain block mx-auto"
          />
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm print:hidden">
            Scan to Verify
          </div>
        </div>

        {/* Employee Info */}
        <div className="w-full pt-4 border-t border-slate-100 print:hidden">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{emp.name}</h2>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">{emp.jobTitle}</p>

          <div className="inline-flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-xs text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {emp.empCode}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {emp.department}
            </span>
          </div>
        </div>

        {/* Footer Tag */}
        <p className="text-[10px] text-slate-400 mt-8 tracking-wide print:hidden">
          Official Access & Verification Identity
        </p>
      </div>
    </div>
  );
}
