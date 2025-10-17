import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <Card className={cn("wl-card", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {Icon && (
          <div className="mb-4 p-4 bg-wl-accent/10 rounded-2xl">
            <Icon className="h-8 w-8 text-wl-accent" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-wl-text mb-2">
          {title}
        </h3>
        <p className="text-wl-muted mb-6 max-w-md">
          {description}
        </p>
        {action && (
          <Button onClick={action.onClick} className="wl-button-primary">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
