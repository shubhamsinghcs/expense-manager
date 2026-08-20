export type RoommateId = "adi" | "ssr" | "harsh" | "manoj";

export interface Roommate {
  id: RoommateId;
  name: string;
  shortName: string;
  room: string;
  avatar: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  email: string;
}

export type Category =
  | "groceries"
  | "electricity"
  | "gas"
  | "rent"
  | "utilities"
  | "snacks"
  | "transport"
  | "cleaning"
  | "internet"
  | "miscellaneous";

export interface CategoryInfo {
  id: Category;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
}

export type SplitType = "equal" | "selective" | "custom";

export interface ExpenseSplit {
  roommateId: RoommateId;
  shareAmount: number;
  percentage?: number;
}

export interface ElectricityMetadata {
  billingPeriod: string;
  unitsConsumed?: number;
  dueDate?: string;
  meterReading?: number;
}

export interface GasMetadata {
  cylinderCount: number;
  cylinderType?: string;
  bookingRef?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  paidBy: RoommateId;
  date: string; // YYYY-MM-DD
  splitType: SplitType;
  splitAmong: RoommateId[];
  customAmounts?: Partial<Record<RoommateId, number>>;
  splits?: ExpenseSplit[];
  notes?: string;
  receiptUrl?: string;
  isUtility?: boolean;
  electricityMeta?: ElectricityMetadata;
  gasMeta?: GasMetadata;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type SettlementStatus = "completed" | "pending" | "cancelled";

export interface Settlement {
  id: string;
  fromId: RoommateId;
  toId: RoommateId;
  amount: number;
  date: string;
  status: SettlementStatus;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SimplifiedDebt {
  id: string;
  fromId: RoommateId;
  toId: RoommateId;
  amount: number;
}

export interface RoommateBalance {
  roommate: Roommate;
  totalPaid: number;
  totalShare: number;
  settlementsPaid: number;
  settlementsReceived: number;
  netBalance: number; // >0 is owed money (should receive), <0 owes money (needs to pay)
}

export interface FlatMetrics {
  totalSpent: number;
  expenseCount: number;
  settlementCount: number;
  monthlyAverage: number;
  topCategory: { category: Category; amount: number; percentage: number };
  balances: Record<RoommateId, RoommateBalance>;
  simplifiedDebts: SimplifiedDebt[];
  electricityTotal: number;
  gasTotal: number;
  groceriesTotal: number;
}

