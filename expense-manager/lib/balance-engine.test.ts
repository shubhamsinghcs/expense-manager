import {
  distributeAmountEqually,
  calculateExpenseSplits,
  calculateBalances,
  simplifyDebts,
  computeFlatMetrics,
} from "./debt-simplifier";
import { Expense, Settlement, HouseholdMember } from "./types";
import { getPaletteForIndex } from "./initial-data";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

function createTestMembers(names: string[]): HouseholdMember[] {
  return names.map((name, index) => {
    const pal = getPaletteForIndex(index);
    const id = `m-${name.toLowerCase()}`;
    return {
      id,
      householdId: "h-test",
      displayName: name,
      shortName: name,
      room: `Room ${101 + index}`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
      color: pal.color,
      bgColor: pal.bgColor,
      borderColor: pal.borderColor,
      textColor: pal.textColor,
      role: index === 0 ? "admin" : "member",
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  });
}

export function runTests() {
  console.log("=== RUNNING GENERIC DYNAMIC N-MEMBER BALANCE ENGINE UNIT TESTS ===\n");

  // -------------------------------------------------------------
  // Scenario 1: 2 Members Household
  // -------------------------------------------------------------
  console.log("--- Scenario 1: 2-Member Household (Equal & Custom Splits) ---");
  const members2 = createTestMembers(["Alex", "Sam"]);
  const [alex, sam] = members2;

  const exp2_1: Expense = {
    id: "e-2-1",
    description: "Groceries",
    amount: 1500,
    category: "groceries",
    paidBy: alex.id,
    date: "2026-08-20",
    splitType: "equal",
    splitAmong: [alex.id, sam.id],
    createdAt: new Date().toISOString(),
  };

  const balances2_1 = calculateBalances(members2, [exp2_1], []);
  assert(balances2_1[alex.id].totalPaid === 1500, "2-member: Alex totalPaid === 1500");
  assert(balances2_1[alex.id].totalShare === 750, "2-member: Alex totalShare === 750");
  assert(balances2_1[alex.id].netBalance === 750, "2-member: Alex netBalance === +750");
  assert(balances2_1[sam.id].netBalance === -750, "2-member: Sam netBalance === -750");

  const debts2_1 = simplifyDebts(balances2_1);
  assert(debts2_1.length === 1, "2-member: Exactly 1 debt transfer");
  assert(debts2_1[0].fromId === sam.id && debts2_1[0].toId === alex.id && debts2_1[0].amount === 750, "Sam pays Alex 750");

  // -------------------------------------------------------------
  // Scenario 2: 3 Members Household (Selective Split & Payer Excluded)
  // -------------------------------------------------------------
  console.log("\n--- Scenario 2: 3-Member Household (Selective Split & Payer Excluded) ---");
  const members3 = createTestMembers(["Alex", "Sam", "Jordan"]);
  const [m1, m2, m3] = members3;

  // m1 buys dinner only for m2 and m3 (m1 excluded from split)
  const exp3_1: Expense = {
    id: "e-3-1",
    description: "Concert tickets for Sam and Jordan",
    amount: 1200,
    category: "miscellaneous",
    paidBy: m1.id,
    date: "2026-08-20",
    splitType: "selective",
    splitAmong: [m2.id, m3.id],
    createdAt: new Date().toISOString(),
  };

  const balances3_1 = calculateBalances(members3, [exp3_1], []);
  assert(balances3_1[m1.id].totalPaid === 1200, "3-member: m1 totalPaid === 1200");
  assert(balances3_1[m1.id].totalShare === 0, "3-member: m1 totalShare === 0");
  assert(balances3_1[m1.id].netBalance === 1200, "3-member: m1 netBalance === +1200");
  assert(balances3_1[m2.id].netBalance === -600, "3-member: m2 netBalance === -600");
  assert(balances3_1[m3.id].netBalance === -600, "3-member: m3 netBalance === -600");

  const sumNet3 = Object.values(balances3_1).reduce((s, b) => s + b.netBalance, 0);
  assert(Math.abs(sumNet3) < 0.01, `3-member: Sum of net balances is 0 (sum=${sumNet3})`);

  // -------------------------------------------------------------
  // Scenario 3: 4 Members Household (Equal + Utilities + Settlements)
  // -------------------------------------------------------------
  console.log("\n--- Scenario 3: 4-Member Household (Full Cycle) ---");
  const members4 = createTestMembers(["Alex", "Sam", "Jordan", "Taylor"]);
  const [pA, pB, pC, pD] = members4;

  const exp4_1: Expense = {
    id: "e-4-1",
    description: "Monthly Groceries",
    amount: 1000,
    category: "groceries",
    paidBy: pA.id,
    date: "2026-08-20",
    splitType: "equal",
    splitAmong: members4.map((m) => m.id),
    createdAt: new Date().toISOString(),
  };

  const exp4_2: Expense = {
    id: "e-4-2",
    description: "Electricity Bill",
    amount: 2400,
    category: "electricity",
    paidBy: pB.id,
    date: "2026-08-20",
    splitType: "equal",
    splitAmong: members4.map((m) => m.id),
    isUtility: true,
    electricityMeta: { billingPeriod: "Aug 2026", unitsConsumed: 280 },
    createdAt: new Date().toISOString(),
  };

  const exp4_3: Expense = {
    id: "e-4-3",
    description: "Gas Cylinder",
    amount: 1100,
    category: "gas",
    paidBy: pC.id,
    date: "2026-08-20",
    splitType: "equal",
    splitAmong: members4.map((m) => m.id),
    isUtility: true,
    gasMeta: { cylinderCount: 1 },
    createdAt: new Date().toISOString(),
  };

  const balances4 = calculateBalances(members4, [exp4_1, exp4_2, exp4_3], []);
  const sumNet4 = Object.values(balances4).reduce((s, b) => s + b.netBalance, 0);
  assert(Math.abs(sumNet4) < 0.01, `4-member: Sum of net balances is 0 (sum=${sumNet4})`);

  const debts4 = simplifyDebts(balances4);
  assert(debts4.length <= 3, `4-member: Simplified debts count <= 3 (got ${debts4.length})`);

  // Simulate full settlement of calculated debts
  const settlements4: Settlement[] = debts4.map((d, i) => ({
    id: `set-4-${i}`,
    householdId: "h-test",
    fromId: d.fromId,
    toId: d.toId,
    amount: d.amount,
    date: "2026-08-20",
    status: "completed",
    createdAt: new Date().toISOString(),
  }));

  const settledBalances4 = calculateBalances(members4, [exp4_1, exp4_2, exp4_3], settlements4);
  Object.values(settledBalances4).forEach((b) => {
    assert(Math.abs(b.netBalance) < 0.01, `${b.member.displayName} balance is 0 after full settlement (got ${b.netBalance})`);
  });

  // -------------------------------------------------------------
  // Scenario 4: 5 Members Household (Maximum Allowed)
  // -------------------------------------------------------------
  console.log("\n--- Scenario 4: 5-Member Household (Maximum Limit) ---");
  const members5 = createTestMembers(["Alex", "Sam", "Jordan", "Taylor", "Casey"]);
  assert(members5.length === 5, "5-member count matches 5");

  const exp5_1: Expense = {
    id: "e-5-1",
    description: "High-speed Apartment Internet",
    amount: 1999,
    category: "internet",
    paidBy: members5[0].id,
    date: "2026-08-20",
    splitType: "equal",
    splitAmong: members5.map((m) => m.id),
    createdAt: new Date().toISOString(),
  };

  const splits5_1 = calculateExpenseSplits(exp5_1, members5);
  const totalShares5_1 = Object.values(splits5_1).reduce((s, v) => s + v, 0);
  assert(Math.abs(totalShares5_1 - 1999) < 0.001, `5-member: Paise split sum matches 1999 exactly (got ${totalShares5_1})`);

  // -------------------------------------------------------------
  // Scenario 5: Paise Rounding Invariants (Odd amount division)
  // -------------------------------------------------------------
  console.log("\n--- Scenario 5: Deterministic Paise Rounding ---");
  const oddDistributed3 = distributeAmountEqually(100, ["m1", "m2", "m3"]);
  const oddSum3 = Object.values(oddDistributed3).reduce((s, v) => s + v, 0);
  assert(Math.abs(oddSum3 - 100) < 0.0001, `100 / 3 distributes with zero lost paise (sum=${oddSum3})`);
  assert(oddDistributed3["m1"] === 33.34, "m1 gets 33.34");
  assert(oddDistributed3["m2"] === 33.33, "m2 gets 33.33");
  assert(oddDistributed3["m3"] === 33.33, "m3 gets 33.33");

  console.log("\nALL DYNAMIC N-MEMBER INVARIANT AND CALCULATION TESTS PASSED!");
}

runTests();
