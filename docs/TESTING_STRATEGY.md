# Testing Strategy & Test Suite Documentation

**Document Version:** 3.0.0  
**Frameworks:** 
- **Backend:** Node.js Native Test Runner (`node:test`) + `supertest` (22 tests in ~4.6s)
- **Frontend:** `vitest` + `@testing-library/react` + `jsdom` (31 tests in ~5.2s)  
**Total Automated Tests:** 53 Deterministic Tests with 0 Failures

---

## 1. Testing Philosophy

In production software engineering, automated tests must be:
1. **Fast:** Developers should be able to run tests on every file change without waiting for heavy runtimes.
2. **Deterministic:** Zero flaky tests, zero race conditions, zero network dependencies.
3. **Behavior-Focused:** Test business rules, calculations, boundary conditions, HTTP status contracts, and UI accessibility/user interactions.

We deliberately avoided heavy testing setups:
- **Backend:** Native Node.js test runner (`node --test`), eliminating Jest runtime overhead.
- **Frontend:** Native Vite-integrated `vitest` with `jsdom` and `@testing-library/react` for instant feedback.

---

## 2. Backend Test Suite Breakdown (22 Tests)

Located in [`backend/tests/`]:

### Suite 1: Salary Calculation Business Logic (`calculations.test.js`)
Verifies the core mathematical engine that governs all payroll figures:
1. **`should accurately calculate gross and net salary with valid inputs`**: Verifies $\text{Gross} = \text{Basic} + \text{Allowances}$ and $\text{Net} = \text{Gross} - \text{Deductions}$.
2. **`should handle default zero values for allowances and deductions`**: Ensures omitted allowances/deductions safely default to 0 without `NaN`.
3. **`should accurately round floating decimals to 2 decimal places`**: Boundary rounding (e.g. `1234.567` $\to$ `1234.57`) eliminating IEEE 754 precision leakage.
4. **`should throw error when basic salary is negative`**: Negative salary inputs immediately raise descriptive validation errors.
5. **`should throw error when allowances are negative`**: Disallows negative allowance manipulation.
6. **`should throw error when deductions are negative`**: Validates deductions must be non-negative.
7. **`should throw error when deductions exceed gross salary`**: Invariant test: deductions cannot exceed gross pay, preventing negative take-home.

### Suite 2: Salary Input Validation (`calculations.test.js`)
Verifies payload integrity before any database write:
8. **`should return isValid: true for complete and valid payload`**: Valid employee payload passes validation cleanly.
9. **`should detect missing mandatory fields and invalid email format`**: Validates required fields (`name`, `email`, `country`, `department`, `designation`, `currency`, `basicSalary`) and RFC email format.

### Suite 3: Itemized Component Rules & Formula Calculations (`calculations.test.js`)
Verifies percentage formulas and statutory defaults:
10. **`should accurately compute percentage components (HRA 40%, DA 10%, PF 12%) and statutory defaults`**: Basic (50,000) $\to$ HRA (20,000), DA (5,000), PF (6,000) + Fixed Conveyance (1,600) + Medical (1,250) + Prof Tax (200) + Health Ins (500), verifying accurate Gross (77,850) and Net (71,150).

### Suite 4: API Route Endpoints & Integration (`api.test.js`)
Tests HTTP contracts and end-to-end database interactions:
11. **`GET /api/health should return status 200 and ok`**: System health check.
12. **`GET / should return informational metadata`**: API root metadata and discovery routes.
13. **`GET /api/unknown-route should return 404 Route Not Found`**: Central 404 fallback handler.
14. **`GET /api/structures should return status 200 and paginated data`**: Bounded pagination (`limit` & `page` offset).
15. **`GET /api/structures with country filter should filter records accurately`**: Indexed query filtering by country.
16. **`GET /api/analytics/by-department should return department payroll breakdown`**: Aggregation query by department.
17. **`GET /api/structures/filters should return filter options`**: Dynamic select options for countries, departments, designations.
18. **`POST /api/structures should return 400 Bad Request on invalid input`**: Validation error contract.
19. **`GET /api/analytics/summary should enforce strict currency isolation`**: Guarantees distinct currency pools without cross-currency FX mixing.
20. **`GET /api/reports/export should stream audit-ready CSV with attachment header`**: Chunked CSV stream with `Content-Disposition: attachment`.
21. **`Full Salary Structure Lifecycle: Create, Read with Components, Update, and Cascade Delete`**: Complete CRUD workflow: POST $\to$ GET :id $\to$ PUT :id $\to$ DELETE cascade $\to$ GET 404.
22. **`Express Server Initialization with Sequelize`**: Verifies database connection bootstrap.

---

## 3. Frontend Test Suite Breakdown (31 Tests)

Located in [`frontend/src/tests/`]:

### Suite 1: API Client Service (`api.test.js` - 7 Tests)
- `should fetch salary structures with correct serialized query parameters` (page, limit, search, country, minSalary, maxSalary).
- `should fetch a single salary structure by ID`.
- `should send a POST request with payload when creating salary structure`.
- `should send a PUT request with updated data when editing salary structure`.
- `should send a DELETE request when deleting salary structure`.
- `should construct accurate export CSV URL with query parameters`.
- `should throw descriptive Error when server returns 400 or 500 error status`.

### Suite 2: Pagination Component (`Pagination.test.jsx` - 7 Tests)
- `should render accurate record count text for 10,000 records` ("Showing 1 to 25 of 10,000 records").
- `should render 0 to 0 when total records is zero`.
- `should disable Previous and First buttons on page 1`.
- `should disable Next and Last buttons on the final page`.
- `should call onPageChange with incremented page when Next is clicked`.
- `should call onPageChange with decremented page when Previous is clicked`.
- `should call onPageChange when a specific numbered page button is clicked`.

### Suite 3: FilterBar Search & Filters (`FilterBar.test.jsx` - 5 Tests)
- `should render search input and filter placeholders`.
- `should not display Reset Filters button when no active filters exist`.
- `should display Reset Filters button and active filter badge when filters are present`.
- `should call onReset when Reset Filters button is clicked`.
- `should debounce search updates before updating filter state`.

### Suite 4: Delete Confirmation Modal (`DeleteConfirmModal.test.jsx` - 5 Tests)
- `should not render anything when isOpen is false`.
- `should render modal with employee details when isOpen is true`.
- `should call onClose when Cancel button is clicked`.
- `should call onConfirm when Confirm Delete button is clicked`.
- `should display loading state and disable buttons when isDeleting is true`.

### Suite 5: StatCard Metric Cards (`StatCard.test.jsx` - 4 Tests)
- `should render title and value correctly`.
- `should render subtitle when provided`.
- `should render Icon when passed with color scheme`.
- `should fallback to indigo color scheme when invalid or default color is provided`.

### Suite 6: Navbar Navigation (`Navbar.test.jsx` - 3 Tests)
- `should render brand logo, title and navigation links`.
- `should mark the active link with highlight class when on Dashboard route`.
- `should mark the active link with highlight class when on Structures route`.

---

## 4. How to Execute Tests

### Run Backend Tests:
```bash
cd backend
npm test
```

### Run Frontend Tests:
```bash
cd frontend
npm test
```
