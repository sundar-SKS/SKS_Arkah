import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceForm from "@/components/finance/invoice-form";
import { 
  Download, Search, Filter, Eye, 
  TrendingUp, AlertCircle, CheckCircle, Clock
} from "lucide-react";
import type { Invoice } from "@shared/schema";
import type { FinanceStats } from "@/lib/types";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const statusNames = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export default function Finance() {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<FinanceStats>({
    queryKey: ["/api/invoices/stats"],
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
        title="Finance Management" 
        description="Invoice generation, payment tracking, and financial reporting" 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-8">
          
          {/* Financial Overview */}
          <Card className="mb-8">
            <CardContent className="p-6 bg-gradient-to-r from-arkah-primary to-arkah-secondary text-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : formatCurrency(stats?.totalRevenue || "0")}
                  </div>
                  <div className="text-arkah-primary bg-white bg-opacity-20 px-2 py-1 rounded text-sm mt-1 inline-block">
                    Total Revenue
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : formatCurrency(stats?.outstanding || "0")}
                  </div>
                  <div className="text-arkah-primary bg-white bg-opacity-20 px-2 py-1 rounded text-sm mt-1 inline-block">
                    Outstanding
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : formatCurrency(stats?.collected || "0")}
                  </div>
                  <div className="text-arkah-primary bg-white bg-opacity-20 px-2 py-1 rounded text-sm mt-1 inline-block">
                    Collected
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.overdueCount || 0}
                  </div>
                  <div className="text-arkah-primary bg-white bg-opacity-20 px-2 py-1 rounded text-sm mt-1 inline-block">
                    Overdue Invoices
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Management</CardTitle>
                  <p className="text-sm text-gray-600">Generate, track, and manage client invoices</p>
                </div>
                <div className="flex space-x-3">
                  <InvoiceForm />
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Purchase Dump
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {/* Search and Filters */}
            <CardContent className="px-6 py-4 border-b">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Search invoices..." 
                    className="pl-10" 
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
            
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8">
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices && invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(invoice.issueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900">Project #{invoice.projectId}</div>
                              <div className="text-sm text-gray-500">
                                {invoice.clientEmail || "No email"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">Project #{invoice.projectId}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(invoice.totalAmount.toString())}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                              {statusNames[invoice.status as keyof typeof statusNames]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-arkah-primary hover:text-arkah-secondary">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                                ⋮
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          <div className="flex flex-col items-center">
                            <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                            <p className="text-gray-500 mb-4">Generate your first invoice to get started</p>
                            <InvoiceForm />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
