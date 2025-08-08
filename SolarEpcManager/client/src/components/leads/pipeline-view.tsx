import { useQuery } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type Lead } from "@shared/schema";

interface PipelineStage {
  stage: string;
  count: number;
  value: string;
}

const stageConfig = {
  generation: { name: "Generation", color: "#8B5CF6" },
  cold: { name: "Cold Leads", color: "#06B6D4" },
  costing: { name: "Costing", color: "#10B981" },
  proposal: { name: "Proposal", color: "#F59E0B" },
  negotiations: { name: "Negotiations", color: "#EF4444" },
  confirmed: { name: "Confirmed", color: "#22C55E" },
  rejected: { name: "Rejected", color: "#6B7280" },
};

export default function PipelineView() {
  const { data: stats = [], isLoading } = useQuery<PipelineStage[]>({
    queryKey: ["/api/leads/stats"],
  });

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arkah-primary"></div>
      </div>
    );
  }

  // Calculate max count for scaling
  const maxCount = Math.max(...stats.map(s => s.count), 1);
  const minHeight = 30; // Minimum pipe height
  const maxHeight = 120; // Maximum pipe height
  const pipeWidth = 80; // Fixed pipe width

  const getStageHeight = (count: number) => {
    if (count === 0) return minHeight * 0.4; // Very thin for empty stages
    const ratio = count / maxCount;
    return minHeight + (maxHeight - minHeight) * ratio;
  };

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Sales Pipeline Flow
        </h2>
        
        <div className="flex items-center justify-center overflow-x-auto pb-4" style={{ minHeight: '300px' }}>
        {Object.entries(stageConfig).map(([key, config], index) => {
          const stageStat = stats.find(s => s.stage === key);
          const count = stageStat?.count || 0;
          const value = stageStat?.value || "0";
          const height = getStageHeight(count);
          const isLast = index === Object.entries(stageConfig).length - 1;

          return (
            <div key={key} className="flex items-center">
              {/* Stage Column */}
              <div className="flex flex-col items-center min-w-[140px]">
                {/* Stage Name */}
                <div className="text-sm font-semibold text-gray-700 mb-4 text-center">
                  {config.name}
                </div>
                
                {/* Pipe Segment Container - Centered vertically */}
                <div className="relative flex items-center justify-center" style={{ height: '160px' }}>
                  {/* Center Line (invisible guide) */}
                  <div className="absolute w-full h-0.5 bg-gray-200 opacity-30"></div>
                  
                  {/* Pipe Segment with Tooltip */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className="rounded-lg shadow-lg transition-all duration-500 ease-in-out flex items-center justify-center relative z-10 cursor-pointer hover:opacity-90"
                          style={{ 
                            backgroundColor: config.color,
                            width: `${pipeWidth}px`,
                            height: `${height}px`,
                            opacity: count === 0 ? 0.3 : 1
                          }}
                        >
                          {/* Count Display */}
                          <div className="text-white font-bold text-lg">
                            {count}
                          </div>
                        </div>
                      </TooltipTrigger>
                      {count > 0 && (
                        <TooltipContent className="max-w-xs p-4 bg-white border shadow-lg">
                          <div className="space-y-2">
                            <div className="font-semibold text-gray-900 mb-2">
                              {config.name} ({count} leads)
                            </div>
                            {leads
                              .filter(lead => lead.stage === key)
                              .slice(0, 5) // Show max 5 leads
                              .map((lead, idx) => (
                                <div key={lead.id} className="text-sm border-b border-gray-100 pb-2 last:border-b-0">
                                  <div className="font-medium text-gray-800">{lead.companyName}</div>
                                  <div className="text-gray-600">
                                    {lead.capacity}MW • {lead.contactPerson}
                                  </div>
                                  <div className="text-green-600 font-medium">
                                    ₹{parseFloat(lead.estimatedValue || "0").toLocaleString('en-IN')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {lead.projectType === 'rooftop' ? '🏢 Rooftop' : '⚡ Open Access'}
                                  </div>
                                </div>
                              ))}
                            {leads.filter(lead => lead.stage === key).length > 5 && (
                              <div className="text-xs text-gray-500 italic">
                                +{leads.filter(lead => lead.stage === key).length - 5} more leads...
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  

                </div>
                
                {/* Stage Value */}
                <div className="text-center mt-4">
                  <div className="text-lg font-bold text-green-600">
                    ₹{parseFloat(value).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500">stage value</div>
                </div>
              </div>

              {/* Connecting Arrow - Positioned at center line */}
              {!isLast && (
                <div className="flex items-center mx-3" style={{ height: '160px' }}>
                  <div className="flex items-center">
                    <div className="w-8 h-0.5 bg-gray-400"></div>
                    <div className="w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pipeline Insights */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Pipeline Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Bottleneck Stage:</span>
            <span className="ml-2 font-semibold text-red-600">
              {stats.length > 0 ? 
                stageConfig[stats.reduce((prev, current) => 
                  (prev.count > current.count) ? prev : current
                ).stage as keyof typeof stageConfig]?.name || "N/A"
                : "N/A"
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Pipeline Value:</span>
            <span className="ml-2 font-semibold text-green-600">
              ${stats.reduce((sum, stage) => sum + parseFloat(stage.value || "0"), 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Conversion Rate:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {stats.length > 0 ? 
                Math.round((stats.find(s => s.stage === 'confirmed')?.count || 0) / 
                stats.reduce((sum, s) => sum + s.count, 0) * 100) : 0}%
            </span>
          </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}