import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@shared/schema";

interface ProjectTimelineProps {
  projectId?: number;
}

const statusIcons = {
  completed: CheckCircle,
  in_progress: Clock,
  pending: AlertCircle,
  blocked: AlertCircle,
};

const statusColors = {
  completed: "text-green-500",
  in_progress: "text-arkah-primary",
  pending: "text-gray-400",
  blocked: "text-red-500",
};

const statusBadgeColors = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-arkah-primary bg-opacity-10 text-arkah-primary",
  pending: "bg-gray-100 text-gray-600",
  blocked: "bg-red-100 text-red-800",
};

export default function ProjectTimeline({ projectId }: ProjectTimelineProps) {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { projectId }],
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="flex-1 bg-gray-200 h-16 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No tasks found for this project.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort tasks by creation date
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          
          {/* Timeline items */}
          <div className="space-y-6">
            {sortedTasks.map((task, index) => {
              const StatusIcon = statusIcons[task.status as keyof typeof statusIcons];
              const iconColor = statusColors[task.status as keyof typeof statusColors];
              const badgeColor = statusBadgeColors[task.status as keyof typeof statusBadgeColors];
              
              return (
                <div key={task.id} className="relative flex items-start">
                  <div className={`w-4 h-4 ${iconColor} rounded-full border-4 border-white shadow flex items-center justify-center bg-white`}>
                    <StatusIcon className="w-3 h-3" />
                  </div>
                  
                  <div className="ml-6 bg-white p-4 rounded-lg shadow-sm border flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className={`text-xs ${badgeColor}`}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          {task.priority && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          )}
                          {task.progress !== null && task.progress > 0 && (
                            <span className="text-xs text-gray-500">
                              {task.progress}% complete
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 ml-4">
                        {task.dueDate && (
                          <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                        )}
                        <div className="mt-1">
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {task.progress !== null && task.progress > 0 && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-arkah-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
