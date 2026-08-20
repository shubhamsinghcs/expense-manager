"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Expense,
  Settlement,
  Category,
  RoommateId,
} from "../lib/types";
import {
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  ROOMMATES,
  CATEGORIES,
} from "../lib/initial-data";
import { computeFlatMetrics } from "../lib/debt-simplifier";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { formatCurrency } from "../lib/utils";
import { Navbar } from "../components/Navbar";
import { PersonalHeader } from "../components/PersonalHeader";
import { RoommateCards } from "../components/RoommateCards";
import { DebtSimplifierCard } from "../components/DebtSimplifierCard";
import { ExpenseList } from "../components/ExpenseList";
import { CategoryBreakdown } from "../components/CategoryBreakdown";
import { SettlementsList } from "../components/SettlementsList";
import { UtilitiesSection } from "../components/UtilitiesSection";
import { QuickAddModal } from "../components/QuickAddModal";
import { EditExpenseModal } from "../components/EditExpenseModal";
import { DeleteExpenseModal } from "../components/DeleteExpenseModal";
import { ExpenseDetailModal } from "../components/ExpenseDetailModal";
import { ElectricityBillModal } from "../components/ElectricityBillModal";
import { GasCylinderModal } from "../components/GasCylinderModal";
import { DebtSettlementModal } from "../components/DebtSettlementModal";
import { ExportModal } from "../components/ExportModal";
import {
  Plus,
  TrendingUp,
  Receipt,
  Users,
  Zap,
  Flame,
  LayoutGrid,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

export default function FlatSplitDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-08");
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [selectedRoommate, setSelectedRoommate] = useState<RoommateId | null>(null);
  const [currentPersona, setCurrentPersona] = useState<RoommateId>("ssr");
  const [activeViewTab, setActiveViewTab] = useState<"dashboard" | "utilities" | "settlements">("dashboard");

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isElectricityModalOpen, setIsElectricityModalOpen] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Edit / Delete / Detail modal targets
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const [settleTarget, setSettleTarget] = useState<{
    fromId: RoommateId;
    toId: RoommateId;
    amount: number;
  } | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Data Loading & Local Storage Sync
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem("flatsplit_expenses_v2");
      const savedSettlements = localStorage.getItem("flatsplit_settlements_v2");
      const savedPersona = localStorage.getItem("flatsplit_persona");

      if (savedExpenses) {
        setExpenses(JSON.parse(savedExpenses));
      } else {
        setExpenses(INITIAL_EXPENSES);
        localStorage.setItem("flatsplit_expenses_v2", JSON.stringify(INITIAL_EXPENSES));
      }

      if (savedSettlements) {
        setSettlements(JSON.parse(savedSettlements));
      } else {
        setSettlements(INITIAL_SETTLEMENTS);
        localStorage.setItem("flatsplit_settlements_v2", JSON.stringify(INITIAL_SETTLEMENTS));
      }

      if (savedPersona && ["adi", "ssr", "harsh", "manoj"].includes(savedPersona)) {
        setCurrentPersona(savedPersona as RoommateId);
      }
    } catch {
      setExpenses(INITIAL_EXPENSES);
      setSettlements(INITIAL_SETTLEMENTS);
    }
    setIsLoaded(true);
  }, []);

  const handlePersonaChange = (id: RoommateId) => {
    setCurrentPersona(id);
    localStorage.setItem("flatsplit_persona", id);
  };

  // 2. Supabase Integration (if configured)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function fetchSupabaseData() {
      try {
        const { data: expData, error: expError } = await supabase!
          .from("expenses")
          .select("*")
          .order("date", { ascending: false });

        if (!expError && expData && expData.length > 0) {
          const mapped: Expense[] = expData.map((row: any) => ({
            id: row.id,
            description: row.description,
            amount: Number(row.amount),
            category: row.category as Category,
            paidBy: row.paid_by as RoommateId,
            date: row.date,
            splitType: row.split_type,
            splitAmong: row.split_among,
            customAmounts: row.custom_amounts,
            notes: row.notes,
            receiptUrl: row.receipt_url,
            isUtility: row.is_utility,
            electricityMeta: row.electricity_meta,
            gasMeta: row.gas_meta,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          setExpenses(mapped);
          localStorage.setItem("flatsplit_expenses_v2", JSON.stringify(mapped));
        }

        const { data: setData, error: setError } = await supabase!
          .from("settlements")
          .select("*")
          .order("date", { ascending: false });

        if (!setError && setData && setData.length > 0) {
          const mappedSet: Settlement[] = setData.map((row: any) => ({
            id: row.id,
            fromId: row.from_id as RoommateId,
            toId: row.to_id as RoommateId,
            amount: Number(row.amount),
            date: row.date,
            status: row.status || "completed",
            note: row.note,
            createdAt: row.created_at,
          }));
          setSettlements(mappedSet);
          localStorage.setItem("flatsplit_settlements_v2", JSON.stringify(mappedSet));
        }
      } catch (err) {
        console.warn("Supabase fetch fallback to local store", err);
      }
    }

    fetchSupabaseData();
  }, []);

  // Filter expenses by selected Month (exclude soft-deleted)
  const monthFilteredExpenses = useMemo(() => {
    const activeExpenses = expenses.filter((e) => !e.deletedAt);
    if (selectedMonth === "all") return activeExpenses;
    return activeExpenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Compute live flat metrics and balances
  const metrics = useMemo(() => {
    return computeFlatMetrics(monthFilteredExpenses, settlements);
  }, [monthFilteredExpenses, settlements]);

  // Category totals for breakdown
  const expensesByCategory = useMemo(() => {
    const totals: Record<Category, number> = {
      groceries: 0,
      electricity: 0,
      gas: 0,
      rent: 0,
      utilities: 0,
      snacks: 0,
      transport: 0,
      cleaning: 0,
      internet: 0,
      miscellaneous: 0,
    };
    monthFilteredExpenses.forEach((e) => {
      if (totals[e.category] !== undefined) {
        totals[e.category] += e.amount;
      } else {
        totals.miscellaneous += e.amount;
      }
    });
    return totals;
  }, [monthFilteredExpenses]);

  // Handlers
  const handleAddExpense = async (newExpenseData: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem("flatsplit_expenses_v2", JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("expenses").insert({
          id: newExpense.id,
          description: newExpense.description,
          amount: newExpense.amount,
          category: newExpense.category,
          paid_by: newExpense.paidBy,
          date: newExpense.date,
          split_type: newExpense.splitType,
          split_among: newExpense.splitAmong,
          custom_amounts: newExpense.customAmounts,
          notes: newExpense.notes,
          is_utility: newExpense.isUtility,
          electricity_meta: newExpense.electricityMeta,
          gas_meta: newExpense.gasMeta,
        });
      } catch (err) {
        console.error("Failed to insert into Supabase", err);
      }
    }
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    const updated = expenses.map((e) =>
      e.id === updatedExpense.id
        ? { ...updatedExpense, updatedAt: new Date().toISOString() }
        : e
    );
    setExpenses(updated);
    localStorage.setItem("flatsplit_expenses_v2", JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("expenses")
          .update({
            description: updatedExpense.description,
            amount: updatedExpense.amount,
            category: updatedExpense.category,
            paid_by: updatedExpense.paidBy,
            date: updatedExpense.date,
            split_type: updatedExpense.splitType,
            split_among: updatedExpense.splitAmong,
            custom_amounts: updatedExpense.customAmounts,
            notes: updatedExpense.notes,
            is_utility: updatedExpense.isUtility,
            electricity_meta: updatedExpense.electricityMeta,
            gas_meta: updatedExpense.gasMeta,
            updated_at: new Date().toISOString(),
          })
          .eq("id", updatedExpense.id);
      } catch (err) {
        console.error("Failed to update in Supabase", err);
      }
    }
  };

  const handleConfirmDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    localStorage.setItem("flatsplit_expenses_v2", JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("expenses").delete().eq("id", id);
      } catch (err) {
        console.error("Failed to delete from Supabase", err);
      }
    }
  };

  const handleRecordSettlement = async (settlementData: Omit<Settlement, "id" | "createdAt">) => {
    const newSettlement: Settlement = {
      ...settlementData,
      id: `set-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSettlement, ...settlements];
    setSettlements(updated);
    localStorage.setItem("flatsplit_settlements_v2", JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("settlements").insert({
          id: newSettlement.id,
          from_id: newSettlement.fromId,
          to_id: newSettlement.toId,
          amount: newSettlement.amount,
          date: newSettlement.date,
          status: newSettlement.status,
          note: newSettlement.note,
        });
      } catch (err) {
        console.error("Failed to insert settlement into Supabase", err);
      }
    }
  };

  const handleDeleteSettlement = async (id: string) => {
    const updated = settlements.filter((s) => s.id !== id);
    setSettlements(updated);
    localStorage.setItem("flatsplit_settlements_v2", JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("settlements").delete().eq("id", id);
      } catch (err) {
        console.error("Failed to delete settlement from Supabase", err);
      }
    }
  };

  const handleOpenSettlementForDebt = (debt: {
    fromId: RoommateId;
    toId: RoommateId;
    amount: number;
  }) => {
    setSettleTarget(debt);
    setIsSettlementModalOpen(true);
  };

  const handleSettleWithRoommate = (roommateId: RoommateId) => {
    const matchingDebt = metrics.simplifiedDebts.find(
      (d) => d.fromId === roommateId || d.toId === roommateId
    );
    if (matchingDebt) {
      setSettleTarget(matchingDebt);
    } else {
      setSettleTarget({
        fromId: roommateId,
        toId: currentPersona !== roommateId ? currentPersona : "ssr",
        amount: Math.abs(metrics.balances[roommateId]?.netBalance || 0),
      });
    }
    setIsSettlementModalOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm font-bold flex items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading FlatSplit #402...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Navbar */}
      <Navbar
        onQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        isSupabaseConnected={isSupabaseConfigured}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-6">
        {/* Personal Header: Current flatmate persona switcher + personalized balance badge + quick utility action triggers */}
        <PersonalHeader
          currentPersona={currentPersona}
          onPersonaChange={handlePersonaChange}
          metrics={metrics}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenElectricityModal={() => setIsElectricityModalOpen(true)}
          onOpenGasModal={() => setIsGasModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

        {/* View Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
          <div className="flex bg-slate-200/70 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveViewTab("dashboard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeViewTab === "dashboard"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Overview & Ledger</span>
            </button>

            <button
              onClick={() => setActiveViewTab("utilities")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeViewTab === "utilities"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Electricity & Gas Tracker</span>
              {monthFilteredExpenses.filter((e) => e.category === "electricity" || e.category === "gas").length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-black">
                  {monthFilteredExpenses.filter((e) => e.category === "electricity" || e.category === "gas").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveViewTab("settlements")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeViewTab === "settlements"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span>Settlement Transfers</span>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-black">
                {settlements.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsElectricityModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Electricity Bill</span>
            </button>
            <button
              onClick={() => setIsGasModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition"
            >
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>+ Gas Cylinder</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Standard Dashboard & Transaction List */}
        {activeViewTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Metric Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Spend */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Total Month Spend
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    INR (₹)
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(metrics.totalSpent)}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <span>{monthFilteredExpenses.length} purchases recorded</span>
                </div>
              </div>

              {/* Average Per Person */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Fair Share / Flatmate
                  </span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(metrics.totalSpent / 4)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Equal 4-way baseline across flat
                </div>
              </div>

              {/* Top Category */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Top Spending Category
                  </span>
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight capitalize truncate">
                  {CATEGORIES[metrics.topCategory.category]?.label || metrics.topCategory.category}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {formatCurrency(metrics.topCategory.amount)} ({metrics.topCategory.percentage.toFixed(0)}%)
                </div>
              </div>

              {/* Outstanding Debts */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Settlements Needed
                  </span>
                  <Receipt className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {metrics.simplifiedDebts.length}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {metrics.simplifiedDebts.length === 0
                    ? "All 4 flatmates all square"
                    : "Minimum transfer routes"}
                </div>
              </div>
            </div>

            {/* 4 Roommate Profile Cards */}
            <section aria-label="Roommate Balances">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Flatmate Standings & Balances
                </h2>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Click any flatmate card to filter their expenses
                </span>
              </div>
              <RoommateCards
                balances={metrics.balances}
                selectedRoommate={selectedRoommate}
                onSelectRoommate={setSelectedRoommate}
                onSettleWith={handleSettleWithRoommate}
              />
            </section>

            {/* Greedy Debt Simplification Solution */}
            <section aria-label="Debt Simplification">
              <DebtSimplifierCard
                simplifiedDebts={metrics.simplifiedDebts}
                onRecordSettlement={handleOpenSettlementForDebt}
              />
            </section>

            {/* Main 2-Column Split: Expenses List & Category Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Expenses List with Edit, Delete & Detail actions */}
              <div className="lg:col-span-2 space-y-6">
                <ExpenseList
                  expenses={monthFilteredExpenses}
                  onEditExpense={(exp) => setEditingExpense(exp)}
                  onDeleteExpense={(exp) => setDeletingExpense(exp)}
                  onViewExpenseDetails={(exp) => setViewingExpense(exp)}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedRoommate={selectedRoommate}
                  onClearRoommateFilter={() => setSelectedRoommate(null)}
                  onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                />

              </div>

              {/* Right 1 Col: Category Breakdown + Settlement History */}
              <div className="space-y-6">
                <CategoryBreakdown
                  metrics={metrics}
                  expensesByCategory={expensesByCategory}
                />

                <SettlementsList
                  settlements={settlements}
                  onDeleteSettlement={handleDeleteSettlement}
                  onOpenSettleModal={() => {
                    setSettleTarget(null);
                    setIsSettlementModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Utilities Section */}
        {activeViewTab === "utilities" && (
          <div className="animate-in fade-in duration-200">
            <UtilitiesSection
              expenses={expenses}
              onOpenElectricityModal={() => setIsElectricityModalOpen(true)}
              onOpenGasModal={() => setIsGasModalOpen(true)}
              onViewExpenseDetails={(exp) => setViewingExpense(exp)}
            />
          </div>
        )}

        {/* Tab 3: Settlements Section */}
        {activeViewTab === "settlements" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <DebtSimplifierCard
              simplifiedDebts={metrics.simplifiedDebts}
              onRecordSettlement={handleOpenSettlementForDebt}
            />

            <SettlementsList
              settlements={settlements}
              onDeleteSettlement={handleDeleteSettlement}
              onOpenSettleModal={() => {
                setSettleTarget(null);
                setIsSettlementModalOpen(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile & Quick access) */}
      <div className="fixed bottom-6 right-6 z-20 sm:hidden">
        <button
          id="btn-fab-quick-add"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Quick Add Expense Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddExpense={handleAddExpense}
        defaultPayer={currentPersona}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSaveExpense={handleUpdateExpense}
      />

      {/* Delete Expense Modal */}
      <DeleteExpenseModal
        isOpen={!!deletingExpense}
        expense={deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirmDelete={handleConfirmDeleteExpense}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        isOpen={!!viewingExpense}
        expense={viewingExpense}
        onClose={() => setViewingExpense(null)}
        onEdit={(exp) => {
          setViewingExpense(null);
          setEditingExpense(exp);
        }}
        onDelete={(exp) => {
          setViewingExpense(null);
          setDeletingExpense(exp);
        }}
      />


      {/* Electricity Bill Modal */}
      <ElectricityBillModal
        isOpen={isElectricityModalOpen}
        onClose={() => setIsElectricityModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      {/* Gas Cylinder Modal */}
      <GasCylinderModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        onAddExpense={handleAddExpense}
      />

      {/* Settle Debt Modal */}
      <DebtSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        initialData={settleTarget}
        onRecordSettlement={handleRecordSettlement}
      />

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        expenses={monthFilteredExpenses}
        settlements={settlements}
        metrics={metrics}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
