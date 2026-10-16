"use client";
import { useState } from "react";
import { X, CreditCard, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { ReceiptData } from "./ReceiptModal";

interface CollectFeeModalProps {
  enquiry: {
    id: string;
    enquiryId: string;
    studentName: string;
    applyingClass: string;
    fatherName?: string;
  };
  onClose: () => void;
  onSuccess: (receipt: ReceiptData) => void;
}

export default function CollectFeeModal({ enquiry, onClose, onSuccess }: CollectFeeModalProps) {
  const [feeType, setFeeType] = useState<"REGISTRATION" | "ADMISSION">("REGISTRATION");
  const [amount, setAmount] = useState<string>("5000");
  const [paymentMode, setPaymentMode] = useState<string>("UPI");
  const [transactionReference, setTransactionReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTypeChange = (type: "REGISTRATION" | "ADMISSION") => {
    setFeeType(type);
    if (type === "REGISTRATION") {
      setAmount("5000");
    } else {
      setAmount("25000");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (paymentMode !== "CASH" && !transactionReference.trim()) {
      setError("Please provide a transaction reference, UTR, or Cheque number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiryId: enquiry.id,
          feeType,
          amount: Number(amount),
          paymentMode,
          transactionReference: transactionReference.trim() || undefined,
          remarks: remarks.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to process payment");
      }

      onSuccess(json.receipt);
    } catch (err: any) {
      setError(err.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#D8E0EB]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#F8FAFD] border-b border-[#D8E0EB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF1FF] text-[#1A56DB] flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#0D1B2E]">Collect Fee & Issue Receipt</h3>
              <p className="text-xs text-slate-500">{enquiry.studentName} ({enquiry.enquiryId})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fee Type Pill Selector */}
          <div>
            <span className="form-label mb-2">Fee Head / Purpose</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange("REGISTRATION")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col ${
                  feeType === "REGISTRATION"
                    ? "border-[#1A56DB] bg-[#EBF1FF] text-[#1A56DB] shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Registration Fee</span>
                <span className="text-[11px] font-normal opacity-70">Secures admission slot</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("ADMISSION")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col ${
                  feeType === "ADMISSION"
                    ? "border-[#047857] bg-[#ECFDF5] text-[#047857] shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>Admission / Tuition Fee</span>
                <span className="text-[11px] font-normal opacity-70">Confirms final enrollment</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <span className="form-label">
              Amount (INR) <span className="text-red-500">*</span>
            </span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-8 font-bold text-base text-slate-900"
                placeholder="5000"
              />
            </div>
          </div>

          {/* Payment Mode & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="form-label">
                Payment Mode <span className="text-red-500">*</span>
              </span>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="input-field"
              >
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="CASH">Cash at Desk</option>
                <option value="ONLINE">Bank Transfer (NEFT / RTGS)</option>
                <option value="CHEQUE">Demand Draft / Cheque</option>
                <option value="DD">Demand Draft</option>
              </select>
            </div>

            <div>
              <span className="form-label">
                Ref / UTR / Cheque # {paymentMode !== "CASH" && <span className="text-red-500">*</span>}
              </span>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="input-field font-mono text-xs"
                placeholder={paymentMode === "CASH" ? "Optional for cash" : "e.g., 425109283741"}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <span className="form-label">Notes / Remarks</span>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field text-xs"
              placeholder="e.g. Paid by father via Google Pay"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-5 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Confirm & Generate Receipt
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
