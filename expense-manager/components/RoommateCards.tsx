"use client";

import React from "react";
import { HouseholdMember, MemberBalance } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { ArrowUpRight, ArrowDownLeft, CheckCircle, Wallet, ArrowRight } from "lucide-react";

interface RoommateCardsProps {
  members?: HouseholdMember[];
  balances?: Record<string, MemberBalance>;
  selectedRoommate: string | null;
  onSelectRoommate: (id: string | null) => void;
  onSettleWith: (memberId: string) => void;
}

export function RoommateCards({
  members = [],
  balances = {},
  selectedRoommate,
  onSelectRoommate,
  onSettleWith,
}: RoommateCardsProps) {
  const memberList = members || [];
  const balanceMap = balances || {};

  // Grid columns based on member count (2 to 5)
  const gridColsClass =
    memberList.length === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : memberList.length === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : memberList.length === 5
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid ${gridColsClass} gap-4`}>
      {memberList.map((member) => {
        const bal = balanceMap[member.id] || {
          member,
          totalPaid: 0,
          totalShare: 0,
          settlementsPaid: 0,
          settlementsReceived: 0,
          netBalance: 0,
        };

        const isSelected = selectedRoommate === member.id;
        const net = bal.netBalance || 0;
        const isOwed = net > 0.01;
        const owes = net < -0.01;
        const isSettled = !isOwed && !owes;

        return (
          <div
            key={member.id}
            id={`member-card-${member.id}`}
            onClick={() => onSelectRoommate(isSelected ? null : member.id)}
            className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer ${
              isSelected
                ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            {/* Top row: Avatar & Room / Status tag */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={member.avatarUrl}
                    alt={member.displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs bg-slate-100"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      isOwed
                        ? "bg-emerald-500"
                        : owes
                        ? "bg-rose-500"
                        : "bg-slate-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {member.displayName}
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    {member.room || (member.role === "admin" ? "Admin" : "Member")}
                  </span>
                </div>
              </div>

              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${member.bgColor}`}
              >
                {member.shortName}
              </span>
            </div>

            {/* Net Balance Highlight */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Net Balance
              </div>
              <div className="flex items-baseline justify-between">
                <div
                  className={`text-xl font-black tracking-tight ${
                    isOwed
                      ? "text-emerald-600"
                      : owes
                      ? "text-rose-600"
                      : "text-slate-700"
                  }`}
                >
                  {isOwed && "+"}
                  {formatCurrency(net)}
                </div>

                <div className="flex items-center text-xs font-semibold gap-1">
                  {isOwed && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <ArrowDownLeft className="w-3 h-3" /> Gets Back
                    </span>
                  )}
                  {owes && (
                    <span className="inline-flex items-center gap-0.5 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      <ArrowUpRight className="w-3 h-3" /> Owes House
                    </span>
                  )}
                  {isSettled && (
                    <span className="inline-flex items-center gap-0.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 text-emerald-500" /> Settled
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown stats */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  Paid Out
                </span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(bal.totalPaid)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-medium">
                  Fair Share
                </span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(bal.totalShare)}
                </span>
              </div>
            </div>

            {/* Hover Action */}
            <div className="mt-3 flex items-center justify-between text-xs pt-1">
              <span className="text-indigo-600 font-medium group-hover:underline inline-flex items-center gap-1">
                {isSelected ? "Showing all" : "Filter expenses"}
                {!isSelected && <ArrowRight className="w-3 h-3" />}
              </span>
              {owes && (
                <button
                  id={`btn-settle-card-${member.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSettleWith(member.id);
                  }}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md border border-rose-200 flex items-center gap-1 transition"
                >
                  <Wallet className="w-3 h-3" /> Settle
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
