"use client";

import React from "react";
import { Settlement, HouseholdMember } from "../lib/types";
import { formatCurrency, formatDate } from "../lib/utils";
import { ArrowRight, CheckCircle, Trash2, Wallet } from "lucide-react";

interface SettlementsListProps {
  settlements?: Settlement[];
  members?: HouseholdMember[];
  onDeleteSettlement: (id: string) => void;
  onOpenSettleModal: () => void;
}

export function SettlementsList({
  settlements = [],
  members = [],
  onDeleteSettlement,
  onOpenSettleModal,
}: SettlementsListProps) {
  const settlementList = settlements || [];
  const memberList = members || [];
  const getMember = (id: string) => memberList.find((r) => r && r.id === id);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 leading-tight">
            Settlement History
          </h2>
          <p className="text-xs text-slate-500">
            {settlementList.length} completed {settlementList.length === 1 ? "settlement" : "settlements"}
          </p>
        </div>

        <button
          id="btn-custom-settlement"
          onClick={onOpenSettleModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Record Settlement</span>
        </button>
      </div>

      {settlementList.length === 0 ? (
        <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-600">
            No settlements recorded yet
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Use the debt simplification panel above to record settled transfers.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {settlementList.map((s) => {
            const sender = getMember(s.fromId);
            const receiver = getMember(s.toId);

            return (
              <div
                key={s.id}
                id={`settlement-item-${s.id}`}
                className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span>{sender?.shortName || s.fromId}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span>{receiver?.shortName || s.toId}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{formatDate(s.date)}</span>
                      {s.note && <span>• {s.note}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-emerald-600">
                    {formatCurrency(s.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteSettlement(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
