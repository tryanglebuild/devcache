interface TemplateTagsProps {
  tags: string[]
  color: string
}

export function TemplateTags({ tags, color }: TemplateTagsProps) {
  if (!tags || tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-surface-container-high text-neutral-500 dark:text-neutral-400 text-[11px] font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
