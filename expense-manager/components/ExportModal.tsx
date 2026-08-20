"use client";

import React, { useState } from "react";
import { Expense, Settlement, FlatMetrics } from "../lib/types";
import { exportExpensesToCSV, exportMonthlyReportPDF } from "../lib/export";
import { X, FileSpreadsheet, FileText, Download, Check } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  settlements: Settlement[];
  metrics: FlatMetrics;
  selectedMonth: string;
}

export function ExportModal({
  isOpen,
  onClose,
  expenses,
  settlements,
  metrics,
  selectedMonth,
}: ExportModalProps) {
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const monthLabel =
    selectedMonth === "all"
      ? "All Time Summary"
      : selectedMonth === "2026-08"
      ? "August 2026"
      : selectedMonth === "2026-07"
      ? "July 2026"
      : "June 2026";

  const handleExportCSV = () => {
    exportExpensesToCSV(expenses);
    setDownloadedFormat("CSV");
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const handleExportPDF = () => {
    exportMonthlyReportPDF(expenses, settlements, metrics, monthLabel);
    setDownloadedFormat("PDF");
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div
        id="export-modal"
        className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Export Expense Report
              </h3>
              <p className="text-xs text-slate-500">{monthLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {downloadedFormat && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{downloadedFormat} file generated and downloaded successfully!</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Download your flat expenses, roommate share calculations, and debt simplification plan for your records or accounting.
          </p>

          <div className="space-y-3">
            {/* PDF Report */}
            <div
              onClick={handleExportPDF}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                    PDF Monthly Statement
                  </h4>
                  <p className="text-xs text-slate-500">
                    Includes balance sheet, optimal transfers, and invoice itemization
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>

            {/* CSV Export */}
            <div
              onClick={handleExportCSV}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600">
                    CSV Raw Data Export
                  </h4>
                  <p className="text-xs text-slate-500">
                    Full spreadsheet compatible with Excel, Google Sheets, & Numbers
                  </p>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
