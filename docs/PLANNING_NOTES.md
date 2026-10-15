# Product Planning & Architectural Design Notes

**Document Version:** 1.0.0  
**Target User Persona:** HR Manager of the Organization  
**Core Objective:** Design and build high-performance salary management software for 10,000 employees that empowers the HR Manager to instantly answer how the organization compensates people globally.

---

## 1. Executive Summary & Design Principles

During the initial planning and whiteboarding phase, we established 4 foundational design principles:
1. **Product Framing First:** Build specifically for the **HR Manager** persona, optimizing for instant visibility into organizational compensation spend.
2. **Financial Precision & Zero Currency Drift:** Treat payroll numbers with strict mathematical invariants—never mix different currencies.
3. **Enterprise UX Consistency:** Maintain unified styling across all filter controls, modal dialogs, and navigation states with responsive debouncing.

---

## 2. Key Planning Decisions & Implementation Details

### 2.1. Multi-Country Currency Isolation & Dedicated Currency Filter
* **The Problem:** 
  Organizations with 10,000 employees operate across multiple countries (USA, UK, Germany, India, Singapore, Japan). A naive spreadsheet or system adds salaries together, generating misleading and synthetic totals (e.g. summing ¥1,000,000 JPY + $10,000 USD).
* **Planning Decision:** 
  - Never blend distinct currencies into a single aggregate figure without an explicit conversion rate.
  - Implement a **Dedicated Currency Filter & Switcher** in both the Analytics Dashboard and the 10k Records Grid.
  - In the backend, payroll aggregates are grouped by `currency_code` (`c.currency_code`), ensuring that USD, INR, EUR, GBP, JPY, and SGD are tracked in independent financial pools.
* **HR Manager Benefit:** 
  The HR Manager can review accurate, audit-compliant payroll figures for any country/currency without exchange rate distortion.

---

### 2.2. Executive Dashboard KPI Cards (Instant HR Answers)
* **The Problem:** 
  In spreadsheets, answering executive questions like *"What is our total monthly payroll expense?"* or *"What is the spread between our lowest and highest earners?"* requires writing manual formulas or pivot tables that can take minutes to load.
* **Planning Decision:** 
  Provide instant high-level metric cards at the very top of the [Dashboard]:
  1. **Total Employees:** Live headcount (10,000 active employees).
  2. **Total Expected Expense (Gross Payroll):** Total organizational commitment per selected currency.
  3. **Average Net Pay:** Average in-hand take-home salary across the workforce.
  4. **Max Expense (Highest Compensation):** Highest salary package in the organization.
  5. **Min Expense (Entry-level Compensation):** Minimum salary benchmark to monitor entry-level pay floors.
* **HR Manager Benefit:** 
  The HR Manager can immediately answer board-level and leadership questions about total payroll commitments and compensation spreads in under 3 seconds.

---

### 2.3. Top 5 Highest Earners & Compensation Distribution Charts
* **The Problem:** 
  Spreadsheets make it difficult to visualize how compensation is distributed across departments and organizational hierarchies.
* **Planning Decision:** 
  Include visual intelligence and ranking widgets:
  - **Top 5 Highest Paid Employees Table:** Shows the highest earners along with their Department, Designation, and Net Take-Home Salary.
  - **Department Payroll Breakdown Chart:** An interactive bar chart displaying the total payroll spend per department (Engineering, Sales, Product, Marketing, Operations, HR, Finance, Legal).
  - **Role & Designation Compensation Chart:** Highlights compensation bands across job levels, showing how pay scales from Associate to Director.
* **HR Manager Benefit:** 
  Reveals department-level budget allocation and ensures compensation parity across identical job designations.

---

### 2.4. Unified Filter UX & Responsive Debouncing
* **The Problem:** 
  Inconsistent UI dropdowns, lack of quick clear buttons, and typing into search inputs that trigger immediate backend requests on every keystroke cause layout shifts, browser lag, and database thrashing across 10,000 records.
