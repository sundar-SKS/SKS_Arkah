import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertProjectSchema, insertVendorSchema, insertPurchaseOrderSchema, 
         insertInvoiceSchema, insertTaskSchema, insertDocumentSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Leads routes
  app.get("/api/leads", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const leads = await storage.getLeads(Number(limit), Number(offset));
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/stats", async (req, res) => {
    try {
      const stats = await storage.getLeadStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead stats" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(Number(req.params.id));
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      
      // Create activity
      await storage.createActivity({
        entityType: "lead",
        entityId: lead.id,
        action: "created",
        description: `Lead created for ${lead.companyName}`,
        performedBy: leadData.assignedTo || 1, // Default to admin user
      });
      
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const leadData = insertLeadSchema.partial().parse(req.body);
      const originalLead = await storage.getLead(Number(req.params.id));
      if (!originalLead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      const lead = await storage.updateLead(Number(req.params.id), leadData);
      
      // Create activity if stage changed
      if (leadData.stage && leadData.stage !== originalLead.stage) {
        await storage.createActivity({
          entityType: "lead",
          entityId: lead.id,
          action: "stage_changed",
          description: `Lead moved from ${originalLead.stage} to ${leadData.stage}`,
          performedBy: leadData.assignedTo || originalLead.assignedTo || 1,
        });
      }
      
      res.json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lead data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const projects = await storage.getProjects(Number(limit), Number(offset));
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/stats", async (req, res) => {
    try {
      const stats = await storage.getProjectStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project stats" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      
      await storage.createActivity({
        entityType: "project",
        entityId: project.id,
        action: "created",
        description: `Project created: ${project.name}`,
        performedBy: projectData.projectManager || 1,
      });
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Vendors routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const vendors = await storage.getVendors(Number(limit), Number(offset));
      res.json(vendors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  app.post("/api/vendors", async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid vendor data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  // Purchase Orders routes
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const purchaseOrders = await storage.getPurchaseOrders(Number(limit), Number(offset));
      res.json(purchaseOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.get("/api/purchase-orders/stats", async (req, res) => {
    try {
      const stats = await storage.getPurchaseStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase stats" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const poData = insertPurchaseOrderSchema.parse(req.body);
      const po = await storage.createPurchaseOrder(poData);
      
      await storage.createActivity({
        entityType: "purchase_order",
        entityId: po.id,
        action: "created",
        description: `Purchase order ${po.poNumber} created`,
        performedBy: poData.createdBy || 1,
      });
      
      res.status(201).json(po);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid purchase order data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const invoices = await storage.getInvoices(Number(limit), Number(offset));
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/stats", async (req, res) => {
    try {
      const stats = await storage.getFinanceStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch finance stats" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      
      await storage.createActivity({
        entityType: "invoice",
        entityId: invoice.id,
        action: "created",
        description: `Invoice ${invoice.invoiceNumber} created`,
        performedBy: invoiceData.createdBy || 1,
      });
      
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const { limit = 50, offset = 0, projectId } = req.query;
      let tasks;
      if (projectId) {
        tasks = await storage.getTasksByProject(Number(projectId));
      } else {
        tasks = await storage.getTasks(Number(limit), Number(offset));
      }
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/stats", async (req, res) => {
    try {
      const stats = await storage.getTaskStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch task stats" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      await storage.createActivity({
        entityType: "task",
        entityId: task.id,
        action: "created",
        description: `Task created: ${task.title}`,
        performedBy: taskData.createdBy || 1,
      });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), taskData);
      
      await storage.createActivity({
        entityType: "task",
        entityId: task.id,
        action: "updated",
        description: `Task updated: ${task.title}`,
        performedBy: taskData.assignedTo || task.assignedTo || 1,
      });
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid task data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  // Activities routes
  app.get("/api/activities/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const { limit = 20 } = req.query;
      const activities = await storage.getActivities(entityType, Number(entityId), Number(limit));
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
