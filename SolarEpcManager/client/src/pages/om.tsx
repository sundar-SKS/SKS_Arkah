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
import { 
  Wrench, AlertTriangle, CheckCircle, Clock, 
  Battery, Thermometer, Zap, TrendingUp,
  Calendar, MapPin, Phone, FileText,
  Activity, Shield, Settings
} from "lucide-react";
import type { Project } from "@shared/schema";

interface MaintenanceSchedule {
  id: number;
  projectId: number;
  type: 'preventive' | 'corrective' | 'emergency';
  title: string;
  description: string;
  scheduledDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  technician: string;
  estimatedDuration: number; // hours
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PerformanceMetrics {
  projectId: number;
  capacity: number;
  currentOutput: number;
  efficiency: number;
  availability: number;
  energyGenerated: number; // kWh today
  co2Saved: number; // kg today
  lastUpdate: Date;
}

export default function OperationsAndMaintenance() {
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    select: (data) => data?.filter(project => project.status === 'in_progress' || project.status === 'completed') || [],
  });

  // Mock O&M data - in real app this would come from API
  const maintenanceSchedule: MaintenanceSchedule[] = [
    {
      id: 1,
      projectId: 1,
      type: 'preventive',
      title: 'Quarterly Panel Cleaning',
      description: 'Clean solar panels, check connections, inspect for damage',
      scheduledDate: new Date('2024-02-01'),
      status: 'pending',
      technician: 'Suresh Patel',
      estimatedDuration: 4,
      priority: 'medium'
    },
    {
      id: 2,
      projectId: 1,
      type: 'corrective',
      title: 'Inverter Issue Resolution',
      description: 'Address inverter fault code 03 - DC isolation failure',
      scheduledDate: new Date('2024-01-30'),
      status: 'overdue',
      technician: 'Ravi Kumar',
      estimatedDuration: 2,
      priority: 'high'
    },
    {
      id: 3,
      projectId: 2,
      type: 'preventive',
      title: 'Electrical System Inspection',
      description: 'Check all electrical connections, measure resistances',
      scheduledDate: new Date('2024-02-05'),
      status: 'in_progress',
      technician: 'Amit Singh',
      estimatedDuration: 6,
      priority: 'medium'
    }
  ];

  const performanceData: PerformanceMetrics[] = [
    {
      projectId: 1,
      capacity: 50,
      currentOutput: 42.5,
      efficiency: 85,
      availability: 98.2,
      energyGenerated: 380,
      co2Saved: 266,
      lastUpdate: new Date()
    },
    {
      projectId: 2,
      capacity: 25,
      currentOutput: 23.1,
      efficiency: 92.4,
      availability: 99.1,
      energyGenerated: 195,
      co2Saved: 137,
      lastUpdate: new Date()
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <Calendar className="h-4 w-4" />;
      case 'corrective': return <Wrench className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const totalEnergyToday = performanceData.reduce((sum, p) => sum + p.energyGenerated, 0);
  const totalCO2Saved = performanceData.reduce((sum, p) => sum + p.co2Saved, 0);
  const avgEfficiency = performanceData.reduce((sum, p) => sum + p.efficiency, 0) / performanceData.length;
  const avgAvailability = performanceData.reduce((sum, p) => sum + p.availability, 0) / performanceData.length;

  return (
    <>
      <Header 
        title="Operations & Maintenance" 
        description="Monitor performance, schedule maintenance, and manage solar plant operations" 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-8">
          
          {/* Performance Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Energy Today</p>
                    <p className="text-3xl font-bold text-gray-900">{totalEnergyToday}</p>
                    <p className="text-sm text-gray-500">kWh</p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">CO₂ Saved Today</p>
                    <p className="text-3xl font-bold text-gray-900">{totalCO2Saved}</p>
                    <p className="text-sm text-gray-500">kg</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                    <p className="text-3xl font-bold text-gray-900">{avgEfficiency.toFixed(1)}%</p>
                    <p className="text-sm text-green-600">↗ +2.3% from last week</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-arkah-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Availability</p>
                    <p className="text-3xl font-bold text-gray-900">{avgAvailability.toFixed(1)}%</p>
                    <p className="text-sm text-green-600">Target: 99%</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Live Performance Monitoring */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Live Performance</CardTitle>
                  <Select value={timeFilter} onValueChange={(value: 'today' | 'week' | 'month') => setTimeFilter(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData.map((metrics) => {
                  const project = projects?.find(p => p.id === metrics.projectId);
                  return (
                    <div key={metrics.projectId} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{project?.name || `Project ${metrics.projectId}`}</h4>
                        <Badge variant="outline">
                          {metrics.currentOutput}MW / {metrics.capacity}MW
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Efficiency</p>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all" 
                                style={{ width: `${metrics.efficiency}%` }}
                              />
                            </div>
                            <span className="font-semibold">{metrics.efficiency}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-600">Availability</p>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all" 
                                style={{ width: `${metrics.availability}%` }}
                              />
                            </div>
                            <span className="font-semibold">{metrics.availability}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Last updated: {metrics.lastUpdate.toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Maintenance Schedule */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <Button size="sm" className="bg-arkah-primary hover:bg-arkah-secondary">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {maintenanceSchedule.map((task) => {
                  const project = projects?.find(p => p.id === task.projectId);
                  return (
                    <div key={task.id} className="p-4 border rounded-lg bg-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(task.type)}
                          <h4 className="font-semibold">{task.title}</h4>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Project</p>
                          <p className="font-medium">{project?.name || `Project ${task.projectId}`}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Technician</p>
                          <p className="font-medium">{task.technician}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Scheduled</p>
                          <p className="font-medium">{task.scheduledDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{task.estimatedDuration}h</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()} Priority
                        </span>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                          {task.status === 'pending' && (
                            <Button size="sm" className="bg-arkah-primary hover:bg-arkah-secondary">
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Equipment Status */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Equipment Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                    Inverters
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Inverter Bank A</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Inverter Bank B</span>
                      <Badge className="bg-red-100 text-red-800">Fault</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Inverter Bank C</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Thermometer className="h-5 w-5 mr-2 text-red-500" />
                    Environmental
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Panel Temperature</span>
                      <span className="font-medium">45°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ambient Temperature</span>
                      <span className="font-medium">32°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Irradiance</span>
                      <span className="font-medium">850 W/m²</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Battery className="h-5 w-5 mr-2 text-blue-500" />
                    Power Quality
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Grid Frequency</span>
                      <span className="font-medium">50.02 Hz</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Voltage (L-N)</span>
                      <span className="font-medium">230.5 V</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Power Factor</span>
                      <span className="font-medium">0.98</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}