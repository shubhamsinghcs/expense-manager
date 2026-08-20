"use client";

import React from "react";
import { Expense, HouseholdMember } from "../lib/types";
import { formatCurrency, formatDate } from "../lib/utils";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  members?: HouseholdMember[];
  onConfirmDelete: (id: string) => void;
}

export function DeleteExpenseModal({
  isOpen,
  onClose,
  expense,
  members = [],
  onConfirmDelete,
}: DeleteExpenseModalProps) {
  if (!isOpen || !expense) return null;

  const memberList = members || [];
  const payer = memberList.find((r) => r && r.id === expense.paidBy);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="delete-expense-modal"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
            Delete Expense Entry?
          </h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Are you sure you want to delete this expense? This action will permanently remove this purchase from the household ledger and immediately recalculate every member's balance.
          </p>

          {/* Expense snapshot card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Description</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">
                {expense.description}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Amount</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Paid by</span>
              <span className="font-semibold text-slate-800">
                {payer?.displayName || expense.paidBy}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Date</span>
              <span className="text-slate-700">{formatDate(expense.date)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-delete-expense"
              type="button"
              onClick={() => {
                onConfirmDelete(expense.id);
                onClose();
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Expense</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
