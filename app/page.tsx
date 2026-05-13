"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { Upload, Calendar, Building, Briefcase, Hash, MapPin, User, Phone, Loader2, Printer, Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { saveEmployeeData, updateEmployee, getEmployeeById, getNetworkBaseUrl } from "./actions";
import { useSearchParams, useRouter } from "next/navigation";

function GeneratorForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    empCode: "",
    department: "",
    issueDate: "", // Initially empty to avoid hydration mismatch
    phone: "",
    address: "",
    companyAddress: "Kupwara, Kashmir - 193221.",
    companyPhone: "+91 1955 295310",
    companyEmail: "helpdesk@ar-techmarketing.in",
    companyWeb: "http://ar-techmarketing.in",
    image: "",
    signature: ""
  });







// data set kara hai 

  const [currentDate, setCurrentDate] = useState("");

  const sigInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [qrData, setQrData] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Check for authentication
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      router.push('/login');
    }
  }, [router]);

  // Load company details and set current date on mount
  useEffect(() => {
    // Set date only on client to avoid hydration mismatch
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate);
    if (!editId) {
      setFormData(prev => ({ ...prev, issueDate: formattedDate }));
    }

    const savedData = localStorage.getItem("companyProfile");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({
        ...prev,
        companyPhone: parsed.companyPhone || prev.companyPhone,
        companyEmail: parsed.companyEmail || prev.companyEmail,
        companyWeb: parsed.companyWeb || prev.companyWeb,
        companyAddress: parsed.companyAddress || prev.companyAddress,
        signature: parsed.signature || prev.signature
      }));
    }
  }, [editId]);

  // Check for edit mode
  useEffect(() => {
    if (editId) {
      fetchEmployeeToEdit(editId);
    }
  }, [editId]);

  const fetchEmployeeToEdit = async (id: string) => {
    const result = await getEmployeeById(id);
    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        ...result.data
      }));
      // Set QR data initially using live origin in production or network IP locally
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isLocal) {
        const networkIp = await getNetworkBaseUrl();
        const port = window.location.port ? `:${window.location.port}` : '';
        setQrData(`${window.location.protocol}//${networkIp}${port}/employee/${id}`);
      } else {
        setQrData(`${window.location.origin}/employee/${id}`);
      }
    }
  };

  // Save company details to localStorage whenever they change
  useEffect(() => {
    const companyData = {
      companyPhone: formData.companyPhone,
      companyEmail: formData.companyEmail,
      companyWeb: formData.companyWeb,
      companyAddress: formData.companyAddress,
      signature: formData.signature
    };
    localStorage.setItem("companyProfile", JSON.stringify(companyData));
  }, [formData.companyPhone, formData.companyEmail, formData.companyWeb, formData.companyAddress, formData.signature]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "signature" = "image") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isInvalid = (field: keyof typeof formData) => {
    return attemptedSubmit && !formData[field];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">

      {/* LEFT PANEL - FORM */}
      <div className="w-full lg:w-1/2 p-6 lg:p-12 overflow-y-auto border-r border-slate-200 bg-white print:hidden">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
              {editId ? "Update Employee Profile" : "Create Employee Profile"}
            </h1>
            <p className="text-slate-500">Fill in the details below to generate an employee ID card instantly.</p>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Photo - Left Side */}
              <div className="w-full lg:w-[180px] shrink-0">
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${isInvalid('image') ? 'text-red-500' : 'text-slate-500'}`}>
                  Profile Photo {isInvalid('image') && "*"}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden ${isInvalid('image') ? 'border-red-300 bg-red-50 hover:border-red-400' : 'border-slate-200 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50'}`}
                >
                  {formData.image ? (
                    <div className="flex flex-col items-center p-2 text-center">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm mb-2">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Change</span>
                    </div>
                  ) : (
                    <div className="text-center p-2">
                      <Upload className={`w-8 h-8 mx-auto mb-2 transition-colors ${isInvalid('image') ? 'text-red-300' : 'text-slate-300 group-hover:text-blue-500'}`} />
                      <span className={`text-xs font-bold block uppercase tracking-tighter ${isInvalid('image') ? 'text-red-400' : 'text-slate-400'}`}>Upload Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
              </div>

              {/* Input Fields - Right Side */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${isInvalid('name') ? 'text-red-500' : 'text-slate-500'}`}>Full Name</label>
                    <div className="relative group">
                      <User className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isInvalid('name') ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`pl-9 w-full rounded-xl border bg-white py-2 text-sm outline-none transition-all shadow-sm ${isInvalid('name') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="Ishfaq Nazir"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${isInvalid('jobTitle') ? 'text-red-500' : 'text-slate-500'}`}>Job Title</label>
                    <div className="relative group">
                      <Briefcase className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isInvalid('jobTitle') ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className={`pl-9 w-full rounded-xl border bg-white py-2 text-sm outline-none transition-all shadow-sm ${isInvalid('jobTitle') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="CFO"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${isInvalid('empCode') ? 'text-red-500' : 'text-slate-500'}`}>Emp Code</label>
                    <div className="relative group">
                      <Hash className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isInvalid('empCode') ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="text"
                        name="empCode"
                        value={formData.empCode}
                        onChange={handleInputChange}
                        className={`pl-9 w-full rounded-xl border bg-white py-2 text-sm outline-none transition-all shadow-sm ${isInvalid('empCode') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="EMP-001"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${isInvalid('department') ? 'text-red-500' : 'text-slate-500'}`}>Department</label>
                    <div className="relative group">
                      <Building className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isInvalid('department') ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={`pl-9 w-full rounded-xl border bg-white py-2 text-sm outline-none transition-all shadow-sm ${isInvalid('department') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                        placeholder="Finance"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider ${isInvalid('issueDate') ? 'text-red-500' : 'text-slate-500'}`}>Issue Date</label>
                    <div className="relative group">
                      <Calendar className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isInvalid('issueDate') ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className={`pl-9 w-full rounded-xl border bg-white py-2 text-sm outline-none transition-all shadow-sm ${isInvalid('issueDate') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <label className={`block text-[11px] font-bold uppercase tracking-wider ${isInvalid('address') ? 'text-red-500' : 'text-slate-500'}`}>Home Address</label>
                  <div className="relative group">
                    <MapPin className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isInvalid('address') ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`pl-9 w-full rounded-xl border bg-white py-2 text-sm outline-none transition-all shadow-sm ${isInvalid('address') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details Accordion */}
            <div className="pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setShowCompanyDetails(!showCompanyDetails)}
                className="w-full flex items-center justify-between py-1 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span className="font-bold text-sm">Company Settings</span>
                  <span className="text-[9px] bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">Auto-Filled</span>
                </div>
                {showCompanyDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${showCompanyDetails ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Co. Phone</label>
                    <input type="text" name="companyPhone" value={formData.companyPhone} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Co. Email</label>
                    <input type="text" name="companyEmail" value={formData.companyEmail} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Co. Website</label>
                    <input type="text" name="companyWeb" value={formData.companyWeb} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Co. Address</label>
                    <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-blue-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Auth. Signature</label>
                    <div onClick={() => sigInputRef.current?.click()} className="w-full h-[42px] border-2 border-dashed border-slate-200 rounded-xl flex items-center px-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all overflow-hidden bg-white shadow-sm">
                      {formData.signature ? (
                        <div className="flex items-center gap-2">
                          <img src={formData.signature} alt="Sig" className="h-8 object-contain mix-blend-multiply" />
                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Loaded</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Upload Signature</span>
                      )}
                    </div>
                    <input type="file" ref={sigInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, "signature")} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-2">
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  disabled={isSaving}
                  className={`flex-1 text-white py-4 px-4 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2 transform active:scale-[0.98] ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                  onClick={async () => {
                    setAttemptedSubmit(true);

                    // Validation logic
                    const requiredFields = ['name', 'jobTitle', 'empCode', 'department', 'issueDate', 'address'];
                    const isAnyFieldMissing = requiredFields.some(key => !formData[key as keyof typeof formData]);

                    if (isAnyFieldMissing || !formData.image) {
                      // Visual validation will trigger via attemptedSubmit state
                      return;
                    }

                    setIsSaving(true);
                    try {
                      let result;
                      if (editId) {
                        result = await updateEmployee(Number(editId), formData);
                      } else {
                        result = await saveEmployeeData(formData);
                      }

                      if (result.success) {
                        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                        let profileUrl;
                        if (isLocal) {
                          const networkIp = await getNetworkBaseUrl();
                          const port = window.location.port ? `:${window.location.port}` : '';
                          profileUrl = `${window.location.protocol}//${networkIp}${port}/employee/${editId || (result as any).id}`;
                        } else {
                          profileUrl = `${window.location.origin}/employee/${editId || (result as any).id}`;
                        }

                        setQrData(profileUrl);
                        setAttemptedSubmit(false); // Reset validation state

                        alert(editId ? "Profile updated successfully!" : "Profile created successfully!");

                        if (editId) {
                          router.push('/employees');
                        }
                      } else {
                        alert("Failed to save data: " + result.error);
                      }
                    } catch (error) {
                      alert("An unexpected error occurred while saving.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {editId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editId ? "Update Profile" : "Create Profile"
                  )}
                </button>

                {!editId && qrData && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: "",
                        jobTitle: "",
                        empCode: "",
                        department: "",
                        issueDate: currentDate,
                        phone: "",
                        address: "",
                        companyAddress: "Kupwara, Kashmir - 193221.",
                        companyPhone: "+91 1955 295310",
                        companyEmail: "helpdesk@ar-techmarketing.in",
                        companyWeb: "http://ar-techmarketing.in",
                        image: "",
                        signature: ""
                      });
                      setQrData("");
                    }}
                    className="px-4 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-xs uppercase tracking-wider border border-slate-200 shrink-0"
                  >
                    Create Fresh Card
                  </button>
                )}
              </div>

              {attemptedSubmit && (
                <div className="flex items-center justify-center gap-1.5 text-red-500 animate-pulse mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Please fill all required fields highlighted in red</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - PREVIEW */}
      <div className="w-full lg:w-1/2 bg-slate-100 flex flex-col items-center p-6 lg:p-12 relative overflow-y-auto print:bg-white print:w-full print:p-0 print:block">

        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 print:hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-2xl flex justify-end mb-8 z-10 print:hidden relative">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            Print ID Cards
          </button>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col xl:flex-row gap-8 items-center justify-center z-10 relative print:flex-row print:gap-4 print:items-start">

          {/* FRONT FACE */}
          <div
            className="relative w-[340px] h-[525px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 print:shadow-none print:border-gray-300 print:break-inside-avoid shrink-0"
          >
            {/* Background Image */}
            <img src="/card.svg" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
            {/* Logo Area */}
            <div className="relative z-10 w-full flex justify-center">
              <div className="bg-white rounded-b-[18px] shadow-sm flex items-center justify-center overflow-hidden h-[90px] w-[230px]">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain scale-[1.2]" />
              </div>
            </div>

            {/* Profile Image */}
            <div className="relative z-10 flex justify-center mt-6">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                {!formData.image ? (
                  <User className="w-16 h-16 text-slate-300" />
                ) : (
                  <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                )}
              </div>
            </div>

            {/* Details Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center pt-4 px-8 pb-10">
              <h2 className="text-2xl font-bold text-[#4c9fd6] mb-0.5 text-center leading-tight">{formData.name || "Employee Name"}</h2>
              <p className="text-sm text-slate-600 font-medium mb-6 uppercase tracking-wider">{formData.jobTitle || "Job Title"}</p>

              <div className="w-full space-y-2.5 mt-2">
                <div className="flex items-start">
                  <span className="w-24 text-[12px] font-bold text-black">Emp Code</span>
                  <span className="text-[11px] font-bold text-black mr-2">:</span>
                  <span className="text-[11px] text-black font-semibold flex-1">{formData.empCode || "-"}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-[12px] font-bold text-black">Department</span>
                  <span className="text-[11px] font-bold text-black mr-2">:</span>
                  <span className="text-[11px] text-black font-semibold flex-1">{formData.department || "-"}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-[12px] font-bold text-black">Issue Date</span>
                  <span className="text-[11px] font-bold text-black mr-2">:</span>
                  <span className="text-[11px] text-black font-semibold flex-1">{formData.issueDate || "-"}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 text-[12px] font-bold text-black">Address</span>
                  <span className="text-[11px] font-bold text-black mr-2">:</span>
                  <span className="text-[11px] text-black font-semibold flex-1 leading-tight">{formData.address || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div
            className="relative w-[340px] h-[525px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-200 print:shadow-none print:border-gray-300 print:break-inside-avoid shrink-0"
          >
            <img src="/card.svg" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
            <div className="pt-4 px-4 text-center z-10 relative">
              <p className="text-[11px] text-white font-medium leading-relaxed tracking-wide">
                This ID Card is property of Rehmani<br />Technologies and marketing services Pvt Ltd.
              </p>
            </div>

            <div className="flex justify-center mt-3 z-10 relative">
              <div className="bg-white p-2 border-[6px] border-[#418bbc] shadow-md w-[160px] h-[160px]">
                {qrData ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrData)}`}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 text-center border-2 border-dashed border-slate-200">
                    <span className="text-[12px] leading-tight font-medium">Click "Create Profile" to generate QR</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 px-7 z-10 relative" style={{ marginTop: "40px" }}>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Residences</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1 leading-tight">{formData.companyAddress || "-"}</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Phone</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1">{formData.companyPhone || "-"}</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Email</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1">{formData.companyEmail || "-"}</span>
              </div>
              <div className="flex items-center mb-1.5">
                <span className="w-[70px] text-[12px] font-bold text-black">Web</span>
                <span className="text-[12px] font-bold text-black mr-1">:</span>
                <span className="text-[12px] text-black flex-1">{formData.companyWeb || "-"}</span>
              </div>
            </div>

            <div className="mt-4 px-7 z-10 relative">
              <p className="text-[9px] text-[#418bbc] mb-0.5">If lost/found please report at below :</p>
              <p className="text-[8.5px] text-[#418bbc] leading-[1.4]">
                Rehmani Technologies pvt ltd ,Bypass Road Handwara-193221.<br />
                E: helpdesk@ar-techmarketing.in<br />
                P: 01955295310
              </p>
            </div>

            <div className="absolute bottom-4 left-7 z-10 w-[70px] h-[70px]">
              {formData.signature ? (
                <img
                  src={formData.signature}
                  alt="Sig"
                  className="w-full h-full object-contain opacity-90 mix-blend-multiply"
                />
              ) : (
                <div className="w-full h-full rounded-full border border-blue-900 flex items-center justify-center relative">
                  <span className="text-[6px] text-blue-900 text-center font-bold absolute transform -rotate-45 leading-tight">AUTHORIZED<br />SIGNATURE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneratorForm />
    </Suspense>
  );
}
