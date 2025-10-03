import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  subtitle,
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-wl-text wl-hand-drawn">
            {title}
          </h1>
          {(description || subtitle) && (
            <p className="text-lg text-wl-muted max-w-2xl">
              {description || subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-3">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
