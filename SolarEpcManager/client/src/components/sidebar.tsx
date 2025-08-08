import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ChartPie, Users, ShoppingCart, Calculator, 
  ServerCog, BarChart3, Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartPie },
  { name: "Design", href: "/design", icon: Settings },
  { name: "Leads", href: "/leads", icon: Users, badge: "24" },
  { name: "Purchasing", href: "/purchasing", icon: ShoppingCart, badge: "8" },
  { name: "Finance", href: "/finance", icon: Calculator, badge: "12" },
  { name: "Operations", href: "/operations", icon: ServerCog, badge: "6" },
  { name: "O&M", href: "/om", icon: BarChart3, badge: "3" },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-arkah-dark shadow-lg h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-arkah-primary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-arkah-primary to-arkah-secondary rounded transform rotate-45"></div>
          <span className="text-white text-xl font-bold">ARKAH</span>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-8">
        <div className="px-6 py-3">
          <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Main</span>
        </div>
        
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href} className={cn(
              "flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors",
              isActive && "text-white bg-arkah-primary border-r-4 border-arkah-accent"
            )}>
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-arkah-accent text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
