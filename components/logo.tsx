import React from 'react'
import Image from 'next/image'

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
        <Image
          src="https://qvfvylflnfxrhyzwlhpm.supabase.co/storage/v1/object/public/assets/Workleap_blue.png"
          alt="Workleap Logo"
          width={100}
          height={100}
          className="w-full h-full object-contain"
          priority
          onError={(e) => {
            console.log('Workleap logo failed to load, showing fallback')
            e.currentTarget.style.display = 'none'
            // Show the fallback when image fails
            const fallback = e.currentTarget.nextElementSibling as HTMLElement
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        {/* Fallback placeholder when image fails to load - hidden by default */}
        <div className="absolute inset-0 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ display: 'none', backgroundColor: '#2545FF' }}>
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
