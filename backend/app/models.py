from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field

DealStage = Literal["Prospecting", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"]
TaskPriority = Literal["Low", "Medium", "High"]
TaskStatus = Literal["open", "done"]

class Company(BaseModel):
    id: int
    name: str
    industry: str
    website: str

class Contact(BaseModel):
    id: int
    companyId: int
    name: str
    email: str
    phone: str
    title: str

class Note(BaseModel):
    id: int
    dealId: int
    body: str
    author: str
    createdAt: datetime

class Task(BaseModel):
    id: int
    dealId: int
    title: str
    dueDate: date
    priority: TaskPriority
    status: TaskStatus

class Deal(BaseModel):
    id: int
    title: str
    value: float
    stage: DealStage
    probability: int
    closeDate: date
    owner: str
    company: Company
    contact: Contact
    notes: list[Note]
    tasks: list[Task]
    createdAt: datetime
    updatedAt: datetime

class DealInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    value: float = Field(gt=0)
    stage: DealStage
    probability: int = Field(ge=0, le=100)
    closeDate: date
    owner: str = Field(min_length=1, max_length=80)
    companyId: int
    contactId: int

class NoteInput(BaseModel):
    body: str = Field(min_length=1, max_length=4000)
    author: str = Field(min_length=1, max_length=80)

class TaskInput(BaseModel):
    title: str = Field(min_length=1, max_length=220)
    dueDate: date
    priority: TaskPriority

class StageTotal(BaseModel):
    stage: DealStage
    count: int
    value: float
    weighted: float

class UpcomingTask(Task):
    dealTitle: str
    companyName: str

class DashboardSummary(BaseModel):
    totalPipelineValue: float
    weightedForecast: float
    openDeals: int
    wonThisMonth: float
    overdueTasks: int
    stageTotals: list[StageTotal]
    upcomingTasks: list[UpcomingTask]
    hotDeals: list[Deal]

class Metadata(BaseModel):
    stages: list[DealStage]
    owners: list[str]
    companies: list[Company]
    contacts: list[Contact]
