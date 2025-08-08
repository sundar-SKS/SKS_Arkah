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
import { Trash2, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, Vendor } from "@shared/schema";

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  total: z.number(),
});

const purchaseOrderFormSchema = z.object({
  poNumber: z.string().min(1, "PO number is required"),
  projectId: z.number().min(1, "Project is required"),
  vendorId: z.number().min(1, "Vendor is required"),
  description: z.string().min(1, "Description is required"),
  items: z.array(itemSchema).min(1, "At least one item is required"),
  totalAmount: z.number(),
  status: z.string().default("pending"),
  orderDate: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;

export default function PurchaseOrderForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      poNumber: `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      items: [{ name: "", quantity: 1, unitPrice: 0, total: 0 }],
      status: "pending",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  // Calculate totals
  const calculateItemTotal = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const total = item.quantity * item.unitPrice;
      form.setValue(`items.${index}.total`, total);
      calculateGrandTotal();
    }
  };

  const calculateGrandTotal = () => {
    const total = watchedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    form.setValue("totalAmount", total);
  };

  const createMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormData) => {
      const payload = {
        ...data,
        createdBy: 1, // Default to admin user
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        expectedDeliveryDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : undefined,
      };
      
      return apiRequest("POST", "/api/purchase-orders", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders/stats"] });
      
      toast({
        title: "Purchase order created",
        description: "New purchase order has been created successfully.",
      });
      
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseOrderFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-arkah-primary hover:bg-arkah-secondary">
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                {...form.register("poNumber")}
                placeholder="Enter PO number"
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
              <Label>Vendor</Label>
              <Select value={form.watch("vendorId")?.toString()} onValueChange={(value) => form.setValue("vendorId", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id.toString()}>
                      {vendor.name} - {vendor.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expectedDeliveryDate">Expected Delivery Date</Label>
              <Input
                id="expectedDeliveryDate"
                type="date"
                {...form.register("expectedDeliveryDate")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter purchase order description"
              rows={2}
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: "", quantity: 1, unitPrice: 0, total: 0 })}
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
                        <Label>Item Name</Label>
                        <Input
                          {...form.register(`items.${index}.name`)}
                          placeholder="Enter item name"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          {...form.register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            onChange: () => calculateItemTotal(index),
                          })}
                          placeholder="Qty"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Label>Unit Price (₹)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`items.${index}.unitPrice`, {
                            valueAsNumber: true,
                            onChange: () => calculateItemTotal(index),
                          })}
                          placeholder="Price"
                        />
                      </div>
                      
                      <div className="col-span-3">
                        <Label>Total (₹)</Label>
                        <Input
                          type="number"
                          {...form.register(`items.${index}.total`, { valueAsNumber: true })}
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
                              calculateGrandTotal();
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

            {/* Total */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Grand Total:</span>
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
              {createMutation.isPending ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
