import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface KPIStatProps {
  title: string
  value: string | number
  change?: {
    value: string | number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: LucideIcon
  description?: string
  className?: string
}

export function KPIStat({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description,
  className 
}: KPIStatProps) {
  return (
    <Card className={cn("wl-card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-wl-muted">{title}</p>
            <p className="text-3xl font-bold text-wl-text">{value}</p>
            {change && (
              <div className={cn(
                "flex items-center text-sm font-medium",
                change.type === 'increase' && "text-wl-accent-2",
                change.type === 'decrease' && "text-red-500",
                change.type === 'neutral' && "text-wl-muted"
              )}>
                <span className="mr-1">
                  {change.type === 'increase' && '↗'}
                  {change.type === 'decrease' && '↘'}
                  {change.type === 'neutral' && '→'}
                </span>
                {change.value}
                {change.type !== 'neutral' && (
                  <span className="ml-1 text-xs text-wl-muted">
                    vs last period
                  </span>
                )}
              </div>
            )}
            {description && (
              <p className="text-xs text-wl-muted">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-wl-accent/10 rounded-xl">
              <Icon className="h-6 w-6 text-wl-accent" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
