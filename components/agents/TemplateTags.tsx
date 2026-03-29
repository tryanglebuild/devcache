interface TemplateTagsProps {
  tags: string[]
  color: string
}

export function TemplateTags({ tags, color }: TemplateTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md"
          style={{ backgroundColor: color }}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
