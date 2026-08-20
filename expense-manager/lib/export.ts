import { jsPDF } from "jspdf";
import { Expense, Settlement, FlatMetrics, HouseholdMember } from "./types";
import { CATEGORIES } from "./initial-data";
import { formatCurrency } from "./utils";

export function exportExpensesToCSV(
  expenses: Expense[] = [],
  members: HouseholdMember[] = [],
  householdName = "Household"
): void {
  const memberList = members || [];
  const expenseList = expenses || [];

  const headers = [
    "ID",
    "Date",
    "Description",
    "Category",
    "Paid By",
    "Split Type",
    "Split Among",
    "Amount (INR)",
    "Notes",
  ];

  const rows = expenseList.map((e) => {
    const payer = memberList.find((m) => m && m.id === e.paidBy);
    const payerName = payer ? payer.displayName : e.paidBy;
    const splitNames = (Array.isArray(e.splitAmong) ? e.splitAmong : [])
      .map((id) => memberList.find((m) => m && m.id === id)?.shortName || id)
      .join("; ");
    const categoryName = CATEGORIES[e.category]?.label || e.category;

    return [
      `"${e.id}"`,
      `"${e.date}"`,
      `"${(e.description || "").replace(/"/g, '""')}"`,
      `"${categoryName}"`,
      `"${payerName}"`,
      `"${e.splitType}"`,
      `"${splitNames}"`,
      `"${(Number(e.amount) || 0).toFixed(2)}"`,
      `"${(e.notes || "").replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${householdName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-expenses-${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportMonthlyReportPDF(
  expenses: Expense[] = [],
  settlements: Settlement[] = [],
  metrics?: FlatMetrics,
  members: HouseholdMember[] = [],
  monthName = "Current Month",
  householdName = "Household"
): void {
  const memberList = members || [];
  const expenseList = expenses || [];
  const settlementList = settlements || [];
  const safeMetrics = metrics || {
    totalSpent: 0,
    expenseCount: 0,
    settlementCount: 0,
    memberCount: memberList.length,
    monthlyAverage: 0,
    balances: {},
    simplifiedDebts: [],
    electricityTotal: 0,
    gasTotal: 0,
    groceriesTotal: 0,
    topCategory: { category: "groceries", amount: 0, percentage: 0 },
  };

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = 20;

  // Title & Header
  doc.setFontSize(22);
  doc.setTextColor(24, 24, 27); // slate-900
  doc.text(`${householdName} Expense Report`, 20, y);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(
    `Billing Period: ${monthName}  |  Generated: ${new Date().toLocaleDateString()}`,
    20,
    y + 7
  );

  y += 18;

  // Overview box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, y, 170, 24, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL HOUSEHOLD SPEND", 26, y + 8);
  doc.text("TOTAL EXPENSES", 80, y + 8);
  doc.text("AVERAGE PER PERSON", 130, y + 8);

  const activeCount = Math.max(1, memberList.filter((m) => m && m.isActive).length);
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(safeMetrics.totalSpent || 0), 26, y + 18);
  doc.text((safeMetrics.expenseCount || 0).toString(), 80, y + 18);
  doc.text(formatCurrency((safeMetrics.totalSpent || 0) / activeCount), 130, y + 18);

  y += 34;

  // Member Balances Section
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Household Member Net Balances", 20, y);

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y, 170, 7, "F");
  doc.text("Member", 24, y + 5);
  doc.text("Paid Total", 65, y + 5);
  doc.text("Fair Share", 100, y + 5);
  doc.text("Net Balance Status", 140, y + 5);

  y += 8;

  memberList.forEach((m) => {
    const bal = safeMetrics.balances ? safeMetrics.balances[m.id] : undefined;
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${m.displayName}${m.room ? ` (${m.room})` : ""}`, 24, y + 4);
    doc.text(formatCurrency(bal?.totalPaid || 0), 65, y + 4);
    doc.text(formatCurrency(bal?.totalShare || 0), 100, y + 4);

    const net = bal?.netBalance || 0;
    if (net > 0.01) {
      doc.setTextColor(16, 185, 129); // Green
      doc.text(`+${formatCurrency(net)} (Gets Back)`, 140, y + 4);
    } else if (net < -0.01) {
      doc.setTextColor(225, 29, 72); // Rose
      doc.text(`${formatCurrency(net)} (Owes House)`, 140, y + 4);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text("Settled Up", 140, y + 4);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(20, y + 6, 190, y + 6);
    y += 8;
  });

  y += 6;

  // Suggested Transfers / Settlement Plan
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Optimal Settlement Plan (Greedy Debt Simplification)", 20, y);

  y += 6;

  const debts = safeMetrics.simplifiedDebts || [];
  if (debts.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("All members are fully settled up! No transfers needed.", 20, y + 4);
    y += 10;
  } else {
    debts.forEach((debt) => {
      const fromMember = memberList.find((m) => m && m.id === debt.fromId);
      const toMember = memberList.find((m) => m && m.id === debt.toId);
      const fromName = fromMember ? fromMember.displayName : debt.fromId;
      const toName = toMember ? toMember.displayName : debt.toId;

      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `• ${fromName} pays ${toName} : ${formatCurrency(debt.amount || 0)}`,
        24,
        y + 4
      );
      y += 6;
    });
    y += 4;
  }

  // Recent Expenses Section
  if (y > 220) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text("Expense Breakdown", 20, y);

  y += 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(20, y, 170, 7, "F");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Date", 24, y + 5);
  doc.text("Description", 48, y + 5);
  doc.text("Category", 100, y + 5);
  doc.text("Paid By", 135, y + 5);
  doc.text("Amount", 168, y + 5);

  y += 8;

  expenseList.forEach((e) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    const payer = memberList.find((m) => m && m.id === e.paidBy);
    const payerName = payer ? payer.shortName : e.paidBy;
    const catLabel = CATEGORIES[e.category]?.label || e.category;

    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(e.date || "", 24, y + 4);
    doc.text((e.description || "").slice(0, 30), 48, y + 4);
    doc.text(catLabel, 100, y + 4);
    doc.text(payerName || "", 135, y + 4);
    doc.text(formatCurrency(e.amount || 0), 168, y + 4);

    doc.setDrawColor(241, 245, 249);
    doc.line(20, y + 6, 190, y + 6);
    y += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `${householdName} • Roommate & Household Expense Manager`,
    20,
    287
  );

  doc.save(
    `${householdName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-report-${monthName.toLowerCase().replace(/\s+/g, "-")}.pdf`
  );
}
