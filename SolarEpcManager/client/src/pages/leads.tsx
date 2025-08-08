import Header from "@/components/header";
import LeadsBoard from "@/components/leads/leads-board";
import PipelineView from "@/components/leads/pipeline-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kanban, TrendingUp } from "lucide-react";

export default function Leads() {
  return (
    <>
      <Header 
        title="Leads Management" 
        description="Manage your complete lead pipeline from generation to project confirmation" 
      />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="w-full p-6 space-y-8">
          <Tabs defaultValue="pipeline" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pipeline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Visual Pipeline
              </TabsTrigger>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Drag & Drop Board
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pipeline" className="mt-6">
              <PipelineView />
            </TabsContent>
            
            <TabsContent value="board" className="mt-6">
              <LeadsBoard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}