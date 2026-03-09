export interface Project {
  project_id: string;
  project_name: string;
  city: string;
  budget_brl: number;
  start_date: string;
  end_date_planned: string;
}

export interface WeeklySnapshot {
  project_id: string;
  week_start: string;
  planned_progress_pct: number;
  actual_progress_pct: number;
  planned_cost_to_date_brl: number;
  actual_cost_to_date_brl: number;
}

export interface Issue {
  id: string;
  issue_id?: string;
  project_id: string;
  status: string;
  severity: string;
  issue_type: string;
  created_date: string;
}

export interface Task {
  task_id: string;
  project_id: string;
  task_name: string;
  phase: string;
  planned_start: string;
  planned_finish: string;
  actual_start?: string;
  actual_finish?: string;
  status: string;
}

export interface DashboardKPIs {
  plannedProgress: number;
  actualProgress: number;
  progressVariance: number;
  plannedCost: number;
  actualCost: number;
  costVariancePct: number;
  openIssuesCount: number;
  spi: number;
  cpi: number;
}

export interface DashboardData {
  weekly: WeeklySnapshot[];
  issues: { type: string; count: number }[];
  costs: { category: string; planned: number; actual: number }[];
  kpis: DashboardKPIs;
  issuesOpen: number;
  issuesTotal: number;
}
