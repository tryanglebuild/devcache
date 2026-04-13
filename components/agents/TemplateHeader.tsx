interface TemplateHeaderProps {
  name: string
  description?: string | null
  categoryIcon: string
  categoryColor: string
}

export function TemplateHeader({
  name,
  description,
  categoryIcon,
  categoryColor
}: TemplateHeaderProps) {
  return (
    <div>
      <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
        {name}
      </h1>
      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  )
}
