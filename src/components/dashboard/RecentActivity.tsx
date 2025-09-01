import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  FileText, 
  Lightbulb, 
  Target,
  Clock
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "knowledge",
    title: "API Integration Best Practices",
    description: "Sarah Kim updated the authentication section with new OAuth 2.0 examples",
    user: {
      name: "Sarah Kim",
      avatar: "",
      initials: "SK"
    },
    timestamp: "2 hours ago",
    icon: FileText,
    badge: "Updated"
  },
  {
    id: 2,
    type: "experience",
    title: "Database Migration Issue Resolved",
    description: "Mike Chen shared how he fixed the PostgreSQL timeout during large data migration",
    user: {
      name: "Mike Chen",
      avatar: "",
      initials: "MC"
    },
    timestamp: "4 hours ago",
    icon: Lightbulb,
    badge: "Insight"
  },
  {
    id: 3,
    type: "collaboration",
    title: "Q3 Marketing Campaign",
    description: "Team discussion on conversion rate optimization strategies",
    user: {
      name: "Emma Wilson",
      avatar: "",
      initials: "EW"
    },
    timestamp: "6 hours ago",
    icon: MessageSquare,
    badge: "Discussion"
  },
  {
    id: 4,
    type: "project",
    title: "Mobile App Redesign Playbook",
    description: "Auto-generated playbook from the successful mobile app redesign project",
    user: {
      name: "AI Assistant",
      avatar: "",
      initials: "AI"
    },
    timestamp: "1 day ago",
    icon: Target,
    badge: "Generated"
  }
];

const getActivityColor = (type: string) => {
  switch (type) {
    case "knowledge": return "knowledge";
    case "experience": return "experience";
    case "collaboration": return "collaboration";
    case "project": return "insight";
    default: return "muted";
  }
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const color = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
              <div className={`p-2 rounded-lg bg-${color}/10 text-${color} group-hover:bg-${color}/20 transition-colors`}>
                <Icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {activity.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {activity.badge}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{activity.user.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}