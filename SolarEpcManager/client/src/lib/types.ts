export interface DashboardStats {
  totalProjects: number;
  pipelineValue: string;
  activeLeads: number;
  megawattCapacity: string;
}

export interface LeadStats {
  stage: string;
  count: number;
  value: string;
}

export interface ProjectStats {
  totalProjects: number;
  totalCapacity: string;
  activeProjects: number;
}

export interface PurchaseStats {
  totalPurchases: string;
  pendingOrders: string;
  activeVendors: number;
}

export interface FinanceStats {
  totalRevenue: string;
  outstanding: string;
  collected: string;
  overdueCount: number;
}

export interface TaskStats {
  overdue: number;
  dueToday: number;
  completed: number;
  inProgress: number;
}


