'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, FileText, Plus, Edit, Trash2, Eye, EyeOff, Bold, Italic, Code, List, ListOrdered, Link as LinkIcon, Search } from 'lucide-react'
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
  const [previewTemplate, setPreviewTemplate] = useState<InstructionTemplate | null>(null)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    priority: 50,
    content: '',
  })
  const [activeTab, setActiveTab] = useState('my-instructions')
  
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

  const handlePreviewTemplate = (template: InstructionTemplate) => {
    // Show a simple preview modal
    setPreviewTemplate(template)
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

      toast.success(`Template "${template.name}" imported successfully!`)
      setPreviewTemplate(null)
      await fetchSkills()
      // Switch to My Instructions tab to show the imported template
      setActiveTab('my-instructions')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add template')
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

  const handleEditSkill = async () => {
    if (!editingSkill || !editFormData.name || !editFormData.content) {
      toast.error('Name and content are required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/skills/${editingSkill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update instruction')
      }

      toast.success('Instruction updated successfully')
      setEditingSkill(null)
      await fetchSkills()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update instruction')
    } finally {
      setIsSaving(false)
    }
  }

  const openEditModal = async (skill: Skill) => {
    try {
      const response = await fetch(`/api/skills/${skill.id}/content`)
      if (!response.ok) throw new Error('Failed to fetch skill content')
      
      const data = await response.json()
      setEditFormData({
        name: skill.name,
        description: skill.description || '',
        category: skill.category,
        priority: skill.priority,
        content: data.content || '',
      })
      setEditingSkill(skill)
    } catch (error) {
      toast.error('Failed to load instruction content')
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

  // Check which templates are already imported
  const isTemplateImported = (templateName: string) => {
    return skills.some(skill => skill.name === templateName)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-container rounded-lg border border-neutral-200 dark:border-white/[0.09] shadow-none overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-white/[0.09]">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-on-surface">
            AI Instructions
          </h2>
          <p className="text-sm text-neutral-500 dark:text-on-surface-variant mt-0.5">
            Create custom instructions to guide AI chat behavior
          </p>
        </div>
      </div>

      {/* Tabs Navigation - Fixed at top */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
        <div className="border-b border-neutral-200 dark:border-white/[0.09] bg-white dark:bg-surface-container">
          <div className="px-6">
            <TabsList className="inline-flex h-10 items-center justify-start gap-0 bg-transparent p-0">
              <TabsTrigger
                value="my-instructions"
                className="relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent -mb-[2px] data-[state=active]:border-neutral-900 dark:data-[state=active]:border-on-surface data-[state=active]:text-neutral-900 dark:data-[state=active]:text-on-surface data-[state=inactive]:text-neutral-500 dark:data-[state=inactive]:text-on-surface-variant hover:text-neutral-700 dark:hover:text-on-surface rounded-none bg-transparent"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                My Instructions
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="relative inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent -mb-[2px] data-[state=active]:border-neutral-900 dark:data-[state=active]:border-on-surface data-[state=active]:text-neutral-900 dark:data-[state=active]:text-on-surface data-[state=inactive]:text-neutral-500 dark:data-[state=inactive]:text-on-surface-variant hover:text-neutral-700 dark:hover:text-on-surface rounded-none bg-transparent"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
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
              <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open)
                if (!open) {
                  setFormData({ name: '', description: '', category: 'general', priority: 50, content: '' })
                }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-neutral-900 hover:bg-neutral-700 text-white">
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    New Instruction
                  </Button>
                </DialogTrigger>
                <DialogContent className="!max-w-none w-[96vw] h-[92vh] overflow-hidden p-0 gap-0 bg-white dark:bg-surface-container flex flex-col">
              {/* Header */}
              <div className="px-8 pt-5 pb-4 border-b border-neutral-200 dark:border-white/[0.09] shrink-0">
                <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-on-surface">
                  New Instruction
                </DialogTitle>
                <DialogDescription className="text-sm text-neutral-500 dark:text-on-surface-variant mt-0.5">
                  Define custom behavior for the AI chat assistant
                </DialogDescription>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="flex gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="w-[380px] shrink-0 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60">Basic Information</p>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                          Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Always provide examples"
                          className="border-neutral-200 dark:border-white/[0.09] text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="category" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                          Category
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="border-neutral-200 dark:border-white/[0.09] bg-white dark:bg-surface-container-high text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] shadow-md">
                            <SelectItem value="general" className="cursor-pointer">General</SelectItem>
                            <SelectItem value="coding" className="cursor-pointer">Coding</SelectItem>
                            <SelectItem value="writing" className="cursor-pointer">Writing</SelectItem>
                            <SelectItem value="analysis" className="cursor-pointer">Analysis</SelectItem>
                            <SelectItem value="custom" className="cursor-pointer">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                          Description <span className="text-neutral-400 dark:text-on-surface-variant/60 text-xs font-normal">(Optional)</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Brief description of what this instruction does"
                          className="border-neutral-200 dark:border-white/[0.09] text-sm min-h-[80px] resize-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="priority" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                          Priority (0–100)
                        </Label>
                        <Input
                          id="priority"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                          className="border-neutral-200 dark:border-white/[0.09] text-sm"
                        />
                        <div className="h-1.5 bg-neutral-100 dark:bg-surface-container-highest rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-400 dark:bg-on-surface-variant transition-all duration-200"
                            style={{ width: `${formData.priority}%` }}
                          />
                        </div>
                        <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">Higher priority instructions are applied first</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Content Editor */}
                  <div className="flex-1 min-w-0 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60">Instruction Content</p>

                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                        Markdown Content <span className="text-red-500">*</span>
                      </Label>
                      
                      {/* Markdown Toolbar */}
                      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-t-md">
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('**', '**')} title="Bold" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                          <Bold className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('*', '*')} title="Italic" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                          <Italic className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('`', '`')} title="Code" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                          <Code className="h-3.5 w-3.5" />
                        </Button>
                        <div className="w-px h-4 bg-neutral-200 dark:bg-white/[0.09] mx-1" />
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('# ')} title="H1" className="h-7 px-1.5 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant text-xs font-semibold">H1</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('## ')} title="H2" className="h-7 px-1.5 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant text-xs font-semibold">H2</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('### ')} title="H3" className="h-7 px-1.5 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant text-xs font-semibold">H3</Button>
                        <div className="w-px h-4 bg-neutral-200 dark:bg-white/[0.09] mx-1" />
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('- ')} title="List" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                          <List className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('1. ')} title="Ordered List" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                          <ListOrdered className="h-3.5 w-3.5" />
                        </Button>
                        <div className="w-px h-4 bg-neutral-200 dark:bg-white/[0.09] mx-1" />
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('[', '](url)')} title="Link" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                          <LinkIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => insertMarkdown('```\n', '\n```')} title="Code Block" className="h-7 px-1.5 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant text-xs gap-1">
                          <Code className="h-3.5 w-3.5" />Block
                        </Button>
                      </div>

                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="# My Instruction&#10;&#10;Always provide code examples when explaining concepts.&#10;&#10;## Guidelines&#10;&#10;- Use clear, concise language&#10;- Include practical examples&#10;- Be specific about requirements"
                        className="min-h-[500px] font-mono text-sm rounded-t-none border-t-0 border-neutral-200 dark:border-white/[0.09] resize-none"
                      />
                      <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-on-surface-variant/60">
                        <span>Supports markdown formatting</span>
                        <span>{formData.content.length} characters</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="px-8 py-4 bg-white dark:bg-surface-container border-t border-neutral-200 dark:border-white/[0.09] flex items-center justify-between shrink-0">
                <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsModalOpen(false)
                      setFormData({ name: '', description: '', category: 'general', priority: 50, content: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={isSaving || !formData.name || !formData.content}
                    className="bg-neutral-900 hover:bg-neutral-700 text-white"
                  >
                    {isSaving ? (
                      <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Creating...</>
                    ) : (
                      <><Plus className="mr-2 h-3.5 w-3.5" />Create Instruction</>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
            </Dialog>
          </div>

        {/* Info Card */}
        <div className="p-4 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md mb-5">
          <p className="text-xs text-neutral-500 dark:text-on-surface-variant leading-relaxed">
            Instructions are active in every chat session. Active instructions are applied in priority order and override default AI behavior.
            Examples: <span className="text-neutral-700 dark:text-on-surface">&quot;Always respond in Portuguese&quot;</span>, <span className="text-neutral-700 dark:text-on-surface">&quot;Always include code examples&quot;</span>.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 mb-5">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-neutral-900 text-white h-7 text-xs' : 'h-7 text-xs'}
          >
            All ({skills.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'bg-neutral-900 text-white h-7 text-xs' : 'h-7 text-xs'}
          >
            Active ({skills.filter(s => s.is_active).length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilter('inactive')}
            className={filter === 'inactive' ? 'bg-neutral-900 text-white h-7 text-xs' : 'h-7 text-xs'}
          >
            Inactive ({skills.filter(s => !s.is_active).length})
          </Button>
        </div>

        {/* Instructions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-10 border border-neutral-200 dark:border-white/[0.09] rounded-md bg-neutral-50 dark:bg-surface-container-high">
            <p className="text-sm text-neutral-500 dark:text-on-surface-variant">
              {filter === 'all' ? 'No instructions yet' : `No ${filter} instructions`}
            </p>
            <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 mt-1">
              {filter === 'all' ? 'Create your first instruction to get started' : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className={`p-4 rounded-md border transition-colors ${
                  skill.is_active
                    ? 'bg-white dark:bg-surface-container-high border-neutral-200 dark:border-white/[0.09]'
                    : 'bg-neutral-50 dark:bg-surface-container border-neutral-200 dark:border-white/[0.06] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-on-surface">{skill.name}</h4>
                      <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-surface-container-highest rounded text-[10px] font-medium text-neutral-500 dark:text-on-surface-variant capitalize">
                        {skill.category}
                      </span>
                      <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-surface-container-highest rounded text-[10px] font-medium text-neutral-500 dark:text-on-surface-variant">
                        P{skill.priority}
                      </span>
                      {skill.is_active && (
                        <span className="px-1.5 py-0.5 bg-neutral-900 text-white rounded text-[10px] font-medium">
                          Active
                        </span>
                      )}
                    </div>
                    {skill.description && (
                      <p className="text-xs text-neutral-500 dark:text-on-surface-variant mb-1.5">{skill.description}</p>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
                      Created {new Date(skill.created_at).toLocaleDateString()}
                      {skill.last_used_at && ` · Last used ${new Date(skill.last_used_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(skill)}
                      className="h-7 w-7 p-0 text-neutral-400 dark:text-on-surface-variant hover:text-neutral-700 dark:hover:text-on-surface"
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggle(skill.id, skill.is_active)}
                      className="h-7 w-7 p-0 text-neutral-400 dark:text-on-surface-variant hover:text-neutral-700 dark:hover:text-on-surface"
                      title={skill.is_active ? 'Disable' : 'Enable'}
                    >
                      {skill.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(skill.id)}
                      className="h-7 w-7 p-0 text-neutral-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
        <div className="mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 dark:text-on-surface-variant" />
            <Input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 border-neutral-200 dark:border-white/[0.09] text-sm"
            />
          </div>
        </div>

        {/* Templates List */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-10 border border-neutral-200 dark:border-white/[0.09] rounded-md bg-neutral-50 dark:bg-surface-container-high">
            <p className="text-sm text-neutral-500 dark:text-on-surface-variant">No templates found</p>
            <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60 mt-1">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const isImported = isTemplateImported(template.name)
              
              return (
              <div
                key={template.id}
              className="p-4 bg-white dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md hover:border-neutral-300 dark:hover:border-white/[0.15] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-on-surface">{template.name}</h3>
                      {isImported && (
                        <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-surface-container-highest text-neutral-500 dark:text-on-surface-variant rounded text-[10px] font-medium">Imported</span>
                      )}
                      <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-surface-container-highest text-neutral-500 dark:text-on-surface-variant rounded text-[10px] capitalize">{template.category}</span>
                      {template.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-surface-container-highest text-neutral-500 dark:text-on-surface-variant rounded text-[10px]">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-on-surface-variant leading-relaxed">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreviewTemplate(template)}
                      className="h-7 text-xs gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddTemplate(template)}
                      disabled={isSaving || isImported}
                      className={`h-7 text-xs gap-1 ${
                        isImported
                          ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                          : 'bg-neutral-900 hover:bg-neutral-700 text-white'
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <><Plus className="h-3.5 w-3.5" />{isImported ? 'Imported' : 'Import'}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}

        {filteredTemplates.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
            </p>
          </div>
        )}
      </TabsContent>
        </div>
      </div>
      </Tabs>

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0 gap-0 bg-white dark:bg-surface-container flex flex-col">
          {previewTemplate && (
            <>
              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-white/[0.09]">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl shrink-0">{previewTemplate.icon}</span>
                  <div className="flex-1">
                    <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-on-surface">
                      {previewTemplate.name}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-neutral-500 dark:text-on-surface-variant mt-0.5">
                      {previewTemplate.description}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-surface-container-high text-neutral-500 dark:text-on-surface-variant rounded text-[10px] font-medium capitalize">{previewTemplate.category}</span>
                  <span className="px-2 py-0.5 bg-neutral-100 dark:bg-surface-container-high text-neutral-500 dark:text-on-surface-variant rounded text-[10px] font-medium">Priority {previewTemplate.priority}</span>
                  {previewTemplate.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-neutral-100 dark:bg-surface-container-high text-neutral-500 dark:text-on-surface-variant rounded text-[10px]">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <p className="text-xs font-medium text-neutral-500 dark:text-on-surface-variant uppercase tracking-wide mb-2">Content</p>
                <div className="p-4 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-md">
                  <pre className="text-xs text-neutral-700 dark:text-on-surface-variant whitespace-pre-wrap font-mono leading-relaxed">
                    {previewTemplate.content}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-neutral-200 dark:border-white/[0.09] flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddTemplate(previewTemplate)}
                  disabled={isSaving}
                  className="bg-neutral-900 hover:bg-neutral-700 text-white"
                >
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Importing...</>
                  ) : (
                    <><Plus className="mr-2 h-3.5 w-3.5" />Import Template</>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Skill Modal */}
      <Dialog open={!!editingSkill} onOpenChange={(open) => !open && setEditingSkill(null)}>
        <DialogContent className="!max-w-none w-[96vw] h-[92vh] overflow-hidden p-0 gap-0 bg-white dark:bg-surface-container flex flex-col">
          {/* Header */}
          <div className="px-8 pt-5 pb-4 border-b border-neutral-200 dark:border-white/[0.09] shrink-0">
            <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-on-surface">
              Edit Instruction
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500 dark:text-on-surface-variant mt-0.5">
              Modify and improve your custom instruction
            </DialogDescription>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="flex gap-8">
              {/* Left Column - Basic Info */}
              <div className="w-[380px] shrink-0 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60">Basic Information</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      placeholder="e.g., Always provide examples"
                      className="border-neutral-200 dark:border-white/[0.09] text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-category" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                      Category
                    </Label>
                    <Select
                      value={editFormData.category}
                      onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                    >
                      <SelectTrigger className="border-neutral-200 dark:border-white/[0.09] bg-white dark:bg-surface-container-high text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-surface-container border border-neutral-200 dark:border-white/[0.09] shadow-md">
                        <SelectItem value="general" className="cursor-pointer">General</SelectItem>
                        <SelectItem value="coding" className="cursor-pointer">Coding</SelectItem>
                        <SelectItem value="writing" className="cursor-pointer">Writing</SelectItem>
                        <SelectItem value="analysis" className="cursor-pointer">Analysis</SelectItem>
                        <SelectItem value="custom" className="cursor-pointer">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-description" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                      Description <span className="text-neutral-400 dark:text-on-surface-variant/60 text-xs font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      placeholder="Brief description of what this instruction does"
                      className="border-neutral-200 dark:border-white/[0.09] text-sm min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-priority" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                      Priority (0–100)
                    </Label>
                    <Input
                      id="edit-priority"
                      type="number"
                      min="0"
                      max="100"
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({ ...editFormData, priority: parseInt(e.target.value) || 0 })}
                      className="border-neutral-200 dark:border-white/[0.09] text-sm"
                    />
                    <div className="h-1.5 bg-neutral-100 dark:bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-400 dark:bg-on-surface-variant transition-all duration-200"
                        style={{ width: `${editFormData.priority}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Content Editor */}
              <div className="flex-1 min-w-0 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-on-surface-variant/60">Instruction Content</p>

                <div className="space-y-2">
                  <Label htmlFor="edit-content" className="text-sm font-medium text-neutral-700 dark:text-on-surface-variant">
                    Content <span className="text-red-500">*</span>
                  </Label>

                  {/* Markdown Toolbar */}
                  <div className="flex items-center gap-0.5 px-2 py-1.5 bg-neutral-50 dark:bg-surface-container-high border border-neutral-200 dark:border-white/[0.09] rounded-t-md">
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => { const ta = document.getElementById('edit-content') as HTMLTextAreaElement; if (!ta) return; const s = ta.selectionStart; const e = ta.selectionEnd; setEditFormData({ ...editFormData, content: editFormData.content.substring(0, s) + '**' + editFormData.content.substring(s, e) + '**' + editFormData.content.substring(e) }) }}
                      title="Bold" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => { const ta = document.getElementById('edit-content') as HTMLTextAreaElement; if (!ta) return; const s = ta.selectionStart; const e = ta.selectionEnd; setEditFormData({ ...editFormData, content: editFormData.content.substring(0, s) + '*' + editFormData.content.substring(s, e) + '*' + editFormData.content.substring(e) }) }}
                      title="Italic" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => { const ta = document.getElementById('edit-content') as HTMLTextAreaElement; if (!ta) return; const s = ta.selectionStart; const e = ta.selectionEnd; setEditFormData({ ...editFormData, content: editFormData.content.substring(0, s) + '`' + editFormData.content.substring(s, e) + '`' + editFormData.content.substring(e) }) }}
                      title="Code" className="h-7 w-7 p-0 hover:bg-neutral-200 dark:hover:bg-white/[0.08] text-neutral-600 dark:text-on-surface-variant">
                      <Code className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  
                  <Textarea
                    id="edit-content"
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    placeholder="# My Instruction&#10;&#10;Content here..."
                    className="min-h-[500px] font-mono text-sm rounded-t-none border-t-0 border-neutral-200 dark:border-white/[0.09] resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-on-surface-variant/60">
                    <span>Supports markdown formatting</span>
                    <span>{editFormData.content.length} characters</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="px-8 py-4 bg-white dark:bg-surface-container border-t border-neutral-200 dark:border-white/[0.09] flex items-center justify-between shrink-0">
            <p className="text-xs text-neutral-400 dark:text-on-surface-variant/60">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSkill(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditSkill}
                disabled={isSaving || !editFormData.name || !editFormData.content}
                className="bg-neutral-900 hover:bg-neutral-700 text-white"
              >
                {isSaving ? (
                  <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
