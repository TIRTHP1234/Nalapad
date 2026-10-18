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
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-slate-50/80 border-b border-slate-200/80">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shadow-xs">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">Collect Fee & Issue Receipt</h3>
              <p className="text-xs text-slate-500 mt-1">{enquiry.studentName} ({enquiry.enquiryId})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-7 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Fee Type Pill Selector */}
          <div>
            <label className="form-label">Fee Head / Purpose</label>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleTypeChange("REGISTRATION")}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all ${
                  feeType === "REGISTRATION"
                    ? "border-orange-500 bg-orange-50/80 text-orange-950 ring-1 ring-orange-500/25 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="block text-xs font-semibold text-slate-900">Registration Fee</span>
                <span className="text-[11px] text-slate-500 block mt-1">Secures admission slot</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange("ADMISSION")}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all ${
                  feeType === "ADMISSION"
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-600/25 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="block text-xs font-semibold text-slate-900">Admission / Tuition Fee</span>
                <span className="text-[11px] text-slate-500 block mt-1">Confirms final enrollment</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="form-label">
              Amount (INR) <span className="text-rose-500 font-normal ml-0.5">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="form-label">
                Payment Mode <span className="text-rose-500 font-normal ml-0.5">*</span>
              </label>
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
              <label className="form-label">
                Ref / UTR / Cheque # {paymentMode !== "CASH" && <span className="text-rose-500 font-normal ml-0.5">*</span>}
              </label>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="input-field font-mono"
                placeholder={paymentMode === "CASH" ? "Optional for cash" : "e.g., 425109283741"}
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="form-label">Notes / Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="input-field"
              placeholder="e.g. Paid by father via Google Pay"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Confirm & Generate Receipt
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
