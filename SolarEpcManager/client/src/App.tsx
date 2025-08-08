import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Design from "@/pages/design";
import Leads from "@/pages/leads";
import Purchasing from "@/pages/purchasing";
import Finance from "@/pages/finance";
import Operations from "@/pages/operations";
import OM from "@/pages/om";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/design" component={Design} />
          <Route path="/leads" component={Leads} />
          <Route path="/purchasing" component={Purchasing} />
          <Route path="/finance" component={Finance} />
          <Route path="/operations" component={Operations} />
          <Route path="/om" component={OM} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
