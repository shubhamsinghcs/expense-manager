"use client";

import React from "react";
import { Expense, HouseholdMember } from "../lib/types";
import { CATEGORIES } from "../lib/initial-data";
import { formatCurrency, formatDate } from "../lib/utils";
import { calculateExpenseSplits } from "../lib/debt-simplifier";
import {
  X,
  Calendar,
  Users,
  Edit2,
  Trash2,
  Zap,
  Flame,
} from "lucide-react";

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  members?: HouseholdMember[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseDetailModal({
  isOpen,
  onClose,
  expense,
  members = [],
  onEdit,
  onDelete,
}: ExpenseDetailModalProps) {
  if (!isOpen || !expense) return null;

  const memberList = members || [];
  const payer = memberList.find((m) => m && m.id === expense.paidBy);
  const categoryInfo = CATEGORIES[expense.category] || CATEGORIES.miscellaneous;
  const shares = calculateExpenseSplits(expense, memberList);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="expense-detail-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {categoryInfo?.label || expense.category}
              </span>
              {expense.isUtility && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Utility Bill
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {expense.description}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Main Amount & Payer Banner */}
          <div className="flex items-center justify-between p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <div>
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block">
                Total Transaction Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-500 block">
                Paid by
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                <img
                  src={payer?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${expense.paidBy}`}
                  alt={payer?.displayName || expense.paidBy}
                  className="w-5 h-5 rounded-full object-cover bg-slate-100"
                />
                <span className="text-xs font-bold text-slate-900">
                  {payer?.displayName || expense.paidBy}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 block text-[10px]">Date</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(expense.date)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 block text-[10px]">Split Mode</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {expense.splitType === "equal"
                    ? `Equal (All ${memberList.length} Members)`
                    : expense.splitType === "selective"
                    ? `Selective (${expense.splitAmong?.length} Members)`
                    : "Custom Allocation"}
                </span>
              </div>
            </div>
          </div>

          {/* Electricity or Gas Metadata if available */}
          {expense.electricityMeta && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Zap className="w-3.5 h-3.5" /> Electricity Bill Breakdown
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-amber-700 block">Billing Period</span>
                  <span className="font-bold">
                    {expense.electricityMeta.billingPeriod || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-amber-700 block">Units Consumed</span>
                  <span className="font-bold">
                    {expense.electricityMeta.unitsConsumed
                      ? `${expense.electricityMeta.unitsConsumed} kWh`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-amber-700 block">Due Date</span>
                  <span className="font-bold">
                    {expense.electricityMeta.dueDate || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {expense.gasMeta && (
            <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-xl space-y-1.5 text-xs text-orange-900">
              <div className="font-bold flex items-center gap-1.5 text-orange-800">
                <Flame className="w-3.5 h-3.5" /> Gas Refill Details
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-orange-700 block">Cylinders</span>
                  <span className="font-bold">
                    {expense.gasMeta.cylinderCount || 1} Cylinder(s)
                  </span>
                </div>
                <div>
                  <span className="text-orange-700 block">Cylinder Type</span>
                  <span className="font-bold">
                    {expense.gasMeta.cylinderType || "14.2kg Domestic LPG"}
                  </span>
                </div>
                <div>
                  <span className="text-orange-700 block">Booking Ref</span>
                  <span className="font-bold">
                    {expense.gasMeta.bookingRef || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {expense.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="text-slate-500 font-bold block mb-0.5">Notes</span>
              <p className="text-slate-700 italic">{expense.notes}</p>
            </div>
          )}

          {/* Itemized Share Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Itemized Cost Split Breakdown
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {memberList.map((m) => {
                const shareAmount = shares[m.id] || 0;
                const isPayer = expense.paidBy === m.id;
                const netEffect = isPayer
                  ? expense.amount - shareAmount
                  : -shareAmount;

                return (
                  <div
                    key={m.id}
                    className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={m.avatarUrl}
                        alt={m.displayName}
                        className="w-7 h-7 rounded-full object-cover bg-slate-100"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          {m.displayName}
                          {isPayer && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-md">
                              Payer
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {m.room || (m.role === "admin" ? "Admin" : "Member")}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        Share: {formatCurrency(shareAmount)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          netEffect > 0.01
                            ? "text-emerald-600"
                            : netEffect < -0.01
                            ? "text-rose-600"
                            : "text-slate-500"
                        }`}
                      >
                        {netEffect > 0.01
                          ? `+${formatCurrency(netEffect)} (Receives)`
                          : netEffect < -0.01
                          ? `${formatCurrency(netEffect)} (Owed)`
                          : "No balance impact"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons (Edit & Delete) */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              id="btn-delete-from-detail"
              type="button"
              onClick={() => {
                onClose();
                onDelete(expense);
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Entry</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
              >
                Close
              </button>
              <button
                id="btn-edit-from-detail"
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
