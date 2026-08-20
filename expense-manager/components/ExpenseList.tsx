"use client";

import React, { useState, useMemo } from "react";
import { Expense, Category, HouseholdMember } from "../lib/types";
import { CATEGORIES } from "../lib/initial-data";
import { formatCurrency, formatDate } from "../lib/utils";
import { calculateExpenseSplits } from "../lib/debt-simplifier";
import {
  Search,
  ShoppingCart,
  Zap,
  Flame,
  Home,
  Droplets,
  Utensils,
  Car,
  Sparkles,
  Wifi,
  MoreHorizontal,
  Trash2,
  Edit2,
  Eye,
  Users,
  Calendar,
  Tag,
  Filter,
  FileSpreadsheet,
} from "lucide-react";

interface ExpenseListProps {
  expenses?: Expense[];
  members?: HouseholdMember[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onViewExpenseDetails: (expense: Expense) => void;
  selectedCategory: Category | "all";
  onCategoryChange: (cat: Category | "all") => void;
  selectedRoommate: string | null;
  onClearRoommateFilter: () => void;
  onSelectRoommateFilter?: (id: string | null) => void;
  onOpenQuickAdd: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart,
  Zap,
  Flame,
  Home,
  Droplets,
  Utensils,
  Car,
  Sparkles,
  Wifi,
  MoreHorizontal,
};

export function ExpenseList({
  expenses = [],
  members = [],
  onEditExpense,
  onDeleteExpense,
  onViewExpenseDetails,
  selectedCategory,
  onCategoryChange,
  selectedRoommate,
  onClearRoommateFilter,
  onSelectRoommateFilter,
  onOpenQuickAdd,
}: ExpenseListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  const memberList = members || [];
  const expenseList = expenses || [];

  const filteredExpenses = useMemo(() => {
    return expenseList
      .filter((e) => e && !e.deletedAt)
      .filter((e) => {
        // Category filter
        if (selectedCategory !== "all" && e.category !== selectedCategory) {
          return false;
        }
        // Roommate / Member filter (either paid by, or in split)
        if (selectedRoommate) {
          const isPayer = e.paidBy === selectedRoommate;
          const isInSplit = Array.isArray(e.splitAmong) && e.splitAmong.includes(selectedRoommate);
          if (!isPayer && !isInSplit) return false;
        }
        // Search text filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const descMatch = (e.description || "").toLowerCase().includes(q);
          const notesMatch = (e.notes || "").toLowerCase().includes(q);
          const payer = memberList.find((m) => m && m.id === e.paidBy);
          const payerMatch = (payer?.displayName || "").toLowerCase().includes(q);
          const amountMatch = (Number(e.amount) || 0).toString().includes(q);
          if (!descMatch && !notesMatch && !payerMatch && !amountMatch) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const amtA = Number(a.amount) || 0;
        const amtB = Number(b.amount) || 0;
        if (sortBy === "date-desc") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (sortBy === "date-asc") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        if (sortBy === "amount-desc") return amtB - amtA;
        if (sortBy === "amount-asc") return amtA - amtB;
        return 0;
      });
  }, [expenseList, memberList, selectedCategory, selectedRoommate, searchQuery, sortBy]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const activeMemberObj = memberList.find((m) => m && m.id === selectedRoommate);

  return (
    <div id="recent-transactions-section" className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Recent Transactions & Expenses
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filteredExpenses.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Summary of all shared purchases with instant options to edit, inspect itemization, or delete entries.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-transactions-input"
              type="text"
              placeholder="Search expenses, notes, payer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <label htmlFor="sort-by-select" className="sr-only">Sort Transactions</label>
            <div className="relative">
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin text-xs">
        <button
          onClick={() => onCategoryChange("all")}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
            selectedCategory === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
          }`}
        >
          All Categories
        </button>

        {(Object.keys(CATEGORIES) as Category[]).map((catKey) => {
          const cat = CATEGORIES[catKey];
          const isSelected = selectedCategory === catKey;
          const Icon = ICON_MAP[cat.iconName] || Tag;

          return (
            <button
              key={catKey}
              onClick={() => onCategoryChange(catKey)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Member Filter Banner if applied */}
      {selectedRoommate && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Showing transactions involving <strong>{activeMemberObj?.displayName || selectedRoommate}</strong>
            </span>
          </div>
          <button
            onClick={onClearRoommateFilter}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Transactions Summary Metric Bar */}
      <div className="flex items-center justify-between py-2 px-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600">
          Showing {filteredExpenses.length} entries
        </span>
        <span className="font-bold text-slate-900">
          Total Sum: <span className="text-indigo-600 font-black">{formatCurrency(totalFilteredAmount)}</span>
        </span>
      </div>

      {/* Transactions List */}
      {filteredExpenses.length === 0 ? (
        <div className="py-14 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
          <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300" />
          <div>
            <p className="text-sm font-bold text-slate-700">No transactions match your search</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Try adjusting your search criteria or add a new expense.
            </p>
          </div>
          <button
            onClick={onOpenQuickAdd}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
          >
            Log New Expense
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {filteredExpenses.map((expense) => {
            const cat = CATEGORIES[expense.category] || CATEGORIES.miscellaneous;
            const Icon = ICON_MAP[cat?.iconName] || Tag;
            const payer = memberList.find((m) => m && m.id === expense.paidBy);
            const splits = calculateExpenseSplits(expense, memberList);
            const activeParticipantCount = expense.splitAmong?.length || memberList.length;
            const sharePerPerson = (Number(expense.amount) || 0) / Math.max(1, activeParticipantCount);

            return (
              <div
                key={expense.id}
                id={`expense-row-${expense.id}`}
                className="p-4 hover:bg-slate-50/90 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left: Category Icon + Description + Metadata */}
                <div
                  onClick={() => onViewExpenseDetails(expense)}
                  className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${cat.bgColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition truncate max-w-sm sm:max-w-md">
                        {expense.description}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${cat.bgColor}`}
                      >
                        {cat.label}
                      </span>
                      {expense.isUtility && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" /> Utility
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3.5 mt-1 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(expense.date)}
                      </span>

                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        Paid by{" "}
                        <span className="text-slate-900 font-extrabold flex items-center gap-1">
                          <img
                            src={payer?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${expense.paidBy}`}
                            alt={payer?.displayName || expense.paidBy}
                            className="w-4 h-4 rounded-full object-cover inline-block bg-slate-100"
                          />
                          {payer?.shortName || expense.paidBy}
                        </span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {expense.splitType === "equal"
                          ? `Split all ${memberList.length} (₹${sharePerPerson.toFixed(0)}/ea)`
                          : expense.splitType === "selective"
                          ? `Split ${activeParticipantCount} (₹${sharePerPerson.toFixed(0)}/ea)`
                          : "Custom amounts"}
                      </span>
                    </div>

                    {/* Participant Share Badges */}
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 mr-1">Participants:</span>
                      {memberList.map((m) => {
                        const inSplit = expense.splitAmong?.includes(m.id);
                        if (!inSplit) return null;
                        return (
                          <span
                            key={m.id}
                            title={`${m.displayName}: Share ${formatCurrency(splits[m.id] || 0)}`}
                            className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {m.shortName} (₹{Math.round(splits[m.id] || 0)})
                          </span>
                        );
                      })}
                    </div>

                    {expense.notes && (
                      <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                        "{expense.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount Display & Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-lg font-black text-slate-900 tracking-tight">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      {formatCurrency(sharePerPerson)} / person
                    </div>
                  </div>

                  {/* Actions: View / Edit / Delete */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      id={`btn-view-details-${expense.id}`}
                      type="button"
                      onClick={() => onViewExpenseDetails(expense)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                      title="View itemized breakdown"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-edit-expense-${expense.id}`}
                      type="button"
                      onClick={() => onEditExpense(expense)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-delete-expense-${expense.id}`}
                      type="button"
                      onClick={() => onDeleteExpense(expense)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-white rounded-lg transition"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
