import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'new' | 'triaged' | 'building' | 'shipped' | 'declined'
  className?: string
}

const statusConfig = {
  queued: { variant: 'info' as const, label: 'Queued' },
  running: { variant: 'warning' as const, label: 'Running' },
  succeeded: { variant: 'success' as const, label: 'Succeeded' },
  failed: { variant: 'destructive' as const, label: 'Failed' },
  new: { variant: 'info' as const, label: 'New' },
  triaged: { variant: 'warning' as const, label: 'Triaged' },
  building: { variant: 'secondary' as const, label: 'Building' },
  shipped: { variant: 'success' as const, label: 'Shipped' },
  declined: { variant: 'destructive' as const, label: 'Declined' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn("font-medium", className)}
    >
      {config.label}
    </Badge>
  )
}
