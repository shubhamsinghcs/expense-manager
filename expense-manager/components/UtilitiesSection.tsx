"use client";

import React from "react";
import { Expense, HouseholdMember } from "../lib/types";
import { formatCurrency, formatDate } from "../lib/utils";
import {
  Zap,
  Flame,
  Wifi,
  Plus,
} from "lucide-react";

interface UtilitiesSectionProps {
  expenses?: Expense[];
  members?: HouseholdMember[];
  onOpenElectricityModal: () => void;
  onOpenGasModal: () => void;
  onViewExpenseDetails: (expense: Expense) => void;
}

export function UtilitiesSection({
  expenses = [],
  members = [],
  onOpenElectricityModal,
  onOpenGasModal,
  onViewExpenseDetails,
}: UtilitiesSectionProps) {
  const expenseList = expenses || [];
  const memberList = members || [];

  const electricityExpenses = expenseList.filter(
    (e) => e && !e.deletedAt && e.category === "electricity"
  );
  const gasExpenses = expenseList.filter(
    (e) => e && !e.deletedAt && e.category === "gas"
  );
  const internetExpenses = expenseList.filter(
    (e) => e && !e.deletedAt && e.category === "internet"
  );

  const totalElectricity = electricityExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalGas = gasExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalInternet = internetExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalUnits = electricityExpenses.reduce(
    (sum, e) => sum + (e.electricityMeta?.unitsConsumed || 0),
    0
  );
  const totalCylinders = gasExpenses.reduce(
    (sum, e) => sum + (e.gasMeta?.cylinderCount || 1),
    0
  );

  const memberCount = Math.max(1, memberList.length);

  return (
    <div className="space-y-6">
      {/* Top Utility Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Electricity Card */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <button
              onClick={onOpenElectricityModal}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Bill</span>
            </button>
          </div>
          <div className="mt-4">
            <span className="text-[11px] uppercase font-bold text-amber-800 tracking-wider block">
              Electricity Bills
            </span>
            <div className="text-2xl font-black text-amber-950 tracking-tight mt-0.5">
              {formatCurrency(totalElectricity)}
            </div>
            <div className="text-xs text-amber-800 font-medium mt-1">
              {electricityExpenses.length} bills • {totalUnits > 0 ? `${totalUnits} kWh power logged` : "All units tracked"}
            </div>
          </div>
        </div>

        {/* Gas Cylinder Card */}
        <div className="bg-orange-50/70 border border-orange-200 rounded-3xl p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <button
              onClick={onOpenGasModal}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Gas</span>
            </button>
          </div>
          <div className="mt-4">
            <span className="text-[11px] uppercase font-bold text-orange-800 tracking-wider block">
              LPG Gas Refills
            </span>
            <div className="text-2xl font-black text-orange-950 tracking-tight mt-0.5">
              {formatCurrency(totalGas)}
            </div>
            <div className="text-xs text-orange-800 font-medium mt-1">
              {gasExpenses.length} refills • {totalCylinders} cylinder(s) tracked
            </div>
          </div>
        </div>

        {/* Internet & WiFi Card */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold">
              <Wifi className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-sky-700 bg-white/80 px-2.5 py-0.5 rounded-md border border-sky-200">
              Active WiFi
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[11px] uppercase font-bold text-sky-800 tracking-wider block">
              WiFi & Broadband
            </span>
            <div className="text-2xl font-black text-sky-950 tracking-tight mt-0.5">
              {formatCurrency(totalInternet)}
            </div>
            <div className="text-xs text-sky-800 font-medium mt-1">
              {internetExpenses.length} monthly cycles logged
            </div>
          </div>
        </div>
      </div>

      {/* Utility Bills History Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Utility & Fixed Maintenance Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Complete history of electricity bills, gas refills, and recurring household utilities
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {[...electricityExpenses, ...gasExpenses, ...internetExpenses].length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No utility bills recorded yet. Click above to log electricity or gas expenses.
            </div>
          ) : (
            [...electricityExpenses, ...gasExpenses, ...internetExpenses]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => {
                const isElec = expense.category === "electricity";
                const isGas = expense.category === "gas";
                const payer = memberList.find((r) => r && r.id === expense.paidBy);

                return (
                  <div
                    key={expense.id}
                    onClick={() => onViewExpenseDetails(expense)}
                    className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isElec
                            ? "bg-amber-100 text-amber-700"
                            : isGas
                            ? "bg-orange-100 text-orange-700"
                            : "bg-sky-100 text-sky-700"
                        }`}
                      >
                        {isElec ? (
                          <Zap className="w-5 h-5" />
                        ) : isGas ? (
                          <Flame className="w-5 h-5" />
                        ) : (
                          <Wifi className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {expense.description}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                          <span>{formatDate(expense.date)}</span>
                          <span>•</span>
                          <span>Paid by <strong>{payer?.shortName || expense.paidBy}</strong></span>
                          {expense.electricityMeta?.unitsConsumed && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-amber-800">
                                {expense.electricityMeta.unitsConsumed} Units (kWh)
                              </span>
                            </>
                          )}
                          {expense.gasMeta?.cylinderType && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-orange-800">
                                {expense.gasMeta.cylinderType}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-slate-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {formatCurrency(expense.amount / memberCount)} / person
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
