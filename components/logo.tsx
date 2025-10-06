import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Workleap Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Use a simple div with background color instead of external image to avoid 500 errors */}
        <div 
          className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ backgroundColor: '#2545FF' }}
        >
          workleap
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-wl-text ${textSizeClasses[size]}`}>
            GTM AI Hub
          </h1>
        </div>
      )}
    </div>
  )
}

export default Logo
