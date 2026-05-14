import type { Deal, DealStage } from "../types";

const money = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function PipelineBoard({ deals, stages, onOpenDeal }: { deals: Deal[]; stages: DealStage[]; onOpenDeal: (deal: Deal) => void }) {
  const activeStages = stages.length ? stages : (["Prospecting", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"] as DealStage[]);

  return (
    <div className="pipeline-board">
      {activeStages.map((stage) => {
        const stageDeals = deals.filter((deal) => deal.stage === stage);
        const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
        return (
          <section className="pipeline-column" key={stage}>
            <header>
              <div><h3>{stage}</h3><span>{stageDeals.length} deals</span></div>
              <strong>{money(total)}</strong>
            </header>
            <div className="pipeline-cards">
              {stageDeals.map((deal) => (
                <button className="deal-card" key={deal.id} onClick={() => onOpenDeal(deal)}>
                  <strong>{deal.title}</strong>
                  <span>{deal.company.name}</span>
                  <div><b>{money(deal.value)}</b><em>{deal.probability}%</em></div>
                  <p>{deal.contact.name} · closes {deal.closeDate}</p>
                </button>
              ))}
              {stageDeals.length === 0 && <div className="empty-card">No deals in this stage.</div>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
