import type { DealFiltersState, Metadata } from "../types";

export default function DealFilters({ filters, metadata, onChange, onClear }: { filters: DealFiltersState; metadata: Metadata | null; onChange: (filters: DealFiltersState) => void; onClear: () => void }) {
  return (
    <div className="filter-bar">
      <label>
        Stage
        <select value={filters.stage} onChange={(event) => onChange({ ...filters, stage: event.target.value })}>
          <option value="">All stages</option>
          {metadata?.stages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
        </select>
      </label>
      <label>
        Owner
        <select value={filters.owner} onChange={(event) => onChange({ ...filters, owner: event.target.value })}>
          <option value="">All owners</option>
          {metadata?.owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
        </select>
      </label>
      <button className="ghost-button" onClick={onClear}>Clear filters</button>
    </div>
  );
}
