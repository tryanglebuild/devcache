import {
  ServerCog,
  LayoutTemplate,
  GitBranch,
  ShieldCheck,
  TestTube2,
  Database,
  Layers,
  Grid3X3,
  Paintbrush,
  Compass,
  type LucideIcon,
} from 'lucide-react'

/**
 * Canonical Lucide icon for each agent category.
 * Used across landing page, marketplace, dashboard, and agent cards.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Core categories (match AGENT_CATEGORIES keys in types/agents.types.ts)
  backend:      ServerCog,
  frontend:     LayoutTemplate,
  devops:       GitBranch,
  security:     ShieldCheck,
  testing:      TestTube2,
  database:     Database,
  orchestrator: Layers,
  general:      Grid3X3,

  // Display categories used on the landing page (agent tags)
  design:       Paintbrush,
  product:      Compass,
  qa:           TestTube2,  // same as testing
  data:         Database,   // same as database
}

/** Fallback icon when category is unknown */
export const DEFAULT_CATEGORY_ICON: LucideIcon = Grid3X3
