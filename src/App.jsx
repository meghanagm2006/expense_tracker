import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ReceiptText, ChartNoAxesCombined, Settings, Plus,
  Search, Download, Wallet, TrendingUp, CalendarDays, ShoppingBag,
  Coffee, Car, House, HeartPulse, GraduationCap, Ellipsis, Pencil,
  Trash2, X, ArrowUpRight, Menu, ChevronDown
} from "lucide-react";

const CATEGORIES = [
  { name: "Food & Drinks", color: "#f3a78f", icon: Coffee },
  { name: "Transport", color: "#91b8e8", icon: Car },
  { name: "Shopping", color: "#c3a5ed", icon: ShoppingBag },
  { name: "Housing", color: "#8bcdb8", icon: House },
  { name: "Health", color: "#e99dbb", icon: HeartPulse },
  { name: "Education", color: "#e8c477", icon: GraduationCap },
  { name: "Other", color: "#a9b2c7", icon: Ellipsis },
];

const today = new Date().toISOString().slice(0, 10);
const initialExpenses = [
  { id: 1, title: "Weekly groceries", amount: 1250, category: "Food & Drinks", date: today, note: "Supermarket" },
  { id: 2, title: "Cab to college", amount: 280, category: "Transport", date: today, note: "" },
  { id: 3, title: "Notebook & pens", amount: 450, category: "Education", date: today, note: "Stationery shop" },
  { id: 4, title: "Coffee with friends", amount: 190, category: "Food & Drinks", date: today, note: "" },
  { id: 5, title: "New headphones", amount: 1899, category: "Shopping", date: today, note: "" },
];

const money = (n) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(n || 0);

const monthKey = (date) => date.slice(0, 7);
const categoryInfo = (name) => CATEGORIES.find((c) => c.name === name) || CATEGORIES[6];