* **Planning Decision:** 
  - **Unified Component Library Styling:** Standardized `react-select` styling across all filter dropdowns (Country, Department, Designation, Currency, and Limit selectors) with uniform focus rings, borders, and typography.
  - **One-Click Clear Indicator (`X` button):** Every dropdown supports `isClearable: true`, allowing the HR Manager to clear individual filters with a single click.
  - **Search & Salary Range Debouncing:**
    - Search input uses a **350ms debounce timer**.
    - Net take-home salary range (Min/Max) uses a **450ms debounce timer**.
  - **Conditional Reset Filters Button:** A dedicated "Reset Filters" button appears dynamically only when active filters exist, preventing unnecessary DOM clutter.
* **HR Manager Benefit:** 
  Smooth, desktop-like responsiveness with zero input stuttering when filtering 10,000 employee records.

---

### 2.5. Flexible Export Pipeline (All vs. Filtered vs. Selected Records)
* **The Problem:** 
  HR teams frequently need to export subsets of salary data—sometimes the entire 10,000-employee master sheet, sometimes a specific department (e.g., Engineering in India), and sometimes a few individually checked employees for a salary audit.
* **Planning Decision:** 
  Built a multi-tiered export capability in [SalaryStructures.jsx](file:///d:/Projects/Salary%20managment%20system/frontend/src/pages/SalaryStructures.jsx):
  1. **Export All Records:** Streams all 10,000 records directly from the database into an audit-ready CSV.
  2. **Export Filtered Records:** HR can apply any combination of filters (e.g. Country = Germany, Dept = Product) and export only that matching subset.
  3. **Export Selected Records:** Checkboxes allow HR to select individual employees or "Select All on Page" and export precisely those records.
  4. **Chunked Streaming Pipeline:** The backend streams the CSV in batches with HTTP header `Content-Disposition: attachment; filename=salary-structures-...csv`, consuming negligible server RAM.
* **HR Manager Benefit:** 
  Instant CSV downloads ready for finance reconciliation without browser tab freezes.

---

### 2.6. Relational Database Design Inspired by Enterprise HRMS Systems
* **The Problem:** 
  Flat database tables (putting all 20+ columns into a single `employees` table) mimic spreadsheets and lead to data redundancy, update anomalies, and lack of component-level flexibility.
* **Planning Decision:** 
  Modeled an 8-table Third Normal Form (3NF) relational schema inspired by our close digit HRMS :

  - **Separation of Employee Master & Compensation:** Personal details live in `employees`, while financial compensation packages live in `employee_salary_structures`.
  - **Dynamic Itemized Components:** Allowances and deductions are not hardcoded columns. They are rows in `salary_components` and `employee_salary_components` (Basic, HRA, DA, Conveyance, Medical, PF, TDS, Prof Tax).
  - **Automated Percentage Formulas:** Basic pay changes automatically recalculate statutory formulas:
    - **HRA:** 40% of Basic
    - **DA:** 10% of Basic
    - **PF:** 12% of Basic
* **HR Manager Benefit:** 
  Enables itemized salary breakdowns, easy revision history, and regulatory compliance without database schema migrations.

---

## 3. Planning Checklist vs Implementation Status

| Planned Item | Technical Implementation | Status |
| :--- | :--- | :---: |
| **1. Currency Isolation** | Dedicated dropdown filter + ISO currency groupings in analytics SQL queries | **Delivered** |
| **2. HR Executive Cards** | Total Headcount, Total Expected Expense, Average Net Pay, Max & Min Expense | **Delivered** |
| **3. Distribution Charts** | Top 5 Earners Table + Department & Designation Recharts visualizations | **Delivered** |
| **4. Consistent Filter UX** | Custom styled `react-select` with `isClearable` + 350ms/450ms debounce timers | **Delivered** |
| **5. Flexible CSV Export** | Export All / Export Filtered / Export Selected via chunked streaming pipeline | **Delivered** |
| **6. HRMS Relational Schema** | 8-table 3NF schema (Employees, Structures, Components, Countries, Depts) | **Delivered** |
