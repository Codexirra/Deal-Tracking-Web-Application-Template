from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .models import DashboardSummary, Deal, DealInput, Metadata, NoteInput, TaskInput
from . import repository

app = FastAPI(title="DealFlow CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("startup")
def startup() -> None:
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "dealflow-crm"}

@app.get("/api/metadata", response_model=Metadata)
def get_metadata():
    return repository.metadata()

@app.get("/api/dashboard", response_model=DashboardSummary)
def get_dashboard():
    return repository.dashboard()

@app.get("/api/deals", response_model=list[Deal])
def get_deals(search: str | None = Query(default=None), stage: str | None = Query(default=None), owner: str | None = Query(default=None)):
    return repository.list_deals(search=search, stage=stage, owner=owner)

@app.post("/api/deals", response_model=Deal, status_code=201)
def create_deal(payload: DealInput):
    return repository.create_deal(payload)

@app.get("/api/deals/{deal_id}", response_model=Deal)
def get_deal(deal_id: int):
    return repository.get_deal(deal_id)

@app.patch("/api/deals/{deal_id}", response_model=Deal)
def update_deal(deal_id: int, payload: DealInput):
    return repository.update_deal(deal_id, payload)

@app.post("/api/deals/{deal_id}/notes", response_model=Deal, status_code=201)
def add_note(deal_id: int, payload: NoteInput):
    return repository.add_note(deal_id, payload)

@app.post("/api/deals/{deal_id}/tasks", response_model=Deal, status_code=201)
def add_task(deal_id: int, payload: TaskInput):
    return repository.add_task(deal_id, payload)

@app.patch("/api/tasks/{task_id}/complete", response_model=Deal)
def complete_task(task_id: int):
    return repository.complete_task(task_id)
