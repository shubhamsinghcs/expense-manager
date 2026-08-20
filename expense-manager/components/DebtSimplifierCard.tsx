"use client";

import React from "react";
import { SimplifiedDebt, HouseholdMember } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { ArrowRight, Sparkles, CheckCircle2, Zap } from "lucide-react";

interface DebtSimplifierCardProps {
  members?: HouseholdMember[];
  simplifiedDebts?: SimplifiedDebt[];
  onRecordSettlement: (debt: {
    fromId: string;
    toId: string;
    amount: number;
  }) => void;
}

export function DebtSimplifierCard({
  members = [],
  simplifiedDebts = [],
  onRecordSettlement,
}: DebtSimplifierCardProps) {
  const memberList = members || [];
  const debtList = simplifiedDebts || [];
  const getMember = (id: string) => memberList.find((m) => m && m.id === id);

  return (
    <div id="debt-simplification-panel" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Simplified Debt Resolution
            </h2>
            <p className="text-xs text-slate-500">
              Greedy Minimum Cash-Flow algorithm reduces multi-party debts to fewest transfers
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {debtList.length} {debtList.length === 1 ? "Transfer" : "Transfers"} Needed
        </span>
      </div>

      {debtList.length === 0 ? (
        <div className="py-6 px-4 text-center bg-emerald-50/50 rounded-xl border border-emerald-100">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-emerald-900">
            Everyone is all square!
          </h3>
          <p className="text-xs text-emerald-700 mt-0.5">
            No outstanding balances between household members.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {debtList.map((debt, index) => {
            const debtor = getMember(debt.fromId);
            const creditor = getMember(debt.toId);

            const debtorName = debtor?.displayName || debt.fromId;
            const debtorShort = debtor?.shortName || debt.fromId;
            const debtorAvatar = debtor?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${debt.fromId}`;

            const creditorName = creditor?.displayName || debt.toId;
            const creditorShort = creditor?.shortName || debt.toId;
            const creditorAvatar = creditor?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${debt.toId}`;

            return (
              <div
                key={debt.id || index}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition"
              >
                {/* Visual debtor -> creditor transfer */}
                <div className="flex items-center gap-3">
                  {/* Debtor */}
                  <div className="flex items-center gap-2">
                    <img
                      src={debtorAvatar}
                      alt={debtorName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800">
                        {debtorShort}
                      </div>
                      <div className="text-[10px] text-rose-600 font-medium">
                        Owes
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-1 text-slate-400">
                    <span className="text-xs font-extrabold text-indigo-600">
                      {formatCurrency(debt.amount)}
                    </span>
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                  </div>

                  {/* Creditor */}
                  <div className="flex items-center gap-2">
                    <img
                      src={creditorAvatar}
                      alt={creditorName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                    />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800">
                        {creditorShort}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">
                        Receives
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settle button */}
                <button
                  id={`btn-settle-transfer-${debt.fromId}-${debt.toId}`}
                  onClick={() =>
                    onRecordSettlement({
                      fromId: debt.fromId,
                      toId: debt.toId,
                      amount: debt.amount,
                    })
                  }
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition"
                >
                  <Zap className="w-3 h-3" />
                  <span>Settle</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
