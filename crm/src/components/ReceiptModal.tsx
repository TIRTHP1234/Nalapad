"use client";
import { useRef } from "react";
import { X, Printer, CheckCircle, GraduationCap } from "lucide-react";

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  feeType: string;
  amount: number;
  paymentMode: string;
  transactionReference?: string;
  studentName: string;
  enquiryId: string;
  fatherName?: string;
  contact?: string;
  applyingClass: string;
  academicYear: string;
  campus?: string;
  remarks?: string;
}

function numberToWords(num: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero Rupees";

  function convert(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  }

  return convert(Math.floor(num)) + " Rupees Only";
}

export default function ReceiptModal({
  receipt,
  onClose,
}: {
  receipt: ReceiptData;
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay print:p-0 print:bg-white">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[95vh] border border-slate-200 animate-slide-up print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="text-emerald-600" size={19} />
            <span className="font-bold text-sm text-slate-900 font-heading">Payment Verified — Official Nalapad Receipt</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div ref={receiptRef} className="p-8 overflow-y-auto text-slate-800 print:p-8 print:text-black">
          {/* Header */}
          <div className="border-b-2 border-[#0E2148] pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0E2148] text-white flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={26} />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-[#0E2148] tracking-tight uppercase">
                    Nalapad Academy
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Admission & Fee Management Department
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bangalore, Karnataka · contact@nalapad.edu · +91 80 2345 6789
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-[#0E2148] text-white font-bold text-xs uppercase px-3 py-1 rounded-md mb-1.5 tracking-wider">
                  Official Receipt
                </div>
                <p className="text-xs font-mono font-bold text-slate-900">{receipt.receiptNumber}</p>
                <p className="text-[11px] text-slate-500">Date: {receipt.date}</p>
              </div>
            </div>
          </div>

          {/* Student & Payment Summary Grid */}
          <div className="bg-[#F8FAFD] rounded-xl p-5 border border-[#E2E8F0] mb-6 print:border-slate-300">
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Student Name</span>
                <span className="text-slate-900 font-bold text-sm">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Enquiry / Application No.</span>
                <span className="font-mono font-bold text-slate-900">{receipt.enquiryId}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Parent / Guardian Name</span>
                <span className="text-slate-900 font-semibold">{receipt.fatherName || "Parent / Guardian"}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Class & Academic Year</span>
                <span className="text-slate-900 font-semibold">Grade {receipt.applyingClass} ({receipt.academicYear})</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Payment Mode</span>
                <span className="text-slate-900 font-semibold">{receipt.paymentMode}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Transaction Reference / UTR</span>
                <span className="font-mono text-slate-900 font-semibold">{receipt.transactionReference || "Direct Cash"}</span>
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <table className="w-full text-xs mb-6 border border-[#E2E8F0] rounded-lg overflow-hidden">
            <thead className="bg-[#0E2148] text-white">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">Description</th>
                <th className="py-2.5 px-4 text-left font-semibold">Category</th>
                <th className="py-2.5 px-4 text-right font-semibold">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {receipt.feeType === "REGISTRATION" ? "Admission Registration Fee" : "Admission & Tuition Fee"}
                  <span className="block text-[11px] text-slate-500 font-normal mt-0.5">
                    Academic Year {receipt.academicYear} · Campus: {receipt.campus || "Main Campus"}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-medium">
                  {receipt.feeType}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                  ₹{receipt.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-[#F8FAFD] font-bold">
                <td colSpan={2} className="py-3 px-4 text-slate-900 text-right uppercase tracking-wider text-[11px]">
                  Total Paid:
                </td>
                <td className="py-3 px-4 text-right text-base text-[#1A56DB]">
                  ₹{receipt.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="mb-8 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Amount in Words: </span>
            <span className="italic text-slate-900 font-medium">{numberToWords(receipt.amount)}</span>
          </div>

          {/* Signatures & Verification */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                • This receipt is valid subject to realization of cheque / online clearance.<br />
                • Fees once paid are non-refundable as per school admission policy.<br />
                • System generated verification reference: <span className="font-mono">{receipt.receiptNumber}</span>
              </p>
            </div>
            <div className="text-right flex flex-col items-end justify-end">
              <div className="w-40 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-900">Authorized Signatory</p>
              <p className="text-[10px] text-slate-500">Accounts & Admissions Desk</p>
            </div>
          </div>
        </div>

        {/* Footer actions for screen view */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button onClick={onClose} className="btn-secondary text-xs py-2 px-4">
            Close
          </button>
          <button onClick={handlePrint} className="btn-primary text-xs py-2 px-5 flex items-center gap-2">
            <Printer size={15} /> Print Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
