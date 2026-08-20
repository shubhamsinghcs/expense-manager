import {
  Expense,
  Settlement,
  HouseholdMember,
  MemberBalance,
  SimplifiedDebt,
  FlatMetrics,
  Category,
} from "./types";
import { CATEGORIES } from "./initial-data";

/**
 * Distribute an amount among N participants with deterministic paise/cent rounding
 * so that sum(shares) === totalAmount exactly.
 */
export function distributeAmountEqually(
  totalAmount: number,
  participantIds: string[]
): Record<string, number> {
  const result: Record<string, number> = {};
  if (!participantIds || participantIds.length === 0) return result;

  const validAmount = Number(totalAmount) || 0;
  const totalCents = Math.round(validAmount * 100);
  const baseCents = Math.floor(totalCents / participantIds.length);
  const remainderCents = totalCents % participantIds.length;

  participantIds.forEach((id, index) => {
    // Distribute remainder cents to initial participants
    const shareCents = baseCents + (index < remainderCents ? 1 : 0);
    result[id] = shareCents / 100;
  });

  return result;
}

/**
 * Calculate the exact share per participant for any expense (Equal, Selective, or Custom)
 */
export function calculateExpenseSplits(
  expense: Expense,
  allMembers?: HouseholdMember[]
): Record<string, number> {
  const shares: Record<string, number> = {};
  if (!expense) return shares;

  const totalAmount = Number(expense.amount) || 0;

  // Initialize shares for any known members
  if (allMembers && Array.isArray(allMembers)) {
    allMembers.forEach((m) => {
      if (m && m.id) {
        shares[m.id] = 0;
      }
    });
  }

  if (expense.splitType === "custom" && expense.customAmounts) {
    let customSum = 0;
    Object.entries(expense.customAmounts).forEach(([id, amt]) => {
      const numAmt = Math.round((Number(amt) || 0) * 100) / 100;
      shares[id] = numAmt;
      customSum += numAmt;
    });

    // If rounding discrepancy exists, adjust on the first active participant
    const diff = Math.round((totalAmount - customSum) * 100) / 100;
    if (Math.abs(diff) > 0.001) {
      const firstActive = Object.keys(expense.customAmounts)[0];
      if (firstActive && shares[firstActive] !== undefined) {
        shares[firstActive] = Math.round((shares[firstActive] + diff) * 100) / 100;
      }
    }
  } else {
    let participants = Array.isArray(expense.splitAmong) ? expense.splitAmong : [];
    if (participants.length === 0) {
      participants =
        allMembers && allMembers.length > 0
          ? allMembers.map((m) => m.id)
          : expense.paidBy
          ? [expense.paidBy]
          : [];
    }

    const distributed = distributeAmountEqually(totalAmount, participants);
    Object.entries(distributed).forEach(([id, share]) => {
      shares[id] = share;
    });
  }

  return shares;
}

