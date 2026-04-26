import { PrismaHero } from "../components/ui/prisma-hero";
import { HyperSection } from "../components/ui/hyper-section";
import { FeaturesSection } from "../components/ui/features-section";
import PlaytoFooter from "../components/ui/PlaytoFooter";

export default function DemoPage() {
  return (
    <main className="bg-void min-h-screen font-body">
      <PrismaHero />
      <HyperSection />
      <FeaturesSection />
      <PlaytoFooter />
    </main>
  );
}
