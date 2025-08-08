import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LeadForm from "./lead-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, Phone, Zap, Building2, Plus, 
  Calendar, Eye, Edit, ArrowRight 
} from "lucide-react";
import type { Lead } from "@shared/schema";

const stageConfig = {
  generation: {
    name: "Lead Generation",
    color: "bg-arkah-primary",
    textColor: "text-white",
    bgColor: "bg-arkah-primary/10",
    borderColor: "border-arkah-primary/20",
  },
  cold: {
    name: "Cold Leads",
    color: "bg-blue-500",
    textColor: "text-white",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  costing: {
    name: "Costing",
    color: "bg-yellow-500",
    textColor: "text-white",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  proposal: {
    name: "Proposal",
    color: "bg-orange-500",
    textColor: "text-white",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  negotiations: {
    name: "Negotiations",
    color: "bg-arkah-accent",
    textColor: "text-white",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  confirmed: {
    name: "Confirmed",
    color: "bg-green-500",
    textColor: "text-white",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  rejected: {
    name: "Rejected",
    color: "bg-red-500",
    textColor: "text-white",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
}

function LeadCard({ lead, isDragging = false }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: lead.id,
    data: { type: "lead", lead },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(1)}Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    } else {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
  };

  const getInitials = (companyName: string) => {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md ${
        isDragging || isSortableDragging ? 'shadow-lg opacity-50' : 'transition-shadow duration-150'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-arkah-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {getInitials(lead.companyName)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{lead.companyName}</h3>
              <p className="text-xs text-gray-600">{lead.contactPerson}</p>
            </div>
          </div>
          <LeadForm lead={lead}>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </LeadForm>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-gray-600">
            <Mail className="h-3 w-3 mr-1" />
            {lead.email}
          </div>
          {lead.phone && (
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {lead.phone}
            </div>
          )}
          <div className="flex items-center text-xs text-gray-600">
            <Zap className="h-4 w-4 mr-1 text-yellow-500" />
            {parseFloat(lead.capacity.toString()).toFixed(1)}MW
          </div>
          <div className="flex items-center text-xs">
            <Badge variant="outline" className="text-xs">
              {lead.projectType === 'rooftop' ? 'Rooftop' : 'Open Access'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-arkah-primary">
            {formatCurrency(lead.estimatedValue.toString())}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(lead.updatedAt).toLocaleDateString()}
          </div>
        </div>

        {lead.notes && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-2">
            {lead.notes}
          </div>
        )}

        {lead.stage === 'confirmed' && (
          <div className="mt-3">
            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
              <ArrowRight className="h-3 w-3 mr-1" />
              Move to Purchasing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StageColumnProps {
  stage: string;
  leads: Lead[];
}

function StageColumn({ stage, leads }: StageColumnProps) {
  const config = stageConfig[stage as keyof typeof stageConfig];
  
  const totalValue = leads.reduce((sum, lead) => sum + parseFloat(lead.estimatedValue.toString()), 0);
  
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
  };

  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: 'stage', stage },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 h-full min-h-[600px] w-full ${config.bgColor} ${config.borderColor} border-2 border-dashed transition-colors ${
        isOver ? 'border-arkah-primary bg-arkah-primary/5' : ''
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{config.name}</h3>
          <Badge className={`${config.color} ${config.textColor}`}>
            {leads.length}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          {formatCurrency(totalValue)}
        </div>
      </div>
      
      <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>

      {stage === 'generation' && (
        <div className="mt-4">
          <LeadForm>
            <Button variant="outline" className="w-full border-dashed border-arkah-primary text-arkah-primary hover:bg-arkah-primary hover:text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </LeadForm>
        </div>
      )}
    </div>
  );
}

export default function LeadsBoard() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: number; newStage: string }) => {
      return apiRequest("PUT", `/api/leads/${leadId}`, { stage: newStage });
    },
    onMutate: async ({ leadId, newStage }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/leads"] });
      
      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData(["/api/leads"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/leads"], (old: Lead[] | undefined) => {
        if (!old) return old;
        return old.map(lead => 
          lead.id === leadId ? { ...lead, stage: newStage, updatedAt: new Date() } : lead
        );
      });
      
      // Return a context object with the snapshotted value
      return { previousLeads };
    },
    onError: (error: any, newLead, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["/api/leads"], context?.previousLeads);
      
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group leads by stage
  const leadsByStage = leads?.reduce((acc, lead) => {
    if (!acc[lead.stage]) {
      acc[lead.stage] = [];
    }
    acc[lead.stage].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>) || {};

  // Ensure all stages exist
  const stages = Object.keys(stageConfig);
  stages.forEach(stage => {
    if (!leadsByStage[stage]) {
      leadsByStage[stage] = [];
    }
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as number;
    const activeLead = leads?.find(lead => lead.id === activeId);
    
    if (!activeLead) {
      setActiveId(null);
      return;
    }

    // Determine the target stage
    let targetStage: string;
    
    // If dropped directly on a stage column
    if (typeof over.id === 'string' && Object.keys(stageConfig).includes(over.id)) {
      targetStage = over.id;
    }
    // If dropped on another lead card, find which stage that lead belongs to
    else if (typeof over.id === 'number') {
      const targetLead = leads?.find(lead => lead.id === over.id);
      if (targetLead) {
        targetStage = targetLead.stage;
      } else {
        setActiveId(null);
        return;
      }
    } else {
      setActiveId(null);
      return;
    }

    // Only update if moving to a different stage
    if (targetStage && targetStage !== activeLead.stage) {
      updateLeadMutation.mutate({ leadId: activeId, newStage: targetStage });
    }

    setActiveId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over events if needed
  };

  const activeLead = activeId ? leads?.find(lead => lead.id === activeId) : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse">
            <div className="flex gap-6 overflow-x-auto pb-4" style={{ minWidth: 'fit-content' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-96 rounded-lg" style={{ minWidth: '320px', width: '320px' }}></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Pipeline Board</CardTitle>
        <p className="text-sm text-gray-600">Drag and drop leads between stages to update their status</p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="flex gap-6 overflow-x-auto pb-4" style={{ minWidth: 'fit-content' }}>
            {stages.map((stage) => (
              <div key={stage} style={{ minWidth: '320px', width: '320px' }}>
                <StageColumn stage={stage} leads={leadsByStage[stage] || []} />
              </div>
            ))}
          </div>
          
          <DragOverlay dropAnimation={null} style={{ cursor: 'grabbing' }}>
            {activeLead ? (
              <div className="transform scale-105 opacity-95 shadow-2xl">
                <LeadCard lead={activeLead} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </CardContent>
    </Card>
  );
}