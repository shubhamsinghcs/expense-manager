# FlatSplit — Flat & Shared Expense Manager

A clean, modern expense tracker and debt settlement platform built specifically for shared flats, apartments, and roommates. FlatSplit takes the awkwardness out of shared apartment finances by tracking everyday groceries, utility bills (electricity with meter reading calculations, LPG gas cylinders), and rent, while automatically simplifying multi-roommate debts into the smallest number of direct transfers.

---

## Why FlatSplit?

Living with roommates is great until it's time to split a ₹4,830 electricity bill or figure out who owes what after five different grocery runs. Most generic split apps either require everyone to download an app and create accounts or bury utility calculations in manual spreadsheets.

FlatSplit was built to give households a single, intuitive dashboard with:

- **Dynamic Household Sizes (2 to 5 Members)**: Configurable for small 2-person setups up to 5-person flats. Add, edit, or adjust roommates with custom rooms, avatars, and distinct color accents.
- **Fair & Flexible Splitting**:
  - *Equal Split*: Evenly divide among everyone with exact paise rounding (zero-sum guaranteed).
  - *Selective Split*: Include only the roommates who were actually part of the expense (e.g., weekend dinners or shared cabs).
  - *Custom Allocation*: Set specific amounts per person when items or shares vary.
- **Dedicated Utility Trackers**:
  - **Electricity Calculator**: Enter previous and current meter readings, cost per unit, and fixed meter charges to compute total consumption and each roommate's exact share.
  - **Gas Cylinder Tracker**: Record refill bookings, vendor details, and cylinder costs.
- **Greedy Debt Simplification (Minimum Cash Flow)**: An algorithm that turns tangled multi-way IOUs into the absolute minimum number of direct transfers (at most $N-1$ transactions).
- **Roommate Persona View**: Switch between roommate profiles in one click to view your individual ledger: what you've paid, your consumed share, who owes you, and whom you need to pay.
- **One-Click Settlement Ledger**: Log UPI, cash, or bank transfers to clear balances instantly with timestamped receipts.
- **Data Export & Reporting**:
  - Download full transaction logs in clean **CSV** format.
  - Generate structured, print-ready **Monthly PDF Financial Reports** complete with spend breakdowns, roommate balance cards, and transfer action items.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Exporting**: [jsPDF](https://github.com/parallax/jsPDF) for client-side report generation
- **Database / Backend**: [Supabase](https://supabase.com/) (PostgreSQL with RLS & Realtime capability) with resilient client-side state fallbacks

---

## Project Structure

```
├── app/
│   ├── globals.css          # Tailwind CSS configuration & root styles
│   ├── layout.tsx           # Main application layout & metadata
│   └── page.tsx             # Main dashboard assembly and state management
├── components/
│   ├── CategoryBreakdown.tsx    # Category-wise spend progress & analytics
│   ├── DebtSettlementModal.tsx  # Direct transfer settlement dialog
│   ├── DebtSimplifierCard.tsx   # Optimized transfer instructions panel
│   ├── DeleteExpenseModal.tsx   # Safe confirmation modal for deletions
│   ├── EditExpenseModal.tsx     # Full-featured expense modifier
│   ├── ElectricityBillModal.tsx # Meter reading & power unit rate calculator
│   ├── ExpenseDetailModal.tsx   # Deep-dive itemized cost breakdown
│   ├── ExpenseList.tsx          # Filterable & searchable transaction ledger
│   ├── ExportModal.tsx          # CSV & PDF export trigger dialog
│   ├── GasCylinderModal.tsx     # LPG booking & refill cost distributor
│   ├── HouseholdSetupModal.tsx  # First-time household configuration wizard
│   ├── ManageHouseholdModal.tsx # Member editor & household settings
│   ├── Navbar.tsx               # Top navigation bar with household switcher
│   ├── PersonalHeader.tsx       # Roommate persona switcher & personal balance card
│   ├── QuickAddModal.tsx        # Fast modal for everyday expense entry
│   ├── RoommateCards.tsx        # Responsive grid of roommate balance summaries
│   ├── SettlementsList.tsx      # Historic settlement transaction list
│   └── UtilitiesSection.tsx     # Electricity, gas, and internet utility hub
├── lib/
│   ├── debt-simplifier.ts   # Core balance calculations & greedy debt graph solver
│   ├── export.ts            # CSV export and jsPDF monthly report builders
│   ├── initial-data.ts      # Seed data & category taxonomy
│   ├── types.ts             # TypeScript interfaces for members, expenses, and debts
│   └── utils.ts             # Currency formatters and date helpers
└── supabase/
    └── schema.sql           # Database tables, RLS policies, and triggers
```

---

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18.17+ recommended) and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shubhamsinghcs/expense-manager.git
   cd expense-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (Optional for Supabase sync):**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   If connecting to a Supabase backend, fill in:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(The application also runs seamlessly with built-in client persistence if Supabase credentials are not provided.)*

4. **Run the local development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## Building for Production

To build the application for production deployment:

```bash
npm run build
npm run start
```

You can also deploy directly to [Vercel](https://vercel.com/) or any Node.js container platform (Cloud Run, Railway, Render).

---

## How Debt Simplification Works

When multiple roommates pay for different shared items, circular or chained debts easily occur:
- Alice pays ₹1,200 for Bob and Charlie.
- Bob pays ₹600 for Charlie.
- Charlie pays ₹300 for Alice.

Rather than making 3 separate repayments, FlatSplit computes each roommate's net position ($\text{Total Paid} - \text{Total Consumed Share}$) and runs a greedy cash-flow simplification algorithm. This pairs the largest debtor with the largest creditor iteratively, reducing complex multi-person transfers to at most $N-1$ direct payments with zero rounding discrepancies.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
