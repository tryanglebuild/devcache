import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const displayName = profile?.full_name || user!.email?.split('@')[0] || 'User'

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Greeting */}
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-[#191c1e] mb-2">Personal Overview</h2>
        <p className="text-[#464554] font-medium">Welcome back, {displayName}. Your engineering workspace is synchronized.</p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#4648d4]/10 flex items-center justify-center text-[#4648d4]">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">Total Projects</p>
            <p className="text-2xl font-black text-[#191c1e]">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#575992]/10 flex items-center justify-center text-[#575992]">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">Saved Templates</p>
            <p className="text-2xl font-black text-[#191c1e]">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#904900]/10 flex items-center justify-center text-[#904900]">
            <span className="material-symbols-outlined">code</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">Code Snippets</p>
            <p className="text-2xl font-black text-[#191c1e]">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">Favorite Items</p>
            <p className="text-2xl font-black text-[#191c1e]">0</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* Recent Projects */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight">Recent Projects</h3>
              <button className="text-sm font-semibold text-[#4648d4] hover:underline">View All Projects</button>
            </div>
            
            <div className="text-center py-12 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#464554] text-3xl">folder_open</span>
              </div>
              <p className="text-[#464554] font-medium mb-4">No projects yet</p>
              <button className="px-6 py-2.5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4648d4]/20 hover:shadow-xl transition-all">
                Create Your First Project
              </button>
            </div>
          </section>

          {/* Favorited Templates */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight">Favorited Templates</h3>
              <button className="text-sm font-semibold text-[#4648d4] hover:underline">Manage Favorites</button>
            </div>
            
            <div className="text-center py-12 bg-white rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#464554] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-[#464554] font-medium">No favorite templates yet</p>
            </div>
          </section>
        </div>

        {/* Right Column - Activity */}
        <aside>
          <div className="sticky top-28">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
              <button className="p-2 hover:bg-[#f2f4f6] rounded-lg transition-colors">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,30,0.06)]">
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#464554]">history</span>
                </div>
                <p className="text-sm text-[#464554]">No recent activity</p>
              </div>
            </div>

            {/* System Status */}
            <div className="mt-8 p-6 bg-[#f2f4f6] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-[#464554] uppercase tracking-wider">System Operational</span>
              </div>
              <span className="text-[10px] font-bold text-[#464554] opacity-60">v1.0.0</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
