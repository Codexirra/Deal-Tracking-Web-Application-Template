import { CalendarClock, CircleDollarSign, Target, TrendingUp } from "lucide-react";
import type { DashboardSummary, Deal } from "../types";

const money = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

function Card({ label, value, helper, icon: Icon }: { label: string; value: string; helper: string; icon: typeof CircleDollarSign }) {
  return (
    <article className="stat-card">
      <div className="stat-icon"><Icon size={22} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{helper}</p>
      </div>
    </article>
  );
}

export default function Dashboard({ summary, onOpenDeal }: { summary: DashboardSummary; onOpenDeal: (deal: Deal) => void }) {
  return (
    <div className="dashboard-grid">
      <section className="stats-grid">
        <Card label="Total pipeline" value={money(summary.totalPipelineValue)} helper="Open opportunity value" icon={CircleDollarSign} />
        <Card label="Weighted forecast" value={money(summary.weightedForecast)} helper="Probability adjusted" icon={TrendingUp} />
        <Card label="Open deals" value={String(summary.openDeals)} helper="Active opportunities" icon={Target} />
        <Card label="Overdue tasks" value={String(summary.overdueTasks)} helper="Need follow-up today" icon={CalendarClock} />
      </section>

      <section className="panel wide-panel">
        <div className="panel-header">
          <div>
            <h2>Pipeline by stage</h2>
            <p>Value and weighted forecast across your revenue funnel.</p>
          </div>
        </div>
        <div className="stage-list">
          {summary.stageTotals.map((stage) => (
            <div className="stage-row" key={stage.stage}>
              <div>
                <strong>{stage.stage}</strong>
                <span>{stage.count} deals · {money(stage.weighted)} weighted</span>
              </div>
              <div className="stage-meter"><span style={{ width: `${Math.min(100, stage.value / Math.max(summary.totalPipelineValue, 1) * 100)}%` }} /></div>
              <b>{money(stage.value)}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header"><h2>Hot deals</h2><p>Largest opportunities requiring attention.</p></div>
        <div className="stack-list">
          {summary.hotDeals.map((deal) => (
            <button className="mini-deal" key={deal.id} onClick={() => onOpenDeal(deal)}>
              <strong>{deal.title}</strong>
              <span>{deal.company.name} · {deal.stage}</span>
              <b>{money(deal.value)}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header"><h2>Upcoming tasks</h2><p>Keep close dates moving.</p></div>
        <div className="stack-list">
          {summary.upcomingTasks.length === 0 && <p className="muted">No open tasks. Your team is clear.</p>}
          {summary.upcomingTasks.map((task) => (
            <div className="task-line" key={task.id}>
              <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
              <div><strong>{task.title}</strong><span>{task.dealTitle} · {task.companyName} · due {task.dueDate}</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
