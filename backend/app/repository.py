from datetime import date
from fastapi import HTTPException
from .db import get_conn
from .models import DealInput, NoteInput, TaskInput

STAGES = ["Prospecting", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]

DEAL_SELECT = """
SELECT d.id, d.title, d.value::float, d.stage, d.probability, d.close_date, d.owner, d.created_at, d.updated_at,
       c.id AS company_id, c.name AS company_name, c.industry AS company_industry, c.website AS company_website,
       ct.id AS contact_id, ct.company_id AS contact_company_id, ct.name AS contact_name, ct.email AS contact_email, ct.phone AS contact_phone, ct.title AS contact_title
FROM deals d
JOIN companies c ON c.id = d.company_id
JOIN contacts ct ON ct.id = d.contact_id
"""

def _camel_deal(row, notes=None, tasks=None):
    return {
        "id": row["id"], "title": row["title"], "value": row["value"], "stage": row["stage"], "probability": row["probability"],
        "closeDate": row["close_date"], "owner": row["owner"], "createdAt": row["created_at"], "updatedAt": row["updated_at"],
        "company": {"id": row["company_id"], "name": row["company_name"], "industry": row["company_industry"], "website": row["company_website"]},
        "contact": {"id": row["contact_id"], "companyId": row["contact_company_id"], "name": row["contact_name"], "email": row["contact_email"], "phone": row["contact_phone"], "title": row["contact_title"]},
        "notes": notes or [], "tasks": tasks or []
    }

def _note(row):
    return {"id": row["id"], "dealId": row["deal_id"], "body": row["body"], "author": row["author"], "createdAt": row["created_at"]}

def _task(row):
    return {"id": row["id"], "dealId": row["deal_id"], "title": row["title"], "dueDate": row["due_date"], "priority": row["priority"], "status": row["status"]}

def get_notes(cur, deal_id: int):
    cur.execute("SELECT * FROM notes WHERE deal_id=%s ORDER BY created_at DESC", (deal_id,))
    return [_note(row) for row in cur.fetchall()]

def get_tasks(cur, deal_id: int):
    cur.execute("SELECT * FROM tasks WHERE deal_id=%s ORDER BY status ASC, due_date ASC", (deal_id,))
    return [_task(row) for row in cur.fetchall()]

def list_deals(search: str | None = None, stage: str | None = None, owner: str | None = None):
    clauses = []
    params = []
    if search:
        clauses.append("(LOWER(d.title) LIKE %s OR LOWER(c.name) LIKE %s OR LOWER(ct.name) LIKE %s)")
        term = f"%{search.lower()}%"
        params.extend([term, term, term])
    if stage:
        clauses.append("d.stage = %s")
        params.append(stage)
    if owner:
        clauses.append("d.owner = %s")
        params.append(owner)
    sql = DEAL_SELECT + (" WHERE " + " AND ".join(clauses) if clauses else "") + " ORDER BY d.updated_at DESC"
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
            return [_camel_deal(row, get_notes(cur, row["id"]), get_tasks(cur, row["id"])) for row in rows]

