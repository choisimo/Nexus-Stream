import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Search } from "lucide-react";
import heroImage from "@/assets/hero-knowledge-hub.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero rounded-2xl p-8 text-primary-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={heroImage} 
          alt="Knowledge Hub" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      <div className="relative z-10 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Transform Your Team's Knowledge Into 
            <span className="block text-primary-glow">Collective Intelligence</span>
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Capture, connect, and amplify your organization's implicit knowledge. 
            Turn scattered insights into powerful playbooks that drive success.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button size="lg" variant="secondary" className="shadow-soft">
            <Plus className="mr-2 h-4 w-4" />
            Create Knowledge
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            <Search className="mr-2 h-4 w-4" />
            Explore Insights
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 mt-8 pt-8 border-t border-primary-foreground/20">
          <div>
            <div className="text-2xl font-bold">247</div>
            <div className="text-sm opacity-75">Knowledge Articles</div>
          </div>
          <div>
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm opacity-75">Active Contributors</div>
          </div>
          <div>
            <div className="text-2xl font-bold">1.2k</div>
            <div className="text-sm opacity-75">Insights Shared</div>
          </div>
        </div>
      </div>
    </section>
  );
}