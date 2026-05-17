import { getEmployeeById, getNetworkBaseUrl } from "@/app/actions";
import Link from "next/link";
import { CheckCircle, ArrowLeft, User, Globe } from "lucide-react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function EmployeeProfile({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8 px-4 font-sans">
      
      {/* Top Header Section */}
      <div className="w-full max-w-4xl flex flex-col items-center justify-center mb-8 gap-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 flex flex-col items-center gap-3">
          Employee Verification
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 shadow-sm">
            <CheckCircle className="w-4 h-4" />
            Verified Identity
          </div>
        </h1>
      </div>

      {/* Cards Container - Reuse the exact design from home page */}
      <div className="flex flex-col xl:flex-row gap-8 items-center justify-center z-10 relative mb-12">

          {/* FRONT FACE */}
          <div className="relative w-[340px] h-[525px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 shrink-0 transform hover:scale-[1.02] transition-transform duration-500">
            {/* Background Image */}
            <img src="/card.svg" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
            
            {/* Logo Area */}
            <div className="relative z-10 w-full flex justify-center">
              <div className="bg-white rounded-b-[18px] shadow-sm flex items-center justify-center overflow-hidden h-[90px] w-[230px]">
                <img src="/logo.jpg" alt="Company Logo" className="w-full h-full object-contain scale-[1.2]" />
              </div>
            </div>

            {/* Profile Image */}
            <div className="relative z-10 flex justify-center mt-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                {!emp.image ? (
                  <User className="w-16 h-16 text-slate-300" />
                ) : (
                  <img src={emp.image} alt={emp.name} className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            {/* Employee Details Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center pt-4 px-8 pb-10">
              <h2 className="text-2xl font-bold text-[#4c9fd6] mb-0.5 text-center leading-tight">{emp.name}</h2>
              <p className="text-sm text-slate-600 font-medium mb-6 uppercase tracking-wider">{emp.jobTitle}</p>

              <div className="w-full space-y-2.5 mt-2">
                <div className="flex items-baseline">
                  <span className="w-24 text-[12px] font-bold text-black">Emp Code</span>
                  <span className="text-[12px] font-bold text-black mr-2">:</span>
                  <span className="text-[12px] text-black font-semibold flex-1 leading-tight">{emp.empCode}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-24 text-[12px] font-bold text-black">Department</span>
                  <span className="text-[12px] font-bold text-black mr-2">:</span>
                  <span className="text-[12px] text-black font-semibold flex-1 leading-tight">{emp.department}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-24 text-[12px] font-bold text-black">Issue Date</span>
                  <span className="text-[12px] font-bold text-black mr-2">:</span>
                  <span className="text-[12px] text-black font-semibold flex-1 leading-tight">{emp.issueDate}</span>
                </div>
                <div className="flex items-baseline">
                  <span className="w-24 text-[12px] font-bold text-black">Address</span>
                  <span className="text-[12px] font-bold text-black mr-2">:</span>
                  <span className="text-[12px] text-black font-semibold flex-1 leading-tight">{emp.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="relative w-[340px] h-[525px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 shrink-0 transform hover:scale-[1.02] transition-transform duration-500">
            <img src="/card.svg" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
            
            <div className="pt-4 px-4 text-center z-10 relative">
              <p className="text-[11px] text-white font-medium leading-relaxed tracking-wide">
                This ID Card is property of Rehmani<br />Technologies and marketing services Pvt Ltd.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mt-3 z-10 relative">
              <div className="bg-white p-2 border-[6px] border-[#418bbc] shadow-md w-[160px] h-[160px]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(profileUrl)}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Details */}
            <div className="mt-6 px-7 z-10 relative" style={{ marginTop: "40px" }}>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Residences</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1 leading-tight">{emp.companyAddress || "-"}</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Phone</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1">{emp.companyPhone || "-"}</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Email</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1">{emp.companyEmail || "-"}</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Web</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1">{emp.companyWeb || "-"}</span>
              </div>
            </div>

            {/* Lost/Found */}
            <div className="mt-4 px-7 z-10 relative">
              <p className="text-[9px] text-[#418bbc] mb-0.5">If lost/found please report at below :</p>
              <p className="text-[8.5px] text-[#418bbc] leading-[1.4]">
                Rehmani Technologies pvt ltd ,Bypass Road Handwara-193221.<br />
                E: helpdesk@ar-techmarketing.in<br />
                P: 01955295310
              </p>
            </div>

            {/* Stamp/Signature */}
            <div className="absolute bottom-4 left-7 z-10 w-[70px] h-[70px]">
              {emp.signature ? (
                <img 
                  src={emp.signature} 
                  alt="Authorized Signature" 
                  className="w-full h-full object-contain opacity-90 mix-blend-multiply" 
                />
              ) : (
                <img src="/stamp.png" alt="" className="w-full h-full object-contain opacity-90 mix-blend-multiply" />
              )}
            </div>
          </div>
      </div>

      {/* Footer Link */}
      <div className="text-center z-10">
        <p className="text-slate-500 text-sm mb-4 italic">Official Digital Identity Record</p>
        <Link 
          href="http://ar-techmarketing.in" 
          target="_blank"
          className="inline-flex items-center px-8 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all shadow-xl"
        >
          Visit Website
          <Globe className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </div>
  );
}