def get_deal(deal_id: int):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(DEAL_SELECT + " WHERE d.id=%s", (deal_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Deal not found")
            return _camel_deal(row, get_notes(cur, deal_id), get_tasks(cur, deal_id))

def validate_contact_company(cur, company_id: int, contact_id: int):
    cur.execute("SELECT id FROM contacts WHERE id=%s AND company_id=%s", (contact_id, company_id))
    if not cur.fetchone():
        raise HTTPException(status_code=400, detail="Selected contact does not belong to the selected company")

def create_deal(payload: DealInput):
    with get_conn() as conn:
        with conn.cursor() as cur:
            validate_contact_company(cur, payload.companyId, payload.contactId)
            cur.execute("""
                INSERT INTO deals (title,value,stage,probability,close_date,owner,company_id,contact_id)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, (payload.title, payload.value, payload.stage, payload.probability, payload.closeDate, payload.owner, payload.companyId, payload.contactId))
            deal_id = cur.fetchone()["id"]
        conn.commit()
    return get_deal(deal_id)

def update_deal(deal_id: int, payload: DealInput):
    with get_conn() as conn:
        with conn.cursor() as cur:
            validate_contact_company(cur, payload.companyId, payload.contactId)
            cur.execute("""
                UPDATE deals SET title=%s,value=%s,stage=%s,probability=%s,close_date=%s,owner=%s,company_id=%s,contact_id=%s,updated_at=NOW()
                WHERE id=%s RETURNING id
            """, (payload.title, payload.value, payload.stage, payload.probability, payload.closeDate, payload.owner, payload.companyId, payload.contactId, deal_id))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="Deal not found")
        conn.commit()
    return get_deal(deal_id)

def add_note(deal_id: int, payload: NoteInput):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO notes (deal_id,body,author) VALUES (%s,%s,%s)", (deal_id, payload.body, payload.author))
            cur.execute("UPDATE deals SET updated_at=NOW() WHERE id=%s", (deal_id,))
        conn.commit()
    return get_deal(deal_id)

def add_task(deal_id: int, payload: TaskInput):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO tasks (deal_id,title,due_date,priority,status) VALUES (%s,%s,%s,%s,'open')", (deal_id, payload.title, payload.dueDate, payload.priority))
            cur.execute("UPDATE deals SET updated_at=NOW() WHERE id=%s", (deal_id,))
        conn.commit()
    return get_deal(deal_id)

def complete_task(task_id: int):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE tasks SET status='done' WHERE id=%s RETURNING deal_id", (task_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Task not found")
            deal_id = row["deal_id"]
            cur.execute("UPDATE deals SET updated_at=NOW() WHERE id=%s", (deal_id,))
        conn.commit()
    return get_deal(deal_id)

def metadata():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM companies ORDER BY name")
            companies = [{"id": r["id"], "name": r["name"], "industry": r["industry"], "website": r["website"]} for r in cur.fetchall()]
            cur.execute("SELECT * FROM contacts ORDER BY name")
            contacts = [{"id": r["id"], "companyId": r["company_id"], "name": r["name"], "email": r["email"], "phone": r["phone"], "title": r["title"]} for r in cur.fetchall()]
            cur.execute("SELECT DISTINCT owner FROM deals ORDER BY owner")
            owners = [r["owner"] for r in cur.fetchall()]
    return {"stages": STAGES, "owners": owners, "companies": companies, "contacts": contacts}

def dashboard():
    deals = list_deals()
    open_deals = [d for d in deals if d["stage"] not in ["Closed Won", "Closed Lost"]]
    stage_totals = []
    for stage in STAGES:
        stage_deals = [d for d in deals if d["stage"] == stage]
        stage_totals.append({"stage": stage, "count": len(stage_deals), "value": sum(d["value"] for d in stage_deals), "weighted": sum(d["value"] * d["probability"] / 100 for d in stage_deals)})
    today = date.today()
    tasks = []
    overdue = 0
    for deal in deals:
        for task in deal["tasks"]:
            if task["status"] == "open":
                if task["dueDate"] < today:
                    overdue += 1
                tasks.append({**task, "dealTitle": deal["title"], "companyName": deal["company"]["name"]})
    return {
        "totalPipelineValue": sum(d["value"] for d in open_deals),
        "weightedForecast": sum(d["value"] * d["probability"] / 100 for d in open_deals),
        "openDeals": len(open_deals),
        "wonThisMonth": sum(d["value"] for d in deals if d["stage"] == "Closed Won"),
        "overdueTasks": overdue,
        "stageTotals": stage_totals,
        "upcomingTasks": sorted(tasks, key=lambda task: task["dueDate"])[:8],
        "hotDeals": sorted(open_deals, key=lambda deal: deal["value"], reverse=True)[:4]
    }
