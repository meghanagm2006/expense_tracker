# Bloom — Smart Expense Tracker

A responsive React expense tracker with a pastel dashboard, category breakdown, monthly analytics, transaction search/filter, edit/delete, browser LocalStorage persistence and CSV export.

## Requirements
- Node.js 18 or newer
- npm
- VS Code (recommended)

## Run locally
1. Extract this ZIP.
2. Open the `smart-expense-tracker` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Build for production
```bash
npm run build
npm run preview
```

## Project structure
```text
smart-expense-tracker/
├── index.html
├── package.json
├── README.md
└── src/
    ├── App.jsx
    ├── App.css
    └── main.jsx
```

## Features
- Add, edit and delete expenses
- Expense title, amount, category, date and optional note
- Monthly totals, transaction count and average expense
- Category-wise donut breakdown and bar chart
- Search and category filtering
- Monthly filtering
- Export the currently filtered transactions as CSV
- Automatic save to browser LocalStorage

## Notes
- Data is stored in the browser on the device where the app is used. It is not a cloud account and will not automatically sync between devices.
- The initial sample transactions are only demo data. Delete them and add your own entries for a clean project demonstration.
