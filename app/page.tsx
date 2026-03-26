import Navigation from '@/components/landing/Navigation'
import HeroSection from '@/components/landing/HeroSection'
import ProblemSection from '@/components/landing/ProblemSection'
import SolutionSection from '@/components/landing/SolutionSection'
import WorkflowSection from '@/components/landing/WorkflowSection'
import CapabilitiesSection from '@/components/landing/CapabilitiesSection'
import SecuritySection from '@/components/landing/SecuritySection'
import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <WorkflowSection />
      <CapabilitiesSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </main>
  )
}
