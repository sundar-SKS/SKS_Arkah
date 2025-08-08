import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Lead } from "@shared/schema";

const leadFormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  capacity: z.string().min(1, "Capacity is required"),
  estimatedValue: z.string().min(1, "Estimated value is required"),
  stage: z.string().default("generation"),
  projectType: z.string().default("rooftop"),
  source: z.string().default("manual"),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  lead?: Lead;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export default function LeadForm({ lead, onSuccess, children }: LeadFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      companyName: lead?.companyName || "",
      contactPerson: lead?.contactPerson || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      capacity: lead?.capacity || "",
      estimatedValue: lead?.estimatedValue || "",
      stage: lead?.stage || "generation",
      projectType: lead?.projectType || "rooftop",
      source: lead?.source || "manual",
      notes: lead?.notes || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const payload = {
        ...data,
        capacity: data.capacity,
        estimatedValue: data.estimatedValue,
        assignedTo: 1, // Default to admin user
      };
      
      if (lead) {
        return apiRequest("PUT", `/api/leads/${lead.id}`, payload);
      } else {
        return apiRequest("POST", "/api/leads", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: lead ? "Lead updated" : "Lead created",
        description: lead ? "Lead has been updated successfully." : "New lead has been created successfully.",
      });
      
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save lead",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-arkah-primary hover:bg-arkah-secondary">
            {lead ? "Edit Lead" : "Add Lead"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                {...form.register("companyName")}
                placeholder="Enter company name"
              />
              {form.formState.errors.companyName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                {...form.register("contactPerson")}
                placeholder="Enter contact person name"
              />
              {form.formState.errors.contactPerson && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.contactPerson.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity (MW)</Label>
              <Input
                id="capacity"
                type="number"
                step="0.1"
                {...form.register("capacity")}
                placeholder="Enter capacity in MW"
              />
              {form.formState.errors.capacity && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.capacity.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
              <Input
                id="estimatedValue"
                type="number"
                {...form.register("estimatedValue")}
                placeholder="Enter estimated value"
              />
              {form.formState.errors.estimatedValue && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.estimatedValue.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Stage</Label>
              <Select value={form.watch("stage")} onValueChange={(value) => form.setValue("stage", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generation">Generation</SelectItem>
                  <SelectItem value="cold">Cold Leads</SelectItem>
                  <SelectItem value="costing">Costing</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiations">Negotiations</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Project Type</Label>
              <Select value={form.watch("projectType")} onValueChange={(value) => form.setValue("projectType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rooftop">Rooftop Solar</SelectItem>
                  <SelectItem value="open_access">Open Access Solar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Source</Label>
              <Select value={form.watch("source")} onValueChange={(value) => form.setValue("source", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="cold_call">Cold Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Enter any additional notes"
              rows={3}
            />
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
