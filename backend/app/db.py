import os
from contextlib import contextmanager
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

load_dotenv(override=False)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  website TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  title TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL CHECK (value > 0),
  stage TEXT NOT NULL,
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  close_date DATE NOT NULL,
  owner TEXT NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  contact_id INTEGER NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  deal_id INTEGER NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
);
"""

@contextmanager
def get_conn():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not configured. Set it to a Postgres connection string for the deal tracker backend.")
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        yield conn

def init_db() -> None:
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)
            cur.execute("SELECT COUNT(*) AS count FROM companies")
            if cur.fetchone()["count"] == 0:
                seed(cur)
        conn.commit()

def seed(cur) -> None:
    companies = [
        ("Northstar Health", "Healthcare", "https://northstar.example"),
        ("Apex Manufacturing", "Manufacturing", "https://apex.example"),
        ("BrightCart", "Retail technology", "https://brightcart.example"),
        ("Cobalt Bank", "Financial services", "https://cobalt.example")
    ]
    company_ids = []
    for company in companies:
        cur.execute("INSERT INTO companies (name, industry, website) VALUES (%s,%s,%s) RETURNING id", company)
        company_ids.append(cur.fetchone()["id"])

    contacts = [
        (company_ids[0], "Maya Patel", "maya@northstar.example", "+1 555-0148", "VP Operations"),
        (company_ids[1], "Jordan Lee", "jordan@apex.example", "+1 555-0191", "Director of IT"),
        (company_ids[2], "Elena Garcia", "elena@brightcart.example", "+1 555-0166", "Chief Revenue Officer"),
        (company_ids[3], "Sam Carter", "sam@cobalt.example", "+1 555-0183", "Head of Digital Banking")
    ]
    contact_ids = []
    for contact in contacts:
        cur.execute("INSERT INTO contacts (company_id,name,email,phone,title) VALUES (%s,%s,%s,%s,%s) RETURNING id", contact)
        contact_ids.append(cur.fetchone()["id"])

    deals = [
        ("Enterprise care coordination rollout", 142000, "Negotiation", 75, "2025-03-28", "Avery Stone", company_ids[0], contact_ids[0]),
        ("Plant analytics modernization", 86000, "Proposal", 55, "2025-04-12", "Morgan Chen", company_ids[1], contact_ids[1]),
        ("Omnichannel commerce expansion", 118000, "Qualified", 40, "2025-04-30", "Riley Brooks", company_ids[2], contact_ids[2]),
        ("Digital onboarding platform", 210000, "Prospecting", 25, "2025-05-18", "Avery Stone", company_ids[3], contact_ids[3]),
        ("Retail loyalty renewal", 64000, "Closed Won", 100, "2025-02-18", "Riley Brooks", company_ids[2], contact_ids[2])
    ]
    deal_ids = []
    for deal in deals:
        cur.execute("INSERT INTO deals (title,value,stage,probability,close_date,owner,company_id,contact_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id", deal)
        deal_ids.append(cur.fetchone()["id"])

    notes = [
        (deal_ids[0], "Economic buyer confirmed budget and asked for implementation timeline before procurement review.", "Avery Stone"),
        (deal_ids[1], "Sent proposal with two rollout options. Technical validation scheduled with plant systems team.", "Morgan Chen"),
        (deal_ids[2], "Discovery call uncovered priority around unified customer profiles and store associate adoption.", "Riley Brooks")
    ]
    for note in notes:
        cur.execute("INSERT INTO notes (deal_id,body,author) VALUES (%s,%s,%s)", note)

    tasks = [
        (deal_ids[0], "Send security questionnaire responses", "2025-03-05", "High", "open"),
        (deal_ids[0], "Book implementation planning call", "2025-03-08", "Medium", "open"),
        (deal_ids[1], "Follow up on proposal feedback", "2025-03-04", "High", "open"),
        (deal_ids[2], "Share customer profile case study", "2025-03-10", "Medium", "open")
    ]
    for task in tasks:
        cur.execute("INSERT INTO tasks (deal_id,title,due_date,priority,status) VALUES (%s,%s,%s,%s,%s)", task)
