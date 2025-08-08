import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProjectTimeline from "@/components/operations/project-timeline";
import { 
  Plus, Calendar, Users, Clock, AlertTriangle,
  CheckCircle, BarChart3, Settings, Building, Zap
} from "lucide-react";
import type { Project, Task } from "@shared/schema";
import type { TaskStats } from "@/lib/types";

export default function Operations() {
  const [selectedProject, setSelectedProject] = useState<number | undefined>();

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: taskStats, isLoading: statsLoading } = useQuery<TaskStats>({
    queryKey: ["/api/tasks/stats"],
  });

  const activeProjects = projects?.filter(p => p.status === 'in_progress' || p.status === 'planning') || [];
  const rooftopProjects = activeProjects.filter(p => p.projectType === 'rooftop');
  const openAccessProjects = activeProjects.filter(p => p.projectType === 'open_access');

  return (
    <>
      <Header 
        title="Operations Management" 
        description="Project tracking, milestone management, and progress monitoring" 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-8">
          
          {/* Project Selection */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Overview</CardTitle>
                  <p className="text-sm text-gray-600">Select a project to view detailed timeline and tasks</p>
                </div>
                <div className="flex space-x-3">
                  <Button className="bg-arkah-primary hover:bg-arkah-secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                  <Button className="bg-gray-600 hover:bg-gray-700">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gantt View
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <Select value={selectedProject?.toString()} onValueChange={(value) => setSelectedProject(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project to track" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} - {project.client} ({project.capacity}MW)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Project Timeline */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <ProjectTimeline projectId={selectedProject} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 text-gray-300 mb-4 mx-auto" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                    <p className="text-gray-500">Choose a project from the dropdown above to view its timeline and tasks</p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Task Summary & Active Projects */}
            <div className="space-y-6">
              
              {/* Task Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Overdue Tasks
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {statsLoading ? "..." : taskStats?.overdue || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">Requires immediate attention</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                        Due Today
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        {statsLoading ? "..." : taskStats?.dueToday || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">Scheduled for completion</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Completed
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {statsLoading ? "..." : taskStats?.completed || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">This month</div>
                  </div>
                  
                  <div className="bg-arkah-primary bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-arkah-primary" />
                        In Progress
                      </span>
                      <span className="text-lg font-bold text-arkah-primary">
                        {statsLoading ? "..." : taskStats?.inProgress || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">Actively being worked on</div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : activeProjects.length > 0 ? (
                    activeProjects.map((project) => (
                      <div key={project.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-600">
                              {parseFloat(project.capacity.toString()).toFixed(1)}MW • {project.client}
                            </p>
                          </div>
                          <Badge className="bg-arkah-primary text-white">
                            {project.progress}% Complete
                          </Badge>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-arkah-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due: {project.expectedCompletionDate ? new Date(project.expectedCompletionDate).toLocaleDateString() : 'TBD'}
                            </span>
                            <span className="text-gray-600 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Team assigned
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-arkah-primary hover:text-arkah-secondary p-0"
                            onClick={() => setSelectedProject(project.id)}
                          >
                            View Details →
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 text-gray-300 mb-2 mx-auto" />
                      <p className="text-sm">No active projects found</p>
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
