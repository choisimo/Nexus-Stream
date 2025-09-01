import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { FeatureCards } from "@/components/dashboard/FeatureCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation />
        <main className="flex-1 p-6 space-y-8 animate-fade-in">
          <HeroSection />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Knowledge Hub Features</h2>
                <p className="text-muted-foreground">Explore the tools that transform your team's knowledge into competitive advantage</p>
              </div>
              <FeatureCards />
            </div>
            
            <div className="space-y-6">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
