"use client";

import React, { useState } from "react";
import { RoommateId, Category, SplitType, Expense } from "../lib/types";
import { ROOMMATES, CATEGORIES } from "../lib/initial-data";
import { formatCurrency } from "../lib/utils";
import {
  X,
  Plus,
  Calendar,
  Users,
  Check,
  Tag,
  FileText,
  AlertCircle,
} from "lucide-react";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  defaultPayer?: RoommateId;
}

export function QuickAddModal({
  isOpen,
  onClose,
  onAddExpense,
  defaultPayer = "ssr",
}: QuickAddModalProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("groceries");
  const [paidBy, setPaidBy] = useState<RoommateId>(defaultPayer);
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [splitAmong, setSplitAmong] = useState<RoommateId[]>([
    "adi",
    "ssr",
    "harsh",
    "manoj",
  ]);
  const [customAmounts, setCustomAmounts] = useState<Record<RoommateId, string>>({
    adi: "",
    ssr: "",
    harsh: "",
    manoj: "",
  });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const activeSplitCount =
    splitType === "equal" ? 4 : Math.max(1, splitAmong.length);
  const perPersonShare = numAmount > 0 ? numAmount / activeSplitCount : 0;

  const handleToggleRoommate = (id: RoommateId) => {
    if (splitAmong.includes(id)) {
      if (splitAmong.length <= 1) return;
      setSplitAmong(splitAmong.filter((item) => item !== id));
    } else {
      setSplitAmong([...splitAmong, id]);
    }
  };

  const handleCustomAmountChange = (id: RoommateId, val: string) => {
    setCustomAmounts((prev) => ({ ...prev, [id]: val }));
  };

  const customTotal = Object.values(customAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter an expense description.");
      return;
    }
    if (!amount || numAmount <= 0) {
      setError("Please enter a valid amount greater than ₹0.");
      return;
    }
    if (splitType === "selective" && splitAmong.length === 0) {
      setError("Please select at least one roommate to split with.");
      return;
    }

    let parsedCustom: Partial<Record<RoommateId, number>> | undefined = undefined;

    if (splitType === "custom") {
      const diff = Math.abs(numAmount - customTotal);
      if (diff > 0.05) {
        setError(
          `Custom split total (₹${customTotal.toFixed(2)}) must equal expense amount (₹${numAmount.toFixed(2)}).`
        );
        return;
      }
      parsedCustom = {
        adi: parseFloat(customAmounts.adi) || 0,
        ssr: parseFloat(customAmounts.ssr) || 0,
        harsh: parseFloat(customAmounts.harsh) || 0,
        manoj: parseFloat(customAmounts.manoj) || 0,
      };
    }

    onAddExpense({
      description: description.trim(),
      amount: numAmount,
      category,
      paidBy,
      date,
      splitType,
      splitAmong:
        splitType === "equal"
          ? ["adi", "ssr", "harsh", "manoj"]
          : splitAmong,
      customAmounts: parsedCustom,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setDescription("");
    setAmount("");
    setNotes("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="quick-add-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Add Flat Expense
              </h3>
              <p className="text-xs text-slate-500">
                Record a shared purchase for Flat #402
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ₹
              </span>
              <input
                id="input-expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-4 py-2.5 text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Title *
            </label>
            <input
              id="input-expense-description"
              type="text"
              placeholder="e.g. Supermarket grocery run, Water tanker, Snacks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(Object.keys(CATEGORIES) as Category[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2 rounded-xl text-xs font-semibold border text-center transition flex flex-col items-center gap-1 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid By (Roommates selection) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Paid By (Payer)
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
                        ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 leading-none">
                        {r.shortName}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {r.room}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Type Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Split Method
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSplitType("equal")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    splitType === "equal"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All 4 Equal
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("selective")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    splitType === "selective"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Selective
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType("custom")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition ${
                    splitType === "custom"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* Selective checkboxes */}
            {splitType === "selective" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                {ROOMMATES.map((r) => {
                  const isChecked = splitAmong.includes(r.id);
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border text-xs font-semibold transition ${
                        isChecked
                          ? "bg-white border-indigo-300 text-indigo-950 shadow-xs"
                          : "bg-slate-100 border-slate-200 text-slate-400"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRoommate(r.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span>{r.shortName}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Custom amount inputs */}
            {splitType === "custom" && (
              <div className="space-y-2 mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Share Allocation</span>
                  <span>
                    Total: {formatCurrency(customTotal)} / {formatCurrency(numAmount)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROOMMATES.map((r) => (
                    <div key={r.id} className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 block">
                        {r.shortName} (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={customAmounts[r.id] || ""}
                        onChange={(e) => handleCustomAmountChange(r.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equal share preview */}
            {splitType !== "custom" && numAmount > 0 && (
              <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Split between {activeSplitCount} flatmates
                </span>
                <span className="font-black text-sm">
                  {formatCurrency(perPersonShare)} / person
                </span>
              </div>
            )}
          </div>

          {/* Date & Notes Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Notes / Memo (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. UPI Ref #491204"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              id="btn-submit-quick-add"
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
