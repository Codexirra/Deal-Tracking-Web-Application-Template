export type DealStage = "Prospecting" | "Qualified" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
export type TaskStatus = "open" | "done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Company {
  id: number;
  name: string;
  industry: string;
  website: string;
}

export interface Contact {
  id: number;
  companyId: number;
  name: string;
  email: string;
  phone: string;
  title: string;
}

export interface Note {
  id: number;
  dealId: number;
  body: string;
  author: string;
  createdAt: string;
}

export interface Task {
  id: number;
  dealId: number;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  owner: string;
  company: Company;
  contact: Contact;
  notes: Note[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalPipelineValue: number;
  weightedForecast: number;
  openDeals: number;
  wonThisMonth: number;
  overdueTasks: number;
  stageTotals: Array<{ stage: DealStage; count: number; value: number; weighted: number }>;
  upcomingTasks: Array<Task & { dealTitle: string; companyName: string }>;
  hotDeals: Deal[];
}

export interface Metadata {
  stages: DealStage[];
  owners: string[];
  companies: Company[];
  contacts: Contact[];
}

export interface DealInput {
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string;
  owner: string;
  companyId: number;
  contactId: number;
}

export interface DealFiltersState {
  search: string;
  stage: string;
  owner: string;
}
