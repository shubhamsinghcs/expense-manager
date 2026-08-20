"use client";

import React, { useState } from "react";
import { Expense, RoommateId, SplitType } from "../lib/types";
import { ROOMMATES } from "../lib/initial-data";
import { formatCurrency } from "../lib/utils";
import { Flame, X, AlertCircle, Users } from "lucide-react";

interface GasCylinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
}

export function GasCylinderModal({
  isOpen,
  onClose,
  onAddExpense,
}: GasCylinderModalProps) {
  const [cylinderCount, setCylinderCount] = useState<number>(1);
  const [cylinderType, setCylinderType] = useState("14.2kg Domestic LPG");
  const [amount, setAmount] = useState("1100");
  const [bookingRef, setBookingRef] = useState("HP-902184");
  const [paidBy, setPaidBy] = useState<RoommateId>("manoj");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [splitAmong, setSplitAmong] = useState<RoommateId[]>([
    "adi",
    "ssr",
    "harsh",
    "manoj",
  ]);
  const [notes, setNotes] = useState("Kitchen cooking gas cylinder refill & delivery");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const activeCount = splitType === "equal" ? 4 : Math.max(1, splitAmong.length);
  const share = numAmount / activeCount;

  const handleToggle = (id: RoommateId) => {
    if (splitAmong.includes(id)) {
      if (splitAmong.length <= 1) return;
      setSplitAmong(splitAmong.filter((i) => i !== id));
    } else {
      setSplitAmong([...splitAmong, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    onAddExpense({
      description: `${cylinderCount}x LPG Gas Cylinder (${cylinderType})`,
      amount: numAmount,
      category: "gas",
      paidBy,
      date: new Date().toISOString().slice(0, 10),
      splitType,
      splitAmong:
        splitType === "equal"
          ? ["adi", "ssr", "harsh", "manoj"]
          : splitAmong,
      isUtility: true,
      gasMeta: {
        cylinderCount,
        cylinderType,
        bookingRef: bookingRef.trim() || undefined,
      },
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="gas-cylinder-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 bg-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                Log Gas Cylinder Refill
              </h3>
              <p className="text-xs text-orange-100">
                Track LPG cylinders & shared cooking expenses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-orange-100 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount and Cylinder count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Refill Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  ₹
                </span>
                <input
                  id="input-gas-amount"
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="1100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cylinder Count
              </label>
              <div className="flex gap-2">
                {[1, 2].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setCylinderCount(cnt);
                      setAmount(String(cnt * 1100));
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      cylinderCount === cnt
                        ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {cnt} Cylinder{cnt > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type & Booking Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Cylinder Type / Agency
              </label>
              <select
                value={cylinderType}
                onChange={(e) => setCylinderType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
              >
                <option value="14.2kg Domestic LPG">14.2kg Domestic LPG (HP/Indane/Bharat)</option>
                <option value="5kg Commercial/Mini">5kg Mini Domestic LPG</option>
                <option value="19kg Commercial">19kg Commercial LPG</option>
                <option value="PNG Piped Gas">PNG Piped Natural Gas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Booking Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. HP-902184"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Paid By (Who paid for the cylinder?)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROOMMATES.map((r) => {
                const isSelected = paidBy === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setPaidBy(r.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition ${
                      isSelected
                        ? "bg-orange-50 border-orange-500 ring-2 ring-orange-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 leading-none">
                        {r.shortName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Split Distribution
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`px-2.5 py-0.5 rounded-md font-semibold ${
                    splitType === "equal"
                      ? "bg-white text-orange-700 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  All 4 Flatmates
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("selective")}
                  className={`px-2.5 py-0.5 rounded-md font-semibold ${
                    splitType === "selective"
                      ? "bg-white text-orange-700 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Selective
                </button>
              </div>
            </div>

            {splitType === "selective" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                {ROOMMATES.map((r) => {
                  const isChecked = splitAmong.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-xs font-semibold ${
                        isChecked
                          ? "bg-white border-orange-300 text-orange-950"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(r.id)}
                        className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                      />
                      <span>{r.shortName}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {numAmount > 0 && (
              <div className="mt-2 p-2.5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between text-xs text-orange-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-orange-600" />
                  Split equally among {activeCount} flatmates
                </span>
                <span className="font-black text-sm">
                  {formatCurrency(share)} / person
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Delivery boy tip included"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              id="btn-submit-gas-cylinder"
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl shadow-md shadow-orange-200 flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4" />
              <span>Record Gas Cylinder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
