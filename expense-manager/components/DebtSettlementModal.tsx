"use client";

import React, { useState, useEffect } from "react";
import { RoommateId, Settlement } from "../lib/types";
import { ROOMMATES } from "../lib/initial-data";
import { formatCurrency } from "../lib/utils";
import { X, Check, Wallet, ArrowRight, Calendar, FileText } from "lucide-react";

interface DebtSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    fromId: RoommateId;
    toId: RoommateId;
    amount: number;
  } | null;
  onRecordSettlement: (settlement: Omit<Settlement, "id" | "createdAt">) => void;
}

export function DebtSettlementModal({
  isOpen,
  onClose,
  initialData,
  onRecordSettlement,
}: DebtSettlementModalProps) {
  const [fromId, setFromId] = useState<RoommateId>("harsh");
  const [toId, setToId] = useState<RoommateId>("ssr");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFromId(initialData.fromId);
      setToId(initialData.toId);
      setAmount(initialData.amount.toFixed(2));
      const senderName = ROOMMATES.find(r => r.id === initialData.fromId)?.shortName || initialData.fromId;
      const receiverName = ROOMMATES.find(r => r.id === initialData.toId)?.shortName || initialData.toId;
      setNote(`UPI settlement: ${senderName} to ${receiverName}`);
    } else {
      setAmount("");
      setNote("");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId === toId) {
      setError("Sender and receiver cannot be the same roommate.");
      return;
    }
    if (!amount || numAmount <= 0) {
      setError("Please enter a settlement amount greater than ₹0.");
      return;
    }

    onRecordSettlement({
      fromId,
      toId,
      amount: numAmount,
      date,
      status: "completed",
      note: note.trim() || undefined,
    });

    setError("");
    onClose();
  };


  const sender = ROOMMATES.find((r) => r.id === fromId);
  const receiver = ROOMMATES.find((r) => r.id === toId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="settlement-modal"
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Record Settlement
              </h3>
              <p className="text-xs text-slate-500">
                Mark debt transfer as paid and update net balances
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Visual Pair Selector */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Payer (Debtor)
              </label>
              <select
                id="select-settlement-from"
                value={fromId}
                onChange={(e) => setFromId(e.target.value as RoommateId)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                {ROOMMATES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Receiver (Creditor)
              </label>
              <select
                id="select-settlement-to"
                value={toId}
                onChange={(e) => setToId(e.target.value as RoommateId)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
              >
                {ROOMMATES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer visual */}
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="text-xs font-bold text-slate-700">
              {sender?.shortName}
            </span>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-black border border-emerald-200">
              <span>pays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {receiver?.shortName}
            </span>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Settlement Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ₹
              </span>
              <input
                id="input-settlement-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-4 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>


          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Note (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Venmo / Zelle transfer"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-settlement"
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-200 transition"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
