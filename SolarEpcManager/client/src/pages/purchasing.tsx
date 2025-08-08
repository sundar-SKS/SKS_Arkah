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
import PurchaseOrderForm from "@/components/purchasing/purchase-order-form";
import { 
  Upload, Search, Filter, Download, Paperclip, 
  Eye, Building, Package, TrendingUp, Users
} from "lucide-react";
import type { PurchaseOrder } from "@shared/schema";
import type { PurchaseStats } from "@/lib/types";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  ordered: "bg-purple-100 text-purple-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
};

const statusNames = {
  pending: "Pending",
  approved: "Approved",
  ordered: "Ordered",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
};

export default function Purchasing() {
  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<PurchaseStats>({
    queryKey: ["/api/purchase-orders/stats"],
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
        title="Purchasing Management" 
        description="Track project purchasing, vendor management, and cost negotiations" 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="px-6 py-8">
          
          {/* Purchase Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : formatCurrency(stats?.totalPurchases || "0")}
                </div>
                <div className="text-sm text-gray-600">Total Purchases</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-arkah-primary">
                  {statsLoading ? "..." : formatCurrency(stats?.pendingOrders || "0")}
                </div>
                <div className="text-sm text-gray-600">Pending Orders</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? "..." : formatCurrency(
                    stats ? (parseFloat(stats.totalPurchases) - parseFloat(stats.pendingOrders)).toString() : "0"
                  )}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.activeVendors || 0}
                </div>
                <div className="text-sm text-gray-600">Active Vendors</div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Orders Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
                  <p className="text-sm text-gray-600">Manage purchase orders and vendor relationships</p>
                </div>
                <div className="flex space-x-3">
                  <PurchaseOrderForm />
                  <Button className="bg-gray-600 hover:bg-gray-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Invoice
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
                    placeholder="Search purchase orders..." 
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
                      <TableHead>PO Details</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders && purchaseOrders.length > 0 ? (
                      purchaseOrders.map((po) => (
                        <TableRow key={po.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">{po.poNumber}</div>
                              <div className="text-sm text-gray-500">{po.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900">Project #{po.projectId}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                Construction Project
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm text-gray-900">Vendor #{po.vendorId}</div>
                              <div className="text-sm text-gray-500">Tier 1 Supplier</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(po.totalAmount.toString())}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[po.status as keyof typeof statusColors]}>
                              {statusNames[po.status as keyof typeof statusNames]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">3 files</span>
                              <Button variant="ghost" size="sm" className="text-arkah-primary hover:text-arkah-secondary p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-arkah-primary hover:text-arkah-secondary">
                                Edit
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
                            <Package className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
                            <p className="text-gray-500 mb-4">Create your first purchase order to get started</p>
                            <PurchaseOrderForm />
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
