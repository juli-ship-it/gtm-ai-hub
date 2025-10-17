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
    <div className={cn("mb-6 lg:mb-8", className)}>
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-wl-text wl-hand-drawn">
            {title}
          </h1>
          {(description || subtitle) && (
            <p className="text-base lg:text-lg text-wl-muted max-w-2xl">
              {description || subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-3 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
