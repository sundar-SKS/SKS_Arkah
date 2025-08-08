import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

const itemSchema = z.object({
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
  amount: z.number(),
});

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  projectId: z.number().min(1, "Project is required"),
  type: z.string().default("client_invoice"),
  clientEmail: z.string().email("Invalid email address"),
  description: z.string().min(1, "Description is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  amount: z.number(),
  taxAmount: z.number().default(0),
  totalAmount: z.number(),
  dueDate: z.string().min(1, "Due date is required"),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

export default function InvoiceForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      type: "client_invoice",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
      taxAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  // Calculate totals
  const calculateItemAmount = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const amount = item.quantity * item.rate;
      form.setValue(`items.${index}.amount`, amount);
      calculateTotals();
    }
  };

  const calculateTotals = () => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = form.watch("taxAmount") || 0;
    
    form.setValue("amount", subtotal);
    form.setValue("totalAmount", subtotal + taxAmount);
  };

  const createMutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const payload = {
        ...data,
        createdBy: 1, // Default to admin user
        issueDate: new Date(),
        dueDate: new Date(data.dueDate),
        status: "draft",
      };
      
      return apiRequest("POST", "/api/invoices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/stats"] });
      
      toast({
        title: "Invoice created",
        description: "New invoice has been created successfully.",
      });
      
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-arkah-primary hover:bg-arkah-secondary">
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New Invoice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                {...form.register("invoiceNumber")}
                placeholder="Enter invoice number"
              />
            </div>
            
            <div>
              <Label>Project</Label>
              <Select value={form.watch("projectId")?.toString()} onValueChange={(value) => form.setValue("projectId", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name} - {project.client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                {...form.register("clientEmail")}
                placeholder="Enter client email"
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter invoice description"
              rows={2}
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-4">
                        <Label>Description</Label>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Enter item description"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: () => calculateItemAmount(index),
                          })}
                          placeholder="Qty"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Rate (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.rate`, {
                            valueAsNumber: true,
                            onChange: () => calculateItemAmount(index),
                          })}
                          placeholder="Rate"
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          {...form.register(`items.${index}.amount`, { valueAsNumber: true })}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              remove(index);
                              calculateTotals();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">₹{form.watch("amount")?.toLocaleString() || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <Label htmlFor="taxAmount">Tax Amount (₹):</Label>
                <div className="w-32">
                  <Input
                    id="taxAmount"
                    type="number"
                    step="0.01"
                    {...form.register("taxAmount", {
                      valueAsNumber: true,
                      onChange: calculateTotals,
                    })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-arkah-primary">
                  ₹{form.watch("totalAmount")?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-arkah-primary hover:bg-arkah-secondary"
              disabled={createMutation.isPending || !form.formState.isValid}
            >
              {createMutation.isPending ? "Creating..." : "Generate Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
