import { useEffect, useMemo, useState } from "react";
import { BarChart3, BriefcaseBusiness, LayoutDashboard, Plus, RefreshCw, Search, Settings } from "lucide-react";
import { api } from "./api";
import Dashboard from "./components/Dashboard";
import PipelineBoard from "./components/PipelineBoard";
import DealTable from "./components/DealTable";
import DealFilters from "./components/DealFilters";
import DealForm from "./components/DealForm";
import DealDetail from "./components/DealDetail";
import type { DashboardSummary, Deal, DealFiltersState, DealInput, Metadata } from "./types";

type Page = "dashboard" | "pipeline" | "deals" | "detail";

const emptyFilters: DealFiltersState = { search: "", stage: "", owner: "" };

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState<DealFiltersState>(emptyFilters);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextMetadata, nextDeals, nextSummary] = await Promise.all([
        api.getMetadata(),
        api.getDeals(filters),
        api.getDashboard()
      ]);
      setMetadata(nextMetadata);
      setDeals(nextDeals);
      setSummary(nextSummary);
      if (selectedDeal) {
        const refreshed = nextDeals.find((deal) => deal.id === selectedDeal.id);
        if (refreshed) setSelectedDeal(refreshed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load deal tracker data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.stage, filters.owner]);

  const visibleDeals = useMemo(() => deals, [deals]);

  const openDeal = async (deal: Deal) => {
    setPage("detail");
    setSelectedDeal(deal);
    try {
      setSelectedDeal(await api.getDeal(deal.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open deal.");
    }
  };

  const handleSaveDeal = async (payload: DealInput) => {
    setSaving(true);
    setError(null);
    try {
      const saved = editingDeal ? await api.updateDeal(editingDeal.id, payload) : await api.createDeal(payload);
      setShowForm(false);
      setEditingDeal(null);
      setSelectedDeal(saved);
      setPage("detail");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save deal.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (dealId: number, body: string, author: string) => {
    const updated = await api.addNote(dealId, body, author);
    setSelectedDeal(updated);
    await loadAll();
  };

  const handleAddTask = async (dealId: number, title: string, dueDate: string, priority: "Low" | "Medium" | "High") => {
    const updated = await api.addTask(dealId, title, dueDate, priority);
    setSelectedDeal(updated);
    await loadAll();
  };

  const handleCompleteTask = async (taskId: number) => {
    const updated = await api.completeTask(taskId);
    setSelectedDeal(updated);
    await loadAll();
  };

  const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
    { id: "pipeline" as Page, label: "Pipeline", icon: BarChart3 },
    { id: "deals" as Page, label: "Deals", icon: BriefcaseBusiness }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">DF</div>
          <div>
            <strong>DealFlow</strong>
            <span>Sales CRM</span>
          </div>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={page === item.id ? "nav-item active" : "nav-item"} onClick={() => setPage(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <Settings size={18} />
          <p>Pipeline stages, contacts, and company records are served from your FastAPI backend.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Revenue workspace</p>
            <h1>{page === "dashboard" ? "Sales dashboard" : page === "pipeline" ? "Pipeline board" : page === "detail" ? "Deal detail" : "Deal records"}</h1>
          </div>
          <div className="topbar-actions">
            <div className="global-search">
              <Search size={16} />
              <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search deals, contacts, companies" />
            </div>
            <button className="secondary-button" onClick={loadAll}><RefreshCw size={16} /> Refresh</button>
            <button className="primary-button" onClick={() => { setEditingDeal(null); setShowForm(true); }}><Plus size={16} /> New deal</button>
          </div>
        </header>

        {error && <div className="alert">{error}</div>}
        {loading && <div className="loading-panel">Loading your sales workspace…</div>}

        {!loading && page !== "detail" && (
          <DealFilters filters={filters} metadata={metadata} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />
        )}

        {!loading && page === "dashboard" && summary && <Dashboard summary={summary} onOpenDeal={openDeal} />}
        {!loading && page === "pipeline" && <PipelineBoard deals={visibleDeals} stages={metadata?.stages || []} onOpenDeal={openDeal} />}
        {!loading && page === "deals" && <DealTable deals={visibleDeals} onOpenDeal={openDeal} onEditDeal={(deal) => { setEditingDeal(deal); setShowForm(true); }} />}
        {!loading && page === "detail" && selectedDeal && (
          <DealDetail
            deal={selectedDeal}
            onBack={() => setPage("deals")}
            onEdit={() => { setEditingDeal(selectedDeal); setShowForm(true); }}
            onAddNote={handleAddNote}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
          />
        )}

        {showForm && metadata && (
          <DealForm
            metadata={metadata}
            deal={editingDeal}
            saving={saving}
            onCancel={() => { setShowForm(false); setEditingDeal(null); }}
            onSubmit={handleSaveDeal}
          />
        )}
      </main>
    </div>
  );
}
