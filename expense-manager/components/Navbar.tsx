"use client";

import React from "react";
import { Plus, Download, Database, CheckCircle2 } from "lucide-react";

interface NavbarProps {
  onQuickAdd: () => void;
  onOpenExport: () => void;
  isSupabaseConnected: boolean;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function Navbar({
  onQuickAdd,
  onOpenExport,
  isSupabaseConnected,
  selectedMonth,
  onMonthChange,
}: NavbarProps) {
  return (
    <header id="app-navbar" className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <span className="font-bold text-lg tracking-tight">FS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">
                  FlatSplit
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Flat #402
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                4-Person Shared Expense & Settlement Manager
              </p>
            </div>
          </div>

          {/* Center: Month Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="month-select" className="sr-only">Select Month</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition"
            >
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="all">All Time</option>
            </select>

            {/* Supabase status badge */}
            <div
              title={
                isSupabaseConnected
                  ? "Connected to Supabase Realtime DB"
                  : "Local Persistence Mode (Instant sync active)"
              }
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isSupabaseConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {isSupabaseConnected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supabase Live</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Local Sync</span>
                </>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-export-report"
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition"
              title="Export Report (PDF / CSV)"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              id="btn-quick-add-navbar"
              onClick={onQuickAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs shadow-indigo-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