function isMemberArray(arr: unknown[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const first = arr[0];
  return Boolean(
    first &&
      typeof first === "object" &&
      ("displayName" in first || "shortName" in first || "role" in first || "room" in first)
  );
}

function isExpenseArray(arr: unknown[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const first = arr[0];
  return Boolean(
    first &&
      typeof first === "object" &&
      ("paidBy" in first || "splitAmong" in first || "splitType" in first || "category" in first || "description" in first)
  );
}

function isSettlementArray(arr: unknown[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const first = arr[0];
  return Boolean(
    first &&
      typeof first === "object" &&
      ("fromId" in first || "toId" in first || "status" in first)
  );
}

function parseEngineArgs(
  arg1?: unknown,
  arg2?: unknown,
  arg3?: unknown
): { members: HouseholdMember[]; expenses: Expense[]; settlements: Settlement[] } {
  let members: HouseholdMember[] = [];
  let expenses: Expense[] = [];
  let settlements: Settlement[] = [];

  const a1 = Array.isArray(arg1) ? (arg1 as unknown[]) : [];
  const a2 = Array.isArray(arg2) ? (arg2 as unknown[]) : [];
  const a3 = Array.isArray(arg3) ? (arg3 as unknown[]) : [];

  if (isMemberArray(a1)) {
    // (members, expenses, settlements)
    members = a1 as HouseholdMember[];
    expenses = a2 as Expense[];
    settlements = a3 as Settlement[];
  } else if (isMemberArray(a3)) {
    // (expenses, settlements, members)
    expenses = a1 as Expense[];
    settlements = a2 as Settlement[];
    members = a3 as HouseholdMember[];
  } else if (isExpenseArray(a1)) {
    // (expenses, settlements, members?)
    expenses = a1 as Expense[];
    if (isMemberArray(a2)) {
      members = a2 as HouseholdMember[];
      settlements = a3 as Settlement[];
    } else {
      settlements = a2 as Settlement[];
      members = a3 as HouseholdMember[];
    }
  } else if (isExpenseArray(a2)) {
    // (members, expenses, settlements)
    members = a1 as HouseholdMember[];
    expenses = a2 as Expense[];
    settlements = a3 as Settlement[];
  } else {
    // Fallback based on argument count
    if (arg3 !== undefined) {
      if (a1.length === 0 && a3.length > 0 && isMemberArray(a3)) {
        expenses = a1 as Expense[];
        settlements = a2 as Settlement[];
        members = a3 as HouseholdMember[];
      } else {
        // default 3 args: (members, expenses, settlements)
        members = a1 as HouseholdMember[];
        expenses = a2 as Expense[];
        settlements = a3 as Settlement[];
      }
    } else {
      // 2 args: default (expenses, settlements)
      expenses = a1 as Expense[];
      settlements = a2 as Settlement[];
    }
  }

  // If members array is empty, synthesize from expenses and settlements
  if (members.length === 0) {
    const memberIds = new Set<string>();
    expenses.forEach((e) => {
      if (e && e.paidBy) memberIds.add(e.paidBy);
      if (e && Array.isArray(e.splitAmong)) {
        e.splitAmong.forEach((id) => {
          if (id) memberIds.add(id);
        });
      }
    });
    settlements.forEach((s) => {
      if (s && s.fromId) memberIds.add(s.fromId);
      if (s && s.toId) memberIds.add(s.toId);
    });

    members = Array.from(memberIds).map((id, index) => ({
      id,
      householdId: "h-default",
      displayName: id.charAt(0).toUpperCase() + id.slice(1),
      shortName: id.charAt(0).toUpperCase() + id.slice(1),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
      color: "indigo",
      bgColor: "bg-indigo-50 text-indigo-700",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-600",
      role: index === 0 ? "admin" : "member",
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
  }

  return { members, expenses, settlements };
}

/**
 * Calculate individual member balances dynamically for N members (2-5).
 */
export function calculateBalances(
  arg1?: unknown,
  arg2?: unknown,
  arg3?: unknown
): Record<string, MemberBalance> {
  const { members, expenses, settlements } = parseEngineArgs(arg1, arg2, arg3);
  const balances: Record<string, MemberBalance> = {};

  // Initialize for all active members
  members.forEach((m) => {
    if (m && m.id) {
      balances[m.id] = {
        member: m,
        totalPaid: 0,
        totalShare: 0,
        settlementsPaid: 0,
        settlementsReceived: 0,
        netBalance: 0,
      };
    }
  });

  // Calculate expense impacts (only non-deleted expenses)
  const activeExpenses = expenses.filter((e) => e && !e.deletedAt);

  activeExpenses.forEach((expense) => {
    if (!expense) return;
    const amount = Number(expense.amount) || 0;
    const payerId = expense.paidBy;

    if (payerId) {
      if (balances[payerId]) {
        balances[payerId].totalPaid += amount;
      } else {
        // Create fallback entry if member was removed/not in active list
        balances[payerId] = {
          member: {
            id: payerId,
            householdId: expense.householdId || "h-default",
            displayName: payerId,
            shortName: payerId,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${payerId}`,
            color: "slate",
            bgColor: "bg-slate-50 text-slate-700",
            borderColor: "border-slate-200",
            textColor: "text-slate-600",
            role: "member",
            isActive: false,
            createdAt: expense.createdAt || new Date().toISOString(),
          },
          totalPaid: amount,
          totalShare: 0,
          settlementsPaid: 0,
          settlementsReceived: 0,
          netBalance: 0,
        };
      }
    }

    const shares = calculateExpenseSplits(expense, members);
    Object.entries(shares).forEach(([id, share]) => {
      if (!balances[id]) {
        balances[id] = {
          member: {
            id,
            householdId: "h-default",
            displayName: id,
            shortName: id,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
            color: "slate",
            bgColor: "bg-slate-50 text-slate-700",
            borderColor: "border-slate-200",
            textColor: "text-slate-600",
            role: "member",
            isActive: false,
            createdAt: new Date().toISOString(),
          },
          totalPaid: 0,
          totalShare: 0,
          settlementsPaid: 0,
          settlementsReceived: 0,
          netBalance: 0,
        };
      }
      balances[id].totalShare += share;
    });
  });

  // Calculate settlement impacts (only completed settlements)
  settlements
    .filter((s) => s && s.status !== "cancelled")
    .forEach((s) => {
      const amount = Number(s.amount) || 0;
      if (s.fromId && balances[s.fromId]) {
        balances[s.fromId].settlementsPaid += amount;
      }
      if (s.toId && balances[s.toId]) {
        balances[s.toId].settlementsReceived += amount;
      }
    });

  // Final Net Balance calculation
  Object.keys(balances).forEach((key) => {
    const b = balances[key];
    b.totalPaid = Math.round(b.totalPaid * 100) / 100;
    b.totalShare = Math.round(b.totalShare * 100) / 100;
    b.settlementsPaid = Math.round(b.settlementsPaid * 100) / 100;
    b.settlementsReceived = Math.round(b.settlementsReceived * 100) / 100;
    b.netBalance =
      Math.round(
        (b.totalPaid - b.totalShare + (b.settlementsPaid - b.settlementsReceived)) * 100
      ) / 100;
  });

  return balances;
}

/**
 * Greedy Debt Simplification (Minimum Cash Flow algorithm)
 * Dynamic for 2-5 members. Simplifies N-person debts into at most N-1 direct transfers.
 */
export function simplifyDebts(
  balances: Record<string, MemberBalance>
): SimplifiedDebt[] {
  if (!balances) return [];

  // Extract net balances
  const netAmounts: { id: string; amount: number }[] = Object.keys(balances)
    .filter((id) => balances[id] && typeof balances[id].netBalance === "number")
    .map((id) => ({
      id,
      amount: Math.round(balances[id].netBalance * 100) / 100,
    }));

  if (netAmounts.length === 0) {
    return [];
  }

  const debts: SimplifiedDebt[] = [];
  const EPSILON = 0.01;
  let iterations = 0;
  const maxIterations = 30;

  while (iterations < maxIterations) {
    iterations++;

    // Find biggest debtor (min negative net) and biggest creditor (max positive net)
    let minIndex = 0;
    let maxIndex = 0;

    for (let i = 1; i < netAmounts.length; i++) {
      if (netAmounts[i].amount < netAmounts[minIndex].amount) {
        minIndex = i;
      }
      if (netAmounts[i].amount > netAmounts[maxIndex].amount) {
        maxIndex = i;
      }
    }

    const maxDebtor = netAmounts[minIndex];
    const maxCreditor = netAmounts[maxIndex];

    // If both debtor or creditor are missing or all settled
    if (
      !maxDebtor ||
      !maxCreditor ||
      (Math.abs(maxDebtor.amount) < EPSILON && Math.abs(maxCreditor.amount) < EPSILON)
    ) {
      break;
    }

    if (maxDebtor.amount >= -EPSILON || maxCreditor.amount <= EPSILON) {
      break;
    }

    // Amount to transfer is minimum of debtor debt and creditor credit
    const transferAmount = Math.min(-maxDebtor.amount, maxCreditor.amount);
    const roundedTransfer = Math.round(transferAmount * 100) / 100;

    if (roundedTransfer > 0) {
      debts.push({
        id: `debt-${maxDebtor.id}-${maxCreditor.id}-${debts.length + 1}`,
        fromId: maxDebtor.id,
        toId: maxCreditor.id,
        amount: roundedTransfer,
      });

      maxDebtor.amount = Math.round((maxDebtor.amount + roundedTransfer) * 100) / 100;
      maxCreditor.amount = Math.round((maxCreditor.amount - roundedTransfer) * 100) / 100;
    } else {
      break;
    }
  }

  return debts;
}

/**
 * Computes household overview metrics for N members (2-5).
 */
export function computeFlatMetrics(
  arg1?: unknown,
  arg2?: unknown,
  arg3?: unknown
): FlatMetrics {
  const { members, expenses, settlements } = parseEngineArgs(arg1, arg2, arg3);

  const activeExpenses = expenses.filter((e) => e && !e.deletedAt);
  const balances = calculateBalances(members, activeExpenses, settlements);
  const simplifiedDebts = simplifyDebts(balances);

  const totalSpent = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Group by category
  const categoryTotals: Record<Category, number> = {
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

  activeExpenses.forEach((e) => {
    if (!e) return;
    const amount = Number(e.amount) || 0;
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += amount;
    } else {
      categoryTotals.miscellaneous += amount;
    }
  });

  let topCategoryKey: Category = "groceries";
  let maxCatAmount = 0;
  (Object.keys(categoryTotals) as Category[]).forEach((cat) => {
    if (categoryTotals[cat] > maxCatAmount) {
      maxCatAmount = categoryTotals[cat];
      topCategoryKey = cat;
    }
  });

  const activeMemberCount = Math.max(
    1,
    members.filter((m) => m && m.isActive).length
  );

  return {
    memberCount: members.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    expenseCount: activeExpenses.length,
    settlementCount: settlements.filter((s) => s && s.status === "completed").length,
    monthlyAverage: Math.round((totalSpent / activeMemberCount) * 100) / 100,
    topCategory: {
      category: topCategoryKey,
      amount: Math.round(maxCatAmount * 100) / 100,
      percentage:
        totalSpent > 0 ? Math.round((maxCatAmount / totalSpent) * 1000) / 10 : 0,
    },
    balances,
    simplifiedDebts,
    electricityTotal: Math.round((categoryTotals.electricity || 0) * 100) / 100,
    gasTotal: Math.round((categoryTotals.gas || 0) * 100) / 100,
    groceriesTotal: Math.round((categoryTotals.groceries || 0) * 100) / 100,
  };
}
