import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PipelineChart from "@/components/leads/pipeline-chart";
import { 
  TrendingUp, Users, Zap, PlusCircle, FileText, 
  CalendarPlus, Calculator, CloudSun 
} from "lucide-react";
import type { Project } from "@shared/schema";
import type { DashboardStats } from "@/lib/types";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    select: (data) => data?.slice(0, 3) || [], // Get first 3 projects for recent projects
  });

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

  return (
    <>
      <Header 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your solar projects." 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Projects */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.totalProjects || 0}
                    </p>
                    <p className="text-sm text-green-600 font-medium">↗ 12% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-arkah-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <CloudSun className="text-arkah-primary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Pipeline Value */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : formatCurrency(stats?.pipelineValue || "0")}
                    </p>
                    <p className="text-sm text-green-600 font-medium">↗ 8% from last month</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Active Leads */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Leads</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.activeLeads || 0}
                    </p>
                    <p className="text-sm text-yellow-600 font-medium">24 need follow-up</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Users className="text-yellow-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* MW Capacity */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">MW Capacity</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : parseFloat(stats?.megawattCapacity || "0").toFixed(1)}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">In development</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Zap className="text-blue-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Leads Pipeline */}
            <div className="lg:col-span-2">
              <PipelineChart />
            </div>
            
            {/* Quick Actions & Recent Projects */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-between bg-arkah-primary hover:bg-arkah-secondary">
                    <span className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Lead
                    </span>
                    <span>→</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Proposal
                    </span>
                    <span>→</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </span>
                    <span>→</span>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center">
                      <Calculator className="mr-2 h-4 w-4" />
                      Cost Calculator
                    </span>
                    <span>→</span>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Recent Projects */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Button variant="ghost" size="sm" className="text-arkah-primary hover:text-arkah-secondary">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : projects && projects.length > 0 ? (
                    projects.map((project) => (
                      <div key={project.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-arkah-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                          <CloudSun className="text-arkah-primary h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{project.name}</p>
                          <p className="text-xs text-gray-500">
                            {parseFloat(project.capacity.toString()).toFixed(1)}MW • {project.status.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-8 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-arkah-primary rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{project.progress}%</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No projects found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
