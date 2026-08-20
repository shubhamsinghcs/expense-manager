"use client";

import React, { useState } from "react";
import { Expense, RoommateId, SplitType } from "../lib/types";
import { ROOMMATES } from "../lib/initial-data";
import { formatCurrency } from "../lib/utils";
import { Zap, X, AlertCircle, Calendar, Users } from "lucide-react";

interface ElectricityBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
}

export function ElectricityBillModal({
  isOpen,
  onClose,
  onAddExpense,
}: ElectricityBillModalProps) {
  const [billingPeriod, setBillingPeriod] = useState("July-August 2026");
  const [amount, setAmount] = useState("2400");
  const [unitsConsumed, setUnitsConsumed] = useState("280");
  const [dueDate, setDueDate] = useState("2026-08-25");
  const [paidBy, setPaidBy] = useState<RoommateId>("ssr");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [splitAmong, setSplitAmong] = useState<RoommateId[]>([
    "adi",
    "ssr",
    "harsh",
    "manoj",
  ]);
  const [notes, setNotes] = useState("Summer AC & kitchen appliances power consumption");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const numUnits = parseFloat(unitsConsumed) || 0;
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
      setError("Please enter a valid bill amount.");
      return;
    }

    onAddExpense({
      description: `Electricity Bill (${billingPeriod})`,
      amount: numAmount,
      category: "electricity",
      paidBy,
      date: new Date().toISOString().slice(0, 10),
      splitType,
      splitAmong:
        splitType === "equal"
          ? ["adi", "ssr", "harsh", "manoj"]
          : splitAmong,
      isUtility: true,
      electricityMeta: {
        billingPeriod,
        unitsConsumed: numUnits || undefined,
        dueDate: dueDate || undefined,
      },
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="electricity-bill-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 bg-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                Log Electricity Bill
              </h3>
              <p className="text-xs text-amber-100">
                Record power bill & split with all flatmates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
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

          {/* Amount and Billing Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Bill Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  ₹
                </span>
                <input
                  id="input-electricity-amount"
                  type="number"
                  step="1"
                  min="1"
                  required
                  placeholder="2400"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Billing Period
              </label>
              <input
                type="text"
                placeholder="e.g. July-August 2026"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Units Consumed & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Units Consumed (kWh)
              </label>
              <input
                type="number"
                placeholder="e.g. 280"
                value={unitsConsumed}
                onChange={(e) => setUnitsConsumed(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Paid By (Who paid the bill?)
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
                        ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20"
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

          {/* Split Participants */}
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
                      ? "bg-white text-amber-700 shadow-xs"
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
                      ? "bg-white text-amber-700 shadow-xs"
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
                          ? "bg-white border-amber-300 text-amber-950"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(r.id)}
                        className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <span>{r.shortName}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {numAmount > 0 && (
              <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-amber-600" />
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
              placeholder="e.g. Consumer ID: 109283910"
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
              id="btn-submit-electricity-bill"
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-md shadow-amber-200 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Record Electricity Bill</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
