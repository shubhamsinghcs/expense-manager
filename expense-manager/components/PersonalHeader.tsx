"use client";

import React from "react";
import { HouseholdMember, FlatMetrics } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Plus,
  Zap,
  Flame,
  UserCheck,
} from "lucide-react";

interface PersonalHeaderProps {
  currentPersona?: string;
  onPersonaChange: (id: string) => void;
  members?: HouseholdMember[];
  householdName?: string;
  metrics?: FlatMetrics;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  onOpenQuickAdd: () => void;
  onOpenElectricityModal: () => void;
  onOpenGasModal: () => void;
  onOpenSettlementModal?: () => void;
  onOpenExportModal?: () => void;
}

export function PersonalHeader({
  currentPersona = "",
  onPersonaChange,
  members = [],
  householdName = "Household",
  metrics,
  selectedMonth,
  onMonthChange,
  onOpenQuickAdd,
  onOpenElectricityModal,
  onOpenGasModal,
  onOpenSettlementModal,
  onOpenExportModal,
}: PersonalHeaderProps) {
  const memberList = members || [];
  const currentMember =
    memberList.find((m) => m && m.id === currentPersona) ||
    memberList[0] || {
      id: "guest",
      displayName: "You",
      shortName: "You",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=You",
      room: "Room 1",
    };

  const personalBal = (metrics?.balances && currentPersona ? metrics.balances[currentPersona] : null) || {
    totalPaid: 0,
    totalShare: 0,
    settlementsPaid: 0,
    settlementsReceived: 0,
    netBalance: 0,
  };

  const net = personalBal.netBalance || 0;
  const isOwed = net > 0.01;
  const owes = net < -0.01;
  const isSettled = !isOwed && !owes;

  // Find incoming and outgoing debts for active roommate
  const simplifiedDebts = metrics?.simplifiedDebts || [];
  const moneyComingToYou = simplifiedDebts.filter(
    (d) => d && d.toId === currentPersona
  );
  const moneyYouNeedToPay = simplifiedDebts.filter(
    (d) => d && d.fromId === currentPersona
  );

  return (
    <div
      id="personal-dashboard-header"
      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/60 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Greeting & Persona Switcher */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              Viewing as
            </span>

            {/* Persona Switcher Pill Group */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
              {memberList.map((m) => (
                <button
                  key={m.id}
                  id={`btn-select-persona-${m.id}`}
                  onClick={() => onPersonaChange(m.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    currentPersona === m.id
                      ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.color === "emerald"
                        ? "bg-emerald-500"
                        : m.color === "amber"
                        ? "bg-amber-500"
                        : m.color === "rose"
                        ? "bg-rose-500"
                        : m.color === "sky"
                        ? "bg-sky-500"
                        : m.color === "purple"
                        ? "bg-purple-500"
                        : "bg-indigo-500"
                    }`}
                  />
                  <span>{m.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={currentMember.avatarUrl}
              alt={currentMember.displayName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-indigo-100 bg-slate-100"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hello, {currentMember.displayName}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentMember.room ? `${currentMember.room} • ` : ""}
                {householdName} ({members.length} {members.length === 1 ? "Member" : "Members"})
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Net Standing Card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200">
          <div className="pr-4 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
              Your Net Standing
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isOwed
                    ? "text-emerald-600"
                    : owes
                    ? "text-rose-600"
                    : "text-slate-700"
                }`}
              >
                {isOwed && "+"}
                {formatCurrency(net)}
              </span>
            </div>
            <div className="text-xs font-semibold mt-1">
              {isOwed && (
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> You should receive {formatCurrency(net)}
                </span>
              )}
              {owes && (
                <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5" /> You need to pay {formatCurrency(Math.abs(net))}
                </span>
              )}
              {isSettled && (
                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> You are fully settled up!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pl-0 sm:pl-2">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                You Paid Out
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {formatCurrency(personalBal.totalPaid)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">
                Your Fair Share
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {formatCurrency(personalBal.totalShare)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar for Instant Operations */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-quick-add-hero"
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs shadow-indigo-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>

          <button
            id="btn-add-electricity-hero"
            onClick={onOpenElectricityModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Electricity Bill</span>
          </button>

          <button
            id="btn-add-gas-hero"
            onClick={onOpenGasModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition"
          >
            <Flame className="w-4 h-4 text-orange-600" />
            <span>Gas Cylinder</span>
          </button>
        </div>

        {/* Direct personal debt status breakdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {moneyComingToYou.length > 0 && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {moneyComingToYou
                  .map(
                    (d) =>
                      `${memberList.find((m) => m && m.id === d.fromId)?.shortName || d.fromId} owes you ${formatCurrency(d.amount)}`
                  )
                  .join(", ")}
              </span>
            </div>
          )}

          {moneyYouNeedToPay.length > 0 && (
            <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>
                {moneyYouNeedToPay
                  .map(
                    (d) =>
                      `Pay ${memberList.find((m) => m && m.id === d.toId)?.shortName || d.toId} ${formatCurrency(d.amount)}`
                  )
                  .join(", ")}
              </span>
              {onOpenSettlementModal && (
                <button
                  onClick={onOpenSettlementModal}
                  className="ml-1 px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-md transition"
                >
                  Settle
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
