import { useMemo, useState } from "react";
import type { Deal, DealInput, DealStage, Metadata } from "../types";

export default function DealForm({ metadata, deal, saving, onCancel, onSubmit }: { metadata: Metadata; deal: Deal | null; saving: boolean; onCancel: () => void; onSubmit: (payload: DealInput) => void }) {
  const [form, setForm] = useState<DealInput>({
    title: deal?.title || "",
    value: deal?.value || 25000,
    stage: deal?.stage || "Prospecting",
    probability: deal?.probability || 20,
    closeDate: deal?.closeDate || new Date().toISOString().slice(0, 10),
    owner: deal?.owner || metadata.owners[0] || "Sales Team",
    companyId: deal?.company.id || metadata.companies[0]?.id || 0,
    contactId: deal?.contact.id || metadata.contacts[0]?.id || 0
  });
  const [validation, setValidation] = useState<string | null>(null);

  const companyContacts = useMemo(() => metadata.contacts.filter((contact) => contact.companyId === Number(form.companyId)), [metadata.contacts, form.companyId]);

  const update = <K extends keyof DealInput>(key: K, value: DealInput[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) return setValidation("Deal name is required.");
    if (form.value <= 0) return setValidation("Deal value must be greater than zero.");
    if (!form.companyId || !form.contactId) return setValidation("Select a company and contact.");
    setValidation(null);
    onSubmit(form);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="panel-header"><div><h2>{deal ? "Edit deal" : "Create deal"}</h2><p>Capture value, stage, close date, buyer, and ownership.</p></div></div>
        {validation && <div className="alert compact">{validation}</div>}
        <div className="form-grid">
          <label>Deal name<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Enterprise expansion" /></label>
          <label>Value<input type="number" value={form.value} onChange={(e) => update("value", Number(e.target.value))} /></label>
          <label>Stage<select value={form.stage} onChange={(e) => update("stage", e.target.value as DealStage)}>{metadata.stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
          <label>Probability<input type="number" min="0" max="100" value={form.probability} onChange={(e) => update("probability", Number(e.target.value))} /></label>
          <label>Close date<input type="date" value={form.closeDate} onChange={(e) => update("closeDate", e.target.value)} /></label>
          <label>Owner<select value={form.owner} onChange={(e) => update("owner", e.target.value)}>{metadata.owners.map((owner) => <option key={owner}>{owner}</option>)}</select></label>
          <label>Company<select value={form.companyId} onChange={(e) => { const companyId = Number(e.target.value); const firstContact = metadata.contacts.find((contact) => contact.companyId === companyId); setForm({ ...form, companyId, contactId: firstContact?.id || 0 }); }}>{metadata.companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
          <label>Contact<select value={form.contactId} onChange={(e) => update("contactId", Number(e.target.value))}>{companyContacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} · {contact.title}</option>)}</select></label>
        </div>
        <div className="modal-actions"><button className="ghost-button" onClick={onCancel}>Cancel</button><button className="primary-button" disabled={saving} onClick={submit}>{saving ? "Saving…" : "Save deal"}</button></div>
      </div>
    </div>
  );
}
