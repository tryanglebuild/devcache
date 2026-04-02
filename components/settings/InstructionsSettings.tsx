'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, FileText, Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, Bold, Italic, Code, List, ListOrdered, Link as LinkIcon, Sparkles, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { INSTRUCTION_TEMPLATES, type InstructionTemplate } from '@/lib/instruction-templates'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Skill {
  id: string
  name: string
  description: string | null
  category: string
  priority: number
  is_active: boolean
  file_path: string
  created_at: string
  last_used_at: string | null
}

export function InstructionsSettings() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [templateSearch, setTemplateSearch] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    priority: 50,
    content: '',
  })

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/skills')
      if (!response.ok) throw new Error('Failed to fetch skills')
      const data = await response.json()
      setSkills(data.skills || [])
    } catch (error) {
      toast.error('Failed to load instructions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.content) {
      toast.error('Name and content are required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create instruction')
      }

      toast.success('Instruction created successfully')
      setFormData({ name: '', description: '', category: 'general', priority: 50, content: '' })
      setIsModalOpen(false)
      await fetchSkills()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create instruction')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (skillId: string, currentState: boolean) => {
    try {
      const response = await fetch(`/api/skills/${skillId}/toggle`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to toggle instruction')

      toast.success(currentState ? 'Instruction disabled' : 'Instruction enabled')
      await fetchSkills()
    } catch (error) {
      toast.error('Failed to toggle instruction')
    }
  }

  const handleDelete = async (skillId: string) => {
    if (!confirm('Are you sure you want to delete this instruction?')) return

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete instruction')

      toast.success('Instruction deleted successfully')
      await fetchSkills()
    } catch (error) {
      toast.error('Failed to delete instruction')
    }
  }

  const handleAddTemplate = async (template: InstructionTemplate) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          category: template.category,
          priority: template.priority,
          content: template.content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add template')
      }

      toast.success(`Template "${template.name}" added successfully!`)
      setShowTemplates(false)
      await fetchSkills()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add template')
    } finally {
      setIsSaving(false)
    }
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.content.substring(start, end)
    const newText = formData.content.substring(0, start) + before + selectedText + after + formData.content.substring(end)
    
    setFormData({ ...formData, content: newText })
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const filteredSkills = skills.filter(skill => {
    if (filter === 'active') return skill.is_active
    if (filter === 'inactive') return !skill.is_active
    return true
  })

  const filteredTemplates = INSTRUCTION_TEMPLATES.filter(template => {
    if (!templateSearch) return true
    const search = templateSearch.toLowerCase()
    return (
      template.name.toLowerCase().includes(search) ||
      template.description.toLowerCase().includes(search) ||
      template.tags.some(tag => tag.toLowerCase().includes(search))
    )
  })

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb] bg-gradient-to-r from-white to-[#fafbfc]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#4648d4] flex items-center justify-center shadow-md">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#191c1e]">
              AI Instructions (Skills)
            </h2>
            <p className="text-[#6b7280] text-sm">
              Create custom instructions to guide the AI chat behavior
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation - Fixed at top */}
      <Tabs defaultValue="my-instructions" className="flex flex-col flex-1 overflow-hidden">
        <div className="border-b border-[#e5e7eb] bg-white shadow-sm">
          <div className="px-6">
            <TabsList className="inline-flex h-12 items-center justify-start gap-1 bg-transparent p-0 border-b-2 border-transparent">
              <TabsTrigger 
                value="my-instructions" 
                className="relative inline-flex items-center justify-center whitespace-nowrap px-6 py-3 text-sm font-medium transition-all border-b-2 border-transparent -mb-[2px] data-[state=active]:border-[#4648d4] data-[state=active]:text-[#4648d4] data-[state=inactive]:text-[#6b7280] hover:text-[#191c1e] hover:bg-[#f7f9fb] rounded-t-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                My Instructions
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="relative inline-flex items-center justify-center whitespace-nowrap px-6 py-3 text-sm font-medium transition-all border-b-2 border-transparent -mb-[2px] data-[state=active]:border-[#4648d4] data-[state=active]:text-[#4648d4] data-[state=inactive]:text-[#6b7280] hover:text-[#191c1e] hover:bg-[#f7f9fb] rounded-t-lg"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Browse Templates
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* My Instructions Tab */}
          <TabsContent value="my-instructions" className="mt-0">
            {/* Create Button */}
            <div className="mb-6">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#4648d4] to-[#6063ee] hover:from-[#3739b8] hover:to-[#4f52d9] text-white shadow-lg shadow-[#4648d4]/30 transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    New Instruction
                  </Button>
                </DialogTrigger>
                <DialogContent className="!max-w-none w-[96vw] h-[92vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-white via-[#fafbfc] to-[#f7f9fb] flex flex-col">
              {/* Header with gradient - Fixed */}
              <div className="relative px-10 pt-6 pb-5 bg-gradient-to-br from-[#4648d4] to-[#6063ee] text-white overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold text-white mb-0.5">
                        Create New Instruction
                      </DialogTitle>
                      <DialogDescription className="text-white/80 text-xs">
                        Define custom behavior for the AI chat assistant
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-10 py-8">
                <div className="flex gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="w-[420px] shrink-0 space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#191c1e]">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white text-xs">
                          1
                        </div>
                        Basic Information
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-[#191c1e]">
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Always provide examples"
                            className="border-[#e5e7eb] focus:border-[#4648d4] focus:ring-[#4648d4]/20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium text-[#191c1e]">
                            Category
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="border-[#e5e7eb] focus:border-[#4648d4] focus:ring-[#4648d4]/20 bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border border-[#e5e7eb] shadow-lg">
                              <SelectItem value="general" className="hover:bg-[#f7f9fb] cursor-pointer">📋 General</SelectItem>
                              <SelectItem value="coding" className="hover:bg-[#f7f9fb] cursor-pointer">💻 Coding</SelectItem>
                              <SelectItem value="writing" className="hover:bg-[#f7f9fb] cursor-pointer">✍️ Writing</SelectItem>
                              <SelectItem value="analysis" className="hover:bg-[#f7f9fb] cursor-pointer">📊 Analysis</SelectItem>
                              <SelectItem value="custom" className="hover:bg-[#f7f9fb] cursor-pointer">⚙️ Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium text-[#191c1e]">
                            Description <span className="text-[#9ca3af] text-xs">(Optional)</span>
                          </Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of what this instruction does"
                            className="border-[#e5e7eb] focus:border-[#4648d4] focus:ring-[#4648d4]/20 min-h-[80px] resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-sm font-medium text-[#191c1e]">
                            Priority (0-100)
                          </Label>
                          <div className="space-y-3">
                            <Input
                              id="priority"
                              type="number"
                              min="0"
                              max="100"
                              value={formData.priority}
                              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                              className="border-[#e5e7eb] focus:border-[#4648d4] focus:ring-[#4648d4]/20"
                            />
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#9ca3af]">Low</span>
                                <span className="font-semibold text-[#4648d4]">{formData.priority}%</span>
                                <span className="text-[#9ca3af]">High</span>
                              </div>
                              <div className="h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#4648d4] to-[#6063ee] transition-all duration-300"
                                  style={{ width: `${formData.priority}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-[#9ca3af] leading-relaxed">
                            Higher priority instructions are applied first
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Info Card */}
                    <div className="p-4 bg-gradient-to-br from-[#f7f9fb] to-white border border-[#e5e7eb] rounded-xl">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-[#4648d4] shrink-0 mt-0.5" />
                        <h4 className="text-xs font-semibold text-[#191c1e]">
                          Quick Tips
                        </h4>
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#6b7280]">
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#4648d4] shrink-0">•</span>
                          <span>Use markdown for formatting</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#4648d4] shrink-0">•</span>
                          <span>Be specific and clear</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#4648d4] shrink-0">•</span>
                          <span>Higher priority = applied first</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-[#4648d4] shrink-0">•</span>
                          <span>Toggle on/off anytime</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Right Column - Content Editor */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#191c1e]">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#4648d4] to-[#6063ee] flex items-center justify-center text-white text-xs">
                        2
                      </div>
                      Instruction Content
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-sm font-medium text-[#191c1e]">
                        Markdown Content <span className="text-red-500">*</span>
                      </Label>
                      
                      {/* Enhanced Markdown Toolbar */}
                      <div className="flex items-center gap-1 p-2 bg-white border border-[#e5e7eb] rounded-t-xl shadow-sm">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('**', '**')}
                          title="Bold"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('*', '*')}
                          title="Italic"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('`', '`')}
                          title="Code"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <Code className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-[#e5e7eb] mx-1" />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('# ')}
                          title="Heading 1"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4] font-semibold text-xs"
                        >
                          H1
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('## ')}
                          title="Heading 2"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4] font-semibold text-xs"
                        >
                          H2
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('### ')}
                          title="Heading 3"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4] font-semibold text-xs"
                        >
                          H3
                        </Button>
                        <div className="w-px h-6 bg-[#e5e7eb] mx-1" />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('- ')}
                          title="Bullet List"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('1. ')}
                          title="Numbered List"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-6 bg-[#e5e7eb] mx-1" />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('[', '](url)')}
                          title="Link"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => insertMarkdown('```\n', '\n```')}
                          title="Code Block"
                          className="hover:bg-[#f7f9fb] hover:text-[#4648d4]"
                        >
                          <Code className="h-4 w-4" />
                          <span className="ml-1 text-xs">Block</span>
                        </Button>
                      </div>
                      
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="# My Instruction&#10;&#10;Always provide code examples when explaining concepts.&#10;&#10;## Guidelines&#10;&#10;- Use clear, concise language&#10;- Include practical examples&#10;- Be specific about requirements"
                        className="min-h-[550px] font-mono text-sm rounded-t-none border-t-0 border-[#e5e7eb] focus:border-[#4648d4] focus:ring-[#4648d4]/20 resize-none"
                      />
                      <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                        <span>Use markdown formatting to structure your instruction</span>
                        <span>{formData.content.length} characters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="px-10 py-4 bg-white border-t border-[#e5e7eb] flex items-center justify-between shrink-0">
                <p className="text-xs text-[#9ca3af]">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="border-[#e5e7eb] hover:bg-[#f7f9fb]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isSaving || !formData.name || !formData.content}
                    className="bg-gradient-to-r from-[#4648d4] to-[#6063ee] hover:from-[#3739b8] hover:to-[#4f52d9] text-white shadow-lg shadow-[#4648d4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Instruction
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>

        {/* Info Card */}
        <div className="p-5 bg-[#f7f9fb] border border-[#e5e7eb] rounded-lg mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-white border border-[#e5e7eb] flex items-center justify-center shrink-0">
              <AlertCircle className="h-4 w-4 text-[#4648d4]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#191c1e] mb-1">
                About Instructions
              </h4>
              <p className="text-xs text-[#6b7280] leading-relaxed mb-3">
                Instructions are markdown files that define how the AI should behave in chat. 
                They have the highest priority and override default system behavior.
              </p>
              <div className="space-y-1">
                <p className="text-xs text-[#6b7280]">
                  • Active instructions are loaded automatically in every chat
                </p>
                <p className="text-xs text-[#6b7280]">
                  • Higher priority instructions are applied first
                </p>
                <p className="text-xs text-[#6b7280]">
                  • Use markdown format for better formatting
                </p>
                <p className="text-xs text-[#6b7280]">
                  • Examples: "Always provide code examples", "Be concise", "Use Portuguese"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-[#4648d4]' : ''}
          >
            All ({skills.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-[#10b981]' : ''}
          >
            Active ({skills.filter(s => s.is_active).length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilter('inactive')}
            className={filter === 'inactive' ? 'bg-[#9ca3af]' : ''}
          >
            Inactive ({skills.filter(s => !s.is_active).length})
          </Button>
        </div>

        {/* Instructions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4648d4]" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-12 bg-[#f7f9fb] rounded-lg border border-[#e5e7eb]">
            <FileText className="h-12 w-12 text-[#9ca3af] mx-auto mb-3" />
            <p className="text-sm text-[#6b7280]">
              {filter === 'all' ? 'No instructions yet' : `No ${filter} instructions`}
            </p>
            <p className="text-xs text-[#9ca3af] mt-1">
              {filter === 'all' ? 'Create your first instruction' : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={`p-4 rounded-lg border transition-all ${
                  skill.is_active
                    ? 'bg-white border-[#4648d4] shadow-sm'
                    : 'bg-[#f7f9fb] border-[#e5e7eb] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#191c1e]">{skill.name}</h4>
                      <span className="px-2 py-0.5 bg-[#f7f9fb] rounded text-xs font-medium text-[#464554] border border-[#e5e7eb]">
                        {skill.category}
                      </span>
                      <span className="px-2 py-0.5 bg-[#4648d4] text-white rounded text-xs font-medium">
                        Priority: {skill.priority}
                      </span>
                      {skill.is_active && (
                        <span className="px-2 py-0.5 bg-[#10b981] text-white rounded text-xs font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-sm text-[#6b7280] mb-2">{skill.description}</p>
                    )}
                    <p className="text-xs text-[#9ca3af]">
                      Created: {new Date(skill.created_at).toLocaleDateString()}
                      {skill.last_used_at && ` • Last used: ${new Date(skill.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(skill.id, skill.is_active)}
                      className={`border-[#e5e7eb] ${
                        skill.is_active 
                          ? 'text-[#10b981] hover:bg-[#f0fdf4]' 
                          : 'text-[#9ca3af] hover:bg-[#f7f9fb]'
                      }`}
                      title={skill.is_active ? 'Disable instruction' : 'Enable instruction'}
                    >
                      {skill.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(skill.id)}
                      className="border-[#e5e7eb] text-[#ef4444] hover:bg-[#fef2f2]"
                      title="Delete instruction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Templates Tab */}
      <TabsContent value="templates" className="mt-0 h-full">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <Input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search by name, description, or tags..."
              className="pl-10 border-[#e5e7eb] focus:border-[#4648d4] focus:ring-[#4648d4]/20 bg-[#f7f9fb]"
            />
          </div>
        </div>

        {/* Templates List */}
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f7f9fb] flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-[#9ca3af]" />
            </div>
            <h3 className="text-lg font-semibold text-[#191c1e] mb-1">No templates found</h3>
            <p className="text-sm text-[#6b7280]">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="group p-5 bg-white border border-[#e5e7eb] rounded-xl hover:border-[#4648d4] hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f7f9fb] to-[#e5e7eb] flex items-center justify-center shrink-0 group-hover:from-[#4648d4]/10 group-hover:to-[#6063ee]/10 transition-all">
                    <span className="text-2xl">{template.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-[#191c1e] mb-1 group-hover:text-[#4648d4] transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-[#6b7280] leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-[#f7f9fb] text-[#464554] rounded-md text-xs font-medium capitalize">
                          {template.category}
                        </span>
                        <span className="px-2.5 py-1 bg-[#4648d4]/10 text-[#4648d4] rounded-md text-xs font-medium">
                          Priority {template.priority}
                        </span>
                        {template.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-white border border-[#e5e7eb] text-[#6b7280] rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddTemplate(template)}
                        disabled={isSaving}
                        className="bg-[#4648d4] hover:bg-[#3739b8] text-white shadow-sm"
                      >
                        {isSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5 mr-1.5" />
                            Add to Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Templates Count */}
        {filteredTemplates.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-[#6b7280]">
              Showing {filteredTemplates.length} of {INSTRUCTION_TEMPLATES.length} templates
            </p>
          </div>
        )}
      </TabsContent>
        </div>
      </div>
      </Tabs>
    </div>
  )
}
