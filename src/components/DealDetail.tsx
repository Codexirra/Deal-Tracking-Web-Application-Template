import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, Pencil, Phone, Plus } from "lucide-react";
import type { Deal, TaskPriority } from "../types";

const money = (value: number) => new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export default function DealDetail({ deal, onBack, onEdit, onAddNote, onAddTask, onCompleteTask }: { deal: Deal; onBack: () => void; onEdit: () => void; onAddNote: (dealId: number, body: string, author: string) => Promise<void>; onAddTask: (dealId: number, title: string, dueDate: string, priority: TaskPriority) => Promise<void>; onCompleteTask: (taskId: number) => Promise<void> }) {
  const [note, setNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [busy, setBusy] = useState(false);

  const submitNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    await onAddNote(deal.id, note.trim(), deal.owner);
    setNote("");
    setBusy(false);
  };

  const submitTask = async () => {
    if (!taskTitle.trim()) return;
    setBusy(true);
    await onAddTask(deal.id, taskTitle.trim(), taskDue, priority);
    setTaskTitle("");
    setBusy(false);
  };

  return (
    <div className="detail-layout">
      <section className="panel detail-main">
        <div className="detail-hero">
          <button className="ghost-button" onClick={onBack}><ArrowLeft size={16} /> Back</button>
          <button className="secondary-button" onClick={onEdit}><Pencil size={16} /> Edit deal</button>
        </div>
        <p className="eyebrow">{deal.stage} · {deal.probability}% probability</p>
        <h2>{deal.title}</h2>
        <div className="deal-metrics">
          <div><span>Value</span><strong>{money(deal.value)}</strong></div>
          <div><span>Weighted</span><strong>{money(deal.value * deal.probability / 100)}</strong></div>
          <div><span>Close date</span><strong>{deal.closeDate}</strong></div>
          <div><span>Owner</span><strong>{deal.owner}</strong></div>
        </div>
      </section>

      <aside className="panel contact-card">
        <h3>{deal.company.name}</h3>
        <p>{deal.company.industry}</p>
        <a href={deal.company.website} target="_blank" rel="noreferrer">{deal.company.website}</a>
        <hr />
        <strong>{deal.contact.name}</strong>
        <span>{deal.contact.title}</span>
        <p><Mail size={14} /> {deal.contact.email}</p>
        <p><Phone size={14} /> {deal.contact.phone}</p>
      </aside>

      <section className="panel">
        <div className="panel-header"><h2>Notes</h2><p>Keep discovery, objections, and next steps in context.</p></div>
        <div className="composer"><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a sales note…" /><button className="primary-button" disabled={busy} onClick={submitNote}><Plus size={16} /> Add note</button></div>
        <div className="timeline">
          {deal.notes.map((item) => <div className="note" key={item.id}><strong>{item.author}</strong><span>{new Date(item.createdAt).toLocaleString()}</span><p>{item.body}</p></div>)}
          {deal.notes.length === 0 && <p className="muted">No notes yet.</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header"><h2>Tasks</h2><p>Follow-ups connected directly to this opportunity.</p></div>
        <div className="task-form"><input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Schedule executive follow-up" /><input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} /><select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}><option>Low</option><option>Medium</option><option>High</option></select><button className="primary-button" disabled={busy} onClick={submitTask}>Add task</button></div>
        <div className="stack-list">
          {deal.tasks.map((task) => <div className={task.status === "done" ? "task-line done" : "task-line"} key={task.id}><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span><div><strong>{task.title}</strong><span>Due {task.dueDate} · {task.status}</span></div>{task.status === "open" && <button className="ghost-button small" onClick={() => onCompleteTask(task.id)}><CheckCircle2 size={14} /> Done</button>}</div>)}
          {deal.tasks.length === 0 && <p className="muted">No tasks yet.</p>}
        </div>
      </section>
    </div>
  );
}
