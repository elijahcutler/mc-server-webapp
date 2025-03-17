interface SectionHeaderProps {
  title: string
  description?: string
  id?: string
}

export default function SectionHeader({ title, description, id }: SectionHeaderProps) {
  return (
    <div className={id ? `section-header ${id}` : "section-header"} id={id}>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}

