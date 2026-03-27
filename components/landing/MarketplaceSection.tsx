export default function MarketplaceSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="text-indigo-600 font-extrabold tracking-[0.2em] text-[10px] uppercase mb-4 block">
            Community Marketplace
          </span>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
            Discover Expert AI Agents
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Access thousands of specialized agents across design, development, product, QA, and more. Created by experts, rated by the community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Agent Card 1 - Design */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-3xl">palette</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-bold text-slate-900">4.9</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Design System Architect</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Expert in creating scalable design systems, component libraries, and design tokens for consistent brand experiences.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-purple-600 border border-purple-100">
                DESIGN
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-purple-600 border border-purple-100">
                UI/UX
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-purple-600 border border-purple-100">
                FIGMA
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="font-semibold">4.1K</span>
              </div>
              <button className="text-purple-600 font-bold text-sm hover:text-purple-700 transition-colors">
                View Agent →
              </button>
            </div>
          </div>
          
          {/* Agent Card 2 - Product */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">lightbulb</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-bold text-slate-900">4.8</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Product Strategy Expert</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Guides product discovery, roadmap planning, user research, and feature prioritization with proven frameworks.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-emerald-600 border border-emerald-100">
                PRODUCT
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-emerald-600 border border-emerald-100">
                STRATEGY
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-emerald-600 border border-emerald-100">
                ROADMAP
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="font-semibold">3.2K</span>
              </div>
              <button className="text-emerald-600 font-bold text-sm hover:text-emerald-700 transition-colors">
                View Agent →
              </button>
            </div>
          </div>
          
          {/* Agent Card 3 - QA */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-600 text-3xl">bug_report</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-bold text-slate-900">4.9</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">QA Testing Specialist</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Comprehensive testing strategies, test case generation, automation frameworks, and quality assurance best practices.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-rose-600 border border-rose-100">
                QA
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-rose-600 border border-rose-100">
                TESTING
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-rose-600 border border-rose-100">
                AUTOMATION
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="font-semibold">2.9K</span>
              </div>
              <button className="text-rose-600 font-bold text-sm hover:text-rose-700 transition-colors">
                View Agent →
              </button>
            </div>
          </div>
        </div>
        
        {/* Second Row - Development Agents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Agent Card 4 - Backend */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-3xl">smart_toy</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-bold text-slate-900">4.9</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Supabase Expert Agent</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Master of database design, RLS policies, authentication flows, and real-time subscriptions for backend development.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-indigo-600 border border-indigo-100">
                BACKEND
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-indigo-600 border border-indigo-100">
                DATABASE
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-indigo-600 border border-indigo-100">
                AUTH
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="font-semibold">5.2K</span>
              </div>
              <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors">
                View Agent →
              </button>
            </div>
          </div>
          
          {/* Agent Card 5 - Frontend */}
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-3xl">smart_toy</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-bold text-slate-900">4.8</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Next.js Performance Agent</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Optimize your Next.js apps for speed with server components, caching strategies, and image optimization.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-blue-600 border border-blue-100">
                FRONTEND
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-blue-600 border border-blue-100">
                PERFORMANCE
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-blue-600 border border-blue-100">
                REACT
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="font-semibold">3.8K</span>
              </div>
              <button className="text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
                View Agent →
              </button>
            </div>
          </div>
          
          {/* Agent Card 6 - Orchestrator */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-3xl p-8 border-2 border-indigo-200 hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Orchestrator
            </div>
            
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-600 text-3xl">psychology</span>
              </div>
              <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-indigo-200">
                <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-sm font-bold text-slate-900">4.8</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">Cross-Functional Team Lead</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Coordinates design, product, development, and QA agents to deliver complete features with aligned workflows.
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-indigo-600 border border-indigo-200">
                ORCHESTRATOR
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-indigo-600 border border-indigo-200">
                CROSS-FUNCTIONAL
              </span>
              <span className="text-[10px] font-bold bg-white px-3 py-1.5 rounded-full text-indigo-600 border border-indigo-200">
                LEADERSHIP
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-indigo-200">
              <div className="flex items-center gap-2 text-slate-700 text-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="font-semibold">4.3K</span>
              </div>
              <button className="text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors">
                View Agent →
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:translate-y-[-2px] transition-all">
            Browse All Agents
          </button>
          <p className="mt-6 text-slate-500 text-sm">
            1,247+ agents available • 15,000+ downloads this month
          </p>
        </div>
      </div>
    </section>
  )
}
