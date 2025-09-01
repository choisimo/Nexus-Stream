import { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Home,
  Lightbulb,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
    badge: null,
  },
  {
    title: "Knowledge Base",
    icon: BookOpen,
    href: "/knowledge",
    badge: "12 new",
    color: "knowledge"
  },
  {
    title: "Work Logs",
    icon: FileText,
    href: "/logs",
    badge: "3 today",
    color: "experience"
  },
  {
    title: "Insights",
    icon: Lightbulb,
    href: "/insights",
    badge: null,
    color: "insight"
  },
  {
    title: "Projects",
    icon: Target,
    href: "/projects",
    badge: "5 active",
    color: "collaboration"
  },
  {
    title: "Team",
    icon: Users,
    href: "/team",
    badge: null,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics",
    badge: null,
  },
];

export function Navigation() {
  const [activeItem, setActiveItem] = useState("/");

  return (
    <nav className="w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.href;
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-10 px-3",
                isActive && "bg-gradient-primary text-primary-foreground shadow-soft",
                !isActive && "hover:bg-muted/50"
              )}
              onClick={() => setActiveItem(item.href)}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  isActive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <FileText className="mr-2 h-4 w-4" />
            New Work Log
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <BookOpen className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </div>
      </div>
    </nav>
  );
}