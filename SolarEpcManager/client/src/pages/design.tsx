import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Layers, Upload, Download, Eye, Edit3, 
  Ruler, Calculator, Sun, Zap,
  FileImage, Grid3X3, PenTool
} from "lucide-react";
import type { Project, Lead } from "@shared/schema";

interface DesignProject {
  id: number;
  name: string;
  leadId: number;
  capacity: number;
  status: 'draft' | 'in_review' | 'approved' | 'revision_needed';
  designer: string;
  drawings: string[];
  lastModified: Date;
  approvalDate?: Date;
}

export default function Design() {
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: leads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    select: (data) => data?.filter(lead => lead.stage === 'confirmed') || [],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Mock design data - in real app this would come from API
  const designProjects: DesignProject[] = [
    {
      id: 1,
      name: "SolarMax 50MW Grid-Tied System",
      leadId: 3,
      capacity: 50,
      status: 'approved',
      designer: "Rajesh Kumar",
      drawings: ['site-layout.dwg', 'electrical-schematic.dwg', '3d-render.skp'],
      lastModified: new Date('2024-01-15'),
      approvalDate: new Date('2024-01-20')
    },
    {
      id: 2,
      name: "GreenTech 25MW Rooftop Array",
      leadId: 5,
      capacity: 25,
      status: 'in_review',
      designer: "Priya Sharma",
      drawings: ['preliminary-layout.dwg', 'structural-analysis.pdf'],
      lastModified: new Date('2024-01-25'),
    },
    {
      id: 3,
      name: "EcoEnergy 75MW Solar Farm",
      leadId: 7,
      capacity: 75,
      status: 'draft',
      designer: "Amit Patel",
      drawings: ['concept-design.dwg'],
      lastModified: new Date('2024-01-28'),
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_review': return 'bg-yellow-100 text-yellow-800';
      case 'revision_needed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'in_review': return 'In Review';
      case 'revision_needed': return 'Needs Revision';
      default: return 'Draft';
    }
  };

  return (
    <>
      <Header 
        title="Design & Engineering" 
        description="CAD drawings, system design, and technical specifications for solar installations" 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-8">
          
          {/* Design Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Designs</p>
                    <p className="text-3xl font-bold text-gray-900">{designProjects.length}</p>
                  </div>
                  <Layers className="h-8 w-8 text-arkah-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {designProjects.filter(p => p.status === 'in_review').length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {designProjects.reduce((sum, p) => sum + p.capacity, 0)}MW
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-arkah-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Designs</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {designProjects.filter(p => p.status === 'approved').length}
                    </p>
                  </div>
                  <Sun className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  <Button className="bg-arkah-primary hover:bg-arkah-secondary">
                    <PenTool className="mr-2 h-4 w-4" />
                    New Design
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CAD
                  </Button>
                  <Button variant="outline">
                    <Calculator className="mr-2 h-4 w-4" />
                    Design Calculator
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Design Projects */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {designProjects.map((design) => {
              const linkedLead = leads?.find(lead => lead.id === design.leadId);
              
              return (
                <Card key={design.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{design.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {linkedLead?.companyName || 'Unknown Client'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(design.status)}>
                        {getStatusText(design.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Capacity</p>
                        <p className="font-semibold flex items-center">
                          <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                          {design.capacity}MW
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Designer</p>
                        <p className="font-semibold">{design.designer}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Drawings ({design.drawings.length})</p>
                      <div className="space-y-1">
                        {design.drawings.slice(0, 2).map((drawing, index) => (
                          <div key={index} className="flex items-center text-xs bg-gray-50 rounded px-2 py-1">
                            <FileImage className="h-3 w-3 mr-2 text-gray-500" />
                            {drawing}
                          </div>
                        ))}
                        {design.drawings.length > 2 && (
                          <p className="text-xs text-gray-500">+{design.drawings.length - 2} more</p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last modified: {design.lastModified.toLocaleDateString()}
                      {design.approvalDate && (
                        <p>Approved: {design.approvalDate.toLocaleDateString()}</p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Design Tools Panel */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Design Tools & Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">CAD Software</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center"><Layers className="h-4 w-4 mr-2" />AutoCAD 2024</p>
                    <p className="flex items-center"><Layers className="h-4 w-4 mr-2" />SketchUp Pro</p>
                    <p className="flex items-center"><Layers className="h-4 w-4 mr-2" />SolarCAD</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Design Standards</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center"><Ruler className="h-4 w-4 mr-2" />IEC 61215 Standards</p>
                    <p className="flex items-center"><Ruler className="h-4 w-4 mr-2" />Indian Solar Code</p>
                    <p className="flex items-center"><Ruler className="h-4 w-4 mr-2" />BIS Guidelines</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Simulation Tools</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center"><Calculator className="h-4 w-4 mr-2" />PVsyst</p>
                    <p className="flex items-center"><Calculator className="h-4 w-4 mr-2" />SAM (NREL)</p>
                    <p className="flex items-center"><Calculator className="h-4 w-4 mr-2" />Homer Pro</p>
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