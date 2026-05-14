import type { Deal } from "../types";

const money = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function DealTable({ deals, onOpenDeal, onEditDeal }: { deals: Deal[]; onOpenDeal: (deal: Deal) => void; onEditDeal: (deal: Deal) => void }) {
  return (
    <section className="panel table-panel">
      <div className="panel-header">
        <div><h2>Deal records</h2><p>Search, filter, edit, and inspect every opportunity.</p></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Deal</th><th>Company</th><th>Contact</th><th>Stage</th><th>Value</th><th>Close date</th><th>Owner</th><th></th></tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.id}>
                <td><button className="link-button" onClick={() => onOpenDeal(deal)}>{deal.title}</button></td>
                <td>{deal.company.name}</td>
                <td>{deal.contact.name}</td>
                <td><span className="stage-badge">{deal.stage}</span></td>
                <td>{money(deal.value)}</td>
                <td>{deal.closeDate}</td>
                <td>{deal.owner}</td>
                <td><button className="ghost-button small" onClick={() => onEditDeal(deal)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deals.length === 0 && <div className="empty-state">No deals match the current filters.</div>}
    </section>
  );
}
