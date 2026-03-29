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
    <div className="flex items-start gap-4">
      <div 
        className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"
        style={{ 
          background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}dd 100%)` 
        }}
      >
        <span className="material-symbols-outlined text-4xl">
          {categoryIcon}
        </span>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-black tracking-tight text-[#191c1e] mb-2">
          {name}
        </h1>
        {description && (
          <p className="text-[#464554] font-medium">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
