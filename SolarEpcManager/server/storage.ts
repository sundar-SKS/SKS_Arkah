import { 
  users, leads, projects, vendors, purchaseOrders, invoices, tasks, documents, activities,
  type User, type InsertUser, type Lead, type InsertLead, type Project, type InsertProject,
  type Vendor, type InsertVendor, type PurchaseOrder, type InsertPurchaseOrder,
  type Invoice, type InsertInvoice, type Task, type InsertTask, type Document, type InsertDocument,
  type Activity, type InsertActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, gte, lte, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Leads
  getLeads(limit?: number, offset?: number): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  getLeadsByStage(stage: string): Promise<Lead[]>;
  getLeadStats(): Promise<{ stage: string; count: number; value: string }[]>;
  
  // Projects
  getProjects(limit?: number, offset?: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  getProjectStats(): Promise<{ totalProjects: number; totalCapacity: string; activeProjects: number }>;
  
  // Vendors
  getVendors(limit?: number, offset?: number): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor>;
  
  // Purchase Orders
  getPurchaseOrders(limit?: number, offset?: number): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder>;
  getPurchaseOrdersByProject(projectId: number): Promise<PurchaseOrder[]>;
  getPurchaseStats(): Promise<{ totalPurchases: string; pendingOrders: string; activeVendors: number }>;
  
  // Invoices
  getInvoices(limit?: number, offset?: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;
  getInvoicesByProject(projectId: number): Promise<Invoice[]>;
  getFinanceStats(): Promise<{ totalRevenue: string; outstanding: string; collected: string; overdueCount: number }>;
  
  // Tasks
  getTasks(limit?: number, offset?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTaskStats(): Promise<{ overdue: number; dueToday: number; completed: number; inProgress: number }>;
  
  // Documents
  getDocuments(entityType: string, entityId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  // Activities
  getActivities(entityType: string, entityId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard
  getDashboardStats(): Promise<{
    totalProjects: number;
    pipelineValue: string;
    activeLeads: number; 
    megawattCapacity: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Leads
  async getLeads(limit = 50, offset = 0): Promise<Lead[]> {
    return await db.select().from(leads)
      .orderBy(desc(leads.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values({
      ...lead,
      updatedAt: new Date(),
    }).returning();
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db.update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async getLeadsByStage(stage: string): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.stage, stage));
  }

  async getLeadStats(): Promise<{ stage: string; count: number; value: string }[]> {
    const stats = await db
      .select({
        stage: leads.stage,
        count: count(),
        value: sql<string>`COALESCE(SUM(${leads.estimatedValue}), 0)::text`
      })
      .from(leads)
      .groupBy(leads.stage);
    
    return stats;
  }

  // Projects
  async getProjects(limit = 50, offset = 0): Promise<Project[]> {
    return await db.select().from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values({
      ...project,
      updatedAt: new Date(),
    }).returning();
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db.update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async getProjectStats(): Promise<{ totalProjects: number; totalCapacity: string; activeProjects: number }> {
    const [stats] = await db
      .select({
        totalProjects: count(),
        totalCapacity: sql<string>`COALESCE(SUM(${projects.capacity}), 0)::text`,
        activeProjects: sql<number>`COUNT(CASE WHEN ${projects.status} IN ('planning', 'in_progress') THEN 1 END)::integer`
      })
      .from(projects);
    
    return stats;
  }

  // Vendors
  async getVendors(limit = 50, offset = 0): Promise<Vendor[]> {
    return await db.select().from(vendors)
      .where(eq(vendors.isActive, true))
      .orderBy(vendors.name)
      .limit(limit)
      .offset(offset);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: number, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const [updatedVendor] = await db.update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  // Purchase Orders
  async getPurchaseOrders(limit = 50, offset = 0): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders)
      .orderBy(desc(purchaseOrders.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return po || undefined;
  }

  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [newPo] = await db.insert(purchaseOrders).values({
      ...po,
      updatedAt: new Date(),
    }).returning();
    return newPo;
  }

  async updatePurchaseOrder(id: number, po: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder> {
    const [updatedPo] = await db.update(purchaseOrders)
      .set({ ...po, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return updatedPo;
  }

  async getPurchaseOrdersByProject(projectId: number): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).where(eq(purchaseOrders.projectId, projectId));
  }

  async getPurchaseStats(): Promise<{ totalPurchases: string; pendingOrders: string; activeVendors: number }> {
    const [stats] = await db
      .select({
        totalPurchases: sql<string>`COALESCE(SUM(${purchaseOrders.totalAmount}), 0)::text`,
        pendingOrders: sql<string>`COALESCE(SUM(CASE WHEN ${purchaseOrders.status} = 'pending' THEN ${purchaseOrders.totalAmount} ELSE 0 END), 0)::text`,
        activeVendors: sql<number>`COUNT(DISTINCT ${purchaseOrders.vendorId})::integer`
      })
      .from(purchaseOrders);
    
    return stats;
  }

  // Invoices
  async getInvoices(limit = 50, offset = 0): Promise<Invoice[]> {
    return await db.select().from(invoices)
      .orderBy(desc(invoices.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values({
      ...invoice,
      updatedAt: new Date(),
    }).returning();
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [updatedInvoice] = await db.update(invoices)
      .set({ ...invoice, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async getInvoicesByProject(projectId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.projectId, projectId));
  }

  async getFinanceStats(): Promise<{ totalRevenue: string; outstanding: string; collected: string; overdueCount: number }> {
    const [stats] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(${invoices.totalAmount}), 0)::text`,
        outstanding: sql<string>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('sent', 'overdue') THEN ${invoices.totalAmount} ELSE 0 END), 0)::text`,
        collected: sql<string>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.totalAmount} ELSE 0 END), 0)::text`,
        overdueCount: sql<number>`COUNT(CASE WHEN ${invoices.status} = 'overdue' THEN 1 END)::integer`
      })
      .from(invoices)
      .where(eq(invoices.type, 'client_invoice'));
    
    return stats;
  }

  // Tasks
  async getTasks(limit = 50, offset = 0): Promise<Task[]> {
    return await db.select().from(tasks)
      .orderBy(desc(tasks.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values({
      ...task,
      updatedAt: new Date(),
    }).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db.update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }

  async getTaskStats(): Promise<{ overdue: number; dueToday: number; completed: number; inProgress: number }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [stats] = await db
      .select({
        overdue: sql<number>`COUNT(CASE WHEN ${tasks.dueDate} < ${todayStart} AND ${tasks.status} != 'completed' THEN 1 END)::integer`,
        dueToday: sql<number>`COUNT(CASE WHEN ${tasks.dueDate} >= ${todayStart} AND ${tasks.dueDate} < ${todayEnd} THEN 1 END)::integer`,
        completed: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'completed' THEN 1 END)::integer`,
        inProgress: sql<number>`COUNT(CASE WHEN ${tasks.status} = 'in_progress' THEN 1 END)::integer`
      })
      .from(tasks);
    
    return stats;
  }

  // Documents
  async getDocuments(entityType: string, entityId: number): Promise<Document[]> {
    return await db.select().from(documents)
      .where(and(eq(documents.entityType, entityType), eq(documents.entityId, entityId)))
      .orderBy(desc(documents.createdAt));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  // Activities
  async getActivities(entityType: string, entityId: number, limit = 20): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(and(eq(activities.entityType, entityType), eq(activities.entityId, entityId)))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    totalProjects: number;
    pipelineValue: string;
    activeLeads: number; 
    megawattCapacity: string;
  }> {
    const [projectStats] = await db
      .select({
        totalProjects: count(),
        megawattCapacity: sql<string>`COALESCE(SUM(${projects.capacity}), 0)::text`,
      })
      .from(projects);

    const [leadStats] = await db
      .select({
        activeLeads: count(),
        pipelineValue: sql<string>`COALESCE(SUM(${leads.estimatedValue}), 0)::text`,
      })
      .from(leads)
      .where(sql`${leads.stage} NOT IN ('confirmed', 'rejected')`);

    return {
      totalProjects: projectStats.totalProjects,
      pipelineValue: leadStats.pipelineValue,
      activeLeads: leadStats.activeLeads,
      megawattCapacity: projectStats.megawattCapacity,
    };
  }
}

export const storage = new DatabaseStorage();
