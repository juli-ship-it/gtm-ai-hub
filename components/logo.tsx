'use client'

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const logoUrl = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/assets/Workleap_Symbol_blue_4x.png` : '/logo-placeholder.png'
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Workleap Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        <img 
          src={logoUrl}
          alt="Workleap Logo"
          className="w-full h-full object-contain"
        />
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
