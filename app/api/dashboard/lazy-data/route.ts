import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  getTrendingAgents,
  getPublicAgents
} from '@/lib/agents/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [trendingAgents, publicAgents] = await Promise.all([
      getTrendingAgents(10),
      getPublicAgents(6)
    ])

    return NextResponse.json({
      trendingAgents,
      publicAgents,
    })
  } catch (error) {
    console.error('Error fetching lazy data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
