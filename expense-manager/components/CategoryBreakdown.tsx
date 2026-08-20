"use client";

import React from "react";
import { FlatMetrics, Category } from "../lib/types";
import { CATEGORIES } from "../lib/initial-data";
import { formatCurrency } from "../lib/utils";
import {
  PieChart,
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
  Tag,
} from "lucide-react";

interface CategoryBreakdownProps {
  metrics?: FlatMetrics;
  expensesByCategory?: Record<Category, number>;
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

export function CategoryBreakdown({
  metrics,
  expensesByCategory = {} as Record<Category, number>,
}: CategoryBreakdownProps) {
  const total = (metrics?.totalSpent && metrics.totalSpent > 0) ? metrics.totalSpent : 1;
  const catMap = expensesByCategory || {};

  const sortedCategories = (Object.keys(CATEGORIES) as Category[])
    .map((catKey) => {
      const amount = catMap[catKey] || 0;
      const percentage = (amount / total) * 100;
      return {
        key: catKey,
        info: CATEGORIES[catKey],
        amount,
        percentage,
      };
    })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              Spend by Category
            </h2>
            <p className="text-xs text-slate-500">
              Total Flat Spend: <strong>{formatCurrency(metrics?.totalSpent || 0)}</strong>
            </p>
          </div>
        </div>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No expenses recorded for this period.
        </div>
      ) : (
        <div className="space-y-3.5">
          {sortedCategories.map((cat) => {
            const Icon = ICON_MAP[cat.info.iconName] || Tag;

            return (
              <div key={cat.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Icon className={`w-3.5 h-3.5 ${cat.info.color}`} />
                    <span>{cat.info.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(cat.amount)}
                    </span>
                    <span className="text-slate-400 text-[11px] w-12 text-right font-medium">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(2, cat.percentage))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
