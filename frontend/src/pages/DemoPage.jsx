import { PrismaHero } from "../components/ui/prisma-hero";
import { HyperSection } from "../components/ui/hyper-section";
import { FeaturesSection } from "../components/ui/features-section";

export default function DemoPage() {
  return (
    <main className="bg-void min-h-screen font-body">
      <PrismaHero />
      <HyperSection />
      <FeaturesSection />
    </main>
  );
}
