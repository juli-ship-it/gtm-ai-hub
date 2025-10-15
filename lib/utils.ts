import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(date)
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function convertLoomUrlToEmbed(loomUrl: string): string | null {
  if (!loomUrl) return null
  
  // Handle different Loom URL formats
  // https://loom.com/share/VIDEO_ID
  // https://www.loom.com/share/VIDEO_ID
  // https://loom.com/embed/VIDEO_ID (already an embed URL)
  
  const shareMatch = loomUrl.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (shareMatch) {
    return `https://loom.com/embed/${shareMatch[1]}`
  }
  
  const embedMatch = loomUrl.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/)
  if (embedMatch) {
    return loomUrl // Already an embed URL
  }
  
  // If it doesn't match expected patterns, return null
  return null
}
