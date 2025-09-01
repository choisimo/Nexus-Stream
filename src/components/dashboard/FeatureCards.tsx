import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FileText, 
  Lightbulb, 
  Target, 
  ArrowRight, 
  TrendingUp,
  Users,
  Brain
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Knowledge Base",
    description: "Centralized repository of all organizational knowledge with AI-powered connections",
    icon: BookOpen,
    color: "knowledge",
    stats: "247 articles",
    recent: "12 updated today",
    href: "/knowledge"
  },
  {
    title: "Work Logs & Experience",
    description: "Capture daily insights and problem-solving processes to build institutional memory",
    icon: FileText,
    color: "experience", 
    stats: "1.2k logs",
    recent: "23 new this week",
    href: "/logs"
  },
  {
    title: "AI Insights Engine",
    description: "Intelligent connections between knowledge and experience for faster problem solving",
    icon: Brain,
    color: "insight",
    stats: "89% match rate",
    recent: "15 connections made",
    href: "/insights"
  },
  {
    title: "Project Playbooks",
    description: "Auto-generated success recipes from completed projects and collective wisdom",
    icon: Target,
    color: "collaboration",
    stats: "34 playbooks",
    recent: "3 generated this month",
    href: "/playbooks"
  }
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <Card key={feature.title} className="group hover:shadow-soft transition-all duration-300 bg-gradient-card border-0">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-lg bg-${feature.color}/10 text-${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.recent}
                </Badge>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {feature.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>{feature.stats}</span>
                </div>
                <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Explore
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}