function App() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem("bloom-expenses");
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch { return initialExpenses; }
  });
  const [activePage, setActivePage] = useState("Overview");
  const [selectedMonth, setSelectedMonth] = useState(today.slice(0, 7));
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    localStorage.setItem("bloom-expenses", JSON.stringify(expenses));
  }, [expenses]);

  const monthExpenses = useMemo(
    () => expenses.filter((e) => monthKey(e.date) === selectedMonth),
    [expenses, selectedMonth]
  );
  const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const average = monthExpenses.length ? total / monthExpenses.length : 0;
  const previousMonth = useMemo(() => {
    const d = new Date(`${selectedMonth}-01T12:00:00`);
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  }, [selectedMonth]);
  const previousTotal = expenses.filter((e) => monthKey(e.date) === previousMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const change = previousTotal ? ((total - previousTotal) / previousTotal) * 100 : null;

  const visibleExpenses = useMemo(() => monthExpenses
    .filter((e) => categoryFilter === "All categories" || e.category === categoryFilter)
    .filter((e) => `${e.title} ${e.category} ${e.note}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
  [monthExpenses, categoryFilter, search]);

  const categoryTotals = CATEGORIES.map((c) => ({
    ...c,
    amount: monthExpenses.filter((e) => e.category === c.name)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const recent = [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).slice(0, 5);

  function saveExpense(data) {
    if (editing) {
      setExpenses((old) => old.map((e) => e.id === editing.id ? { ...data, id: editing.id } : e));
    } else {
      setExpenses((old) => [{ ...data, id: Date.now() }, ...old]);
    }
    setModalOpen(false);
    setEditing(null);
  }
  function openAdd() { setEditing(null); setModalOpen(true); }
  function openEdit(item) { setEditing(item); setModalOpen(true); }
  function deleteExpense(id) {
    if (window.confirm("Delete this expense?")) setExpenses((old) => old.filter((e) => e.id !== id));
  }
  function exportCSV() {
    const rows = [["Title", "Amount (INR)", "Category", "Date", "Note"],
      ...visibleExpenses.map((e) => [e.title, e.amount, e.category, e.date, e.note || ""])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `expenses-${selectedMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const nav = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Transactions", icon: ReceiptText },
    { name: "Analytics", icon: ChartNoAxesCombined },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand"><span className="brand-mark"><Wallet size={20}/></span><span>bloom<span className="brand-dot">.</span></span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav>
          {nav.map(({ name, icon: Icon }) => (
            <button key={name} className={`nav-item ${activePage === name ? "active" : ""}`}
              onClick={() => { setActivePage(name); setMobileNav(false); }}>
              <Icon size={18}/><span>{name}</span>{name === "Transactions" && <span className="nav-count">{expenses.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card"><div className="tip-spark">✦</div><strong>Little steps add up.</strong><p>Keep track of your spending and make room for what matters.</p></div>
          <button className="nav-item muted" onClick={() => alert("Settings: your expenses are stored locally in this browser.")}><Settings size={18}/>Settings</button>
          <div className="profile"><div className="avatar">S</div><div><strong>Student account</strong><small>Personal workspace</small></div><Ellipsis size={18} className="profile-more"/></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMobileNav(!mobileNav)}><Menu size={20}/></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activePage}</strong></div>
          <div className="top-actions">
            <span className="today-label"><CalendarDays size={15}/> {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            <button className="avatar top-avatar" title="Student account">S</button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div><div className="eyebrow">YOUR MONEY, MADE CLEAR</div><h1>{activePage === "Overview" ? "Good things start with a plan." : activePage}</h1><p className="subheading">A little clarity today makes tomorrow easier.</p></div>
            <button className="primary-button" onClick={openAdd}><Plus size={18}/> Add expense</button>
          </section>

          {activePage !== "Transactions" && (
            <section className="summary-grid">
              <div className="summary-card total-card">
                <div className="card-top"><span>Total expenses</span><span className="metric-icon purple"><Wallet size={18}/></span></div>
                <div className="metric">{money(total)}</div>
                <div className="metric-foot"><span className="soft-pill"><CalendarDays size={13}/>{new Date(`${selectedMonth}-02T12:00:00`).toLocaleDateString("en-IN", {month:"long", year:"numeric"})}</span><span className="muted-text">This month</span></div>
              </div>
              <div className="summary-card">
                <div className="card-top"><span>Transactions</span><span className="metric-icon peach"><ReceiptText size={18}/></span></div>
                <div className="metric">{monthExpenses.length}</div>
                <div className="metric-foot"><span className="muted-text">Recorded expenses</span><span className="trend"><TrendingUp size={14}/> Activity</span></div>
              </div>
              <div className="summary-card">
                <div className="card-top"><span>Average expense</span><span className="metric-icon mint"><ChartNoAxesCombined size={18}/></span></div>
                <div className="metric">{money(average)}</div>
                <div className="metric-foot"><span className="muted-text">Per transaction</span><span className="muted-text">Monthly average</span></div>
              </div>
            </section>
          )}

          {activePage === "Overview" && (
            <div className="dashboard-grid">
              <section className="panel spending-panel">
                <div className="panel-heading"><div><h2>Spending breakdown</h2><p>Where your money went</p></div><MonthPicker value={selectedMonth} onChange={setSelectedMonth}/></div>
                {categoryTotals.length ? <div className="breakdown-content">
                  <div className="donut-wrap"><div className="donut" style={{background: `conic-gradient(${makeGradient(categoryTotals, total)})`}}><div className="donut-hole"><strong>{money(total)}</strong><small>Total spent</small></div></div></div>
                  <div className="legend">{categoryTotals.map((c) => <div className="legend-row" key={c.name}><span className="legend-dot" style={{background:c.color}}/><span className="legend-name">{c.name}</span><strong>{money(c.amount)}</strong><small>{total ? Math.round(c.amount/total*100) : 0}%</small></div>)}</div>
                </div> : <EmptyState text="No expenses this month yet. Add your first one to see your breakdown."/ >}
              </section>
              <section className="panel insight-panel">
                <div className="panel-heading"><div><h2>Monthly insight</h2><p>A quick look at your activity</p></div><span className="sparkle">✦</span></div>
                <div className="insight-illustration"><div className="sun">✦</div><div className="plant plant-one">♧</div><div className="plant plant-two">♧</div><div className="insight-note">Small choices<br/>make a difference.</div></div>
                <div className="insight-bottom"><div><span className="muted-text">Compared with last month</span><strong>{change === null ? "No previous data" : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}</strong></div><span className={`change-tag ${change !== null && change > 0 ? "up" : "down"}`}>{change === null ? "—" : change > 0 ? "Higher" : change < 0 ? "Lower" : "Same"}</span></div>
                <p className="insight-caption">A clear picture of your spending helps you make thoughtful decisions.</p>
              </section>
            </div>
          )}

          {activePage === "Analytics" && (
            <section className="panel analytics-panel">
              <div className="panel-heading"><div><h2>Category analytics</h2><p>Compare your spending by category</p></div><MonthPicker value={selectedMonth} onChange={setSelectedMonth}/></div>
              {categoryTotals.length ? <div className="bar-chart">{categoryTotals.map((c) => <div className="bar-row" key={c.name}><div className="bar-label">{c.name}</div><div className="bar-track"><div className="bar-fill" style={{width:`${Math.max(2,c.amount/Math.max(...categoryTotals.map(x=>x.amount))*100)}%`,background:c.color}}/></div><strong>{money(c.amount)}</strong></div>)}</div> : <EmptyState text="Add expenses to see your category analytics."/>}
            </section>
          )}

          {(activePage === "Overview" || activePage === "Transactions") && (
            <section className="panel transactions-panel">
              <div className="panel-heading transaction-heading"><div><h2>{activePage === "Overview" ? "Recent transactions" : "All transactions"}</h2><p>{activePage === "Overview" ? "Your latest money moves" : "Search, filter and manage your expenses"}</p></div><div className="table-actions"><button className="outline-button" onClick={exportCSV}><Download size={15}/> Export CSV</button>{activePage === "Overview" && <button className="text-button" onClick={() => setActivePage("Transactions")}>View all <ArrowUpRight size={15}/></button>}</div></div>
              <div className="filters"><div className="search-box"><Search size={16}/><input placeholder="Search expenses..." value={search} onChange={(e)=>setSearch(e.target.value)}/></div><select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}><option>All categories</option>{CATEGORIES.map(c=><option key={c.name}>{c.name}</option>)}</select>{activePage === "Transactions" && <MonthPicker value={selectedMonth} onChange={setSelectedMonth}/>}</div>
              <ExpenseTable items={activePage === "Overview" ? recent.filter(e => (categoryFilter==="All categories" || e.category===categoryFilter) && `${e.title} ${e.category}`.toLowerCase().includes(search.toLowerCase())) : visibleExpenses} onEdit={openEdit} onDelete={deleteExpense}/>
              <div className="table-footer"><span>Showing {activePage === "Overview" ? Math.min(recent.length, 5) : visibleExpenses.length} transaction(s)</span><span>Saved automatically on this device</span></div>
            </section>
          )}
          <footer>Made with care <span>✦</span> Your personal finance space</footer>
        </div>
      </main>
      {modalOpen && <ExpenseModal initial={editing} onClose={()=>{setModalOpen(false);setEditing(null);}} onSave={saveExpense}/>}
    </div>
  );
}

function makeGradient(items, total) {
  let start = 0;
  return items.map((c) => {
    const end = start + (total ? c.amount / total * 100 : 0);
    const part = `${c.color} ${start}% ${end}%`;
    start = end;
    return part;
  }).join(", ");
}

function MonthPicker({value,onChange}) {
  return <label className="month-picker"><CalendarDays size={14}/><input type="month" value={value} onChange={(e)=>onChange(e.target.value)}/><ChevronDown size={13}/></label>;
}

function ExpenseTable({items,onEdit,onDelete}) {
  if (!items.length) return <EmptyState text="No transactions found. Try another filter or add an expense." />;
  return <div className="table-scroll"><table><thead><tr><th>DESCRIPTION</th><th>CATEGORY</th><th>DATE</th><th>AMOUNT</th><th></th></tr></thead><tbody>
    {items.map((e)=>{const info=categoryInfo(e.category);const Icon=info.icon;return <tr key={e.id}><td><div className="expense-title"><span className="category-icon" style={{background:`${info.color}30`,color:info.color}}><Icon size={17}/></span><div><strong>{e.title}</strong>{e.note && <small>{e.note}</small>}</div></div></td><td><span className="category-chip"><i style={{background:info.color}}/>{e.category}</span></td><td className="date-cell">{new Date(`${e.date}T12:00:00`).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td><td className="amount-cell">− {money(e.amount)}</td><td><div className="row-actions"><button title="Edit" onClick={()=>onEdit(e)}><Pencil size={15}/></button><button title="Delete" onClick={()=>onDelete(e.id)}><Trash2 size={15}/></button></div></td></tr>})}
  </tbody></table></div>;
}

function EmptyState({text}) { return <div className="empty-state"><div className="empty-icon"><ReceiptText size={22}/></div><strong>Nothing to show yet</strong><p>{text}</p></div>; }

function ExpenseModal({initial,onClose,onSave}) {
  const [form,setForm] = useState(initial || {title:"",amount:"",category:"Food & Drinks",date:today,note:""});
  const [error,setError] = useState("");
  function update(key,value) { setForm((f)=>({...f,[key]:value})); }
  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Please enter an expense title.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Enter an amount greater than zero.");
    if (!form.date) return setError("Please select a date.");
    onSave({...form,title:form.title.trim(),amount:Number(form.amount),note:form.note.trim()});
  }
  return <div className="modal-backdrop" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}><form className="expense-modal" onSubmit={submit}>
    <div className="modal-heading"><div><span className="eyebrow">KEEP IT ORGANIZED</span><h2>{initial ? "Edit expense" : "Add an expense"}</h2><p>Every little detail helps you stay on track.</p></div><button type="button" className="icon-button" onClick={onClose}><X size={19}/></button></div>
    <label className="field-label">Expense title<input autoFocus placeholder="e.g. Lunch with friends" value={form.title} onChange={(e)=>update("title",e.target.value)}/></label>
    <label className="field-label">Amount (₹)<input type="number" min="1" step="1" placeholder="0" value={form.amount} onChange={(e)=>update("amount",e.target.value)}/></label>
    <div className="form-two"><label className="field-label">Category<select value={form.category} onChange={(e)=>update("category",e.target.value)}>{CATEGORIES.map(c=><option key={c.name}>{c.name}</option>)}</select></label><label className="field-label">Date<input type="date" value={form.date} onChange={(e)=>update("date",e.target.value)}/></label></div>
    <label className="field-label">Note <span className="optional">(optional)</span><input placeholder="Add a short note" value={form.note} onChange={(e)=>update("note",e.target.value)}/></label>
    {error && <div className="form-error">{error}</div>}
    <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{initial ? "Save changes" : "Save expense"}</button></div>
  </form></div>;
}

export default App;