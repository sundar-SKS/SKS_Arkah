import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LeadStats } from "@/lib/types";

const stageColors = {
  generation: "bg-arkah-primary",
  cold: "bg-blue-500",
  costing: "bg-yellow-500",
  proposal: "bg-orange-500",
  negotiations: "bg-arkah-accent",
  confirmed: "bg-green-500",
  rejected: "bg-red-500",
};

const stageNames = {
  generation: "Generation",
  cold: "Cold Leads",
  costing: "Costing",
  proposal: "Proposal",
  negotiations: "Negotiations",
  confirmed: "Confirmed",
  rejected: "Rejected",
};

export default function PipelineChart() {
  const { data: leadStats, isLoading } = useQuery<LeadStats[]>({
    queryKey: ["/api/leads/stats"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsMap = leadStats?.reduce((acc, stat) => {
    acc[stat.stage] = stat;
    return acc;
  }, {} as Record<string, LeadStats>) || {};

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Leads Pipeline</CardTitle>
        <button className="text-arkah-primary hover:text-arkah-secondary font-medium text-sm">
          View All
        </button>
      </CardHeader>
      <CardContent>
        {/* Pipeline Stages */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Object.entries(stageNames).map(([stage, name]) => {
            const stat = statsMap[stage];
            const colorClass = stageColors[stage as keyof typeof stageColors];
            
            return (
              <div key={stage} className="text-center">
                <div className="bg-gray-100 rounded-lg p-3 mb-2">
                  <div className={`w-8 h-8 ${colorClass} rounded-full mx-auto flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">
                      {stat?.count || 0}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-medium">{name}</p>
              </div>
            );
          })}
        </div>
        
        {/* Pipeline Value Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Pipeline Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-arkah-primary">
                ₹{(parseFloat(statsMap.generation?.value || "0") / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600">New Leads</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-600">
                ₹{(
                  (parseFloat(statsMap.costing?.value || "0") + 
                   parseFloat(statsMap.proposal?.value || "0") + 
                   parseFloat(statsMap.negotiations?.value || "0")) / 1000000
                ).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600">Active Pipeline</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                ₹{(parseFloat(statsMap.confirmed?.value || "0") / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-600">Confirmed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
