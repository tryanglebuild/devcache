import Navigation from '@/components/landing/Navigation'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import WorkflowSection from '@/components/landing/WorkflowSection'
import CapabilitiesSection from '@/components/landing/CapabilitiesSection'
import MarketplaceSection from '@/components/landing/MarketplaceSection'
import SecuritySection from '@/components/landing/SecuritySection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'
import { getTrendingAgents, getMarketplaceStats } from '@/lib/agents/queries'

export const revalidate = 3600 // revalidate every hour

export default async function Home() {
  const [trendingAgents, marketplaceStats] = await Promise.all([
    getTrendingAgents(6),
    getMarketplaceStats(),
  ])

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection stats={marketplaceStats} />
      <ProblemSection />
      <SolutionSection />
      <WorkflowSection agents={trendingAgents.slice(0, 4)} />
      <CapabilitiesSection />
      <MarketplaceSection agents={trendingAgents} stats={marketplaceStats} />
      <SecuritySection />
      <CTASection />
      <Footer />
    </main>
  )
}
